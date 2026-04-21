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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, ...input } = body; // 'id' es el ID del insumo

    if (!id) return NextResponse.json({ error: 'ID de insumo requerido' }, { status: 400 });

    // Invocamos al servicio que acabas de definir
    const data = await InventarioService.ajustarStock(id, input);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}