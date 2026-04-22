export const runtime = 'nodejs';
import { ClientesService } from '@/lib/services/clientes-services';
import { NextResponse } from 'next/server';
 
// GET /api/admin/clientes
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    return NextResponse.json(await ClientesService.listar({
      busqueda:     searchParams.get('search')       ?? undefined,
      tipo_cliente: searchParams.get('tipo_cliente') ?? undefined,
      activo:       searchParams.get('activo')       ?? undefined,
    }));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
 
// PATCH /api/admin/clientes  — actualizar datos
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    return NextResponse.json(await ClientesService.actualizar(id, data));
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
 
// DELETE /api/admin/clientes?id=xxx  — soft delete
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    await ClientesService.desactivar(id);
    return NextResponse.json({ message: 'Cliente desactivado correctamente' });
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}