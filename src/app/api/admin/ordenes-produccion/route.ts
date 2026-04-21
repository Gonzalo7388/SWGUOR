export const runtime = 'nodejs';
import { OrdenesProduccionService } from '@/lib/services/ordenes-produccion-services';
import { NextResponse } from 'next/server';
 
// GET /api/admin/ordenes-produccion
export async function GET_ORDENES(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    return NextResponse.json({
      success: true,
      data: await OrdenesProduccionService.listar(searchParams.get('producto_id') ?? undefined),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
 
// POST /api/admin/ordenes-produccion
export async function POST_ORDENES(req: Request, usuario_id: string) {
  try {
    const body = await req.json();
    const { producto_id, taller_id, ficha_id, cantidad_solicitada, pedido_id } = body;

    // Validación básica de campos requeridos para la DB
    if (!producto_id || !taller_id || !ficha_id || !cantidad_solicitada || !pedido_id) {
      return NextResponse.json(
        { error: 'producto_id, taller_id, ficha_id, pedido_id y cantidad son requeridos' },
        { status: 400 }
      );
    }

    // El servicio ahora se encarga de: Crear Orden -> Crear Seguimiento 'corte' -> Poner Producto 'en_produccion'
    const orden = await OrdenesProduccionService.crear({ 
      ...body, 
      creado_por: usuario_id 
    });

    return NextResponse.json({ success: true, data: orden }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
 
// PUT /api/admin/ordenes-produccion
export async function PUT_ORDENES(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });
    return NextResponse.json({
      success: true,
      data: await OrdenesProduccionService.actualizar(id, data),
    });
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}