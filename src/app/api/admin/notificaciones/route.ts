export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    // Consultas en paralelo para rendimiento
    const [insumosBajoStock, pedidosPendientes, despachosAtrasados, ordenesSinPago] =
      await Promise.all([
        // 1. Alertas de stock — insumos bajo mínimo
        prisma.insumo.findMany({
          where: {},
          select: { id: true, nombre: true, stock_actual: true, stock_minimo: true, categoria_insumo: true },
          orderBy: { stock_actual: 'asc' },
          take: 20,
        }),

        // 2. Pedidos pendientes de gestión
        prisma.pedidos.findMany({
          where: { estado: 'pendiente' },
          include: {
            clientes: { select: { razon_social: true } },
          },
          orderBy: { created_at: 'asc' },
          take: 20,
        }),

        // 3. Despachos atrasados (fecha_despacho pasada y no entregado)
        prisma.despachos.findMany({
          where: {
            fecha_despacho: { lt: new Date() },
            estado: { not: 'entregado' },
          },
          orderBy: { fecha_despacho: 'asc' },
          take: 20,
        }),

        // 4. Órdenes con saldo pendiente vencido (más de 7 días sin pagar)
        prisma.ordenes_compra.findMany({
          where: {
            saldo_pendiente: { gt: 0 },
            created_at: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
          include: {
            proveedores: { select: { razon_social: true } },
          },
          orderBy: { created_at: 'asc' },
          take: 20,
        }),
      ])

    // Filtrar insumos con stock bajo (Prisma no soporta field refs directos en where)
    const insumosAlerta = insumosBajoStock.filter(
      (i) => i.stock_actual <= i.stock_minimo
    );

    // ── Construir notificaciones ──
    const notificaciones: Notificacion[] = [
      // Alertas de Stock
      ...insumosAlerta.map((i) => ({
        id: `stock-${i.id.toString()}`,
        tipo: 'inventario' as const,
        titulo: 'ALERTA DE STOCK',
        descripcion: `${i.nombre} está por debajo del mínimo (Actual: ${i.stock_actual} / Mín: ${i.stock_minimo}). Categoría: ${i.categoria_insumo}.`,
        importante: true as const,
        fecha: new Date().toISOString(),
      })),

      // Pedidos Pendientes
      ...pedidosPendientes.map((p) => ({
        id: `ped-${p.id.toString()}`,
        tipo: 'orden' as const,
        titulo: 'PEDIDO PENDIENTE',
        descripcion: `Pedido de ${p.clientes?.razon_social ?? 'Cliente'} esperando gestión. Prioridad: ${p.prioridad ?? 'normal'}.`,
        importante: (p.prioridad === 'urgente' || p.prioridad === 'alta') as boolean,
        fecha: p.created_at?.toISOString() ?? new Date().toISOString(),
      })),

      // Despachos Atrasados
      ...despachosAtrasados.map((d) => ({
        id: `desp-${d.id.toString()}`,
        tipo: 'urgente' as const,
        titulo: 'DESPACHO ATRASADO',
        descripcion: `El despacho para el pedido #${d.pedido_id.toString()} ha superado la fecha límite (${new Date(d.fecha_despacho).toLocaleDateString()}).`,
        importante: true as const,
        fecha: new Date().toISOString(),
      })),

      // Órdenes con pago vencido
      ...ordenesSinPago.map((o) => ({
        id: `pago-${o.id.toString()}`,
        tipo: 'pago' as const,
        titulo: 'PAGO PENDIENTE',
        descripcion: `Orden de ${o.proveedores?.razon_social ?? 'Proveedor'} con saldo pendiente de ${Number(o.saldo_pendiente ?? 0).toFixed(2)}.`,
        importante: Number(o.saldo_pendiente ?? 0) > 1000,
        fecha: o.created_at?.toISOString() ?? new Date().toISOString(),
      })),
    ];

    // Ordenar por importancia y fecha
    notificaciones.sort((a, b) => {
      if (a.importante !== b.importante) return a.importante ? -1 : 1;
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    });

    // KPIs de notificaciones
    const kpis = {
      sinLeer: notificaciones.length,
      total: notificaciones.length,
      urgentes: notificaciones.filter((n) => n.importante).length,
      porTipo: {
        inventario: notificaciones.filter((n) => n.tipo === 'inventario').length,
        orden: notificaciones.filter((n) => n.tipo === 'orden').length,
        urgente: notificaciones.filter((n) => n.tipo === 'urgente').length,
        pago: notificaciones.filter((n) => n.tipo === 'pago').length,
      },
    };

    return NextResponse.json(
      serializeBigInt({
        data: notificaciones,
        kpis,
        count: notificaciones.length,
      })
    );
  } catch (error: any) {
    console.error('[API_NOTIF] Error:', error);
    return NextResponse.json(
      {
        error: error.message,
        data: [],
        kpis: { sinLeer: 0, total: 0, urgentes: 0, porTipo: {} },
        count: 0,
      },
      { status: 500 }
    );
  }
}

// ─── Types ─────────────────────────────────────────────────────────────────

type Notificacion = {
  id: string;
  tipo: 'inventario' | 'orden' | 'urgente' | 'pago';
  titulo: string;
  descripcion: string;
  importante: boolean;
  fecha: string;
};
