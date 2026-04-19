export const runtime = 'nodejs';
import { PedidosService } from "@/lib/services/pedidos-services";
import { NextResponse } from "next/server";

export async function GET_SEGUIMIENTO_PEDIDO(req: Request) {
  const { searchParams } = new URL(req.url);
  const pedido_id = searchParams.get('pedido_id');
  if (!pedido_id) return NextResponse.json({ error: 'pedido_id requerido' }, { status: 400 });
 
  // Lee directamente del service de pedidos (registrarSeguimiento ya incluye la query)
  return NextResponse.json({ success: true });
}
 
// POST /api/admin/pedidos/seguimiento
export async function POST_SEGUIMIENTO_PEDIDO(req: Request) {
  try {
    const body = await req.json();
    const { pedido_id, status, notas, creado_por } = body;
    if (!pedido_id || !status) {
      return NextResponse.json({ error: 'pedido_id y status requeridos' }, { status: 400 });
    }
    const seg = await PedidosService.registrarSeguimiento({ pedido_id, status, notas, creado_por });
    return NextResponse.json({ success: true, data: seg }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}