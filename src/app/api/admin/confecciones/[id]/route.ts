export const runtime = 'nodejs';
import { ConfeccionesService } from '@/lib/services/confecciones.service';
import { NextResponse } from 'next/server';
import { requireServerRole } from '@/lib/auth/server';
import type { RolUsuario } from '@/lib/constants/roles';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';

const ROLES: RolUsuario[] = ['administrador', 'gerente', 'representante_taller'];

// GET - Obtener una orden específica
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireServerRole(ROLES);
  if (!auth.success) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    
    const confeccion = await prisma.confecciones.findUnique({
      where: { id: Number(id) },
      include: {
        talleres: true,
        seguimiento_confeccion: {
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!confeccion) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    return NextResponse.json(serializeBigInt(confeccion));
  } catch (error: any) {
    console.error('[GET]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Actualizar una orden completa
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireServerRole(ROLES);
  if (!auth.success) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    const body = await req.json();

    const confeccion = await prisma.confecciones.update({
      where: { id: Number(id) },
      data: {
        taller_id: body.taller_id ? Number(body.taller_id) : undefined,
        prenda: body.prenda,
        cantidad: body.cantidad,
        costo_unitario: body.costo_unitario,
        fecha_entrega: body.fecha_entrega ? new Date(body.fecha_entrega) : null,
        prioridad: body.prioridad,
        estado: body.estado,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(serializeBigInt(confeccion));
  } catch (error: any) {
    console.error('[PUT]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Eliminar una orden
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireServerRole(ROLES);
  if (!auth.success) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;

    const existe = await prisma.confecciones.findUnique({
      where: { id: Number(id) },
    });

    if (!existe) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    await prisma.seguimiento_confeccion.deleteMany({
      where: { confeccion_id: Number(id) },
    });

    await prisma.confecciones.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[DELETE]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Cambiar estado
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireServerRole(ROLES);
  if (!auth.success) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.estado) {
      return NextResponse.json({ error: 'El campo estado es requerido' }, { status: 400 });
    }

    const seg = await ConfeccionesService.actualizarEstado(id, {
      estado: body.estado,
      notas: body.notas ?? "",
      responsable_id: auth.user.id?.toString(),
    });

    return NextResponse.json({ success: true, data: seg });
  } catch (error: any) {
    console.error('[POST estado]', error);
    return NextResponse.json({ error: error.message ?? 'Error interno' }, { status: 500 });
  }
}