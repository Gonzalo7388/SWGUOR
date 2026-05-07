export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { tarifaTallerBaseSchema as tarifasTallerSchema } from '@/lib/schemas/tarifaTalleresSchema';
import { serializeBigInt } from '@/lib/utils/serialize';
import { ZodError } from 'zod';

export async function GET() {
  try {
    const tarifas = await prisma.tarifas_taller.findMany({
      include: { talleres: true },
      orderBy: { vigente_desde: 'desc' },
    });
    return NextResponse.json(serializeBigInt(tarifas));
  } catch (error: any) {
    console.error('[GET /tarifas-taller]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = tarifasTallerSchema.parse(body);

    const tarifa = await prisma.tarifas_taller.create({
      data: {
        taller_id: BigInt(validated.tallerId),
        especialidad: validated.tipoServicio,
        precio_unitario: validated.precioUnitario,
        moneda: validated.moneda,
        vigente_desde: new Date(validated.vigenciaDesde),
        vigente_hasta: validated.vigenciaHasta ? new Date(validated.vigenciaHasta) : undefined,
        activo: validated.activo,
        notas: validated.observaciones,
      },
      include: { talleres: true },
    });

    return NextResponse.json(serializeBigInt(tarifa), { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 });
    }
    console.error('[POST /tarifas-taller]', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}