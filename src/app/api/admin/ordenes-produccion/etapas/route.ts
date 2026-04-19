export const runtime = 'nodejs';
import { OrdenesProduccionService } from "@/lib/services/ordenes-produccion-services";
import { NextResponse } from "next/server";

// POST /api/admin/ordenes-produccion/etapa
export async function POST_ETAPA(req: Request, usuario_id: string) {
  try {
    const body = await req.json();
    if (!body.orden_id || !body.etapa) {
      return NextResponse.json({ error: 'orden_id y etapa requeridos' }, { status: 400 });
    }
    const seg = await OrdenesProduccionService.registrarEtapa({ ...body, usuario_id });
    return NextResponse.json({ success: true, data: seg }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}