export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';

type Tx = Prisma.TransactionClient;

// GET: Obtener todas las ventas con sus relaciones (Orden → Cliente)
export async function GET() {
  try {
    const ventas = await prisma.ventas.findMany({
      include: {
        ordenes: {
          include: {
            cliente: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
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
      return NextResponse.json(
        { error: 'orden_id y total son requeridos' },
        { status: 400 }
      );
    }

    // Validar tipo de comprobante
    const tipoComprobante = validarTipoComprobante(body.tipo_comprobante);
    if (typeof tipoComprobante === 'object' && 'error' in tipoComprobante) {
      return NextResponse.json(tipoComprobante, { status: 400 });
    }

    const ordenId = BigInt(body.orden_id);
    const subtotal = body.subtotal ?? body.total;
    const impuestos = body.impuestos ?? 0;
    const total = body.total;

    // Determinar cuenta contable según método de pago
    const cuentaCobro = determinarCuentaCobro(body.metodo_pago);

    // ── Transacción atómica: venta + orden + asiento contable ──
    const result = await prisma.$transaction(async (tx: Tx) => {
      // 1. Crear la venta
      const venta = await tx.ventas.create({
        data: {
          orden_id: ordenId,
          vendedor_id: body.vendedor_id ?? null,
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
          ordenes: {
            include: {
              cliente: true,
            },
          },
        },
      });

      // 2. Actualizar la orden: marcar pagada y ajustar saldos
      await tx.ordenes.update({
        where: { id: ordenId },
        data: {
          total_orden: total,
          total_pagado: total,
          saldo_pendiente: 0,
          estado_pago: 'pagado',
          ...(body.metodo_pago && { metodo_pago: body.metodo_pago }),
        },
      });

      // 3. Asiento contable — DEBE (Caja/Bancos)
      await tx.asientos_contables.create({
        data: {
          fecha: new Date(),
          tipo: 'debe',
          monto: total,
          cuenta: cuentaCobro,
          descripcion: `Cobro venta ${venta.id} — ${venta.numero_comprobante ?? 'S/N'}`,
          orden_id: ordenId,
          venta_id: venta.id,
          usuario_id: venta.usuario_id,
        },
      });

      // 4. Asiento contable — HABER (Ventas / Ingresos)
      await tx.asientos_contables.create({
        data: {
          fecha: new Date(),
          tipo: 'haber',
          monto: total,
          cuenta: 'ventas',
          descripcion: `Ingreso por venta ${venta.id} — ${venta.numero_comprobante ?? 'S/N'}`,
          orden_id: ordenId,
          venta_id: venta.id,
          usuario_id: venta.usuario_id,
        },
      });

      // 5. Asiento contable — HABER (IGV) si hay impuestos
      if (impuestos > 0) {
        await tx.asientos_contables.create({
          data: {
            fecha: new Date(),
            tipo: 'haber',
            monto: impuestos,
            cuenta: 'igv',
            descripcion: `IGV venta ${venta.id}`,
            orden_id: ordenId,
            venta_id: venta.id,
            usuario_id: venta.usuario_id,
          },
        });
      }

      return venta;
    });

    return NextResponse.json(serializeBigInt(result), { status: 201 });
  } catch (error: any) {
    console.error('Error en POST /api/admin/ventas:', error);
    if (error.code === 'P2003') {
      return NextResponse.json({ error: 'La orden especificada no existe' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Actualizar información de la venta
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de venta requerido' }, { status: 400 });
    }

    // Limpiar campos
    if (updates.numero_comprobante) {
      updates.numero_comprobante = updates.numero_comprobante.trim();
    }

    const venta = await prisma.ventas.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json(serializeBigInt(venta));
  } catch (error: any) {
    console.error('Error en PATCH /api/admin/ventas:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Anular registro de venta (uso administrativo)
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    // Transacción: eliminar venta + revertir estado de orden + eliminar asientos
    await prisma.$transaction(async (tx: Tx) => {
      // Eliminar asientos contables asociados
      await tx.asientos_contables.deleteMany({
        where: { venta_id: id },
      });

      // Revertir el estado de la orden asociada
      const venta = await tx.ventas.findUnique({
        where: { id },
        select: { orden_id: true, total: true },
      });

      if (venta) {
        await tx.ordenes.update({
          where: { id: venta.orden_id },
          data: {
            total_pagado: 0,
            saldo_pendiente: venta.total,
            estado_pago: 'pendiente',
          },
        });
      }

      // Eliminar la venta
      await tx.ventas.delete({
        where: { id },
      });
    });

    return NextResponse.json({ message: 'Registro de venta anulado correctamente' });
  } catch (error: any) {
    console.error('Error en DELETE /api/admin/ventas:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ─── Utilitarios ───────────────────────────────────────────────────────────

const TIPOS_COMPROBANTE = ['boleta', 'factura', 'nota_venta'] as const;

function validarTipoComprobante(
  input: string | undefined | null
): (typeof TIPOS_COMPROBANTE)[number] | { error: string } {
  const tipo = input ? input.toLowerCase().trim() : 'nota_venta';
  if (!TIPOS_COMPROBANTE.includes(tipo as any)) {
    return {
      error: `Tipo de comprobante inválido. Use: ${TIPOS_COMPROBANTE.join(', ')}`,
    };
  }
  return tipo as (typeof TIPOS_COMPROBANTE)[number];
}

/**
 * Mapea el método de pago a la cuenta contable de cobro.
 */
function determinarCuentaCobro(metodoPago: string | null | undefined): 'caja' | 'bancos' {
  if (!metodoPago) return 'caja';

  const metodosBanco = [
    'transferencia_bcp',
    'visa',
    'mastercard',
  ];

  return metodosBanco.includes(metodoPago) ? 'bancos' : 'caja';
}
