export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    // 1. Sincronizamos: 4 variables para 4 consultas
    const [insumosBajoStock, pedidosPendientes, despachosAtrasados, ordenesVencidas] =
      await Promise.all([
        // Consulta 0: Alertas de stock
        prisma.insumo.findMany({
          select: { id: true, nombre: true, stock_actual: true, stock_minimo: true, categoria_insumo: true },
          orderBy: { stock_actual: 'asc' },
          take: 20,
        }),

        // Consulta 1: Pedidos pendientes
        prisma.pedidos.findMany({
          where: { estado: 'pendiente' },
          include: {
            clientes: { select: { razon_social: true } },
          },
          orderBy: { created_at: 'asc' },
          take: 20,
        }),

        // Consulta 2: Despachos atrasados
        prisma.despachos.findMany({
          where: {
            fecha_despacho: { lt: new Date() },
            estado: { not: 'entregado' },
          },
          orderBy: { fecha_despacho: 'asc' },
          take: 20,
        }),

<<<<<<< HEAD
        // 4. Órdenes con saldo pendiente vencido (más de 7 días sin pagar)
=======
        // Consulta 3: Órdenes con pago vencido (Aquí está el núcleo de tu idea)
>>>>>>> origin/test
        prisma.ordenes_compra.findMany({
          where: {
            saldo_pendiente: { gt: 0 },
            created_at: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          },
          include: {
<<<<<<< HEAD
            proveedores: { select: { razon_social: true } },
=======
            proveedores: { select: { razon_social: true } }
>>>>>>> origin/test
          },
          take: 20,
        })
      ]);

    // Filtrar insumos con stock bajo
    const insumosAlerta = insumosBajoStock.filter(
      (i) => Number(i.stock_actual) <= Number(i.stock_minimo)
    );

    // 2. Construir notificaciones unificadas
    const notificaciones: Notificacion[] = [
      // Alertas de Stock
      ...insumosAlerta.map((i) => ({
        id: `stock-${i.id.toString()}`,
        tipo: 'inventario' as const,
        titulo: 'ALERTA DE STOCK',
        descripcion: `${i.nombre} está por debajo del mínimo.`,
        importante: true,
        fecha: new Date().toISOString(),
      })),

      // Pedidos Pendientes
      ...pedidosPendientes.map((p) => ({
        id: `ped-${p.id.toString()}`,
        tipo: 'orden' as const,
        titulo: 'PEDIDO PENDIENTE',
        descripcion: `Pedido de ${p.clientes?.razon_social ?? 'Cliente'} esperando gestión.`,
        importante: p.prioridad === 'urgente' || p.prioridad === 'alta',
        fecha: p.created_at?.toISOString() ?? new Date().toISOString(),
      })),

      // Despachos Atrasados
      ...despachosAtrasados.map((d) => ({
        id: `desp-${d.id.toString()}`,
        tipo: 'urgente' as const,
        titulo: 'DESPACHO ATRASADO',
        descripcion: `Envío atrasado para el pedido #${d.pedido_id.toString()}.`,
        importante: true,
        fecha: new Date().toISOString(),
      })),

      // Órdenes Vencidas (La variable que ahora sí tiene datos)
      ...ordenesVencidas.map((o) => ({
        id: `pago-${o.id.toString()}`,
        tipo: 'pago' as const,
<<<<<<< HEAD
        titulo: 'PAGO PENDIENTE',
        descripcion: `Orden de ${o.proveedores?.razon_social ?? 'Proveedor'} con saldo pendiente de ${Number(o.saldo_pendiente ?? 0).toFixed(2)}.`,
        importante: Number(o.saldo_pendiente ?? 0) > 1000,
=======
        titulo: 'PAGO VENCIDO A PROVEEDOR',
        descripcion: `Compra a ${o.proveedores?.razon_social ?? 'Proveedor'} con saldo de ${Number(o.saldo_pendiente).toFixed(2)}.`,
        importante: Number(o.saldo_pendiente) > 1000,
>>>>>>> origin/test
        fecha: o.created_at?.toISOString() ?? new Date().toISOString(),
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
};