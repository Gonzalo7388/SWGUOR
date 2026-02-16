import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface PedidoRelacional {
  id: string;
  created_at: string;
  estado: string;
  cantidad: number;
  precio_unitario: number;
  talla: string | null;
  producto: {
    categorias: { nombre: string } | { nombre: string }[] | null;
  } | null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30");
  const supabase = await createClient();

  // Normalizamos fechas a inicio del día para evitar desfases de horas
  const ahora = new Date();
  const inicioPeriodoActual = new Date();
  inicioPeriodoActual.setDate(ahora.getDate() - days);
  inicioPeriodoActual.setHours(0, 0, 0, 0);

  const inicioPeriodoAnterior = new Date();
  inicioPeriodoAnterior.setDate(inicioPeriodoActual.getDate() - days);
  inicioPeriodoAnterior.setHours(0, 0, 0, 0);

  try {
    const { data, error: errorPedidos } = await supabase
      .from("pedidos")
      .select(`
        id, created_at, estado, cantidad, precio_unitario, talla,
        producto:productos (
          categorias ( nombre )
        )
      `)
      .gte("created_at", inicioPeriodoAnterior.toISOString())
      .order('created_at', { ascending: true }); // Ordenar ayuda a la gráfica de líneas

    if (errorPedidos) throw errorPedidos;
    
    const todosLosPedidos = (data as unknown as PedidoRelacional[]) || [];
    
    const metrics = {
      totalActual: 0,
      totalAnterior: 0,
      pedidosActualesCount: 0,
      produccionMonto: 0
    };

    const paretoMap: Record<string, number> = {};
    const tallasMap: Record<string, number> = {};
    const ventasDiaMap: Record<string, number> = {};
    const estadosProduccion = ['pendiente', 'en_diseño', 'en_corte', 'en_confeccion'];

    todosLosPedidos.forEach(p => {
      const fechaP = new Date(p.created_at);
      const monto = (Number(p.cantidad) || 0) * (Number(p.precio_unitario) || 0);

      // Lógica de Periodos
      if (fechaP >= inicioPeriodoActual) {
        if (p.estado !== 'cancelado') {
          metrics.totalActual += monto;
          metrics.pedidosActualesCount++;
          
          // Formato de fecha para la gráfica (e.g., "15 Feb")
          const label = fechaP.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
          ventasDiaMap[label] = (ventasDiaMap[label] || 0) + monto;

          // Extracción de Categoría
          let catName = "Sin Categoría";
          const resCat = p.producto?.categorias;
          if (resCat) {
            catName = Array.isArray(resCat) ? (resCat[0]?.nombre || catName) : resCat.nombre;
          }
          paretoMap[catName] = (paretoMap[catName] || 0) + monto;
          
          if (p.talla) {
            tallasMap[p.talla] = (tallasMap[p.talla] || 0) + (Number(p.cantidad) || 0);
          }
        }

        if (estadosProduccion.includes(p.estado || '')) {
          metrics.produccionMonto += monto;
        }
      } 
      else if (fechaP >= inicioPeriodoAnterior && p.estado !== 'cancelado') {
        metrics.totalAnterior += monto;
      }
    });

    const crecimiento = metrics.totalAnterior > 0 
      ? ((metrics.totalActual - metrics.totalAnterior) / metrics.totalAnterior) * 100 
      : (metrics.totalActual > 0 ? 100 : 0);

    // RESPUESTA GARANTIZADA: Si no hay datos, enviamos arrays vacíos en lugar de null
    return NextResponse.json({
      metrics: {
        total: metrics.totalActual,
        pedidos: metrics.pedidosActualesCount,
        crecimiento: Math.round(crecimiento),
        produccionEnCurso: metrics.produccionMonto,
        clientes: 0 
      },
      ventasPorDia: Object.entries(ventasDiaMap).map(([fecha, ventas]) => ({ fecha, ventas })),
      ventasPorCategoria: Object.entries(paretoMap).map(([name, value]) => ({ name, value })),
      concentracionTallas: Object.entries(tallasMap).map(([name, value]) => ({ name, value }))
    });

  } catch (error: any) {
    console.error("API REPORTES ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}