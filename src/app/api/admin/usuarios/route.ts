export const runtime = 'nodejs';
import { UsuariosService } from '@/lib/services/usuarios-services';
import { NextResponse } from 'next/server';
 
// GET /api/admin/usuarios
export async function GET_USUARIOS() {
  try {
    return NextResponse.json(await UsuariosService.listar());
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
 
// POST /api/admin/usuarios
export async function POST_USUARIOS(req: Request) {
  try {
    const body = await req.json();
    if (!body.email || !body.password || !body.rol) {
      return NextResponse.json({ error: 'email, password y rol son requeridos' }, { status: 400 });
    }
    const usuario = await UsuariosService.crear(body);
    return NextResponse.json(usuario, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: 'Email ya registrado' }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
 
// PATCH /api/admin/usuarios
export async function PATCH_USUARIOS(req: Request) {
  try {
    const body = await req.json();
    const { id, estado, ...data } = body;
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
 
    // Toggle rápido de estado
    if (estado !== undefined && Object.keys(data).length === 0) {
      return NextResponse.json(await UsuariosService.toggleEstado(id, estado));
    }
 
    return NextResponse.json(await UsuariosService.actualizar(id, { estado, ...data }));
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
 
// DELETE /api/admin/usuarios?id=xxx
export async function DELETE_USUARIOS(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    return NextResponse.json(await UsuariosService.eliminar(id));
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}