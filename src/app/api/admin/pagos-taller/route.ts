export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pagoTallerBaseSchema as pagosTallerSchema } from '@/lib/schemas/pagos-talleres';
import { serializeBigInt } from '@/lib/utils/serialize';
import { ZodError } from 'zod';

export async function GET() {
  try {
    const pagos = await prisma.pagos_taller.findMany({
      include: {
        talleres: true,
        confecciones: true,
        ordenes_produccion: true,
        usuarios: true,
      },
      orderBy: { created_at: 'desc' },
    });
    return NextResponse.json(serializeBigInt(pagos));
  } catch (error: any) {
    console.error('[GET /pagos-taller]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = pagosTallerSchema.parse(body);

    const pago = await prisma.pagos_taller.create({
      data: {
        taller_id: BigInt(validated.taller_id),
        confeccion_id: validated.confeccion_id ? BigInt(validated.confeccion_id) : undefined,
        orden_produccion_id: validated.orden_produccion_id ? BigInt(validated.orden_produccion_id) : undefined,
        monto: validated.monto,
        moneda: validated.moneda,
        metodo_pago: validated.metodo_pago,
        estado: validated.estado,
        fecha_pago: new Date(validated.fecha_pago),
        numero_operacion: validated.numero_operacion,
        comprobante_url: validated.comprobante_url,
        notas: validated.notas,
        registrado_por: validated.registrado_por ? BigInt(validated.registrado_por) : undefined,
      },
      include: {
        talleres: true,
        confecciones: true,
        ordenes_produccion: true,
        usuarios: true,
      },
    });

    return NextResponse.json(serializeBigInt(pago), { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 });
    }
    console.error('[POST /pagos-taller]', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}