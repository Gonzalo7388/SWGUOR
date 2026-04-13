export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';
import { EstadoOrden } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const dateLimit = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const today = new Date();

    const [
      totalVentas,
      totalClientes,
      nuevasOrdenes,
      stockAlerta,
      ventasPeriodo,
      ordenesRecientes,
      stockCritico,
      topItemsRaw,
      produccionStatusRaw,
      ordenesRetrasadas,
      productosSinVariantes,
      pedidosUrgentes,
      seguimientoOrdenes,
    ] = await Promise.all([
      // 1. KPIs Financieros
      prisma.ventas.aggregate({ _sum: { total: true }, _count: { id: true } }),
      
      // 2. Clientes activos
      prisma.clientes.count({ where: { activo: 'activo' } }),

      // 3. Órdenes nuevas
      prisma.ordenes.count({ where: { created_at: { gte: dateLimit } } }),

      // 4. Conteo de alertas de stock
      prisma.insumo.count({
        where: { stock_actual: { lte: prisma.insumo.fields.stock_minimo } },
      }),

      // 5. Histórico de ventas (Gráfico)
      prisma.ventas.findMany({
        where: { created_at: { gte: dateLimit } },
        select: { total: true, created_at: true },
        orderBy: { created_at: 'asc' },
      }),

      // 6. Órdenes recientes (Tabla)
      prisma.ordenes.findMany({
        take: 8,
        include: { cliente: { select: { razon_social: true } } },
        orderBy: { created_at: 'desc' },
      }),

      // 7. Stock bajo el mínimo
      prisma.insumo.findMany({
        orderBy: { stock_actual: 'asc' },
        take: 10,
      }),

      // 8. Ranking de ítems
      prisma.pedido_items.groupBy({
        by: ['variante_id'],
        _sum: { cantidad: true },
        orderBy: { _sum: { cantidad: 'desc' } },
        take: 5,
      }),

      // 9. Lotes por estado
      prisma.ordenes.groupBy({
        by: ['estado'],
        _count: { id: true }
      }),

      // 10. Conteo de retrasos (Alerta Crítica)
      prisma.ordenes.count({
        where: {
          fecha_prometida_entrega: { lt: today },
          estado: { notIn: ['entregado' as EstadoOrden, 'cancelado' as EstadoOrden] }
        }
      }),

      // 11. Productos sin variantes/ficha (Para DISEÑADOR)
      prisma.productos.count({
        where: { variantes_producto: { none: {} } }
      }),

      // 12. Pedidos urgentes (Para CORTADOR/TALLER)
      // Definimos urgente como solicitado y con fecha de entrega próxima
      prisma.ordenes.findMany({
        where: { estado: 'solicitado' as EstadoOrden },
        take: 5,
        orderBy: { created_at: 'asc' }, 
        include: { cliente: { select: { razon_social: true } } }
      }),

      // 13. Seguimiento detallado (Para RECEPCIONISTA/ADMIN)
      prisma.ordenes.findMany({
        take: 10,
        select: {
          id: true,
          estado: true,
          created_at: true,
          cliente: { select: { razon_social: true } }
        },
        orderBy: { created_at: 'desc' }
      }),

      // 14. Alertas Retraso (GERENTE)
      // Conteo de órdenes que deberían haberse entregado pero aún no lo están
      prisma.ordenes.count({
        where: {
          estado: { notIn: ['entregado' as EstadoOrden, 'cancelado' as EstadoOrden] },
          created_at: { lt: dateLimit }
        }
      })
    ]);

    // Procesamiento de nombres de productos para el gráfico
    const chartProductos = await Promise.all(
      topItemsRaw.map(async (item) => {
        const variante = await prisma.variantes_producto.findUnique({
          where: { id: item.variante_id as bigint },
          include: { productos: { select: { nombre: true } } }
        });
        return {
          cantidad: Number(item._sum.cantidad || 0),
          productos: {
            nombre: variante?.productos?.nombre 
              ? `${variante.productos.nombre} (${variante.color})`
              : 'Desconocido'
          }
        };
      })
    );

    // Agrupación final de datos operativos
    const operaciones = {
      lotes_por_estado: produccionStatusRaw.reduce((acc, curr) => {
        const estadoKey = curr.estado ?? 'sin_estado'; 
        acc[estadoKey] = curr._count.id;
        return acc;
      }, {} as Record<string, number>),
      alertas_retraso: ordenesRetrasadas,
      productos_sin_ficha: productosSinVariantes,
      pedidos_urgentes: pedidosUrgentes,
      seguimiento: seguimientoOrdenes
    };

    return NextResponse.json(
      serializeBigInt({
        kpis: {
          total_ventas: totalVentas._sum.total ?? 0,
          ventas_count: totalVentas._count.id,
          recentOrdenes: ordenesRecientes.length,
          total_clientes: totalClientes,
          nuevas_ordenes: nuevasOrdenes,
          stock_alerta: stockAlerta,
          retrasos_totales: ordenesRetrasadas
        },
        operaciones,
        chartIngresos: ventasPeriodo,
        recentOrders: ordenesRecientes,
        criticalStock: stockCritico.filter(i => Number(i.stock_actual) <= Number(i.stock_minimo)),
        chartProductos,
      })
    );
  } catch (error: any) {
    console.error('Error en Dashboard API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}