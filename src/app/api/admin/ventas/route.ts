export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';

type Tx = Prisma.TransactionClient;

// GET: Obtener todas las ventas con sus relaciones
export async function GET() {
  try {
    const ventas = await prisma.ventas.findMany({
      include: {
        //  CORRECCIÓN: Usamos 'ordenes_compra' que es el nombre en el schema
        ordenes_compra: { 
          include: {
            clientes: true,
          },
        },
      } as any, // Mantenemos 'as any' porque la relación no está explícita en el modelo ventas del schema
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json(serializeBigInt(ventas));
  } catch (error: any) {
    console.error('Error fetching ventas:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Registrar una venta con asiento contable atómico
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.orden_id || body.total == null) {
      return NextResponse.json({ error: 'orden_id y total son requeridos' }, { status: 400 });
    }

    const tipoComprobante = validarTipoComprobante(body.tipo_comprobante);
    if (typeof tipoComprobante === 'object' && 'error' in tipoComprobante) {
      return NextResponse.json(tipoComprobante, { status: 400 });
    }

    const ordenId = BigInt(body.orden_id);
    const subtotal = body.subtotal ?? body.total;
    const impuestos = body.impuestos ?? 0;
    const total = body.total;
    const cuentaCobro = determinarCuentaCobro(body.metodo_pago);

    const result = await prisma.$transaction(async (tx: Tx) => {
      // 1. Crear la venta
      const venta = await tx.ventas.create({
        data: {
          orden_id: ordenId,
          usuario_id: body.usuario_id ? BigInt(body.usuario_id) : null,
          subtotal,
          impuestos,
          total,
          metodo_pago: body.metodo_pago ?? null,
          tipo_comprobante: tipoComprobante,
          numero_comprobante: body.numero_comprobante?.trim() ?? null,
          referencia_pago: body.referencia_pago ?? null,
          estado_pago: body.estado_pago ?? 'completado',
        },
        include: {
          //  CORRECCIÓN ts(2353): 'ordenes' -> 'ordenes_compra'
          ordenes_compra: {
            include: { clientes: true },
          },
        } as any,
      });

      // 2. Actualizar la orden financiera
      //  CORRECCIÓN ts(2339): Usamos el nombre correcto 'ordenes_compra'
      await tx.ordenes_compra.update({
        where: { id: ordenId },
        data: {
          total_pagado: total,
          saldo_pendiente: 0,
          estado_pago: 'pagado',
          ...(body.metodo_pago && { metodo_pago: body.metodo_pago }),
        },
      });

      // 3. Asientos contables (igual que antes...)
      await tx.asientos_contables.create({
        data: {
          fecha: new Date(),
          tipo: 'debe',
          monto: total,
          cuenta: cuentaCobro,
          descripcion: `Cobro venta ${venta.id}`,
          orden_id: ordenId,
          venta_id: venta.id,
        },
      });

      await tx.asientos_contables.create({
        data: {
          fecha: new Date(),
          tipo: 'haber',
          monto: total,
          cuenta: 'ventas',
          descripcion: `Ingreso por venta ${venta.id}`,
          orden_id: ordenId,
          venta_id: venta.id,
        },
      });

      return venta;
    });

    return NextResponse.json(serializeBigInt(result), { status: 201 });
  } catch (error: any) {
    console.error('Error en POST /api/admin/ventas:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Anular registro de venta
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    await prisma.$transaction(async (tx: Tx) => {
      await tx.asientos_contables.deleteMany({ where: { venta_id: id } });

      const venta = await tx.ventas.findUnique({
        where: { id },
        select: { orden_id: true, total: true },
      });

      if (venta) {
        //  CORRECCIÓN ts(2339): 'ordenes' -> 'ordenes_compra'
        await tx.ordenes_compra.update({
          where: { id: venta.orden_id },
          data: {
            total_pagado: 0,
            saldo_pendiente: venta.total,
            estado_pago: 'pendiente',
          },
        });
      }

      await tx.ventas.delete({ where: { id } });
    });

    return NextResponse.json({ message: 'Venta anulada correctamente' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- Utilitarios ---
const TIPOS_COMPROBANTE = ['boleta', 'factura', 'nota_venta'] as const;
function validarTipoComprobante(input: any) {
  const tipo = input ? input.toLowerCase().trim() : 'nota_venta';
  return TIPOS_COMPROBANTE.includes(tipo) ? tipo : { error: 'Tipo inválido' };
}
function determinarCuentaCobro(metodo: any) {
  const bancos = ['transferencia_bcp', 'visa', 'mastercard'];
  return bancos.includes(metodo) ? 'bancos' : 'caja';
}