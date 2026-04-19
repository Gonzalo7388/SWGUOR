export const runtime = 'nodejs';
import { TalleresService } from '@/lib/services/talleres-services';
import { NextResponse } from 'next/server';
 
// GET /api/admin/talleres
export async function GET_TALLERES() {
  try {
    return NextResponse.json(await TalleresService.listar());
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
 
// POST /api/admin/talleres
export async function POST_TALLERES(req: Request) {
  try {
    const body = await req.json();
    const taller = await TalleresService.crear(body);
    return NextResponse.json({ success: true, data: taller }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un taller con ese RUC o email' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
 
// PUT /api/admin/talleres
export async function PUT_TALLERES(req: Request) {
  try {
    const body = await req.json();
    const { id, incidencias, ...data } = body;
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    return NextResponse.json({ success: true, data: await TalleresService.actualizar(id, data) });
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Taller no encontrado' }, { status: 404 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
 
// DELETE /api/admin/talleres?id=xxx  — soft delete
export async function DELETE_TALLERES(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    const taller = await TalleresService.desactivar(id);
    return NextResponse.json({ success: true, message: 'Taller desactivado', data: taller });
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Taller no encontrado' }, { status: 404 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}