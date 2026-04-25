import { PersonalInternoService } from "@/lib/services/personal-interno-services";
import { NextResponse } from "next/server";

// PATCH /api/admin/personal/[id]/estado
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { suspender } = await req.json(); // boolean

  const resultado = await PersonalInternoService.toggleEstado(id, suspender);
  return NextResponse.json({ success: true, data: resultado });
}