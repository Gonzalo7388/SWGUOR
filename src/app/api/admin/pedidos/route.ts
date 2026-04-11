import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';

type Tx = Prisma.TransactionClient;

// GET: Obtener la lista de producción (pedidos con sus items y cliente)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const estado = searchParams.get('estado');

    const where: Record<string, unknown> = {};
    if (estado) where.estado = estado;

    const pedidos = await prisma.pedidos.findMany({
      where,
      include: {
        clientes: { select: { id: true, razon_social: true, ruc: true } },
        pedido_items: {
          include: {
            productos: { select: { id: true, nombre: true } },
            variantes_producto: { select: { id: true, nombre: true, color: true, talla: true } },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(serializeBigInt(pedidos));
  } catch (error: any) {
    console.error('Error fetching pedidos:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Crear un nuevo pedido de producción
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.cliente_id || !body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'cliente_id e items (array) son obligatorios' },
        { status: 400 }
      );
    }

    const totalUnidades = body.items.reduce((sum: number, item: any) => sum + (item.cantidad || 0), 0);

    const pedido = await prisma.pedidos.create({
      data: {
        cliente_id: BigInt(body.cliente_id),
        estado: body.estado ?? 'pendiente',
        prioridad: body.prioridad ?? 'normal',
        notas_cliente: body.notas_cliente ?? null,
        notas_pedido: body.notas_pedido ?? null,
        total_estimado: body.total_estimado ?? 0,
        total_unidades: totalUnidades,
        moq_aplicado: body.moq_aplicado ?? 400,
        created_by: body.created_by ?? null,
        pedido_items: {
          create: body.items.map((item: any) => ({
            producto_id: item.producto_id ? BigInt(item.producto_id) : null,
            variante_id: item.variante_id ? BigInt(item.variante_id) : null,
            cantidad: item.cantidad ?? 1,
            especificaciones: item.especificaciones ?? null,
          })),
        },
      },
      include: {
        pedido_items: {
          include: {
            productos: { select: { id: true, nombre: true } },
            variantes_producto: { select: { id: true, nombre: true, color: true, talla: true } },
          },
        },
        clientes: { select: { id: true, razon_social: true } },
      },
    });

    return NextResponse.json(serializeBigInt(pedido), { status: 201 });
  } catch (error: any) {
    console.error('Error creating pedido:', error);
    if (error.code === 'P2003') {
      return NextResponse.json({ error: 'El cliente especificado no existe' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Actualizar pedido + KPIs de tiempo de producción
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const pedido = await prisma.$transaction(async (tx: Tx) => {
      // Si el pedido pasa a 'corte', registramos el estado de producción
      if (updates.estado === 'corte' && body.usuario_id) {
        await tx.estados_produccion.create({
          data: {
            orden_id: BigInt(id), // usamos id del pedido como referencia
            etapa: 'corte',
            usuario_id: BigInt(body.usuario_id),
          },
        });
      }

      const data: Record<string, unknown> = {};
      if (updates.estado !== undefined) data.estado = updates.estado;
      if (updates.prioridad !== undefined) data.prioridad = updates.prioridad;
      if (updates.notas_cliente !== undefined) data.notas_cliente = updates.notas_cliente;
      if (updates.notas_pedido !== undefined) data.notas_pedido = updates.notas_pedido;
      if (updates.total_estimado !== undefined) data.total_estimado = updates.total_estimado;

      return tx.pedidos.update({
        where: { id: BigInt(id) },
        data,
        include: {
          pedido_items: {
            include: {
              productos: { select: { id: true, nombre: true } },
            },
          },
          clientes: { select: { id: true, razon_social: true } },
        },
      });
    });

    return NextResponse.json(serializeBigInt(pedido));
  } catch (error: any) {
    console.error('Error updating pedido:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Asignar tarea de producción (crear confección)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    if (!body.pedido_id || !body.taller_id) {
      return NextResponse.json(
        { error: 'pedido_id y taller_id son obligatorios' },
        { status: 400 }
      );
    }

    const confeccion = await prisma.confecciones.create({
      data: {
        pedido_id: BigInt(body.pedido_id),
        taller_id: BigInt(body.taller_id),
        estado: body.estado ?? 'corte',
        fecha_inicio: new Date(),
        observaciones: body.observaciones ?? null,
        responsable_id: body.responsable_id ? BigInt(body.responsable_id) : null,
      },
    });

    return NextResponse.json(serializeBigInt(confeccion), { status: 201 });
  } catch (error: any) {
    console.error('Error assigning production task:', error);
    if (error.code === 'P2003') {
      return NextResponse.json({ error: 'Pedido o taller no encontrado' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar un pedido
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    // Eliminar items hijos primero (cascade debería manejarlo, pero por seguridad)
    await prisma.pedido_items.deleteMany({
      where: { pedido_id: BigInt(id) },
    });

    await prisma.pedidos.delete({
      where: { id: BigInt(id) },
    });

    return NextResponse.json({ message: 'Pedido eliminado correctamente' });
  } catch (error: any) {
    console.error('Error deleting pedido:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
