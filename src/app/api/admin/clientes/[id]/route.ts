export const runtime = 'nodejs';
import { ClientesService } from "@/lib/services/clientes-services";
import { NextResponse } from "next/server";

/**
 * GET /api/admin/clientes/[id]
 * * NOTA PARA NEXT.JS 16+: 
 * 1. La función DEBE llamarse "GET".
 * 2. El segundo argumento es un objeto que contiene "params".
 * 3. "params" DEBE ser una Promise y debe usarse "await".
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Resolvemos la promesa de los parámetros
    
    const cliente = await ClientesService.obtenerPorId(id);

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(cliente);
  } catch (error: any) {
    console.error("[API_CLIENTES] Error:", error);
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}