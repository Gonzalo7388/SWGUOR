export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pagoTallerBaseSchema as pagosTallerUpdateSchema } from '@/lib/schemas/pagosTalleresSchema';
import { serializeBigInt } from '@/lib/utils/serialize';
import { ZodError } from 'zod';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pago = await prisma.pagos_taller.findUnique({
      where: { id: BigInt(params.id) },
      include: {
        talleres: true,
        confecciones: true,
        ordenes_produccion: true,
        usuarios: true,
      },
    });

    if (!pago) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 });
    }

    return NextResponse.json(serializeBigInt(pago));
  } catch (error: any) {
    console.error('[GET /pagos-taller/:id]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const validated = pagosTallerUpdateSchema.parse(body);

    const pago = await prisma.pagos_taller.update({
      where: { id: BigInt(params.id) },
      data: {
        ...(validated.taller_id ? { taller_id: BigInt(validated.taller_id) } : {}),
        ...(validated.confeccion_id ? { confeccion_id: BigInt(validated.confeccion_id) } : {}),
        ...(validated.orden_produccion_id ? { orden_produccion_id: BigInt(validated.orden_produccion_id) } : {}),
        ...(validated.monto !== undefined ? { monto: validated.monto } : {}),
        ...(validated.moneda ? { moneda: validated.moneda } : {}),
        ...(validated.metodo_pago ? { metodo_pago: validated.metodo_pago } : {}),
        ...(validated.estado ? { estado: validated.estado } : {}),
        ...(validated.fecha_pago ? { fecha_pago: new Date(validated.fecha_pago) } : {}),
        numero_operacion: validated.numero_operacion,
        comprobante_url: validated.comprobante_url,
        notas: validated.notas,
        ...(validated.registrado_por ? { registrado_por: BigInt(validated.registrado_por) } : {}),
      },
      include: {
        talleres: true,
        confecciones: true,
        ordenes_produccion: true,
        usuarios: true,
      },
    });

    return NextResponse.json(serializeBigInt(pago));
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 });
    }
    console.error('[PUT /pagos-taller/:id]', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.pagos_taller.delete({ where: { id: BigInt(params.id) } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[DELETE /pagos-taller/:id]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}