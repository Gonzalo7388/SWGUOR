export const runtime = 'nodejs';
import { NextResponse }      from 'next/server';
import { InventarioService } from '@/lib/services/inventario-services';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const movimientos = await InventarioService.listarMovimientos({
      insumo_id: searchParams.get('insumo_id') ?? undefined,
      desde:     searchParams.get('desde')     ?? undefined,
      hasta:     searchParams.get('hasta')     ?? undefined,
      limite:    searchParams.get('limite') ? Number(searchParams.get('limite')) : undefined,
    });
    return NextResponse.json({ success: true, data: movimientos });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}