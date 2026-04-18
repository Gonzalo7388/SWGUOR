export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { tallerSchema } from '@/lib/schemas/talleres';

// ── GET: Listar todos los talleres ─────────────────────────────────────────
export async function GET() {
  try {
    const talleres = await prisma.talleres.findMany({
      include: {
        _count: { select: { confecciones: true } },
      },
      orderBy: { nombre: 'asc' },
    });

    return NextResponse.json(serializeBigInt(talleres));
  } catch (error: any) {
    console.error('[GET /talleres]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── POST: Crear taller ─────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = tallerSchema.safeParse(body);
    

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Datos inválidos';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { id: _, ...data } = parsed.data;

    const taller = await prisma.talleres.create({
      data: {
        nombre:       data.nombre,
        ruc:          data.ruc,
        contacto:     data.contacto,
        telefono:     data.telefono,
        email:        data.email     || null,
        direccion:    data.direccion,
        especialidad: data.especialidad  || null,
        estado:       data.estado,
      },
    });

    return NextResponse.json(
      { success: true, data: serializeBigInt(taller) },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('[POST /talleres]', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Ya existe un taller con ese RUC o email' },
        { status: 409 },
      );
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ── PUT: Actualizar taller (+ incidencias opcionales) ──────────────────────
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, incidencias, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 });
    }

    // Validar solo los campos que vienen (partial)
    const parsed = tallerSchema.partial().safeParse(updates);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Datos inválidos';
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Actualizar taller
      const tallerData: Record<string, unknown> = {};
      const d = parsed.data;
      if (d.nombre       !== undefined) tallerData.nombre       = d.nombre;
      if (d.direccion    !== undefined) tallerData.direccion    = d.direccion;
      if (d.telefono     !== undefined) tallerData.telefono     = d.telefono;
      if (d.email        !== undefined) tallerData.email        = d.email || null;
      if (d.contacto     !== undefined) tallerData.contacto     = d.contacto;
      if (d.especialidad !== undefined) tallerData.especialidad = d.especialidad || null;
      if (d.estado       !== undefined) tallerData.estado       = d.estado;

      const taller = await tx.talleres.update({
        where: { id: BigInt(id) },
        data:  tallerData,
      });

      // 2. Registrar incidencias si se incluyen
      if (Array.isArray(incidencias) && incidencias.length > 0) {
        for (const inc of incidencias) {
          await tx.incidencias_taller.create({
            data: {
              orden_id:      inc.orden_id      ? BigInt(inc.orden_id)      : BigInt(id),
              confeccion_id: inc.confeccion_id ? BigInt(inc.confeccion_id) : null,
              tipo:          inc.tipo,
              severidad:     inc.severidad     ?? 'media',
              descripcion:   inc.descripcion,
              reportado_por: inc.reportado_por ? BigInt(inc.reportado_por) : null,
              asignado_a:    inc.asignado_a    ? BigInt(inc.asignado_a)    : null,
              impacto_horas: inc.impacto_horas ?? null,
              foto_url:      inc.foto_url      ?? null,
            },
          });
        }
      }

      return taller;
    });

    return NextResponse.json({ success: true, data: serializeBigInt(result) });
  } catch (error: any) {
    console.error('[PUT /talleres]', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Taller no encontrado' }, { status: 404 });
    }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Ya existe un taller con ese RUC o email' },
        { status: 409 },
      );
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ── DELETE: Desactivar taller (borrado lógico) ────────────────────────────
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 });
    }

    const taller = await prisma.talleres.update({
      where: { id: BigInt(id) },
      data:  { estado: 'inactivo' },
    });

    return NextResponse.json({
      success: true,
      message: 'Taller desactivado correctamente',
      data:    serializeBigInt(taller),
    });
  } catch (error: any) {
    console.error('[DELETE /talleres]', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Taller no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}