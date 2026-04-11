import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Estados válidos según el schema: 'borrador' | 'enviada' | 'aprobada' | 'rechazada' | 'convertida'
const ESTADOS_VALIDOS = ['borrador', 'enviada', 'aprobada', 'rechazada', 'convertida'] as const;
type EstadoCotizacion = typeof ESTADOS_VALIDOS[number];

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const estadoFilter = request.nextUrl.searchParams.get('estado');

    // Validar filtro si viene
    if (estadoFilter && estadoFilter !== 'todos' && !ESTADOS_VALIDOS.includes(estadoFilter as EstadoCotizacion)) {
      return NextResponse.json({ error: `Estado inválido. Válidos: ${ESTADOS_VALIDOS.join(', ')}` }, { status: 400 });
    }

    let query = supabase
      .from('cotizaciones')
      .select(`
        id,
        numero,
        estado,
        subtotal,
        igv,
        total,
        monto_descuento,
        costo_envio,
        valida_hasta,
        created_at,
        cliente:clientes (id, razon_social, email),
        pedido:pedidos (id, notas_cliente),
        items:cotizacion_items (
          id,
          cantidad,
          precio_unitario_snapshot,
          subtotal,
          producto:productos (id, nombre),
          variante:variantes_producto (id, nombre, talla, color)
        )
      `)
      .order('created_at', { ascending: false });

    if (estadoFilter && estadoFilter !== 'todos') {
      query = query.eq('estado', estadoFilter);
    }

    const { data: cotizaciones, error } = await query;

    if (error) {
      console.error('Error fetching cotizaciones:', error);
      return NextResponse.json({ error: 'Error al obtener cotizaciones' }, { status: 500 });
    }

    const data = cotizaciones ?? [];

    // KPIs basados en estados reales del schema
    const kpis = {
      borrador:   data.filter(c => c.estado === 'borrador').length,
      enviadas:   data.filter(c => c.estado === 'enviada').length,
      aprobadas:  data.filter(c => c.estado === 'aprobada').length,
      rechazadas: data.filter(c => c.estado === 'rechazada').length,
      valorTotal: data.reduce((sum, c) => sum + Number(c.total ?? 0), 0),
    };

    return NextResponse.json({ data, kpis, count: data.length });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('GET /api/cotizaciones:', msg);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Validaciones mínimas
    if (!body.cliente_id)   return NextResponse.json({ error: 'cliente_id es requerido' }, { status: 400 });
    if (!body.valida_hasta) return NextResponse.json({ error: 'valida_hasta es requerido' }, { status: 400 });
    if (!body.numero)       return NextResponse.json({ error: 'numero es requerido' }, { status: 400 });

    const { data, error } = await supabase
      .from('cotizaciones')
      .insert({
        numero:             body.numero,
        cliente_id:         body.cliente_id,
        pedido_id:          body.pedido_id          ?? null,
        estado:             body.estado             ?? 'borrador',
        subtotal:           body.subtotal           ?? 0,
        igv:                body.igv                ?? 0,
        total:              body.total              ?? 0,
        monto_descuento:    body.monto_descuento    ?? 0,
        costo_envio:        body.costo_envio        ?? 0,
        valida_hasta:       body.valida_hasta,
        direccion_despacho: body.direccion_despacho ?? null,
        metodo_pago:        body.metodo_pago        ?? null,
        id_regla_descuento: body.id_regla_descuento ?? null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Ya existe una cotización con ese número' }, { status: 409 });
      console.error('Error creating cotizacion:', error);
      return NextResponse.json({ error: 'Error al crear cotización' }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('POST /api/cotizaciones:', msg);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PATCH en vez de PUT — más semántico para actualizaciones parciales
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id, estado, ...rest } = body;

    if (!id) return NextResponse.json({ error: 'id es requerido' }, { status: 400 });

    if (estado && !ESTADOS_VALIDOS.includes(estado as EstadoCotizacion)) {
      return NextResponse.json({ error: `Estado inválido. Válidos: ${ESTADOS_VALIDOS.join(', ')}` }, { status: 400 });
    }

    const updates = { ...rest, ...(estado ? { estado } : {}) };

    const { data, error } = await supabase
      .from('cotizaciones')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 });
      console.error('Error updating cotizacion:', error);
      return NextResponse.json({ error: 'Error al actualizar cotización' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('PATCH /api/cotizaciones:', msg);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}