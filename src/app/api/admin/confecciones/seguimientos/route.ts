export const runtime = 'nodejs';
import { ConfeccionesService } from "@/lib/services/confecciones-services";
import { NextResponse } from "next/server";

export async function POST(req: Request, usuario_id: string) {
  try {
    const body = await req.json();
    if (!body.confeccion_id || !body.estado_nuevo) {
      return NextResponse.json({ error: 'confeccion_id y estado_nuevo requeridos' }, { status: 400 });
    }
    const seg = await ConfeccionesService.registrarSeguimiento({ ...body, usuario_id });
    return NextResponse.json({ success: true, data: seg }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}