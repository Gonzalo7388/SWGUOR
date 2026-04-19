export const runtime = 'nodejs';
import { FichasTecnicasService } from "@/lib/services/fichas-tecnicas-services";
import { NextResponse } from "next/server";

// POST /api/admin/fichas-tecnicas/medidas  — reemplaza todas las medidas
export async function POST_MEDIDAS(req: Request) {
  try {
    const { ficha_id, medidas } = await req.json();
    if (!ficha_id || !Array.isArray(medidas)) {
      return NextResponse.json({ error: 'ficha_id y medidas[] requeridos' }, { status: 400 });
    }
    return NextResponse.json({
      success: true,
      data: await FichasTecnicasService.guardarMedidas(ficha_id, medidas),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
 
// DELETE /api/admin/fichas-tecnicas/medidas?id=xxx
export async function DELETE_MEDIDA(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });
    return NextResponse.json(await FichasTecnicasService.eliminarMedida(id));
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Medida no encontrada' }, { status: 404 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}