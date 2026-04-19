export const runtime = 'nodejs';
import { ConfeccionesService } from "@/lib/services/confecciones-services";
import { NextResponse }  from "next/server";

export async function GET_CONFECCION_ID(id: string) {
  const confeccion = await ConfeccionesService.obtenerPorId(id);
  if (!confeccion) return NextResponse.json({ error: 'Confección no encontrada' }, { status: 404 });
  return NextResponse.json(confeccion);
}
 
// PATCH /api/admin/confecciones/[id]  — cambio de estado + seguimiento automático
export async function PATCH_CONFECCION_ID(id: string, body: any, usuario_id?: string) {
  if (!body.estado) return NextResponse.json({ error: 'estado requerido' }, { status: 400 });
  return NextResponse.json(await ConfeccionesService.actualizarEstado(id, body.estado, usuario_id));
}