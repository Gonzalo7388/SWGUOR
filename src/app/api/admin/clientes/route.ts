export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/database';

type EstadoCliente = Database['public']['Enums']['EstadoCliente'];
type TipoCliente   = Database['public']['Enums']['TipoCliente'];

// GET: Obtener todos los clientes
export async function GET() {
<<<<<<< HEAD
=======
  const supabase = await createClient();
>>>>>>> main
  try {
    const clientes = await prisma.clientes.findMany({
      orderBy: { razon_social: 'asc' },
    });

<<<<<<< HEAD
    return NextResponse.json(serializeBigInt(clientes));
  } catch (error: any) {
    console.error('Error fetching clientes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
=======
    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('GET /api/clientes:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
>>>>>>> main
  }
}

// POST: Crear nuevo cliente
export async function POST(req: Request) {
<<<<<<< HEAD
  try {
    const body = await req.json();

    if (!body.ruc) {
      return NextResponse.json({ error: 'El RUC es obligatorio' }, { status: 400 });
    }

    const cliente = await prisma.clientes.create({
      data: {
        ruc: BigInt(body.ruc),
        razon_social: body.razon_social ?? null,
        email: body.email ?? null,
        telefono: body.telefono ? BigInt(body.telefono) : null,
        direccion: body.direccion ?? null,
        activo: body.activo ?? 'activo',
        TipoCliente: body.TipoCliente ?? null,
      },
    });

    return NextResponse.json(serializeBigInt(cliente), { status: 201 });
  } catch (error: any) {
    console.error('Error creating cliente:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un cliente con ese RUC' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
=======
  const supabase = await createClient();
  try {
    const body = await req.json();

    // Validaciones mínimas según el schema (ruc NOT NULL)
    if (!body.ruc) {
      return NextResponse.json({ error: 'ruc es requerido' }, { status: 400 });
    }
    if (isNaN(Number(body.ruc))) {
      return NextResponse.json({ error: 'ruc debe ser numérico' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('clientes')
      .insert([{
        ruc:          Number(body.ruc),
        razon_social: body.razon_social?.trim()          ?? null,
        email:        body.email?.trim().toLowerCase()   ?? null,
        telefono:     body.telefono ? Number(body.telefono) : null,
        direccion:    body.direccion?.trim()              ?? null,
        // El schema usa el enum EstadoCliente, no boolean
        activo:       (body.activo as EstadoCliente)     ?? 'activo',
        TipoCliente:  (body.TipoCliente as TipoCliente)  ?? null,
        usuario_id:   body.usuario_id                    ?? null,
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Ya existe un cliente con ese RUC o usuario vinculado' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('POST /api/clientes:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
>>>>>>> main
  }
}

// PATCH: Editar información del cliente
export async function PATCH(req: Request) {
<<<<<<< HEAD
=======
  const supabase = await createClient();
>>>>>>> main
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

<<<<<<< HEAD
    // Convertir campos BigInt si vienen en el body
    if (updates.ruc !== undefined) updates.ruc = BigInt(updates.ruc);
    if (updates.telefono !== undefined && updates.telefono !== null) {
      updates.telefono = BigInt(updates.telefono);
    }

    const cliente = await prisma.clientes.update({
      where: { id: BigInt(id) },
      data: updates,
    });

    return NextResponse.json(serializeBigInt(cliente));
  } catch (error: any) {
    console.error('Error updating cliente:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un cliente con ese RUC' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
=======
    // Normalizar campos si vienen en el body
    if (updates.email)        updates.email        = updates.email.trim().toLowerCase();
    if (updates.razon_social) updates.razon_social = updates.razon_social.trim();
    if (updates.direccion)    updates.direccion    = updates.direccion.trim();
    if (updates.telefono)     updates.telefono     = Number(updates.telefono);
    if (updates.ruc)          updates.ruc          = Number(updates.ruc);

    const { data, error } = await supabase
      .from('clientes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
      if (error.code === '23505')    return NextResponse.json({ error: 'RUC o usuario ya registrado' }, { status: 409 });
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('PATCH /api/clientes:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
>>>>>>> main
  }
}

// DELETE: Soft delete (cambia activo a 'inactivo')
export async function DELETE(req: Request) {
<<<<<<< HEAD
=======
  const supabase = await createClient();
>>>>>>> main
  try {
    const { searchParams } = new URL(req.url);
    const idRaw = searchParams.get('id');

<<<<<<< HEAD
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    await prisma.clientes.delete({
      where: { id: BigInt(id) },
    });

    return NextResponse.json({ message: 'Eliminado correctamente' });
  } catch (error: any) {
    console.error('Error deleting cliente:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
=======
    if (!idRaw) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    const id = Number(idRaw);
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    // Verificar que existe antes de modificar
    const { data: existing, error: fetchError } = await supabase
      .from('clientes')
      .select('id, activo')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }
    if (existing.activo === 'inactivo') {
      return NextResponse.json({ error: 'El cliente ya está inactivo' }, { status: 400 });
    }

    // Soft delete: marcar como inactivo (consistente con el enum EstadoCliente)
    const { data, error } = await supabase
      .from('clientes')
      .update({ activo: 'inactivo' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: 'Cliente desactivado correctamente', deletedClient: data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('DELETE /api/clientes:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
>>>>>>> main
  }
}
