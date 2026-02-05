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
  inicioPeriodoAnterior.setDate(inicioPeriodoActual.getDate() - days);

  try {
    // 1. Obtener Pedidos con las columnas reales de tu esquema
    const { data: todosLosPedidos, error: errorPedidos } = await supabase
      .from("pedidos")
      .select("id, created_at, estado, cantidad, precio_unitario")
      .gte("created_at", inicioPeriodoAnterior.toISOString());

    if (errorPedidos) throw errorPedidos;
    if (!todosLosPedidos) return NextResponse.json({ error: "No hay datos" }, { status: 404 });

    // Función auxiliar para calcular el total de un pedido según tu esquema
    const calcularMonto = (p: any) => (Number(p.cantidad) || 0) * (Number(p.precio_unitario) || 0);

    // 2. Separar pedidos por periodos (Excluyendo cancelados si aplica)
    const pedidosActuales = todosLosPedidos.filter(p => 
      new Date(p.created_at) >= inicioPeriodoActual && p.estado !== 'cancelado'
    );
    const pedidosAnteriores = todosLosPedidos.filter(p => 
      new Date(p.created_at) >= inicioPeriodoAnterior && 
      new Date(p.created_at) < inicioPeriodoActual &&
      p.estado !== 'cancelado'
    );

    // 3. Métrica: Producción en curso (Basado en tus estados de EstadoPedido)
    const estadosProduccion = ['pendiente', 'en_diseño', 'en_corte', 'en_confeccion']; 
    const produccionEnCurso = todosLosPedidos
      .filter(p => estadosProduccion.includes(p.estado || ''))
      .reduce((acc, p) => acc + calcularMonto(p), 0);

    // 4. Calcular métricas financieras
    const totalActual = pedidosActuales.reduce((acc, p) => acc + calcularMonto(p), 0);
    const totalAnterior = pedidosAnteriores.reduce((acc, p) => acc + calcularMonto(p), 0);

    let porcentajeCrecimiento = totalAnterior > 0 
      ? ((totalActual - totalAnterior) / totalAnterior) * 100 
      : (totalActual > 0 ? 100 : 0);

    // 5. Ventas por Día (Gráfico)
    const ventasPorDiaMap = pedidosActuales.reduce((acc: Record<string, number>, curr) => {
      const fecha = new Date(curr.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
      acc[fecha] = (acc[fecha] || 0) + calcularMonto(curr);
      return acc;
    }, {});

    const ventasPorDia = Object.keys(ventasPorDiaMap).map(fecha => ({
      fecha,
      ventas: ventasPorDiaMap[fecha]
    }));

    // 6. Detalles para Pareto y Tallas (Desde la misma tabla pedidos según tu estructura)
    const { data: detData, error: errorDet } = await supabase
      .from("pedidos")
      .select(`
        cantidad,
        talla,
        precio_unitario,
        producto:productos (
          categorias ( nombre )
        )
      `)
      .gte("created_at", inicioPeriodoActual.toISOString());

    const paretoMap: Record<string, number> = {};
    const tallasMap: Record<string, number> = {};

    detData?.forEach((d: any) => {
      const catName = d.producto?.categorias?.nombre || "General";
      const monto = (Number(d.cantidad) || 0) * (Number(d.precio_unitario) || 0);
      paretoMap[catName] = (paretoMap[catName] || 0) + monto;

      if (d.talla) {
        tallasMap[d.talla] = (tallasMap[d.talla] || 0) + (Number(d.cantidad) || 0);
      }
    });

    return NextResponse.json({
      metrics: {
        total: totalActual,
        pedidos: pedidosActuales.length,
        crecimiento: Math.round(porcentajeCrecimiento),
        produccionEnCurso: produccionEnCurso,
        clientes: 0 // Nota: Tu tabla pedidos no tiene cliente_id directo, está en 'ordenes'
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