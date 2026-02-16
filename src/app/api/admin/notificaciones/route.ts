import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    // 1. Consultas en paralelo para mejor rendimiento (Performance Optimization)
    const [resProductos, resPedidos, resDespachos] = await Promise.all([
      supabase.from('productos').select('id, nombre, stock').lt('stock', 400),
      supabase.from('pedidos').select('id, cliente_nombre').eq('estado', 'pendiente'),
      supabase.from('despachos').select('id, id_pedido').lt('fecha_entrega', new Date().toISOString()).neq('estado', 'entregado')
    ]);

    // 2. Formateo de Notificaciones
    const notificacionesRealtime = [
      // Alertas de Stock (Regla < 400)
      ...(resProductos.data?.map(p => ({
        id: `stock-${p.id}`,
        tipo: 'inventario',
        titulo: 'ALERTA DE STOCK',
        descripcion: `${p.nombre} está por debajo del mínimo (Actual: ${p.stock} / Mín: 400).`,
        importante: true,
        fecha: new Date().toISOString()
      })) || []),

      // Pedidos Pendientes
      ...(resPedidos.data?.map(p => ({
        id: `ped-${p.id}`,
        tipo: 'orden',
        titulo: 'PEDIDO PENDIENTE',
        descripcion: `Nueva orden de ${p.cliente_nombre || 'Cliente'} esperando gestión.`,
        importante: false,
        fecha: new Date().toISOString()
      })) || []),

      // Despachos Atrasados
      ...(resDespachos.data?.map(d => ({
        id: `desp-${d.id}`,
        tipo: 'urgente',
        titulo: 'DESPACHO ATRASADO',
        descripcion: `El despacho para el pedido #${d.id_pedido} ha superado la fecha límite.`,
        importante: true,
        fecha: new Date().toISOString()
      })) || [])
    ];

    // 3. Respuesta con KPIs actualizados
    return NextResponse.json({
      data: notificacionesRealtime,
      kpis: {
        sinLeer: notificacionesRealtime.length,
        total: notificacionesRealtime.length,
        urgentes: notificacionesRealtime.filter(n => n.importante).length
      },
      count: notificacionesRealtime.length
    });

  } catch (error) {
    console.error('[API_NOTIF] Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}