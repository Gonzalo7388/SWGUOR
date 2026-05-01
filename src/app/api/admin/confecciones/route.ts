export const runtime = 'nodejs';
import { ConfeccionesService } from '@/lib/services/confecciones-services';
import { NextResponse } from 'next/server';

// GET /api/admin/confecciones
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const data = await ConfeccionesService.listar({
      estado:    searchParams.get('estado')    ?? undefined,
      taller_id: searchParams.get('taller_id') ?? undefined,
      pedido_id: searchParams.get('pedido_id') ?? undefined,
    });
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[GET /confecciones]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}