export const runtime = 'nodejs';
import { ConfeccionesService } from '@/lib/services/confecciones-services';
import { NextResponse } from 'next/server';
 
// GET /api/admin/confecciones
export async function GET_CONFECCIONES(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    return NextResponse.json(await ConfeccionesService.listar({
      estado:    searchParams.get('estado')    ?? undefined,
      taller_id: searchParams.get('taller_id') ?? undefined,
      pedido_id: searchParams.get('pedido_id') ?? undefined,
    }));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}