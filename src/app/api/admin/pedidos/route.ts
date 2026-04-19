export const runtime = 'nodejs';
import { NextResponse }    from 'next/server';
import { PedidosService }  from '@/lib/services/pedidos-services';
 
export async function GET_PEDIDOS(req: Request) {
  try {
    return NextResponse.json(await PedidosService.listar());
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT_PEDIDOS(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    return NextResponse.json(await PedidosService.actualizar(id, data));
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}