import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/database';

type EstadoPedido    = Database['public']['Enums']['EstadoPedido'];
type PrioridadPedido = Database['public']['Enums']['PrioridadPedido'];
type EstadoConfeccion = Database['public']['Enums']['EstadoConfeccion'];

// GET: Listar pedidos con sus ítems y cliente
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  try {
    const { searchParams } = request.nextUrl;
    const estadoFilter   = searchParams.get('estado');
    const clienteFilter  = searchParams.get('cliente_id');
    const limitParam     = searchParams.get('limit');
    const limit          = limitParam ? Math.min(parseInt(limitParam), 100) : 20;

    let query = supabase
      .from('pedidos')
      .select(`
        id,
        estado,
        prioridad,
        notas_cliente,
        notas_pedido,
        total_estimado,
        total_unidades,
        moq_aplicado,
        created_at,
        updated_at,
        clientes (
          id,
          razon_social,
          ruc,
          email,
          telefono
        ),
        items:pedido_items (
          id,
          cantidad,
          especificaciones,
          producto:productos (id, nombre, sku, imagen),
          variante:variantes_producto (id, nombre, talla, color, sku)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (estadoFilter && estadoFilter !== 'todos') {
      query = query.eq('estado', estadoFilter as EstadoPedido);
    }
    if (clienteFilter) {
      query = query.eq('cliente_id', clienteFilter);
    }

    const { data: pedidos, error } = await query;

    if (error) {
      console.error('Error fetching pedidos:', error);
      return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 });
    }

    return NextResponse.json(pedidos ?? []);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('GET /api/pedidos:', msg);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST: Asignar pedido a un taller (crear confección)
export async function POST(req: Request) {
  const supabase = await createClient();

  try {
    const body = await req.json();
    const { pedido_id, taller_id, estado, observaciones } = body;

    if (!pedido_id) return NextResponse.json({ error: 'pedido_id es requerido' }, { status: 400 });
    if (!taller_id) return NextResponse.json({ error: 'taller_id es requerido' }, { status: 400 });

    // Verificar que el pedido existe
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .select('id, estado')
      .eq('id', pedido_id)
      .single();

    if (pedidoError || !pedido) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    // Verificar que el taller existe y está activo
    const { data: taller, error: tallerError } = await supabase
      .from('talleres')
      .select('id, estado')
      .eq('id', taller_id)
      .single();

    if (tallerError || !taller) {
      return NextResponse.json({ error: 'Taller no encontrado' }, { status: 404 });
    }
    if (taller.estado !== 'activo') {
      return NextResponse.json({ error: 'El taller no está activo' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('confecciones')
      .insert([{
        pedido_id,
        taller_id,
        // estado tiene DEFAULT 'corte' en el schema; solo sobreescribir si viene
        ...(estado ? { estado: estado as EstadoConfeccion } : {}),
        observaciones: observaciones ?? null,
        fecha_inicio:  new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('POST /api/pedidos:', msg);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PATCH: Actualizar estado o prioridad de un pedido
export async function PATCH(req: Request) {
  const supabase = await createClient();

  try {
    const body = await req.json();
    const { id, estado, prioridad, notas_pedido, total_estimado } = body;

    if (!id) return NextResponse.json({ error: 'id es requerido' }, { status: 400 });

    const updates: Record<string, unknown> = {};
    if (estado)                        updates.estado          = estado as EstadoPedido;
    if (prioridad)                     updates.prioridad       = prioridad as PrioridadPedido;
    if (notas_pedido !== undefined)    updates.notas_pedido    = notas_pedido;
    if (total_estimado !== undefined)  updates.total_estimado  = total_estimado;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('pedidos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('PATCH /api/pedidos:', msg);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}