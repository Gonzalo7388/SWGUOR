import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  
  // Obtener el filtro de días de la URL (por defecto 30)
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30');
  const dateLimit = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  try {
    const [statsRes, ventasRes, productosRes, ordenesRes, inventarioRes] = await Promise.all([
      // 1. KPIs mediante el RPC (Asegúrate de que los nombres coincidan con el SQL)
      supabase.rpc('get_dashboard_stats'),
      
      // 2. Flujo de Ingresos (Filtrado por días)
      supabase.from('ventas')
        .select('total, created_at')
        .gte('created_at', dateLimit)
        .order('created_at', { ascending: true }),
      
      // 3. Top Productos (Agregando conteo real)
      supabase.from('detalles_orden')
        .select('cantidad, productos(nombre)')
        .order('cantidad', { ascending: false })
        .limit(5),

      // 4. Órdenes Recientes (Para la tabla)
      supabase.from('ordenes')
        .select('*, clientes(razon_social)')
        .order('created_at', { ascending: false })
        .limit(5),

      // 5. Stock Crítico (Para el widget de alertas)
      supabase.from('inventario')
        .select('*')
        .lte('stock_actual', 400) // Filtro según tu lógica de GUOR
        .order('stock_actual', { ascending: true })
        .limit(5)
    ]);

    // Valores por defecto para evitar errores de "null" en el frontend
    const kpisDefaults = {
      total_ventas: 0,
      total_clientes: 0,
      stock_alerta: 0,
      nuevas_ordenes: 0
    };

    return NextResponse.json({
      kpis: statsRes.data ?? kpisDefaults,
      chartIngresos: ventasRes.data ?? [],
      chartProductos: productosRes.data ?? [],
      recentOrders: ordenesRes.data ?? [],
      criticalStock: inventarioRes.data ?? []
    });

  } catch (error: any) {
    console.error('Error Crítico en Dashboard API:', error);
    return NextResponse.json({ 
      error: error.message,
      kpis: { total_ventas: 0, total_clientes: 0, stock_alerta: 0, nuevas_ordenes: 0 },
      recentOrders: [],
      criticalStock: []
    }, { status: 500 });
  }
}