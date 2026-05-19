export const runtime = 'nodejs';
import { UsuariosService } from '@/lib/services/usuarios.service';
import { requireServerRole } from '@/lib/auth/server';
import { auditoriaService } from '@/lib/services/auditoria.service';
import type { RolUsuario } from '@/lib/constants/roles';
import { NextResponse } from 'next/server';

const ADMIN_ROLES: RolUsuario[] = ['administrador', 'gerente'];

// GET /api/admin/usuarios
export async function GET() {
  const auth = await requireServerRole(ADMIN_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const data = await UsuariosService.listar();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[GET /usuarios]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/usuarios
export async function POST(req: Request) {
  const auth = await requireServerRole(ADMIN_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();

    if (!body.email || !body.password || !body.rol) {
      return NextResponse.json({ error: 'email, password y rol son requeridos' }, { status: 400 });
    }

    const usuario = await UsuariosService.crear({
      ...body,
      createdBy: auth.user.authId,
    });

    if (!usuario) {
      return NextResponse.json({ error: 'No se pudo crear el usuario' }, { status: 500 });
    }

    // Registro en auditoría
    await auditoriaService.registrar({
      usuario_id: BigInt(auth.user.id),
      accion: 'CREAR',
      tabla: 'usuarios',
      registro_id: BigInt(usuario.id),
      datos_despues: usuario,
    });

    return NextResponse.json({ success: true, data: usuario }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /usuarios]', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email ya registrado' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/usuarios
export async function PATCH(req: Request) {
  const auth = await requireServerRole(ADMIN_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { id, estado, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'id requerido' }, { status: 400 });
    }

    // Toggle rápido de estado sin otros campos
    if (estado !== undefined && Object.keys(data).length === 0) {
      const usuario = await UsuariosService.cambiarEstado(id, estado);
      return NextResponse.json({ success: true, data: usuario });
    }

    // Actualización general — requiere al menos un campo además del id
    if (estado === undefined && Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Sin campos para actualizar' }, { status: 400 });
    }

    const usuario = await UsuariosService.actualizar(id, { estado, ...data });

    if (!usuario) {
      return NextResponse.json({ error: 'No se pudo actualizar el usuario' }, { status: 500 });
    }

    // Registro en auditoría
    await auditoriaService.registrar({
      usuario_id: BigInt(auth.user.id),
      accion: 'ACTUALIZAR',
      tabla: 'usuarios',
      registro_id: BigInt(id),
      datos_despues: usuario,
    });

    return NextResponse.json({ success: true, data: usuario });
  } catch (error: any) {
    console.error('[PATCH /usuarios]', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/usuarios?id=xxx
export async function DELETE(req: Request) {
  const auth = await requireServerRole(ADMIN_ROLES);
  if (!auth.success) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });

    // No se elimina — se suspende
    const usuario = await UsuariosService.cambiarEstado(id, 'suspendido');

    await auditoriaService.registrar({
      usuario_id: BigInt(auth.user.id),
      accion: 'SUSPENDER',
      tabla: 'usuarios',
      registro_id: BigInt(id),
      datos_despues: usuario,
    });

    return NextResponse.json({ success: true, data: usuario });
  } catch (error: any) {
    console.error('[DELETE /usuarios]', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}