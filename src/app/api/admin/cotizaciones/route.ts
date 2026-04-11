import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';

type Tx = Prisma.TransactionClient;

// GET: Obtener cotizaciones con filtros
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const estado = searchParams.get('estado');
    const clienteId = searchParams.get('cliente_id');

    const where: Record<string, unknown> = {};
    if (estado && estado !== 'todos') where.estado = estado;
    if (clienteId) where.cliente_id = BigInt(clienteId);

    const cotizaciones = await prisma.cotizaciones.findMany({
      where,
      include: {
        clientes: { select: { id: true, razon_social: true, email: true } },
        pedidos: { select: { id: true, estado: true } },
        cotizacion_items: {
          include: {
            productos: { select: { id: true, nombre: true, sku: true } },
            variantes_producto: { select: { id: true, nombre: true, color: true, talla: true } },
          },
        },
        reglas_descuento: { select: { id: true, nombre: true, descuento_pct: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    // Enriquecer con KPIs
    const data = cotizaciones.map((c) => ({
      ...serializeBigInt(c),
      vencimiento: c.expira_at ?? c.valida_hasta,
      esta_expirada: c.expira_at ? new Date(c.expira_at) < new Date() : false,
      items_count: c.cotizacion_items.length,
    }));

    const kpis = {
      pendientes: data.filter((c) => c.estado === 'borrador' || c.estado === 'enviada').length,
      aceptadas: data.filter((c) => c.estado === 'aprobada' || c.estado === 'convertida').length,
      rechazadas: data.filter((c) => c.estado === 'rechazada').length,
      expiradas: data.filter((c) => c.esta_expirada).length,
      valorTotal: data.reduce((sum, c) => sum + Number(c.total ?? 0), 0),
    };

    return NextResponse.json(serializeBigInt({ data, kpis, count: data.length }));
  } catch (error: any) {
    console.error('Error fetching cotizaciones:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Crear cotización con items
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.cliente_id || !body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'cliente_id e items (array) son obligatorios' },
        { status: 400 }
      );
    }

    const subtotal = body.items.reduce(
      (sum: number, item: any) => sum + Number(item.subtotal ?? item.cantidad * item.precio_unitario),
      0
    );
    const montoDescuento = body.monto_descuento ?? 0;
    const igv = (subtotal - montoDescuento) * 0.18;
    const total = subtotal - montoDescuento + igv + (body.costo_envio ?? 0);

    // Generar número de cotización
    const count = await prisma.cotizaciones.count();
    const numero = `COT-${String(count + 1).padStart(6, '0')}`;

    const cotizacion = await prisma.cotizaciones.create({
      data: {
        numero,
        cliente_id: BigInt(body.cliente_id),
        pedido_id: body.pedido_id ? BigInt(body.pedido_id) : null,
        estado: body.estado ?? 'borrador',
        subtotal,
        igv,
        total,
        valida_hasta: body.valida_hasta
          ? new Date(body.valida_hasta)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días por defecto
        expira_at: body.expira_at ? new Date(body.expira_at) : null,
        metodo_pago: body.metodo_pago ?? null,
        direccion_despacho: body.direccion_despacho ?? null,
        id_regla_descuento: body.id_regla_descuento ? BigInt(body.id_regla_descuento) : null,
        monto_descuento: montoDescuento,
        costo_envio: body.costo_envio ?? 0,
        moneda: body.moneda ?? 'PEN',
        costo_total_estimado: body.costo_total_estimado ?? total,
        notas_internas: body.notas_internas ?? null,
        aprobacion_automatica: body.aprobacion_automatica ?? false,
        cotizacion_items: {
          create: body.items.map((item: any) => ({
            producto_id: item.producto_id ? BigInt(item.producto_id) : null,
            variante_id: item.variante_id ? BigInt(item.variante_id) : null,
            cantidad: item.cantidad ?? 1,
            precio_unitario_snapshot: item.precio_unitario ?? 0,
            subtotal: item.subtotal ?? item.cantidad * item.precio_unitario,
          })),
        },
      },
      include: {
        cotizacion_items: {
          include: {
            productos: { select: { id: true, nombre: true } },
            variantes_producto: { select: { id: true, nombre: true, color: true, talla: true } },
          },
        },
        clientes: { select: { id: true, razon_social: true } },
      },
    });

    return NextResponse.json(serializeBigInt(cotizacion), { status: 201 });
  } catch (error: any) {
    console.error('Error creating cotizacion:', error);
    if (error.code === 'P2003') {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Actualizar cotización (estado, aprobación, etc.)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    // Si se aprueba, registrar timestamp
    if (updates.estado === 'aprobada' || updates.estado === 'convertida') {
      updates.aprobado_at = new Date();
    }

    const data: Record<string, unknown> = {};
    if (updates.estado !== undefined) data.estado = updates.estado;
    if (updates.aprobado_at !== undefined) data.aprobado_at = updates.aprobado_at;
    if (updates.notas_internas !== undefined) data.notas_internas = updates.notas_internas;
    if (updates.direccion_despacho !== undefined) data.direccion_despacho = updates.direccion_despacho;
    if (updates.metodo_pago !== undefined) data.metodo_pago = updates.metodo_pago;
    if (updates.expira_at !== undefined) data.expira_at = updates.expira_at;
    if (updates.aprobacion_automatica !== undefined) data.aprobacion_automatica = updates.aprobacion_automatica;

    const cotizacion = await prisma.cotizaciones.update({
      where: { id: BigInt(id) },
      data,
      include: {
        clientes: { select: { id: true, razon_social: true } },
      },
    });

    return NextResponse.json(serializeBigInt(cotizacion));
  } catch (error: any) {
    console.error('Error updating cotizacion:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /convertir: Convertir cotización a pedido + orden
// Se invoca con PATCH + ?accion=convertir para evitar conflicto con POST
export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const accion = searchParams.get('accion');

    // Si no es convertir, tratar como update parcial
    if (accion !== 'convertir') {
      const body = await req.json();
      const { id, ...updates } = body;

      if (!id) {
        return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
      }

      if (updates.estado === 'aprobada' || updates.estado === 'convertida') {
        updates.aprobado_at = new Date();
      }

      const data: Record<string, unknown> = {};
      if (updates.estado !== undefined) data.estado = updates.estado;
      if (updates.aprobado_at !== undefined) data.aprobado_at = updates.aprobado_at;
      if (updates.notas_internas !== undefined) data.notas_internas = updates.notas_internas;
      if (updates.direccion_despacho !== undefined) data.direccion_despacho = updates.direccion_despacho;
      if (updates.expira_at !== undefined) data.expira_at = updates.expira_at;

      const cotizacion = await prisma.cotizaciones.update({
        where: { id: BigInt(id) },
        data,
        include: {
          clientes: { select: { id: true, razon_social: true } },
        },
      });

      return NextResponse.json(serializeBigInt(cotizacion));
    }

    // ── Lógica de conversión a pedido ──
    const body = await req.json();
    const cotizacionId = body.cotizacion_id;

    if (!cotizacionId) {
      return NextResponse.json({ error: 'cotizacion_id es obligatorio' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx: Tx) => {
      // 1. Obtener cotización con items
      const cotizacion = await tx.cotizaciones.findUnique({
        where: { id: BigInt(cotizacionId) },
        include: {
          cotizacion_items: true,
          clientes: true,
        },
      });

      if (!cotizacion) {
        throw new Error('Cotización no encontrada');
      }

      if (cotizacion.estado === 'rechazada' || cotizacion.estado === 'expirada') {
        throw new Error(`No se puede convertir una cotización ${cotizacion.estado}`);
      }

      // 2. Crear pedido de producción
      const totalUnidades = cotizacion.cotizacion_items.reduce(
        (sum, item) => sum + item.cantidad,
        0
      );

      const pedido = await tx.pedidos.create({
        data: {
          cliente_id: cotizacion.cliente_id,
          estado: 'pendiente',
          prioridad: 'normal',
          notas_cliente: `Derivado de cotización ${cotizacion.numero}`,
          total_estimado: cotizacion.costo_total_estimado ?? 0,
          total_unidades: totalUnidades,
          moq_aplicado: 400,
        },
      });

      // 3. Crear items del pedido desde cotizacion_items
      for (const ci of cotizacion.cotizacion_items) {
        await tx.pedido_items.create({
          data: {
            pedido_id: pedido.id,
            ...(ci.producto_id && { producto_id: ci.producto_id }),
            ...(ci.variante_id && { variante_id: ci.variante_id }),
            cantidad: ci.cantidad,
          },
        });
      }

      // 4. Crear orden vinculada a la cotización
      const orden = await tx.ordenes.create({
        data: {
          cotizacion_id: cotizacion.id,
          cliente_id: cotizacion.cliente_id,
          estado: 'solicitado',
          total_orden: Number(cotizacion.total ?? 0),
          total_pagado: 0,
          saldo_pendiente: Number(cotizacion.total ?? 0),
          estado_pago: 'pendiente',
          metodo_pago: cotizacion.metodo_pago,
          costo_envio_real: cotizacion.costo_envio ?? 0,
        },
      });

      // 5. Actualizar cotización: vincular al pedido y marcar convertida
      await tx.cotizaciones.update({
        where: { id: cotizacion.id },
        data: {
          pedido_id: pedido.id,
          estado: 'convertida',
          aprobado_at: new Date(),
        },
      });

      return { pedido, orden, cotizacion };
    });

    return NextResponse.json(serializeBigInt(result), { status: 201 });
  } catch (error: any) {
    console.error('Error convirtiendo cotización:', error);
    if (error.message === 'Cotización no encontrada') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar cotización
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    // Cascade: cotizacion_items se eliminan automáticamente
    await prisma.cotizaciones.delete({
      where: { id: BigInt(id) },
    });

    return NextResponse.json({ message: 'Cotización eliminada correctamente' });
  } catch (error: any) {
    console.error('Error deleting cotizacion:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
