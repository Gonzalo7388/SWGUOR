export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';

type Tx = Prisma.TransactionClient;

// GET: Obtener todas las ventas con sus relaciones (Venta → Pedido → Cliente)
export async function GET() {
  try {
    const ventas = await prisma.ventas.findMany({
      include: {
        pedidos: {
          include: {
            clientes: true,
          },
        },
        usuarios: true,
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

    if (!body.pedido_id || body.total == null) {
      return NextResponse.json(
        { error: 'pedido_id y total son requeridos' },
        { status: 400 }
      );
    }

    // Validar tipo de comprobante
    const tipoComprobante = validarTipoComprobante(body.tipo_comprobante);
    if (typeof tipoComprobante === 'object' && 'error' in tipoComprobante) {
      return NextResponse.json(tipoComprobante, { status: 400 });
    }

    const pedidoId = BigInt(body.pedido_id);
    const subtotal = body.subtotal ?? body.total;
    const impuestos = body.impuestos ?? 0;
    const total = body.total;

    // Determinar cuenta contable según método de pago
    const cuentaCobro = determinarCuentaCobro(body.metodo_pago);

    // ── Transacción atómica: venta + pedido + asientos contables ──
    const result = await prisma.$transaction(async (tx: Tx) => {
      // 1. Crear la venta
      const venta = await tx.ventas.create({
        data: {
          pedido_id: pedidoId,
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
          pedidos: {
            include: {
              clientes: true,
            },
          },
        },
      });

      // 2. Actualizar el pedido: marcar como entregado
      await tx.pedidos.update({
        where: { id: pedidoId },
        data: {
          estado: 'entregado',
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
          orden_id: pedidoId,
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
          orden_id: pedidoId,
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
            orden_id: pedidoId,
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
      return NextResponse.json({ error: 'El pedido especificado no existe' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Actualizar información de la venta (solo campos permitidos)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de venta requerido' }, { status: 400 });
    }

    // Campos permitidos para actualizar (no se permite cambiar pedido_id ni totales)
    const camposPermitidos: (keyof Prisma.ventasUpdateInput)[] = [
      'metodo_pago',
      'tipo_comprobante',
      'numero_comprobante',
      'referencia_pago',
      'estado_pago',
    ];

    const updatesFiltrados = Object.fromEntries(
      Object.entries(updates).filter(([key]) =>
        camposPermitidos.includes(key as keyof Prisma.ventasUpdateInput)
      )
    );

    if (Object.keys(updatesFiltrados).length === 0) {
      return NextResponse.json(
        { error: 'No se proporcionaron campos válidos para actualizar' },
        { status: 400 }
      );
    }

    if (updatesFiltrados.numero_comprobante) {
      updatesFiltrados.numero_comprobante = (updatesFiltrados.numero_comprobante as string).trim();
    }

    const venta = await prisma.ventas.update({
      where: { id: String(id) },
      data: updatesFiltrados,
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