export const runtime = 'nodejs';

import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';
import { EstadoCliente } from '@prisma/client';

// ══════════════════════════════════════════════════════
// GET: Listar empresas clientes con filtros opcionales
// Query params: ?activo=activo|inactivo|suspendido|potencial&search=texto
// ══════════════════════════════════════════════════════
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const activo = searchParams.get('activo') as EstadoCliente | null;
    const search = searchParams.get('search');

    const clientes = await prisma.clientes.findMany({
      where: {
        ...(activo && { activo }),
        ...(search && {
          OR: [
            { razon_social:    { contains: search, mode: 'insensitive' } },
            { nombre_comercial:{ contains: search, mode: 'insensitive' } },
            { ruc:             { contains: search } },
          ],
        }),
      },
      select: {
        id:               true,
        ruc:              true,
        razon_social:     true,
        nombre_comercial: true,
        email:            true,
        telefono:         true,
        direccion_fiscal: true,
        activo:           true,
        tipo_cliente:     true,
        created_at:       true,
        // Relación: direcciones de entrega registradas
        direcciones_cliente: {
          select: {
            id:          true,
            alias:       true,
            direccion:   true,
            ciudad:      true,
            departamento:true,
            es_principal:true,
          },
        },
      },
      orderBy: { razon_social: 'asc' },
    });

    return NextResponse.json(serializeBigInt(clientes));
  } catch (error: any) {
    console.error('Error fetching clientes B2B:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ══════════════════════════════════════════════════════
// POST: Registrar nueva empresa cliente
// ══════════════════════════════════════════════════════
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validaciones obligatorias para una empresa B2B
    if (!body.ruc) {
      return NextResponse.json({ error: 'El RUC es obligatorio' }, { status: 400 });
    }
    if (!body.razon_social) {
      return NextResponse.json({ error: 'La razón social es obligatoria' }, { status: 400 });
    }
    if (String(body.ruc).length !== 11) {
      return NextResponse.json(
        { error: 'El RUC de una empresa debe tener 11 dígitos' },
        { status: 400 }
      );
    }

    const cliente = await prisma.clientes.create({
      data: {
        ruc:              String(body.ruc),
        razon_social:     String(body.razon_social),
        nombre_comercial: body.nombre_comercial ?? null,

        // Contacto
        email:    body.email    ?? null,
        telefono: body.telefono ? String(body.telefono) : null,

        // Ubicación fiscal
        direccion_fiscal: body.direccion_fiscal ?? null,
        tipo_cliente: 'corporativo',
        // Estado en el sistema
        activo: (body.activo as EstadoCliente) ?? EstadoCliente.activo,
      },
    });

    return NextResponse.json(serializeBigInt(cliente), { status: 201 });
  } catch (error: any) {
    console.error('Error creando cliente B2B:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe una empresa registrada con ese RUC' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ══════════════════════════════════════════════════════
// PATCH: Actualizar datos de la empresa cliente
// ══════════════════════════════════════════════════════
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    // Sanitizar campos que llegan como string pero deben ser string
    if (updates.ruc !== undefined) {
      if (String(updates.ruc).length !== 11) {
        return NextResponse.json(
          { error: 'El RUC debe tener 11 dígitos' },
          { status: 400 }
        );
      }
      updates.ruc = String(updates.ruc);
    }
    if (updates.telefono != null) {
      updates.telefono = String(updates.telefono);
    }
    if (updates.activo !== undefined) {
      updates.activo = updates.activo as EstadoCliente;
    }

    // Proteger: no permitir cambiar tipo_documento en un cliente B2B existente
    delete updates.tipo_documento;

    const cliente = await prisma.clientes.update({
      where: { id: BigInt(id) },
      data: updates,
    });

    return NextResponse.json(serializeBigInt(cliente));
  } catch (error: any) {
    console.error('Error actualizando cliente B2B:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 });
    }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe una empresa con ese RUC' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ══════════════════════════════════════════════════════
// DELETE: Soft delete — desactiva la empresa, no la borra
// En un ERP nunca se eliminan registros con historial de órdenes
// ══════════════════════════════════════════════════════
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    // Verificar que no tenga órdenes activas antes de desactivar
    const ordenesActivas = await prisma.ordenes.count({
      where: {
        cliente_id: BigInt(id),
        estado: { notIn: ['finalizado', 'cancelado'] },
      },
    });

    if (ordenesActivas > 0) {
      return NextResponse.json(
        {
          error: `No se puede desactivar: la empresa tiene ${ordenesActivas} orden(es) activa(s)`,
        },
        { status: 409 }
      );
    }

    // Soft delete: marcar como inactivo, preservar historial
    const cliente = await prisma.clientes.update({
      where: { id: BigInt(id) },
      data: { activo: EstadoCliente.inactivo },
    });

    return NextResponse.json({
      message: 'Empresa desactivada correctamente',
      id: serializeBigInt(cliente.id),
    });
  } catch (error: any) {
    console.error('Error desactivando cliente B2B:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}