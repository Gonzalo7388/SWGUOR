export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { InventarioService } from '@/lib/services/inventario.service';

type Params = { params: Promise<{ id: string }> };

// GET /api/admin/inventario/[id]
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const insumo = await InventarioService.obtenerPorId(id);

    if (!insumo) return NextResponse.json({ error: 'Insumo no encontrado' }, { status: 404 });
    return NextResponse.json(insumo);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/inventario/[id]
// → Con stock_delta o stock_actual: ajusta stock
// → Sin ellos: actualiza campos generales
export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (body.stock_delta !== undefined || body.stock_actual !== undefined) {
      const insumo = await InventarioService.ajustarStock(id, {
        stock_delta: body.stock_delta,
        stock_actual: body.stock_actual,
        motivo: body.motivo,
        usuario_id: body.usuario_id,
        costo_unitario: body.costo_unitario,
        referencia_tipo: body.referencia_tipo,
        precio_unitario: body.precio_unitario,
      });
      return NextResponse.json(insumo);
    }

    const insumo = await InventarioService.actualizar(id, body);
    return NextResponse.json(insumo);
  } catch (error: any) {
    console.error('[PATCH /inventario/:id]', error);
    if (error.message.includes('no encontrado') || error.code === 'P2025') {
      return NextResponse.json({ error: 'Insumo no encontrado' }, { status: 404 });
    }
    if (error.message.includes('Stock insuficiente')) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}