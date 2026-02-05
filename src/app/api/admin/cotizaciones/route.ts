import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const estadoFilter = searchParams.get('estado');

    let query = supabase
      .from('pedidos')
      .select(`
        *,
        cliente:clientes (id, razon_social, email)
      `)
      .eq('estado', 'en_espera') // Cotizaciones en espera de aprobación
      .order('created_at', { ascending: false });

    if (estadoFilter && estadoFilter !== 'todos' && estadoFilter !== 'en_espera') {
      // Simulamos estados de cotización
      if (estadoFilter === 'aceptada') {
        query = query.eq('estado', 'aprobado');
      } else if (estadoFilter === 'rechazada') {
        query = query.eq('estado', 'cancelado');
      }
    }

    const { data: cotizaciones, error } = await query;

    if (error) {
      console.error('Error fetching cotizaciones:', error);
      return NextResponse.json(
        { error: 'Error al obtener cotizaciones' },
        { status: 500 }
      );
    }

    // Formato de respuesta con cálculos
    const formattedData = (cotizaciones || []).map((cot: any, index: number) => ({
      id: cot.id,
      cotizacion_id: `COT-${String(cot.id).padStart(6, '0')}`,
      cliente: cot.cliente?.razon_social || 'N/A',
      descripcion: cot.notas || 'Confección de prendas',
      monto: parseFloat(cot.total),
      estado: mapEstadoCotizacion(cot.estado),
      vencimiento: addDays(new Date(cot.fecha_pedido), 7), // 7 días de vencimiento
      fechaCreacion: cot.fecha_pedido
    }));

    // Cálculos de KPIs
    const kpis = {
      pendientes: formattedData.filter(c => c.estado === 'pendiente').length,
      aceptadas: formattedData.filter(c => c.estado === 'aceptada').length,
      valorTotal: formattedData.reduce((sum, c) => sum + c.monto, 0)
    };

    return NextResponse.json({
      data: formattedData,
      kpis,
      count: formattedData.length
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('pedidos')
      .insert({
        cliente_id: body.cliente_id,
        total: body.monto,
        notas: body.descripcion,
        estado: 'en_espera',
        prioridad: 'normal'
      })
      .select();

    if (error) {
      console.error('Error creating cotizacion:', error);
      return NextResponse.json(
        { error: 'Error al crear cotización' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data?.[0] }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id, estado } = body;

    let newEstado = 'en_espera';
    if (estado === 'aceptada') newEstado = 'aprobado';
    if (estado === 'rechazada') newEstado = 'cancelado';

    const { data, error } = await supabase
      .from('pedidos')
      .update({ estado: newEstado })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating cotizacion:', error);
      return NextResponse.json(
        { error: 'Error al actualizar cotización' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data?.[0] });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

function mapEstadoCotizacion(estado: string): string {
  const map: { [key: string]: string } = {
    'en_espera': 'pendiente',
    'aprobado': 'aceptada',
    'cancelado': 'rechazada',
    'finalizado': 'expirada'
  };
  return map[estado] || 'pendiente';
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
