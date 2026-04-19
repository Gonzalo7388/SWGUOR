export const runtime = 'nodejs';
import { PedidosService } from '@/lib/services/pedidos-services';
import { NextResponse } from 'next/server';

export async function GET_PEDIDO_ID(id: string) {
  const pedido = await PedidosService.obtenerPorId(id);
  if (!pedido) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
  return NextResponse.json({ success: true, data: pedido });
}
 
export async function PUT_PEDIDO_ID(id: string, body: any) {
  return NextResponse.json({
    success: true,
    data: await PedidosService.actualizar(id, body),
  });
}