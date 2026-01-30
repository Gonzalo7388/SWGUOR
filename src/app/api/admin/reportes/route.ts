import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30");
  
  const supabase = await createClient();

  const ahora = new Date();
  const inicioPeriodoActual = new Date();
  inicioPeriodoActual.setDate(ahora.getDate() - days);

  const inicioPeriodoAnterior = new Date();
  inicioPeriodoAnterior.setDate(inicioPeriodoActual.getDate() - (days * 2)); // Corregido: 2 periodos atrás

  try {
    // 1. Obtener Pedidos
    // Nota: Eliminé 'estado_pago' porque no está en tu CSV actual. 
    // Si la agregas luego a Supabase, puedes reincorporarla.
    const { data: todosLosPedidos, error: errorPedidos } = await supabase
      .from("pedidos")
      .select("total, created_at, estado")
      .gte("created_at", inicioPeriodoAnterior.toISOString());

    if (errorPedidos) throw errorPedidos;
    if (!todosLosPedidos) return NextResponse.json({ error: "No hay datos" }, { status: 404 });

    // 2. Separar pedidos por periodos (Basado en 'estado' != 'CANCELADO')
    const pedidosActuales = todosLosPedidos.filter(p => 
      new Date(p.created_at) >= inicioPeriodoActual && p.estado !== 'CANCELADO'
    );
    const pedidosAnteriores = todosLosPedidos.filter(p => 
      new Date(p.created_at) >= inicioPeriodoAnterior && 
      new Date(p.created_at) < inicioPeriodoActual &&
      p.estado !== 'CANCELADO'
    );

    // 3. MÉTRICA: PRODUCCIÓN EN CURSO (Basado en tus roles: cortador, diseñador, etc.)
    // Incluimos estados que NO sean completado ni cancelado
    const estadosProduccion = ['PENDIENTE', 'DISEÑANDO', 'CORTANDO', 'EN_TALLER', 'LISTO'];
    const produccionEnCurso = todosLosPedidos
      .filter(p => estadosProduccion.includes(p.estado))
      .reduce((acc: number, p) => acc + (Number(p.total) || 0), 0);

    // 4. Calcular métricas financieras
    const totalActual = pedidosActuales.reduce((acc: number, p) => acc + (Number(p.total) || 0), 0);
    const totalAnterior = pedidosAnteriores.reduce((acc: number, p) => acc + (Number(p.total) || 0), 0);

    let porcentajeCrecimiento = totalAnterior > 0 
      ? ((totalActual - totalAnterior) / totalAnterior) * 100 
      : (totalActual > 0 ? 100 : 0);

    // 5. Ventas por Día (Gráfico)
    const ventasPorDiaMap = pedidosActuales.reduce((acc: Record<string, number>, curr) => {
      const fecha = new Date(curr.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
      acc[fecha] = (acc[fecha] || 0) + (Number(curr.total) || 0);
      return acc;
    }, {});

    const ventasPorDia = Object.keys(ventasPorDiaMap).map(fecha => ({
      fecha,
      ventas: ventasPorDiaMap[fecha]
    }));

    // 6. Detalles para Pareto y Tallas (Con manejo de errores para relaciones vacías)
    const { data: detData, error: errorDet } = await supabase
      .from("detalles_pedido")
      .select(`
        cantidad,
        talla,
        productos (
          precio,
          categorias ( nombre )
        )
      `)
      .gte("created_at", inicioPeriodoActual.toISOString());

    const paretoMap: Record<string, number> = {};
    const tallasMap: Record<string, number> = {};

    detData?.forEach((d: any) => {
      // Pareto: Si no hay categoría, usamos "General"
      const catName = d.productos?.categorias?.nombre || "General";
      const monto = (Number(d.cantidad) || 0) * (Number(d.productos?.precio) || 0);
      paretoMap[catName] = (paretoMap[catName] || 0) + monto;

      // Tallas
      if (d.talla) {
        tallasMap[d.talla] = (tallasMap[d.talla] || 0) + (Number(d.cantidad) || 0);
      }
    });

    // 7. Respuesta consolidada (Asegurando que nada sea undefined)
    return NextResponse.json({
      metrics: {
        total: totalActual || 0,
        pedidos: pedidosActuales.length || 0,
        crecimiento: Math.round(porcentajeCrecimiento) || 0,
        produccionEnCurso: produccionEnCurso || 0,
        clientes: new Set(pedidosActuales.map((p:any) => p.cliente_id)).size // Calculado al vuelo
      },
      ventasPorDia: ventasPorDia.length > 0 ? ventasPorDia : [{fecha: 'Sin datos', ventas: 0}],
      ventasPorCategoria: Object.entries(paretoMap).map(([name, value]) => ({ name, value })),
      concentracionTallas: Object.entries(tallasMap).map(([name, value]) => ({ name, value }))
    });

  } catch (error: any) {
    console.error("REPORT_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}