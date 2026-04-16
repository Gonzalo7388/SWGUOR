export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import { serializeBigInt, stringifyBigInts } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // ── Filtros avanzados ──
    const days = parseInt(searchParams.get('days') || '30');
    const fechaDesde = searchParams.get('fecha_desde')
      ? new Date(searchParams.get('fecha_desde')!)
      : new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const fechaHasta = searchParams.get('fecha_hasta')
      ? new Date(searchParams.get('fecha_hasta')!)
      : new Date();

    const clienteId = searchParams.get('cliente_id');
    const categoriaId = searchParams.get('categoria_id');
    const estadoOrden = searchParams.get('estado_orden');
    const metodoPago = searchParams.get('metodo_pago');
    const grupo = searchParams.get('grupo') || 'dia'; // 'dia' | 'mes' | 'semana'

    const whereFecha = { gte: fechaDesde, lte: fechaHasta };

    // ── Consultas en paralelo ──
    const [
      resumenGeneral,
      ventasDetalle,
      pedidosProduction,
      inventarioSnapshot,
      clientesRanking,
      categoriasPareto,
      ventasTimeline,
      pagosDetalle,
    ] = await Promise.all([
      // 1. RESUMEN GENERAL
      prisma.$transaction([
        prisma.ordenes.aggregate({
          where: { created_at: whereFecha },
          _count: { id: true },
          _sum: { total_orden: true },
          _avg: { total_orden: true },
        }),
        prisma.ventas.aggregate({
          where: { created_at: whereFecha },
          _count: { id: true },
          _sum: { total: true },
          _avg: { total: true },
        }),
        prisma.clientes.count({ where: { created_at: whereFecha } }),
        prisma.pedidos.count({ where: { created_at: whereFecha } }),
      ]),

      // 2. DETALLE DE VENTAS (para tabla exportable)
      prisma.ventas.findMany({
        where: { created_at: whereFecha },
        include: {
          ordenes: {
            include: {
              cliente: { select: { razon_social: true, ruc: true } },
            },
          },
        },
        orderBy: { created_at: 'desc' },
        take: 200,
      }),

      // 3. PEDIDOS EN PRODUCCIÓN
      prisma.pedidos.findMany({
        where: { created_at: whereFecha },
        include: {
          clientes: { select: { razon_social: true } },
          pedido_items: {
            include: {
              productos: { select: { nombre: true } },
            },
          },
        },
        orderBy: { created_at: 'desc' },
        take: 100,
      }),

      // 4. SNAPSHOT DE INVENTARIO
      prisma.insumo.findMany({
        select: {
          id: true,
          nombre: true,
          tipo: true,
          categoria_insumo: true,
          stock_actual: true,
          stock_minimo: true,
          precio_unitario: true,
          proveedor_id: true,
        },
        orderBy: { stock_actual: 'asc' },
      }),

      // 5. RANKING DE CLIENTES por volumen de compra
      prisma.ordenes.groupBy({
        by: ['cliente_id'],
        _count: { id: true },
        _sum: { total_orden: true },
        where: { created_at: whereFecha, cliente_id: { not: null } },
        orderBy: { _sum: { total_orden: 'desc' } },
        take: 20,
      }),

      // 6. PARETO POR CATEGORÍA (productos más vendidos)
      prisma.pedido_items.groupBy({
        by: ['producto_id'],
        _sum: { cantidad: true },
        _count: { id: true },
        orderBy: { _sum: { cantidad: 'desc' } },
        take: 15,
      }),

      // 7. VENTAS AGRUPADAS POR TIEMPO (gráfico de líneas)
      prisma.ventas.findMany({
        where: { created_at: whereFecha },
        select: { total: true, created_at: true },
        orderBy: { created_at: 'asc' },
      }),

      // 8. DETALLE DE PAGOS
      prisma.pagos_orden.groupBy({
        by: ['metodo_pago'],
        _sum: { monto: true },
        _count: { id: true },
        where: { fecha_pago: whereFecha },
        orderBy: { _sum: { monto: 'desc' } },
      }),
    ]);

    // ── Aplicar filtros adicionales ──
    let ventasFiltradas = ventasDetalle;
    if (clienteId) {
      ventasFiltradas = ventasFiltradas.filter(
        (v) => v.ordenes?.cliente_id?.toString() === clienteId
      );
    }
    if (metodoPago) {
      ventasFiltradas = ventasFiltradas.filter((v) => v.metodo_pago === metodoPago);
    }

    let pedidosFiltrados = pedidosProduction;
    if (estadoOrden) {
      pedidosFiltrados = pedidosFiltrados.filter((p) => p.estado === estadoOrden);
    }

    // ── Procesar: Ventas por tiempo (grupo) ──
    const ventasTimelineProcesado = agruparTimeline(ventasTimeline, grupo);

    // ── Procesar: Ranking de clientes con nombres ──
    const clienteIds = clientesRanking
      .map((c) => c.cliente_id)
      .filter((id): id is bigint => id !== null);

    const clientesDetalle = clienteIds.length > 0
      ? await prisma.clientes.findMany({
          where: { id: { in: clienteIds } },
          select: { id: true, razon_social: true, ruc: true },
        })
      : [];

    const clientesMap = new Map(clientesDetalle.map((c) => [c.id.toString(), c]));

    const clientesRankingFinal = clientesRanking.map((c) => ({
      cliente_id: c.cliente_id?.toString() ?? null,
      razon_social: c.cliente_id
        ? clientesMap.get(c.cliente_id.toString())?.razon_social ?? 'N/A'
        : 'N/A',
      ruc: c.cliente_id
        ? clientesMap.get(c.cliente_id.toString())?.ruc ?? null
        : null,
      total_ordenes: c._count.id,
      total_comprado: Number(c._sum.total_orden ?? 0),
    }));

    // ── Procesar: Pareto por categoría ──
    const productoIds = categoriasPareto
      .map((p) => p.producto_id)
      .filter((id): id is bigint => id !== null);

    const productosDetalle = productoIds.length > 0
      ? await prisma.productos.findMany({
          where: { id: { in: productoIds } },
          include: { categorias: { select: { nombre: true } } },
        })
      : [];

    const productosMap = new Map(productosDetalle.map((p) => [p.id.toString(), p]));

    const categoriasParetoFinal = categoriasPareto.map((p) => {
      const prod = p.producto_id ? productosMap.get(p.producto_id.toString()) : null;
      return {
        producto_id: p.producto_id?.toString() ?? null,
        nombre: prod?.nombre ?? 'N/A',
        categoria: prod?.categorias?.nombre ?? 'Sin categoría',
        cantidad_total: p._sum.cantidad ?? 0,
        pedidos_count: p._count.id,
      };
    });

    // Filtrar por categoría si se especificó
    const categoriasFiltradas = categoriaId
      ? categoriasParetoFinal.filter((c) => c.producto_id === categoriaId)
      : categoriasParetoFinal;

    // ── Procesar: Inventario alertas ──
    const insumosAlerta = inventarioSnapshot.filter(
      (i) => i.stock_actual <= i.stock_minimo
    );

    // ── Métricas calculadas ──
    const [ordenesAgg, ventasAgg] = resumenGeneral;
    const nuevosClientes = resumenGeneral[2];
    const nuevosPedidos = resumenGeneral[3];

    const totalVentas = Number(ventasAgg._sum.total ?? 0);
    const totalOrdenes = Number(ordenesAgg._sum.total_orden ?? 0);
    const ticketPromedio = ventasAgg._count.id > 0 ? totalVentas / ventasAgg._count.id : 0;

    const crecimiento = calculoCrecimiento(ventasTimeline, fechaDesde, fechaHasta);

    // ── Respuesta ──
    return NextResponse.json(
      serializeBigInt({
        periodo: {
          desde: fechaDesde.toISOString(),
          hasta: fechaHasta.toISOString(),
          dias: Math.round((fechaHasta.getTime() - fechaDesde.getTime()) / 86400000),
        },
        metrics: {
          total_ventas: totalVentas,
          total_ordenes: totalOrdenes,
          ordenes_count: ordenesAgg._count.id,
          ventas_count: ventasAgg._count.id,
          ticket_promedio: Math.round(ticketPromedio * 100) / 100,
          nuevos_clientes: nuevosClientes,
          nuevos_pedidos: nuevosPedidos,
          crecimiento_pct: Math.round(crecimiento),
          produccion_en_curso: pedidosFiltrados.filter(
            (p) => p.estado !== 'pendiente' && p.estado !== 'entregado'
          ).length,
        },
        ventasDetalle: stringifyBigInts(ventasFiltradas),
        pedidosProduccion: stringifyBigInts(pedidosFiltrados),
        inventario: serializeBigInt(inventarioSnapshot),
        insumosAlerta: serializeBigInt(insumosAlerta),
        clientesRanking: clientesRankingFinal,
        categoriasPareto: categoriasFiltradas,
        ventasTimeline: ventasTimelineProcesado,
        pagosPorMetodo: pagosDetalle.map((p) => ({
          metodo: p.metodo_pago,
          monto_total: Number(p._sum.monto ?? 0),
          count: p._count.id,
        })),
      })
    );
  } catch (error: any) {
    console.error('Error en reportes API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

type VentaTimeline = { total: import('@prisma/client').Prisma.Decimal; created_at: Date | null };

function agruparTimeline(ventas: VentaTimeline[], grupo: string) {
  const map = new Map<string, number>();

  for (const v of ventas) {
    if (!v.created_at) continue;
    let label: string;

    if (grupo === 'mes') {
      label = v.created_at.toLocaleDateString('es-PE', { month: 'short', year: 'numeric' });
    } else if (grupo === 'semana') {
      const weekNum = getWeekNumber(v.created_at);
      label = `Sem ${weekNum}`;
    } else {
      label = v.created_at.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
    }

    map.set(label, (map.get(label) ?? 0) + Number(v.total));
  }

  return Array.from(map.entries()).map(([periodo, ventas]) => ({ periodo, ventas }));
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function calculoCrecimiento(
  ventas: VentaTimeline[],
  fechaDesde: Date,
  fechaHasta: Date
): number {
  const duracion = fechaHasta.getTime() - fechaDesde.getTime();
  const mitad = new Date(fechaDesde.getTime() + duracion / 2);

  let primeraMitad = 0;
  let segundaMitad = 0;

  for (const v of ventas) {
    if (!v.created_at) continue;
    const monto = Number(v.total);
    if (v.created_at < mitad) {
      primeraMitad += monto;
    } else {
      segundaMitad += monto;
    }
  }

  if (primeraMitad === 0) return segundaMitad > 0 ? 100 : 0;
  return Math.round(((segundaMitad - primeraMitad) / primeraMitad) * 100);
}
