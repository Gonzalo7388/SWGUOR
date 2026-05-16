export const runtime = 'nodejs';
import { TalleresService } from '@/lib/services/talleres.service';
import { NextResponse } from 'next/server';
import { requireServerRole } from '@/lib/auth/server';
import { auditoriaService } from '@/lib/services/auditoria.service';

const TALLERES_ROLES: any = ['administrador', 'gerente'];

// GET /api/admin/talleres
export async function GET() {
  const auth = await requireServerRole(TALLERES_ROLES);
  if (!auth.success) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const data = await TalleresService.listar();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[GET /talleres]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/talleres
export async function POST(req: Request) {
  const auth = await requireServerRole(TALLERES_ROLES);
  if (!auth.success) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await req.json();

    if (!body.nombre) {
      return NextResponse.json({ error: 'nombre requerido' }, { status: 400 });
    }

    const taller = await TalleresService.crear(body);

    await auditoriaService.registrar({
      usuario_id: BigInt(auth.user.id),
      accion: 'CREAR',
      tabla: 'talleres',
      registro_id: BigInt(taller.id),
      datos_despues: taller,
    });

    return NextResponse.json({ success: true, data: taller }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /talleres]', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un taller con ese RUC o email' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/admin/talleres
export async function PUT(req: Request) {
  const auth = await requireServerRole(TALLERES_ROLES);
  if (!auth.success) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await req.json();
    // incidencias se excluye: es relación de solo lectura, no se actualiza directamente
    const { id, incidencias: _incidencias, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'id requerido' }, { status: 400 });
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Sin campos para actualizar' }, { status: 400 });
    }

    const taller = await TalleresService.actualizar(id, data);

    await auditoriaService.registrar({
      usuario_id: BigInt(auth.user.id),
      accion: 'ACTUALIZAR',
      tabla: 'talleres',
      registro_id: BigInt(id),
      datos_despues: taller,
    });

    return NextResponse.json({ success: true, data: taller });
  } catch (error: any) {
    console.error('[PUT /talleres]', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Taller no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/talleres?id=xxx — soft delete
export async function DELETE(req: Request) {
  const auth = await requireServerRole(TALLERES_ROLES);
  if (!auth.success) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const id = new URL(req.url).searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id requerido' }, { status: 400 });
    }

    const taller = await TalleresService.desactivar(id);

    await auditoriaService.registrar({
      usuario_id: BigInt(auth.user.id),
      accion: 'ELIMINAR',
      tabla: 'talleres',
      registro_id: BigInt(id),
    });

    return NextResponse.json({ success: true, message: 'Taller desactivado', data: taller });
  } catch (error: any) {
    console.error('[DELETE /talleres]', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Taller no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}