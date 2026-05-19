export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';

import { requireServerAuth } from '@/lib/auth/server';

export async function GET(req: Request) {
  const auth = await requireServerAuth();
  if (!auth.success) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    // 1. Sincronizamos
    const [insumosBajoStock, pedidosPendientes, despachosAtrasados, ordenesVencidas] =
      await Promise.all([
        prisma.insumo.findMany({
          where: { stock_actual: { lte: prisma.insumo.fields.stock_minimo } },
          select: { id: true, nombre: true, stock_actual: true, stock_minimo: true, created_at: true },
          orderBy: { stock_actual: 'asc' },
          take: 20,
        }),

        prisma.pedidos.findMany({
          where: { estado: 'pendiente' },
          include: {
            clientes: { select: { razon_social: true } },
          },
          orderBy: { created_at: 'desc' },
          take: 20,
        }),

        prisma.despachos.findMany({
          where: {
            fecha_despacho: { lt: new Date() },
            estado: { not: 'entregado' },
          },
          orderBy: { fecha_despacho: 'asc' },
          take: 20,
        }),

        prisma.ordenes_compra.findMany({
          where: {
            saldo_pendiente: { gt: 0 },
            created_at: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          },
          include: {
            proveedores: { select: { razon_social: true } }
          },
          take: 20,
        })
      ]);

    // 2. Construir notificaciones unificadas
    const notificaciones: Notificacion[] = [
      ...insumosBajoStock.map((i) => ({
        id: `stock-${i.id.toString()}`,
        tipo: 'inventario' as const,
        titulo: 'ALERTA DE STOCK',
        descripcion: `${i.nombre} está por debajo del mínimo (${i.stock_actual}/${i.stock_minimo}).`,
        importante: true,
        fecha: i.created_at?.toISOString() ?? new Date().toISOString(),
        url_destino: '/admin/Panel-Administrativo/inventario',
      })),

      ...pedidosPendientes.map((p) => ({
        id: `ped-${p.id.toString()}`,
        tipo: 'orden' as const,
        titulo: 'PEDIDO PENDIENTE',
        descripcion: `Pedido de ${p.clientes?.razon_social ?? 'Cliente'} esperando gestión.`,
        importante: p.prioridad === 'urgente' || p.prioridad === 'alta',
        fecha: p.created_at?.toISOString() ?? new Date().toISOString(),
        url_destino: '/admin/Panel-Administrativo/pedidos',
      })),

      ...despachosAtrasados.map((d) => ({
        id: `desp-${d.id.toString()}`,
        tipo: 'urgente' as const,
        titulo: 'DESPACHO ATRASADO',
        descripcion: `Envío atrasado para el pedido #${d.pedido_id.toString()}.`,
        importante: true,
        fecha: d.fecha_despacho?.toISOString() ?? new Date().toISOString(),
        url_destino: '/admin/Panel-Administrativo/despachos',
      })),

      ...ordenesVencidas.map((o) => ({
        id: `pago-${o.id.toString()}`,
        tipo: 'pago' as const,
        titulo: 'PAGO VENCIDO A PROVEEDOR',
        descripcion: `Compra a ${o.proveedores?.razon_social ?? 'Proveedor'} con saldo pendiente.`,
        importante: Number(o.saldo_pendiente) > 1000,
        fecha: o.created_at?.toISOString() ?? new Date().toISOString(),
        url_destino: '/admin/Panel-Administrativo/cotizaciones-proveedor',
      }))
    ];

    // Ordenar por importancia y fecha
    notificaciones.sort((a, b) => {
      if (a.importante !== b.importante) return a.importante ? -1 : 1;
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    });

    // 3. KPIs para el Dashboard
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
    return NextResponse.json({ error: error.message, data: [] }, { status: 500 });
  }
}

type Notificacion = {
  id: string;
  tipo: 'inventario' | 'orden' | 'urgente' | 'pago';
  titulo: string;
  descripcion: string;
  importante: boolean;
  fecha: string;
  url_destino?: string;
};