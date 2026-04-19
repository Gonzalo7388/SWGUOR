export const runtime = 'nodejs';
import { ClientesService } from "@/lib/services/clientes-services";
import { NextResponse } from "next/server";

// GET /api/admin/clientes/[id]
export async function GET_CLIENTE_ID(id: string) {
  const cliente = await ClientesService.obtenerPorId(id);
  if (!cliente) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
  return NextResponse.json(cliente);
}