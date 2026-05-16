export const runtime = 'nodejs';
import { OrdenesProduccionService } from '@/lib/services/ordenes-produccion.service';
import { NextResponse } from 'next/server';

// GET /api/admin/ordenes-produccion?producto_id=xxx (opcional)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const result = await OrdenesProduccionService.listar({
      producto_id: searchParams.get('producto_id') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      etapa: searchParams.get('etapa') ?? undefined,
      page: searchParams.has('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.has('limit') ? Number(searchParams.get('limit')) : 10,
    });
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[GET /ordenes-produccion]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/ordenes-produccion
// CORREGIDO: el segundo parámetro de un Route Handler en App Router es siempre
// { params } (para rutas dinámicas) o se omite. Nunca es un string suelto.
// usuario_id debe venir en el body o extraerse de la sesión/auth.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { producto_id, taller_id, ficha_id, cantidad_solicitada, pedido_id, creado_por } = body;

    if (!producto_id || !taller_id || !ficha_id || !cantidad_solicitada || !pedido_id) {
      return NextResponse.json(
        { error: 'producto_id, taller_id, ficha_id, pedido_id y cantidad_solicitada son requeridos' },
        { status: 400 }
      );
    }

    // El servicio crea la Orden, el Seguimiento 'corte' y pone el Producto 'en_produccion'
    const orden = await OrdenesProduccionService.crear({
      producto_id,
      taller_id,
      ficha_id,
      cantidad_solicitada,
      pedido_id,
      creado_por: creado_por ?? null, // Idealmente extraer de sesión: getServerSession(req)
    });

    return NextResponse.json({ success: true, data: orden }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /ordenes-produccion]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/admin/ordenes-produccion
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'id requerido' }, { status: 400 });
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Sin campos para actualizar' }, { status: 400 });
    }

    const orden = await OrdenesProduccionService.actualizar(id, data);
    return NextResponse.json({ success: true, data: orden });
  } catch (error: any) {
    console.error('[PUT /ordenes-produccion]', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}