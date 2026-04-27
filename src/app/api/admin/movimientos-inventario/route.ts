export const runtime = 'nodejs';
import { MovimientosInventarioService } from '@/lib/services/movimientos-inventario-services';
import { NextResponse } from 'next/server';

/**
 * GET /api/admin/movimientos-inventario
 * Listar movimientos con filtros
 * 
 * Query params:
 * - tipo_movimiento: entrada|salida|ajuste
 * - referencia_tipo: ORDEN|COMPRA|VENTA|AJUSTE
 * - producto_id: ID del producto
 * - material_id: ID del material
 * - insumo_id: ID del insumo
 * - usuario_id: ID del usuario
 * - almacen_id: ID del almacén
 * - busqueda: Buscar en motivo
 * - desde: Fecha inicio (ISO string)
 * - hasta: Fecha fin (ISO string)
 * - limite: Máximo registros (default 100)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const filtros: any = {};

    // Filtros simples
    if (searchParams.has('tipo_movimiento')) {
      filtros.tipo_movimiento = searchParams.get('tipo_movimiento');
    }
    if (searchParams.has('referencia_tipo')) {
      filtros.referencia_tipo = searchParams.get('referencia_tipo');
    }
    if (searchParams.has('producto_id')) {
      filtros.producto_id = searchParams.get('producto_id');
    }
    if (searchParams.has('material_id')) {
      filtros.material_id = searchParams.get('material_id');
    }
    if (searchParams.has('insumo_id')) {
      filtros.insumo_id = searchParams.get('insumo_id');
    }
    if (searchParams.has('usuario_id')) {
      filtros.usuario_id = searchParams.get('usuario_id');
    }
    if (searchParams.has('almacen_id')) {
      filtros.almacen_id = searchParams.get('almacen_id');
    }
    if (searchParams.has('busqueda')) {
      filtros.busqueda = searchParams.get('busqueda');
    }

    // Filtros de fecha
    if (searchParams.has('desde')) {
      filtros.desde = new Date(searchParams.get('desde')!);
    }
    if (searchParams.has('hasta')) {
      filtros.hasta = new Date(searchParams.get('hasta')!);
    }

    // Límite
    if (searchParams.has('limite')) {
      filtros.limite = parseInt(searchParams.get('limite') || '100');
    }

    const data = await MovimientosInventarioService.listar(filtros);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[GET /movimientos-inventario]', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/movimientos-inventario
 * Registrar un nuevo movimiento
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validar datos mínimos
    if (!body.cantidad) {
      return NextResponse.json(
        { error: 'Cantidad requerida' },
        { status: 400 }
      );
    }

    if (!body.tipo_movimiento) {
      return NextResponse.json(
        { error: 'Tipo de movimiento requerido' },
        { status: 400 }
      );
    }

    if (!body.motivo) {
      return NextResponse.json(
        { error: 'Motivo requerido' },
        { status: 400 }
      );
    }

    if (!body.producto_id && !body.material_id && !body.insumo_id) {
      return NextResponse.json(
        { error: 'Debe especificar producto, material o insumo' },
        { status: 400 }
      );
    }

    const movimiento = await MovimientosInventarioService.registrar(body);
    return NextResponse.json(
      { success: true, data: movimiento },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[POST /movimientos-inventario]', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
