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
    const grupo = searchParams.get('grupo') || 'dia';

    const whereFecha = { gte: fechaDesde, lte: fechaHasta };

    // ── Consultas en paralelo (Alineación corregida) ──
    const [
      resumenGeneral,       // 0
      ventasDetalle,        // 1
      pedidosProduction,    // 2
      inventarioSnapshot,   // 3
      clientesRanking,      // 4
      categoriasPareto,     // 5
      ventasTimeline,       // 6
      pagosDetalle,         // 7
    ] = await Promise.all([
      // 0. RESUMEN GENERAL
      prisma.$transaction([
        prisma.ordenes_compra.aggregate({
          where: { created_at: whereFecha },
          _count: { id: true },
          _sum: { total_orden: true },
        }),
        prisma.ventas.aggregate({
          where: { created_at: whereFecha },
          _count: { id: true },
          _sum: { total: true },
        }),
        prisma.clientes.count({ where: { created_at: whereFecha } }),
        prisma.pedidos.count({ where: { created_at: whereFecha } }),
      ]),

      // 1. DETALLE DE VENTAS
      prisma.ventas.findMany({
        where: { created_at: whereFecha },
        include: {
          pedidos: { 
            include: { clientes: { select: { razon_social: true, ruc: true } } }
          },
        } as any,
        orderBy: { created_at: 'desc' },
        take: 100,
      }),

      // 2. PEDIDOS EN PRODUCCIÓN
      prisma.pedidos.findMany({
        where: { created_at: whereFecha },
        include: {
          clientes: { select: { razon_social: true } },
          pedido_items: { include: { productos: { select: { nombre: true } } } },
        },
        orderBy: { created_at: 'desc' },
      }),

      // 3. SNAPSHOT DE INVENTARIO (Se eliminó el duplicado que causaba el error)
      prisma.insumo.findMany({
        select: { id: true, nombre: true, stock_actual: true, stock_minimo: true },
        orderBy: { stock_actual: 'asc' },
      }),

      // 4. RANKING DE CLIENTES
      prisma.pedidos.groupBy({
        by: ['cliente_id'],
        _count: { id: true },
        _sum: { total_estimado: true },
        where: { created_at: whereFecha, cliente_id: { not: null } },
        orderBy: { _sum: { total_estimado: 'desc' } },
        take: 10,
      }),

      // 5. PARETO POR CATEGORÍA
      prisma.pedido_items.groupBy({
        by: ['producto_id'],
        _sum: { cantidad: true },
        _count: { id: true },
        orderBy: { _sum: { cantidad: 'desc' } },
        take: 15,
      }),

      // 6. VENTAS AGRUPADAS POR TIEMPO
      prisma.ventas.findMany({
        where: { created_at: whereFecha },
        select: { total: true, created_at: true },
        orderBy: { created_at: 'asc' },
      }),

      // 7. DETALLE DE PAGOS
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
        (v: any) => v.pedidos?.cliente_id?.toString() === clienteId
      );
    }

    let pedidosFiltrados = pedidosProduction;
    if (estadoOrden) {
      pedidosFiltrados = pedidosFiltrados.filter((p) => p.estado === estadoOrden);
    }

    // ── Procesamiento de Rankings y Timelines ──
    const ventasTimelineProcesado = agruparTimeline(ventasTimeline, grupo);

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
      total_ordenes: c._count?.id ?? 0,
      total_comprado: Number(c._sum?.total_estimado ?? 0),
    }));

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
        cantidad_total: Number(p._sum?.cantidad ?? 0),
        pedidos_count: p._count?.id ?? 0,
      };
    });

    const [ordenesAgg, ventasAgg] = resumenGeneral;
    const nuevosClientes = resumenGeneral[2];
    const nuevosPedidos = resumenGeneral[3];

    const totalVentas = Number(ventasAgg._sum?.total ?? 0);
    const totalOrdenesComp = Number(ordenesAgg._sum?.total_orden ?? 0);
    const crecimiento = calculoCrecimiento(ventasTimeline, fechaDesde, fechaHasta);

    return NextResponse.json(
      serializeBigInt({
        metrics: {
          total_ventas: totalVentas,
          total_ordenes_compra: totalOrdenesComp,
          ventas_count: ventasAgg._count?.id ?? 0,
          nuevos_clientes: nuevosClientes,
          nuevos_pedidos: nuevosPedidos,
          crecimiento_pct: Math.round(crecimiento),
          produccion_en_curso: pedidosFiltrados.filter(
            (p) => p.estado !== 'entregado'
          ).length,
        },
        ventasDetalle: stringifyBigInts(ventasFiltradas),
        pedidosProduccion: stringifyBigInts(pedidosFiltrados),
        clientesRanking: clientesRankingFinal,
        categoriasPareto: categoriasParetoFinal,
        ventasTimeline: ventasTimelineProcesado,
        pagosPorMetodo: pagosDetalle.map((p) => ({
          metodo: p.metodo_pago,
          monto_total: Number(p._sum?.monto ?? 0),
          count: p._count?.id ?? 0,
        })),
      })
    );
  } catch (error: any) {
    console.error('Error en reportes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function agruparTimeline(ventas: any[], grupo: string) {
  const map = new Map<string, number>();
  for (const v of ventas) {
    if (!v.created_at) continue;
    let label: string;
    if (grupo === 'mes') {
      label = v.created_at.toLocaleDateString('es-PE', { month: 'short', year: 'numeric' });
    } else if (grupo === 'semana') {
      const weekNum = Math.ceil(v.created_at.getDate() / 7);
      label = `Sem ${weekNum}`;
    } else {
      label = v.created_at.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
    }
    map.set(label, (map.get(label) ?? 0) + Number(v.total));
  }
  return Array.from(map.entries()).map(([periodo, ventas]) => ({ periodo, ventas }));
}

function calculoCrecimiento(ventas: any[], fechaDesde: Date, fechaHasta: Date): number {
  const duracion = fechaHasta.getTime() - fechaDesde.getTime();
  const mitad = new Date(fechaDesde.getTime() + duracion / 2);
  let primeraMitad = 0;
  let segundaMitad = 0;
  for (const v of ventas) {
    if (!v.created_at) continue;
    const monto = Number(v.total);
    if (new Date(v.created_at) < mitad) primeraMitad += monto;
    else segundaMitad += monto;
  }
  if (primeraMitad === 0) return segundaMitad > 0 ? 100 : 0;
  return ((segundaMitad - primeraMitad) / primeraMitad) * 100;
}