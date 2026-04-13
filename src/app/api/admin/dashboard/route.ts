export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const dateLimit = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Todas las consultas en paralelo para rendimiento
    const [
      totalVentas,
      totalClientes,
      nuevasOrdenes,
      stockAlerta,
      ventasPeriodo,
      ordenesRecientes,
      stockCritico,
      topVariantes,
    ] = await Promise.all([
      // 1. Total ventas (suma de todos los totales)
      prisma.ventas.aggregate({
        _sum: { total: true },
        _count: { id: true },
      }),

      // 2. Total clientes
      prisma.clientes.count({
        where: { activo: 'activo' },
      }),

      // 3. Nuevas órdenes en el período
      prisma.ordenes.count({
        where: { created_at: { gte: dateLimit } },
      }),

      // 4. Insumos bajo stock mínimo
      prisma.insumo.count({
        where: {
          stock_actual: { lte: prisma.insumo.fields.stock_minimo as unknown as number },
        },
      }),

      // 5. Ventas del período (para gráfico de ingresos)
      prisma.ventas.findMany({
        where: { created_at: { gte: dateLimit } },
        select: { total: true, created_at: true },
        orderBy: { created_at: 'asc' },
      }),

      // 6. Órdenes recientes (tabla dashboard)
      prisma.ordenes.findMany({
        take: 5,
        include: {
          cliente: { select: { razon_social: true, ruc: true } },
        },
        orderBy: { created_at: 'desc' },
      }),

      // 7. Stock crítico (insumos con stock_actual <= stock_minimo)
      prisma.insumo.findMany({
        where: {},
        orderBy: { stock_actual: 'asc' },
        take: 10,
      }),

      // 8. Top variantes más solicitadas (vía pedido_items)
      prisma.pedido_items.groupBy({
        by: ['variante_id'],
        _sum: { cantidad: true },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
    ]);

    // Resolver nombres de variantes del top
    const varianteIds = topVariantes
      .map((v) => v.variante_id)
      .filter((id): id  is bigint => id !== null);

    const variantesDetalle = varianteIds.length > 0
      ? await prisma.variantes_producto.findMany({
          where: { id: { in: varianteIds } },
          select: { id: true, nombre: true, color: true, talla: true },
        })
      : [];

    const variantesMap = new Map(variantesDetalle.map((v) => [v.id.toString(), v]));

    const topProductos = topVariantes.map((v) => ({
      variante_id: v.variante_id?.toString() ?? null,
      nombre: v.variante_id ? variantesMap.get(v.variante_id.toString())?.nombre ?? 'N/A' : 'N/A',
      color: v.variante_id ? variantesMap.get(v.variante_id.toString())?.color ?? null : null,
      talla: v.variante_id ? variantesMap.get(v.variante_id.toString())?.talla ?? null : null,
      cantidad_vendida: v._sum.cantidad ?? 0,
      pedidos_count: v._count.id,
    }));

    // Filtrar stock crítico en memoria (Prisma no soporta field refs en where)
    const stockCriticoFiltrado = stockCritico.filter(
      (i) => i.stock_actual <= i.stock_minimo
    );

    // Postgrest-style count para stock_alerta
    const stockAlertaReal = stockAlerta;

    return NextResponse.json(
      serializeBigInt({
        kpis: {
          total_ventas: totalVentas._sum.total ?? 0,
          ventas_count: totalVentas._count.id,
          total_clientes: totalClientes,
          nuevas_ordenes: nuevasOrdenes,
          stock_alerta: stockAlertaReal,
        },
        chartIngresos: ventasPeriodo,
        recentOrders: ordenesRecientes,
        criticalStock: stockCriticoFiltrado,
        topProductos,
      })
    );
  } catch (error: any) {
    console.error('Error Crítico en Dashboard API:', error);
    return NextResponse.json(
      {
        error: error.message,
        kpis: {
          total_ventas: 0,
          ventas_count: 0,
          total_clientes: 0,
          nuevas_ordenes: 0,
          stock_alerta: 0,
        },
        chartIngresos: [],
        recentOrders: [],
        criticalStock: [],
        topProductos: [],
      },
      { status: 500 }
    );
  }
}
