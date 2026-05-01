export const runtime = 'nodejs';
import { UsuariosService } from '@/lib/services/usuarios-services';
import { NextResponse } from 'next/server';

// GET /api/admin/usuarios/[id]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const usuario = await UsuariosService.obtenerPorId(id);
    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: usuario });
  } catch (error: any) {
    console.error('[GET /usuarios/:id]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}