export const runtime = 'nodejs';
import { FichasTecnicasService } from '@/lib/services/fichas-tecnicas-services';
import { NextResponse } from 'next/server';

// POST /api/admin/fichas-tecnicas/medidas — reemplaza todas las medidas de una ficha
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ficha_id, medidas } = body;

    if (!ficha_id) {
      return NextResponse.json({ error: 'ficha_id requerido' }, { status: 400 });
    }
    if (!Array.isArray(medidas) || medidas.length === 0) {
      return NextResponse.json({ error: 'medidas[] requerido y no puede estar vacío' }, { status: 400 });
    }

    const data = await FichasTecnicasService.guardarMedidas(ficha_id, medidas);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /fichas-tecnicas/medidas]', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Ficha no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/fichas-tecnicas/medidas?id=xxx
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id requerido' }, { status: 400 });
    }

    const result = await FichasTecnicasService.eliminarMedida(id);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[DELETE /fichas-tecnicas/medidas]', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Medida no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}