import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { EstadoOrden } from '@prisma/client';

// Estados válidos según el schema
const ESTADOS_VALIDOS: EstadoOrden[] = [
  'solicitado', 'cotizado', 'aprobado', 'pagado', 'en_proceso', 'finalizado', 'cancelado'
];

// GET: Listar órdenes con filtros opcionales
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  try {
    const { searchParams } = request.nextUrl;
    const estadoFilter   = searchParams.get('estado');
    const clienteFilter  = searchParams.get('cliente_id');
    const limitParam     = searchParams.get('limit');
    const limit          = limitParam ? Math.min(parseInt(limitParam), 100) : 20;

    if (estadoFilter && estadoFilter !== 'todos' && !ESTADOS_VALIDOS.includes(estadoFilter as EstadoOrden)) {
      return NextResponse.json({ error: `Estado inválido. Válidos: ${ESTADOS_VALIDOS.join(', ')}` }, { status: 400 });
    }

    let query = supabase
      .from('ordenes')
      .select(`
        id,
        estado,
        estado_pago,
        total_pagado,
        metodo_pago,
        fecha_prometida_entrega,
        created_at,
        updated_at,
        clientes (
          id,
          razon_social,
          ruc,
          email,
          telefono
        ),
        cotizacion:cotizaciones (
          id,
          numero,
          total,
          subtotal,
          igv,
          items:cotizacion_items (
            id,
            cantidad,
            precio_unitario_snapshot,
            subtotal,
            producto:productos (id, nombre, sku, imagen),
            variante:variantes_producto (id, nombre, talla, color, sku)
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (estadoFilter && estadoFilter !== 'todos') {
      query = query.eq('estado', estadoFilter);
    }
    if (clienteFilter) {
      query = query.eq('cliente_id', clienteFilter);
    }

    const { data: ordenes, error } = await query;

    if (error) {
      console.error('Error fetching ordenes:', error);
      return NextResponse.json({ error: 'Error al obtener órdenes' }, { status: 500 });
    }

    const data = ordenes ?? [];

    // KPIs del conjunto retornado
    const kpis = {
      total:      data.length,
      solicitado: data.filter(o => o.estado === 'solicitado').length,
      en_proceso: data.filter(o => o.estado === 'en_proceso').length,
      finalizado: data.filter(o => o.estado === 'finalizado').length,
      cancelado:  data.filter(o => o.estado === 'cancelado').length,
      facturado:  data.reduce((sum, o) => sum + Number(o.total_pagado ?? 0), 0),
    };

    return NextResponse.json({ data, kpis, count: data.length });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('GET /api/ordenes:', msg);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST: Crear nueva orden (a partir de una cotización aprobada)
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    const body = await request.json();

    if (!body.cliente_id)    return NextResponse.json({ error: 'cliente_id es requerido' },    { status: 400 });
    if (!body.cotizacion_id) return NextResponse.json({ error: 'cotizacion_id es requerido' }, { status: 400 });

    // Verificar que la cotización existe y está aprobada
    const { data: cotizacion, error: cotError } = await supabase
      .from('cotizaciones')
      .select('id, estado, total, cliente_id')
      .eq('id', body.cotizacion_id)
      .single();

    if (cotError || !cotizacion) {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 });
    }
    if (cotizacion.estado !== 'aprobada') {
      return NextResponse.json({ error: 'Solo se pueden crear órdenes de cotizaciones aprobadas' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('ordenes')
      .insert({
        cotizacion_id:             body.cotizacion_id,
        cliente_id:                body.cliente_id,
        estado:                    'solicitado',
        estado_pago:               'pendiente',
        metodo_pago:               body.metodo_pago               ?? null,
        total_pagado:              0,
        fecha_prometida_entrega:   body.fecha_prometida_entrega   ?? null,
        user_id:                   body.user_id                   ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating orden:', error);
      return NextResponse.json({ error: 'Error al crear orden' }, { status: 500 });
    }

    // Marcar la cotización como convertida
    await supabase
      .from('cotizaciones')
      .update({ estado: 'convertida' })
      .eq('id', body.cotizacion_id);

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('POST /api/ordenes:', msg);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PATCH: Actualizar estado o datos de una orden
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();

  try {
    const body = await request.json();
    const { id, estado, estado_pago, total_pagado, fecha_prometida_entrega } = body;

    if (!id) return NextResponse.json({ error: 'id es requerido' }, { status: 400 });

    if (estado && !ESTADOS_VALIDOS.includes(estado as EstadoOrden)) {
      return NextResponse.json({ error: `Estado inválido. Válidos: ${ESTADOS_VALIDOS.join(', ')}` }, { status: 400 });
    }

    const ESTADOS_PAGO_VALIDOS = ['pendiente', 'parcial', 'pagado'];
    if (estado_pago && !ESTADOS_PAGO_VALIDOS.includes(estado_pago)) {
      return NextResponse.json({ error: `Estado de pago inválido. Válidos: ${ESTADOS_PAGO_VALIDOS.join(', ')}` }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (estado)                   updates.estado                   = estado;
    if (estado_pago)              updates.estado_pago              = estado_pago;
    if (total_pagado !== undefined) updates.total_pagado           = total_pagado;
    if (fecha_prometida_entrega)  updates.fecha_prometida_entrega  = fecha_prometida_entrega;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('ordenes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
      console.error('Error updating orden:', error);
      return NextResponse.json({ error: 'Error al actualizar orden' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('PATCH /api/ordenes:', msg);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE: Cancelar una orden (soft delete via estado)
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();

  try {
    const { searchParams } = request.nextUrl;
    const idRaw = searchParams.get('id');

    if (!idRaw) return NextResponse.json({ error: 'id es requerido' }, { status: 400 });

    const id = Number(idRaw);
    if (isNaN(id)) return NextResponse.json({ error: 'id inválido' }, { status: 400 });

    const { data: orden, error: fetchError } = await supabase
      .from('ordenes')
      .select('id, estado')
      .eq('id', id)
      .single();

    if (fetchError || !orden) return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });

    if (orden.estado === 'cancelado') {
      return NextResponse.json({ error: 'La orden ya está cancelada' }, { status: 400 });
    }
    if (orden.estado === 'finalizado') {
      return NextResponse.json({ error: 'No se puede cancelar una orden finalizada' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('ordenes')
      .update({ estado: 'cancelado' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: 'Orden cancelada correctamente', data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('DELETE /api/ordenes:', msg);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}