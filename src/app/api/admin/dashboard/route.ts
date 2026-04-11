import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30');

  // Validar que days sea un número razonable
  if (isNaN(days) || days <= 0 || days > 365) {
    return NextResponse.json({ error: 'Parámetro days inválido' }, { status: 400 });
  }

  const dateLimit = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  try {
    const [statsRes, ventasRes, productosRes, ordenesRes, inventarioRes] = await Promise.all([

      // 1. KPIs via RPC
      supabase.rpc('get_dashboard_stats', { p_days: days }),

      // 2. Flujo de ingresos — tabla: ventas, columnas: total, created_at ✓
      supabase
        .from('ventas')
        .select('total, created_at')
        .gte('created_at', dateLimit)
        .order('created_at', { ascending: true }),

      // 3. Top productos — tabla real: pedido_items (no existe detalles_orden en el schema)
      //    join con productos para obtener el nombre
      supabase
        .from('pedido_items')
        .select('cantidad, productos(nombre)')
        .order('cantidad', { ascending: false })
        .limit(5),

      // 4. Órdenes recientes — join con clientes ✓
      supabase
        .from('ordenes')
        .select('*, clientes(razon_social)')
        .order('created_at', { ascending: false })
        .limit(10),

      // 5. Stock crítico — tabla real: insumo (no "inventario")
      //    stock_minimo existe en el schema, usarlo como referencia dinámica
      supabase
        .from('insumo')
        .select('id, nombre, stock_actual, stock_minimo, unidad_medida')
        .filter('stock_actual', 'lte', 'stock_minimo') // registros bajo su propio mínimo
        .order('stock_actual', { ascending: true })
        .limit(10),
    ]);

    const kpisDefaults = {
      total_ventas:   0,
      total_clientes: 0,
      stock_alerta:   0,
      nuevas_ordenes: 0,
    };

    // Loguear errores parciales sin romper la respuesta
    [statsRes, ventasRes, productosRes, ordenesRes, inventarioRes].forEach((res, i) => {
      if (res.error) console.error(`Dashboard query [${i}] error:`, res.error.message);
    });

    return NextResponse.json({
      kpis:          statsRes.data    ?? kpisDefaults,
      chartIngresos: ventasRes.data   ?? [],
      chartProductos: productosRes.data ?? [],
      recentOrders:  ordenesRes.data  ?? [],
      criticalStock: inventarioRes.data ?? [],
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Dashboard API error:', msg);
    return NextResponse.json({
      error: msg,
      kpis: { total_ventas: 0, total_clientes: 0, stock_alerta: 0, nuevas_ordenes: 0 },
      chartIngresos:  [],
      chartProductos: [],
      recentOrders:   [],
      criticalStock:  [],
    }, { status: 500 });
  }
}