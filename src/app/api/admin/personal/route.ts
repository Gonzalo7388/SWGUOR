export const runtime = 'nodejs';
import { PersonalInternoService } from '@/lib/services/personal-interno.service';
import { NextResponse } from 'next/server';

// GET /api/admin/personal?cargo=xxx&estado=xxx&busqueda=xxx
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const data = await PersonalInternoService.listar({
      cargo: searchParams.get('cargo') ?? undefined,
      estado: searchParams.get('estado') ?? undefined,
      busqueda: searchParams.get('busqueda') ?? undefined,
    });
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[GET /personal]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/personal — actualiza por id o usuario_id
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, usuario_id, ...data } = body;

    if (!id && !usuario_id) {
      return NextResponse.json({ error: 'id o usuario_id requerido' }, { status: 400 });
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Sin campos para actualizar' }, { status: 400 });
    }

    const personal = id
      ? await PersonalInternoService.actualizar(String(id), data)
      : await PersonalInternoService.actualizarPorUsuarioId(String(usuario_id), data);

    return NextResponse.json({ success: true, data: personal });
  } catch (error: any) {
    console.error('[PATCH /personal]', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Personal no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/personal — crea nuevo personal con usuario
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { usuario_id, nombre_completo, cargo, dni, telefono, fecha_ingreso } = body;

    if (!usuario_id || !nombre_completo || !cargo) {
      return NextResponse.json({ message: 'Faltan campos requeridos' }, { status: 400 });
    }

    const personal = await PersonalInternoService.crear({
      usuario_id,
      nombre_completo,
      cargo,
      ...(dni && { dni }),
      ...(telefono && { telefono }),
      ...(fecha_ingreso && { fecha_ingreso }),
    });

    return NextResponse.json({ success: true, data: personal }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /personal]', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'Este usuario ya tiene un perfil asignado' }, { status: 409 });
    }
    return NextResponse.json({ message: error.message ?? 'Error al crear el personal' }, { status: 500 });
  }
}