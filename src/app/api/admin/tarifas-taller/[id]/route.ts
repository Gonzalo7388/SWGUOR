export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { tarifaTallerBaseSchema as tarifasTallerUpdateSchema } from '@/lib/schemas/tarifaTalleresSchema';
import { serializeBigInt } from '@/lib/utils/serialize';
import { ZodError } from 'zod';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tarifa = await prisma.tarifas_taller.findUnique({
      where: { id: BigInt(id) },
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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = tarifasTallerUpdateSchema.parse(body);

    const tarifa = await prisma.tarifas_taller.update({
      where: { id: BigInt(id) },
      data: {
        ...(validated.tallerId ? { taller_id: BigInt(validated.tallerId) } : {}),
        ...(validated.tipoServicio ? { especialidad: validated.tipoServicio } : {}),
        ...(validated.precioUnitario !== undefined ? { precio_unitario: validated.precioUnitario } : {}),
        ...(validated.moneda ? { moneda: validated.moneda } : {}),
        ...(validated.vigenciaDesde ? { vigente_desde: new Date(validated.vigenciaDesde) } : {}),
        ...(validated.vigenciaHasta ? { vigente_hasta: new Date(validated.vigenciaHasta) } : {}),
        ...(validated.activo !== undefined ? { activo: validated.activo } : {}),
        ...(validated.observaciones !== undefined ? { notas: validated.observaciones } : {}),
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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.tarifas_taller.delete({ where: { id: BigInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[DELETE /tarifas-taller/:id]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}