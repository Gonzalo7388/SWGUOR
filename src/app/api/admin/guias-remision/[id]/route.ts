export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { guiaRemisionUpdateSchema } from '@/lib/schemas/guias-remision';
import { serializeBigInt } from '@/lib/utils/serialize';
import { ZodError } from 'zod';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const guia = await prisma.guias_remision.findUnique({
      where: { id: BigInt(params.id) },
      include: { guias_remision_items: true, pedidos: true },
    });
    if (!guia) {
      return NextResponse.json({ error: 'Guía no encontrada' }, { status: 404 });
    }
    return NextResponse.json(serializeBigInt(guia));
  } catch (error: any) {
    console.error('[GET /guias-remision/:id]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const validated = guiaRemisionUpdateSchema.parse(body);

    const guia = await prisma.guias_remision.update({
      where: { id: BigInt(params.id) },
      data: {
        ...(validated.pedido_id ? { pedido_id: BigInt(validated.pedido_id) } : {}),
        ...(validated.tipo ? { tipo: validated.tipo } : {}),
        ...(validated.estado ? { estado: validated.estado } : {}),
        ...(validated.fecha_traslado ? { fecha_traslado: new Date(validated.fecha_traslado) } : {}),
        ...(validated.destino_direccion ? { destino_direccion: validated.destino_direccion } : {}),
        ...(validated.origen_direccion ? { origen_direccion: validated.origen_direccion } : {}),
        observaciones: validated.observaciones,
      },
      include: { guias_remision_items: true, pedidos: true },
    });

    if (validated.items) {
      await prisma.guias_remision_items.deleteMany({ where: { guia_id: guia.id } });
      await prisma.guias_remision_items.createMany({
        data: validated.items.map((item) => ({
          guia_id:     guia.id,              // ← campo correcto según schema
          producto_id: BigInt(item.producto_id),
          cantidad:    item.cantidad,
          unidad:      item.unidad_medida,   // ← campo en schema es "unidad", no "unidad_medida"
          descripcion: item.descripcion,
        })),
      });
    }

    const updatedGuia = await prisma.guias_remision.findUnique({
      where: { id: guia.id },
      include: { guias_remision_items: true, pedidos: true },
    });

    return NextResponse.json(serializeBigInt(updatedGuia));
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 });
    }
    console.error('[PUT /guias-remision/:id]', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.guias_remision_items.deleteMany({ where: { guia_id: BigInt(params.id) } });
    await prisma.guias_remision.delete({ where: { id: BigInt(params.id) } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[DELETE /guias-remision/:id]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}