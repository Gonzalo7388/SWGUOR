export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { tarifasTallerUpdateSchema } from '@/lib/schemas/tarifas-taller';
import { serializeBigInt } from '@/lib/utils/serialize';
import { ZodError } from 'zod';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tarifa = await prisma.tarifas_taller.findUnique({
      where: { id: BigInt(params.id) },
      include: { talleres: true },
    });
    if (!tarifa) {
      return NextResponse.json({ error: 'Tarifa no encontrada' }, { status: 404 });
    }
    return NextResponse.json(serializeBigInt(tarifa));
  } catch (error: any) {
    console.error('[GET /tarifas-taller/:id]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const validated = tarifasTallerUpdateSchema.parse(body);

    const tarifa = await prisma.tarifas_taller.update({
      where: { id: BigInt(params.id) },
      data: {
        ...(validated.taller_id ? { taller_id: BigInt(validated.taller_id) } : {}),
        ...(validated.especialidad ? { especialidad: validated.especialidad } : {}),
        ...(validated.precio_unitario !== undefined ? { precio_unitario: validated.precio_unitario } : {}),
        ...(validated.moneda ? { moneda: validated.moneda } : {}),
        ...(validated.vigente_desde ? { vigente_desde: new Date(validated.vigente_desde) } : {}),
        ...(validated.vigente_hasta ? { vigente_hasta: new Date(validated.vigente_hasta) } : {}),
        ...(validated.activo !== undefined ? { activo: validated.activo } : {}),
        notas: validated.notas,
      },
      include: { talleres: true },
    });

    return NextResponse.json(serializeBigInt(tarifa));
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 });
    }
    console.error('[PUT /tarifas-taller/:id]', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.tarifas_taller.delete({ where: { id: BigInt(params.id) } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[DELETE /tarifas-taller/:id]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}