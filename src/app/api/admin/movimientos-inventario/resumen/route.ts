export const runtime = 'nodejs';
import { MovimientosInventarioService } from '@/lib/services/movimientos-inventario.service';
import { NextResponse } from 'next/server';

/**
 * GET /api/admin/movimientos-inventario/resumen
 * Obtener estadísticas de movimientos
 * 
 * Query params:
 * - tipo_movimiento: entrada|salida|ajuste (opcional)
 * - desde: Fecha inicio (ISO string)
 * - hasta: Fecha fin (ISO string)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const filtros: any = {};

    if (searchParams.has('tipo_movimiento')) {
      filtros.tipo_movimiento = searchParams.get('tipo_movimiento');
    }

    if (searchParams.has('desde')) {
      filtros.desde = new Date(searchParams.get('desde')!);
    }

    if (searchParams.has('hasta')) {
      filtros.hasta = new Date(searchParams.get('hasta')!);
    }

    const resumen = await MovimientosInventarioService.obtenerResumen(filtros);
    return NextResponse.json({ success: true, data: resumen });
  } catch (error: any) {
    console.error('[GET /movimientos-inventario/resumen]', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
