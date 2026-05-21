export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/auth/server';
import { notificacionesService } from '@/lib/services/notificaciones.service';

export async function GET(req: Request) {
  const auth = await requireServerAuth();
  if (!auth.success) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const usuarioId = auth.user?.id; 
  if (!usuarioId) {
    return NextResponse.json({ error: 'No se pudo identificar al usuario de la sesión' }, { status: 401 });
  }

  try {
    // 1. Escaneo en tiempo real de incidencias del sistema
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

    // 2. Mapear usando EXACTAMENTE los nombres de tu ENUM de Supabase
    const incidenciasDetectadas: Array<any> = [
      ...insumosBajoStock.map((i) => ({
        usuario_id: usuarioId,
        tipo: 'stock_bajo' as const, // Match con Supabase enum
        titulo: 'ALERTA DE STOCK',
        mensaje: `${i.nombre} está por debajo del mínimo (${i.stock_actual}/${i.stock_minimo}).`,
        referencia_tipo: 'PRODUCTO' as const,
        referencia_id: i.id,
        url_destino: '/admin/Panel-Administrativo/inventario',
      })),

      ...pedidosPendientes.map((p) => ({
        usuario_id: usuarioId,
        tipo: 'orden_produccion' as const, // Match con Supabase enum
        titulo: 'PEDIDO PENDIENTE',
        mensaje: `Pedido de ${p.clientes?.razon_social ?? 'Cliente'} esperando gestión.`,
        referencia_tipo: 'PEDIDO' as const,
        referencia_id: p.id,
        url_destino: '/admin/Panel-Administrativo/pedidos',
      })),

      ...despachosAtrasados.map((d) => ({
        usuario_id: usuarioId,
        tipo: 'pedido_vencido' as const, // Match con Supabase enum (Despacho retrasado impacta al vencimiento del pedido)
        titulo: 'DESPACHO ATRASADO',
        mensaje: `Envío atrasado para el pedido #${d.pedido_id.toString()}.`,
        referencia_tipo: 'PEDIDO' as const,
        referencia_id: d.id,
        url_destino: '/admin/Panel-Administrativo/despachos',
      })),

      ...ordenesVencidas.map((o) => ({
        usuario_id: usuarioId,
        tipo: 'pago_pendiente' as const, // Match con Supabase enum
        titulo: 'PAGO VENCIDO A PROVEEDOR',
        mensaje: `Compra a ${o.proveedores?.razon_social ?? 'Proveedor'} con saldo pendiente.`,
        referencia_tipo: 'PAGO' as const,
        referencia_id: o.id,
        url_destino: '/admin/Panel-Administrativo/cotizaciones-proveedor',
      }))
    ];

    // 3. Guardar registros nuevos de forma inteligente en la Base de Datos
    for (const incidencia of incidenciasDetectadas) {
      const yaExiste = await prisma.notificaciones.findFirst({
        where: {
          usuario_id: incidencia.usuario_id,
          referencia_tipo: incidencia.referencia_tipo,
          referencia_id: incidencia.referencia_id,
          leido: false,
        }
      });

      if (!yaExiste) {
        await notificacionesService.crear(incidencia);
      }
    }

    // 4. Leer las alertas persistidas reales desde PostgreSQL
    const notificacionesDb = await notificacionesService.obtenerPorUsuario(usuarioId, { limite: 30 });
    const sinLeerCount = await notificacionesService.obtenerNoLeidas(usuarioId);

    // 5. KPIs recalculados con las llaves correctas de tu enum real
    const kpis = {
      sinLeer: sinLeerCount,
      total: notificacionesDb.length,
      urgentes: notificacionesDb.filter((n) => n.tipo === 'pedido_vencido' && !n.leido).length,
      porTipo: {
        stock_bajo: notificacionesDb.filter((n) => n.tipo === 'stock_bajo').length,
        orden_produccion: notificacionesDb.filter((n) => n.tipo === 'orden_produccion').length,
        pedido_vencido: notificacionesDb.filter((n) => n.tipo === 'pedido_vencido').length,
        pago_pendiente: notificacionesDb.filter((n) => n.tipo === 'pago_pendiente').length,
      },
    };

    return NextResponse.json(
      serializeBigInt({
        data: notificacionesDb,
        kpis,
        count: notificacionesDb.length,
      })
    );

  } catch (error: any) {
    console.error('[API_NOTIF] Error:', error);
    return NextResponse.json({ error: error.message, data: [] }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const auth = await requireServerAuth();
  if (!auth.success) return NextResponse.json({ error: auth.error }, { status: auth.status });
  
  const usuarioId = auth.user?.id;
  if (!usuarioId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    await notificacionesService.marcarTodasComoLeidas(usuarioId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}