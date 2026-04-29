export const runtime = 'nodejs';
import { FichasTecnicasService } from '@/lib/services/fichas-tecnicas-services';
import { NextResponse } from 'next/server';

// GET /api/admin/fichas-tecnicas?estado=xxx&busqueda=xxx (listar todas con filtros)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const producto_id = searchParams.get('producto_id');
    const estado = searchParams.get('estado') as any;
    const busqueda = searchParams.get('busqueda');

    // Si se proporciona producto_id, obtener esa ficha específica
    if (producto_id) {
      const data = await FichasTecnicasService.obtenerPorProducto(producto_id);
      return NextResponse.json({ success: true, data });
    }

    // Si no, listar todas las fichas con filtros opcionales
    const data = await FichasTecnicasService.listar({
      estado: estado || undefined,
      busqueda: busqueda || undefined,
    });
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[GET /fichas-tecnicas]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/fichas-tecnicas
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.producto_id) {
      return NextResponse.json({ error: 'producto_id requerido' }, { status: 400 });
    }

    const ficha = await FichasTecnicasService.crear(body);
    return NextResponse.json({ success: true, data: ficha }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /fichas-tecnicas]', error);
    if (error.message?.includes('Ya existe')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/admin/fichas-tecnicas
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'id requerido' }, { status: 400 });
    }

    // Evitar actualización sin campos
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Sin campos para actualizar' }, { status: 400 });
    }

    const ficha = await FichasTecnicasService.actualizar(id, data);
    return NextResponse.json({ success: true, data: ficha });
  } catch (error: any) {
    console.error('[PUT /fichas-tecnicas]', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Ficha no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}