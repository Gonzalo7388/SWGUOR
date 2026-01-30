import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();

  try {
    // Traemos pedidos con fecha_entrega para medir puntualidad
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('fecha_pedido, fecha_entrega, total, estado, cliente_id');

    // Traemos stock crítico
    const { data: productos } = await supabase
      .from('productos')
      .select('nombre, stock')
      .lte('stock', 50); // Ajustar según necesidad textil

    if (error) throw error;

    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const ventasMensuales = meses.map(mes => ({ name: mes, ventas: 0, pedidos: 0 }));

    let pedidosAtrasados = 0;
    const hoy = new Date();

    pedidos?.forEach((p) => {
      const fecha = new Date(p.fecha_pedido);
      const mesIndex = fecha.getMonth();
      
      if (p.estado !== 'CANCELADO') {
        ventasMensuales[mesIndex].ventas += Number(p.total) || 0;
        ventasMensuales[mesIndex].pedidos += 1;
      }

      // Lógica de cumplimiento: si está pendiente y pasó la fecha de entrega
      if (p.estado === 'PENDIENTE' && p.fecha_entrega && new Date(p.fecha_entrega) < hoy) {
        pedidosAtrasados++;
      }
    });

    return NextResponse.json({
      summary: {
        totalVentas: pedidos?.reduce((acc, p) => acc + (Number(p.total) || 0), 0) || 0,
        totalPedidos: pedidos?.length || 0,
        pendientes: pedidos?.filter(p => p.estado === 'PENDIENTE').length || 0,
        atrasados: pedidosAtrasados, // MÉTRICA CRÍTICA PARA TEXTIL
        stockCritico: productos?.length || 0
      },
      ventasMensuales,
      estadosData: [
        { name: 'En Corte', value: pedidos?.filter(p => p.estado === 'CORTE').length || 0, color: '#f59e0b' },
        { name: 'En Confección', value: pedidos?.filter(p => p.estado === 'CONFECCION').length || 0, color: '#3b82f6' },
        { name: 'Completados', value: pedidos?.filter(p => p.estado === 'COMPLETADO').length || 0, color: '#10b981' },
      ]
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
