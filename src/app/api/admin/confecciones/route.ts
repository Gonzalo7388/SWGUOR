import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const searchParams = request.nextUrl.searchParams;
    const estadoFilter = searchParams.get('estado');
    const tallerFilter = searchParams.get('taller');

    let query = (await supabase)
      .from('confecciones')
      .select(`
        *,
        taller:talleres (id, nombre),
        pedido:pedidos (
          id,
          cliente_id,
          cliente:clientes (id, razon_social),
          detalles:detalles_pedido (
            id,
            cantidad,
            talla,
            color,
            producto:productos (id, nombre, sku)
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (estadoFilter && estadoFilter !== 'todos') {
      query = query.eq('estado', estadoFilter);
    }

    if (tallerFilter && tallerFilter !== 'todos') {
      query = query.eq('taller_id', tallerFilter);
    }

    const { data: confecciones, error } = await query;

    if (error) {
      console.error('Error fetching confecciones:', error);
      return NextResponse.json(
        { error: 'Error al obtener confecciones' },
        { status: 500 }
      );
    }

    // Formato de respuesta con cálculos
    const formattedData = (confecciones || []).map((conf: any) => ({
      id: conf.id,
      pedido_id: conf.pedido_id,
      pedido: conf.pedido?.id || 'N/A',
      cliente: conf.pedido?.cliente?.razon_social || 'N/A',
      prenda: conf.pedido?.detalles?.[0]?.producto?.nombre || 'N/A',
      cantidad: conf.pedido?.detalles?.[0]?.cantidad || 1,
      taller: conf.taller?.nombre || 'N/A',
      estado: conf.estado,
      progreso: calculateProgress(conf.estado),
      fechaInicio: conf.fecha_inicio,
      fechaFin: conf.fecha_fin || null,
      observaciones: conf.observaciones
    }));

    return NextResponse.json({
      data: formattedData,
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
      .from('confecciones')
      .insert({
        pedido_id: body.pedido_id,
        taller_id: body.taller_id,
        estado: 'pendiente',
        observaciones: body.observaciones || ''
      })
      .select();

    if (error) {
      console.error('Error creating confeccion:', error);
      return NextResponse.json(
        { error: 'Error al crear confección' },
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
    const { id, estado, observaciones } = body;

    const { data, error } = await supabase
      .from('confecciones')
      .update({
        estado,
        observaciones,
        ...(estado === 'terminado' && { fecha_fin: new Date().toISOString() })
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating confeccion:', error);
      return NextResponse.json(
        { error: 'Error al actualizar confección' },
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

function calculateProgress(estado: string): number {
  const progressMap: { [key: string]: number } = {
    'pendiente': 0,
    'en_proceso': 50,
    'terminado': 100
  };
  return progressMap[estado] || 0;
}
