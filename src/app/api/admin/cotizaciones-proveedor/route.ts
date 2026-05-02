export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma }          from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';

// GET — listar cotizaciones de proveedor
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const estado = searchParams.get('estado') ?? undefined;

    const cotizaciones = await prisma.cotizaciones_proveedor.findMany({
      where: estado ? { estado } : undefined,
      include: {
        proveedores: { select: { id: true, razon_social: true, email: true } },
        cotizaciones_proveedor_items: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ success: true, data: serializeBigInt(cotizaciones) });
  } catch (error: any) {
    console.error('[GET cotizaciones-proveedor]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — crear cotización de proveedor desde el formulario (con o sin PDF)
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      proveedor_nombre,
      proveedor_ruc,
      proveedor_email,
      proveedor_telefono,
      fecha_cotizacion,
      fecha_vencimiento,
      numero_cotizacion,
      moneda,
      notas,
      pdf_url,
      items = [],
    } = body;

    if (!proveedor_nombre?.trim()) {
      return NextResponse.json(
        { error: 'El nombre del proveedor es requerido' },
        { status: 400 }
      );
    }
    if (!items.length) {
      return NextResponse.json(
        { error: 'La cotización debe tener al menos un ítem' },
        { status: 400 }
      );
    }

    // ── Buscar o crear proveedor ───────────────────────────────
    let proveedor = await prisma.proveedores.findFirst({
      where: proveedor_ruc
        ? { ruc: proveedor_ruc }
        : { razon_social: { equals: proveedor_nombre, mode: 'insensitive' } },
    });

    if (!proveedor) {
      proveedor = await prisma.proveedores.create({
        data: {
          razon_social:        proveedor_nombre,
          ruc:                 proveedor_ruc || 'SIN-RUC',  
          contacto:            proveedor_email || '',  
          telefono:            proveedor_telefono || '',    
          email:               proveedor_email || '', 
          direccion:           '',                 
          categoria_suministro: '',               
          estado:              'activo',
        },
      });
    }

    // ── Calcular total ─────────────────────────────────────────
    const total_estimado = items.reduce(
      (acc: number, item: any) => acc + Number(item.subtotal ?? 0),
      0
    );

    // ── Crear cotización con items en transacción ──────────────
    const cotizacion = await prisma.$transaction(async (tx) => {
      const cot = await tx.cotizaciones_proveedor.create({
        data: {
          proveedor_id:      proveedor!.id,
          estado:            'borrador',
          fecha_solicitud:   fecha_cotizacion ? new Date(fecha_cotizacion) : new Date(),
          fecha_vencimiento: fecha_vencimiento ? new Date(fecha_vencimiento) : null,
          numero_externo:    numero_cotizacion || null,
          moneda:            moneda            || 'PEN',
          notas:             notas             || null,
          pdf_url:           pdf_url           || null,
          total_estimado,
        },
      });

      // Items
      if (items.length > 0) {
        await tx.cotizaciones_proveedor_items.createMany({
          data: items.map((item: any) => ({
            cotizacion_id:   cot.id,
            descripcion:     item.descripcion     || null,
            material_id:     item.material_id     ? BigInt(item.material_id) : null,
            insumo_id:       item.insumo_id       ? BigInt(item.insumo_id)   : null,
            cantidad:        Number(item.cantidad        ?? 1),
            unidad:          item.unidad          || 'unidades',
            precio_unitario: Number(item.precio_unitario ?? 0),
            subtotal:        Number(item.subtotal        ?? 0),
            tipo_item:       item.tipo            || 'insumo',
          })),
        });
      }

      return cot;
    });

    return NextResponse.json(
      { success: true, data: serializeBigInt(cotizacion) },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[POST cotizaciones-proveedor]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}