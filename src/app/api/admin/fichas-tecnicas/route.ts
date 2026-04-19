export const runtime = 'nodejs';
import { FichasTecnicasService } from '@/lib/services/fichas-tecnicas-services';
import { NextResponse } from 'next/server';
 
// GET /api/admin/fichas-tecnicas?producto_id=xxx
export async function GET_FICHAS(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const producto_id = searchParams.get('producto_id');
    if (!producto_id) return NextResponse.json({ error: 'producto_id requerido' }, { status: 400 });
    return NextResponse.json({
      success: true,
      data: await FichasTecnicasService.obtenerPorProducto(producto_id),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
 
// POST /api/admin/fichas-tecnicas
export async function POST_FICHAS(req: Request) {
  try {
    const body = await req.json();
    if (!body.producto_id) return NextResponse.json({ error: 'producto_id requerido' }, { status: 400 });
    const ficha = await FichasTecnicasService.crear(body);
    return NextResponse.json({ success: true, data: ficha }, { status: 201 });
  } catch (error: any) {
    if (error.message.includes('Ya existe')) return NextResponse.json({ error: error.message }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
 
// PUT /api/admin/fichas-tecnicas
export async function PUT_FICHAS(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });
    return NextResponse.json({ success: true, data: await FichasTecnicasService.actualizar(id, data) });
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Ficha no encontrada' }, { status: 404 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}