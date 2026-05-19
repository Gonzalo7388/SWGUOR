import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { estado, verificado_por } = body;

    if (!estado) {
      return NextResponse.json({ error: 'Estado es requerido' }, { status: 400 });
    }

    const pago = await prisma.pagos.update({
      where: { id_uuid: id },
      data: {
        estado,
        verificado_at: estado === 'verificado' ? new Date() : undefined,
        verificado_por: verificado_por ? BigInt(verificado_por) : undefined,
      },
    });

    const serialized = JSON.parse(
      JSON.stringify(pago, (_, value) =>
        typeof value === 'bigint' ? Number(value) : value
      )
    );

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Error updating pago:', error);
    return NextResponse.json({ error: 'Error al actualizar el pago' }, { status: 500 });
  }
}
