export const runtime = 'nodejs';
import { ClientesService } from '@/lib/services/clientes.service';
import { NextResponse } from 'next/server';

// GET /api/admin/clientes/[id]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await ClientesService.obtenerDetalle(id);
    if (!data) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[GET /clientes/:id]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}