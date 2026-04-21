export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // ── Consultas en paralelo ──
    const [
      ventasTimeline,
      topProductos,
      stockLevels,
      ordenesPorEstado,
      ingresosVsGastos,
      stockBajo,
      cotizacionesTrend,
      pagosMetodo,
    ] = await Promise.all([
      // 1. FLUJO DE VENTAS (agrupado por fecha)
      prisma.ventas.findMany({
        where: { created_at: { gte: startDate } },
        select: { total: true, created_at: true },
        orderBy: { created_at: 'asc' },
      }),

      // 2. TOP PRODUCTOS (vía pedido_items)
      prisma.pedido_items.groupBy({
        by: ['producto_id'],
        _sum: { cantidad: true },
        _count: { id: true },
        orderBy: { _sum: { cantidad: 'desc' } },
        take: 8,
      }),

      // 3. NIVELES DE STOCK (snapshot actual)
      prisma.insumo.findMany({
        select: {
          id: true,
          nombre: true,
          stock_actual: true,
          stock_minimo: true,
          categoria_insumo: true,
        },
        orderBy: { stock_actual: 'asc' },
      }),

      // 4. ÓRDENES POR ESTADO
      prisma.ordenes.groupBy({
        by: ['estado'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),

      // 5. INGRESOS DEL PERIODO
      prisma.ventas.aggregate({
        where: { created_at: { gte: startDate } },
        _sum: { total: true, impuestos: true },
        _count: { id: true },
      }),

      // 6. STOCK BAJO
      prisma.insumo.findMany({
        where: {},
        select: { id: true, nombre: true, stock_actual: true, stock_minimo: true },
        orderBy: { stock_actual: 'asc' },
        take: 5,
      }),

      // 7. COTIZACIONES DEL PERIODO (tendencia de conversión)
      prisma.cotizaciones.groupBy({
        by: ['estado'],
        _count: { id: true },
        where: { created_at: { gte: startDate } },
      }),

      // 8. PAGOS POR MÉTODO
      prisma.pagos_orden.groupBy({
        by: ['metodo_pago'],
        _sum: { monto: true },
        _count: { id: true },
        orderBy: { _sum: { monto: 'desc' } },
      }),
    ]);

    // ── Procesar: Ventas por día (agrupadas) ──
    const ventasPorDia = agruparPorFecha(ventasTimeline);

    // ── Procesar: Top productos con nombres ──
    const productoIds = topProductos
      .map((p) => p.producto_id)
      .filter((id): id is bigint => id !== null);

    const productosDetalle = productoIds.length > 0
      ? await prisma.productos.findMany({
          where: { id: { in: productoIds } },
          select: { id: true, nombre: true, sku: true },
        })
      : [];

    const productosMap = new Map(productosDetalle.map((p) => [p.id.toString(), p]));

    const topProducts = topProductos.map((p) => ({
      producto_id: p.producto_id?.toString() ?? null,
      nombre: p.producto_id
        ? productosMap.get(p.producto_id.toString())?.nombre ?? 'N/A'
        : 'N/A',
      sku: p.producto_id
        ? productosMap.get(p.producto_id.toString())?.sku ?? null
        : null,
      cantidad_total: p._sum.cantidad ?? 0,
      pedidos_count: p._count.id,
    }));

    // ── Procesar: Stock levels agrupados por categoría ──
    const stockByCategory: Record<string, { alto: number; medio: number; bajo: number }> = {};

    for (const item of stockLevels) {
      const cat = item.categoria_insumo ?? 'otro';
      if (!stockByCategory[cat]) stockByCategory[cat] = { alto: 0, medio: 0, bajo: 0 };

      const actual = Number(item.stock_actual);
      const minimo = Number(item.stock_minimo);

      if (actual > minimo * 3) {
        stockByCategory[cat].alto += actual;
      } else if (actual > minimo) {
        stockByCategory[cat].medio += actual;
      } else {
        stockByCategory[cat].bajo += actual;
      }
    }

    const inventarioData = Object.entries(stockByCategory).map(([categoria, vals]) => ({
      semana: categoria,
      ...vals,
    }));

    // ── Procesar: Órdenes por estado con colores ──
    const estadoColorMap: Record<string, { name: string; color: string }> = {
      solicitado: { name: 'Solicitado', color: '#fb923c' },
      cotizado: { name: 'Cotizado', color: '#facc15' },
      aprobado: { name: 'Aprobado', color: '#38bdf8' },
      pagado: { name: 'Pagado', color: '#10b981' },
      en_proceso: { name: 'En Proceso', color: '#8b5cf6' },
      finalizado: { name: 'Finalizado', color: '#22c55e' },
      cancelado: { name: 'Cancelado', color: '#ef4444' },
    };

    const ordenesEstado = ordenesPorEstado.map((o) => ({
      name: estadoColorMap[o.estado ?? '']?.name ?? o.estado,
      value: o._count.id,
      color: estadoColorMap[o.estado ?? '']?.color ?? '#6b7280',
    }));

    // ── Procesar: Comparativa Ingresos vs Gastos ──
    const totalIngresos = Number(ingresosVsGastos._sum.total ?? 0);
    const totalImpuestos = Number(ingresosVsGastos._sum.impuestos ?? 0);
    const margenEstimado = 0.35; // 35% costo estimado

    const comparativaData = [
      {
        mes: 'Actual',
        ingresos: totalIngresos,
        gastos: Math.round(totalIngresos * margenEstimado),
        ganancia: Math.round(totalIngresos * (1 - margenEstimado) - totalImpuestos),
        impuestos: totalImpuestos,
      },
    ];

    // ── Procesar: Stock bajo (filtro real) ──
    const stockBajoFiltrado = stockBajo.filter((i) => i.stock_actual <= i.stock_minimo);

    // ── Procesar: Tendencia de cotizaciones ──
    const cotizacionesTrendMap = cotizacionesTrend.reduce<Record<string, number>>((acc, c) => {
      acc[c.estado ?? 'borrador'] = c._count.id;
      return acc;
    }, {});

    // ── Procesar: Pagos por método ──
    const pagosPorMetodo = pagosMetodo.map((p) => ({
      metodo: p.metodo_pago,
      monto_total: Number(p._sum.monto ?? 0),
      count: p._count.id,
    }));

    // ── Stats resumen ──
    const stats = {
      totalVentas: totalIngresos,
      totalOrdenes: ordenesPorEstado.reduce((sum, o) => sum + o._count.id, 0),
      totalCotizaciones: cotizacionesTrend.reduce((sum, c) => sum + c._count.id, 0),
      stockBajo: stockBajoFiltrado.length,
      ventasCount: ingresosVsGastos._count.id,
    };

    return NextResponse.json(
      serializeBigInt({
        success: true,
        ventasData: ventasPorDia,
        topProducts,
        inventarioData,
        ordenesEstado,
        comparativaData,
        stockBajo: stockBajoFiltrado,
        cotizacionesTrend: cotizacionesTrendMap,
        pagosPorMetodo,
        stats,
      })
    );
  } catch (error: any) {
    console.error('Error en API charts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        ventasData: [],
        topProducts: [],
        inventarioData: [],
        ordenesEstado: [],
        comparativaData: [],
        stockBajo: [],
        cotizacionesTrend: {},
        pagosPorMetodo: [],
        stats: { totalVentas: 0, totalOrdenes: 0, stockBajo: 0 },
      },
      { status: 200 }
    );
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

type VentaRaw = { total: import('@prisma/client').Prisma.Decimal; created_at: Date | null };

function agruparPorFecha(ventas: VentaRaw[]) {
  const map = new Map<string, number>();

  for (const v of ventas) {
    if (!v.created_at) continue;
    const label = v.created_at.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
    });
    map.set(label, (map.get(label) ?? 0) + Number(v.total));
  }

  return Array.from(map.entries()).map(([fecha, ventas]) => ({ fecha, ventas }));
}
