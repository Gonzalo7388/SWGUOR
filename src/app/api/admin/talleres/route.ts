export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';

// GET: Obtener todos los talleres
export async function GET() {
  try {
    const talleres = await prisma.talleres.findMany({
      include: {
        _count: {
          select: { confecciones: true },
        },
      },
      orderBy: { nombre: 'asc' },
    });

    return NextResponse.json(serializeBigInt(talleres));
  } catch (error: any) {
    console.error('Error fetching talleres:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Crear un nuevo taller
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.nombre || !body.ruc || !body.contacto || !body.telefono || !body.direccion) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const taller = await prisma.talleres.create({
      data: {
        nombre: body.nombre,
        ruc: body.ruc,
        contacto: body.contacto,
        telefono: body.telefono,
        email: body.email ?? null,
        direccion: body.direccion,
        especialidad: body.especialidad ?? null,
        estado: body.estado ?? 'activo',
      },
    });

    return NextResponse.json(serializeBigInt(taller), { status: 201 });
  } catch (error: any) {
    console.error('Error creating taller:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un taller con ese RUC o email' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Actualizar un taller + registrar incidencias si se incluyen
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Actualizar taller
      const tallerData: Record<string, unknown> = {};
      if (updates.nombre !== undefined) tallerData.nombre = updates.nombre;
      if (updates.direccion !== undefined) tallerData.direccion = updates.direccion;
      if (updates.telefono !== undefined) tallerData.telefono = updates.telefono;
      if (updates.email !== undefined) tallerData.email = updates.email;
      if (updates.contacto !== undefined) tallerData.contacto = updates.contacto;
      if (updates.especialidad !== undefined) tallerData.especialidad = updates.especialidad;
      if (updates.estado !== undefined) tallerData.estado = updates.estado;

      const taller = await tx.talleres.update({
        where: { id: BigInt(id) },
        data: tallerData,
      });

      // 2. Si se incluyen incidencias, registrarlas
      if (updates.incidencias && Array.isArray(updates.incidencias)) {
        for (const inc of updates.incidencias) {
          await tx.incidencias_taller.create({
            data: {
              orden_id: inc.orden_id ? BigInt(inc.orden_id) : BigInt(id), // fallback al taller como referencia
              confeccion_id: inc.confeccion_id ? BigInt(inc.confeccion_id) : null,
              tipo: inc.tipo,
              severidad: inc.severidad ?? 'media',
              descripcion: inc.descripcion,
              reportado_por: inc.reportado_por ? BigInt(inc.reportado_por) : null,
              asignado_a: inc.asignado_a ? BigInt(inc.asignado_a) : null,
              impacto_horas: inc.impacto_horas ?? null,
              foto_url: inc.foto_url ?? null,
            },
          });
        }
      }

      return taller;
    });

    return NextResponse.json(serializeBigInt(result));
  } catch (error: any) {
    console.error('Error updating taller:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Taller no encontrado' }, { status: 404 });
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un taller con ese RUC o email' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar un taller
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    await prisma.talleres.delete({
      where: { id: BigInt(id) },
    });

    return NextResponse.json({ message: 'Eliminado correctamente' });
  } catch (error: any) {
    console.error('Error deleting taller:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Taller no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
