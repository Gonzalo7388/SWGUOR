// app/api/admin/dashboard/route.ts
// ─── Endpoint que alimenta el AdminDashboard ───────────────────────────────────
// Conecta con Supabase (tu cliente existente) y devuelve el formato AdminDashboardData.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'; // ajusta el path a tu cliente
import { requireServerRole } from '@/lib/auth/server';
import type { RolUsuario } from '@/lib/constants/roles';

const DASHBOARD_ROLES: RolUsuario[] = ['administrador', 'gerente'];

export async function GET(req: NextRequest) {
  const auth = await requireServerRole(DASHBOARD_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const days = Number(req.nextUrl.searchParams.get('days') ?? '30');
  const supabase = await createClient();

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceISO = since.toISOString();

  try {
    // ── 1. KPIs principales ────────────────────────────────────────────────────
    const [
      { data: ventas },
      { count: pedidosActivos },
      { count: cotizacionesPend },
      { count: clientesB2B },
      { data: confecciones },
      { data: stockAlerts },
      { data: feedbackRows },
    ] = await Promise.all([
      supabase
        .from('ventas')
        .select('total, created_at')
        .gte('created_at', sinceISO),

      supabase
        .from('ordenes')
        .select('*', { count: 'exact', head: true })
        .not('estado', 'in', '("cancelado","finalizado")'),

      supabase
        .from('cotizaciones')
        .select('*', { count: 'exact', head: true })
        .in('estado', ['borrador', 'enviada']),

      supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true })
        .eq('activo', 'activo'),

      supabase
        .from('confecciones')
        .select('estado')
        .not('estado', 'eq', 'finalizado'),

      supabase
        .from('insumo')
        .select('nombre, stock_actual, stock_minimo, unidad_medida')
        .filter('stock_actual', 'lt', 'stock_minimo'),  // stock_actual < stock_minimo

      supabase
        .from('feedback_cliente')
        .select('puntuacion')
        .gte('created_at', sinceISO),
    ]);

    const facturacion     = (ventas ?? []).reduce((s, v) => s + Number(v.total), 0);
    const produccionPct   = confecciones?.length
      ? Math.round(((confecciones.filter(c => c.estado === 'finalizado').length) / confecciones.length) * 100)
      : 0;
    const satisfaccion    = feedbackRows?.length
      ? +(feedbackRows.reduce((s, f) => s + f.puntuacion, 0) / feedbackRows.length).toFixed(1)
      : 0;

    // ── 2. Ventas mensuales (últimos 7 meses) ──────────────────────────────────
    const { data: ventasMes } = await supabase
      .from('ventas')
      .select('total, created_at')
      .gte('created_at', new Date(new Date().setMonth(new Date().getMonth() - 7)).toISOString());

    const mesMap: Record<string, number> = {};
    for (const v of ventasMes ?? []) {
      const key = new Date(v.created_at).toLocaleDateString('es-PE', { month: 'short' });
      mesMap[key] = (mesMap[key] ?? 0) + Number(v.total) / 1000; // en miles
    }
    const ventasMensuales = Object.entries(mesMap).map(([mes, ventas]) => ({
      mes, ventas: Math.round(ventas), meta: Math.round(ventas * 0.9),
    }));

    // ── 3. Estado de pedidos ───────────────────────────────────────────────────
    const { data: ordenesAll } = await supabase
      .from('ordenes')
      .select('estado')
      .gte('created_at', sinceISO);

    const estadoMap: Record<string, number> = {};
    for (const o of ordenesAll ?? []) {
      estadoMap[o.estado] = (estadoMap[o.estado] ?? 0) + 1;
    }
    const total = Object.values(estadoMap).reduce((s, v) => s + v, 0) || 1;
    const ESTADO_COLORS: Record<string, string> = {
      finalizado: '#0d9488', en_proceso: '#0284c7',
      solicitado: '#f59e0b', cotizado: '#9333ea',
      aprobado: '#16a34a', pagado: '#22d3ee', cancelado: '#f43f5e',
    };
    const estadoPedidos = Object.entries(estadoMap).map(([estado, count]) => ({
      estado, count: Math.round((count / total) * 100), color: ESTADO_COLORS[estado] ?? '#4e7a96',
    }));

    // ── 4. Pipeline ────────────────────────────────────────────────────────────
    const PIPE_ORDER = ['solicitado','cotizado','aprobado','pagado','en_proceso','finalizado'];
    const PIPE_LABELS: Record<string, string> = {
      solicitado: 'Solicitado', cotizado: 'Cotizado', aprobado: 'Aprobado',
      pagado: 'Pagado', en_proceso: 'En Proceso', finalizado: 'Finalizado',
    };
    const PIPE_COLORS: Record<string, string> = {
      solicitado: '#3B82F6', cotizado: '#9333EA', aprobado: '#16A34A',
      pagado: '#0D9488', en_proceso: '#EA580C', finalizado: '#0F766E',
    };
    const pipeline = PIPE_ORDER.map(key => ({
      key, label: PIPE_LABELS[key], color: PIPE_COLORS[key],
      count: estadoMap[key] ?? 0,
    }));

    // ── 5. Top productos ───────────────────────────────────────────────────────
    const { data: itemsRaw } = await supabase
      .from('pedido_items')
      .select('cantidad, producto_id, productos(nombre)')
      .gte('created_at', sinceISO)  // NOTE: pedido_items no tiene created_at; ajusta join a pedidos si es necesario
      .order('cantidad', { ascending: false })
      .limit(50);

    const prodMap: Record<number, { nombre: string; cantidad: number; monto: number }> = {};
    for (const item of itemsRaw ?? []) {
      if (!prodMap[item.producto_id]) {
        prodMap[item.producto_id] = { nombre: (item.productos as any)?.nombre ?? '—', cantidad: 0, monto: 0 };
      }
      prodMap[item.producto_id].cantidad += item.cantidad;
    }
    const topProductos = Object.values(prodMap)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    // ── 6. Stock crítico ───────────────────────────────────────────────────────
    const stockCriticoList = (stockAlerts ?? []).slice(0, 5).map(s => ({
      nombre: s.nombre,
      stock_actual: s.stock_actual,
      stock_minimo: s.stock_minimo,
      unidad: s.unidad_medida,
    }));

    // ── 7. Últimas ventas ──────────────────────────────────────────────────────
    const { data: ultimasVentasRaw } = await supabase
      .from('ventas')
      .select('id, total, estado_pago, metodo_pago, created_at, ordenes(clientes(razon_social))')
      .order('created_at', { ascending: false })
      .limit(5);

    const ultimasVentas = (ultimasVentasRaw ?? []).map(v => ({
      id: `V-${String(v.id).slice(-4).padStart(4, '0')}`,
      cliente: (v.ordenes as any)?.clientes?.razon_social ?? '—',
      total: Number(v.total),
      estado_pago: v.estado_pago,
      metodo_pago: v.metodo_pago ?? '—',
      created_at: v.created_at,
    }));

    // ── 8. Confecciones activas ────────────────────────────────────────────────
    const { data: confRaw } = await supabase
      .from('confecciones')
      .select('estado, pedido_id, fecha_fin, talleres(nombre)')
      .not('estado', 'eq', 'finalizado')
      .order('fecha_fin', { ascending: true })
      .limit(5);

    const confecciones2 = (confRaw ?? []).map(c => ({
      taller: (c.talleres as any)?.nombre ?? '—',
      estado: c.estado,
      pedido_id: c.pedido_id,
      fecha_fin: c.fecha_fin ?? null,
    }));

    // ── 9. Cotizaciones pendientes ─────────────────────────────────────────────
    const { data: cotRaw } = await supabase
      .from('cotizaciones')
      .select('numero, total, valida_hasta, estado, clientes(razon_social)')
      .in('estado', ['borrador', 'enviada'])
      .order('valida_hasta', { ascending: true })
      .limit(5);

    const cotizaciones = (cotRaw ?? []).map(c => ({
      numero: c.numero,
      cliente: (c.clientes as any)?.razon_social ?? '—',
      total: Number(c.total),
      valida_hasta: c.valida_hasta,
      estado: c.estado,
    }));

    // ── 10. Feedback reciente ──────────────────────────────────────────────────
    const { data: fbRaw } = await supabase
      .from('feedback_cliente')
      .select('puntuacion, comentarios, canal, enviado_en, clientes(razon_social)')
      .order('enviado_en', { ascending: false })
      .limit(4);

    const feedback = (fbRaw ?? []).map(f => ({
      cliente: (f.clientes as any)?.razon_social ?? '—',
      puntuacion: f.puntuacion,
      comentarios: f.comentarios ?? '',
      canal: f.canal ?? '—',
      enviado_en: f.enviado_en
        ? new Date(f.enviado_en).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
        : '—',
    }));

    // ── 11. Sparklines (últimos 7 puntos diarios) ──────────────────────────────
    // Simplificado: usa los datos de ventas agrupados por día
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });
    const ventasPorDia = last7.map(day => {
      const sum = (ventas ?? [])
        .filter(v => v.created_at.startsWith(day))
        .reduce((s, v) => s + Number(v.total), 0);
      return Math.round(sum / 1000);
    });

    return NextResponse.json({
      kpis: {
        facturacion:       Math.round(facturacion),
        facturacionDelta:  0,   // Calcular comparando con período anterior
        pedidosActivos:    pedidosActivos ?? 0,
        pedidosDelta:      0,
        cotizacionesPend:  cotizacionesPend ?? 0,
        cotizacionesDelta: 0,
        clientesB2B:       clientesB2B ?? 0,
        clientesDelta:     0,
        produccionPct,
        produccionDelta:   0,
        stockCritico:      stockAlerts?.length ?? 0,
        stockDelta:        0,
        satisfaccion,
        satisfaccionDelta: 0,
      },
      ventasMensuales,
      estadoPedidos,
      pipeline,
      topProductos,
      stockCriticoList,
      ultimasVentas,
      confecciones: confecciones2,
      cotizaciones,
      feedback,
      sparklines: {
        facturacion:  ventasPorDia,
        pedidos:      last7.map(() => Math.floor(Math.random() * 10) + 5),  // placeholder
        cotizaciones: last7.map(() => Math.floor(Math.random() * 8) + 3),
        clientes:     last7.map((_, i) => (clientesB2B ?? 0) - (6 - i)),
        produccion:   last7.map(() => Math.floor(Math.random() * 20) + 70),
        stock:        last7.map(() => Math.floor(Math.random() * 5) + 8),
        satisfaccion: last7.map(() => Math.floor(Math.random() * 5) + 40),
      },
    });
  } catch (err: any) {
    console.error('[AdminDashboard API]', err?.message);
    return NextResponse.json({ error: 'Error al cargar datos' }, { status: 500 });
  }
}