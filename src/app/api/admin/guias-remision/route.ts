export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { guiaRemisionBaseSchema as guiaRemisionSchema } from '@/lib/schemas/guias-remision';
import { serializeBigInt } from '@/lib/utils/serialize';
import { ZodError } from 'zod';

export async function GET() {
  try {
    const guias = await prisma.guias_remision.findMany({
      orderBy: { created_at: 'desc' },
      include: { guias_remision_items: true, pedidos: true },
    });
    return NextResponse.json(serializeBigInt(guias));
  } catch (error: any) {
    console.error('[GET /guias-remision]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = guiaRemisionSchema.parse(body); // ← nombre correcto del schema

    const guia = await prisma.guias_remision.create({
      data: {
        numero: validated.numero,
        tipo: validated.tipo,
        estado: validated.estado,
        origen_tipo: validated.origen_tipo,
        origen_id: validated.origen_id ? BigInt(validated.origen_id) : null,
        origen_direccion: validated.origen_direccion,
        destino_tipo: validated.destino_tipo,
        destino_id: validated.destino_id ? BigInt(validated.destino_id) : null,
        destino_direccion: validated.destino_direccion,
        pedido_id: validated.pedido_id ? BigInt(validated.pedido_id) : null,
        orden_produccion_id: validated.orden_produccion_id
          ? BigInt(validated.orden_produccion_id)
          : null,
        transportista: validated.transportista ?? null,
        ruc_transportista: validated.ruc_transportista ?? null,
        placa_vehiculo: validated.placa_vehiculo ?? null,
        fecha_traslado: new Date(validated.fecha_traslado),
        fecha_entrega: validated.fecha_entrega ? new Date(validated.fecha_entrega) : null,
        motivo_traslado: validated.motivo_traslado ?? null,
        observaciones: validated.observaciones ?? null,
        pdf_url: validated.pdf_url ?? null,
        emitido_por: validated.emitido_por ? BigInt(validated.emitido_por) : null,
        // items se crearán en un endpoint separado cuando sea implementado
        // guias_remision_items: {
        //   create: validated.items?.map(...) || []
        // },
      },
      include: { guias_remision_items: true, pedidos: true },
    });

    return NextResponse.json(serializeBigInt(guia), { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 });
    }
    console.error('[POST /guias-remision]', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}