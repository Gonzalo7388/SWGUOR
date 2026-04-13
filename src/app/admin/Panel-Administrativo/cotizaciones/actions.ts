'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { serializePrismaPayload } from '@/lib/serializers';
import { createCotizacionSchema, type CreateCotizacionInput } from '@/lib/schemas/cotizaciones';
import { Prisma, EstadoProducto, EstadoCliente } from '@prisma/client';

export interface CotizacionRow {
  id: number;
  cotizacion_id: string;
  cliente: string | null;
  descripcion: string | null;
  monto: number;
  estado: string;
  fecha_vencimiento: string;
  fecha_creacion: string;
  expirada?: boolean;
}

export async function getCotizaciones(estado?: string): Promise<CotizacionRow[]> {
  const where: Record<string, unknown> = {};
  if (estado && estado !== 'todos') {
    where.estado = estado;
  }

  const rows = await prisma.cotizaciones.findMany({
    where,
    include: { clientes: true },
    orderBy: { created_at: 'desc' },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return serializePrismaPayload(
    rows.map((row) => {
      const validaHasta = new Date(row.valida_hasta);
      validaHasta.setHours(0, 0, 0, 0);
      const estaExpirada = row.estado === 'pendiente' && today > validaHasta;

      return {
        id: Number(row.id),
        cotizacion_id: row.numero,
        cliente: row.clientes?.razon_social ?? null,
        descripcion: row.notas_internas ?? null,
        monto: Number(row.total ?? 0),
        estado: estaExpirada ? 'expirada' : (row.estado ?? 'borrador'),
        fecha_vencimiento: row.valida_hasta.toISOString().split('T')[0],
        fecha_creacion: row.created_at?.toISOString().split('T')[0] ?? '',
        expirada: estaExpirada,
      };
    })
  );
}

export async function createCotizacion(
  rawInput: CreateCotizacionInput
): Promise<{ success: boolean; data?: CotizacionRow; error?: string }> {
  try {
    const parsed = createCotizacionSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
    }

    const {
      cliente_id,
      nombre_cliente_manual,
      valida_hasta,
      moneda,
      empresa,
      contacto,
      tipo_destino,
      vendedor,
      tipo_venta,
      unidad_negocio,
      forma_pago,
      metodo,
      direccion_entrega,
      direccion_factura,
      condicion_entrega,
      tiempo_entrega,
      tasa_impuesto,
      tipo_operacion,
      idioma,
      referencia,
      probabilidad,
      fecha_cierre,
      notas_internas,
      items,
    } = parsed.data;

    // Validar que los items tengan cantidad y precio antes de operar
    const itemsValidos = items.map((item) => ({
      producto_id:         item.producto_id,
      cantidad:            Number(item.cantidad ?? 0),
      precio_unitario:     Number(item.precio_unitario ?? 0),
      color_snapshot:      item.color_snapshot      ?? '',
      talla_snapshot:      item.talla_snapshot      ?? '',
      modelo_snapshot:     item.modelo_snapshot     ?? null,
      prenda_tipo_snapshot: item.prenda_tipo_snapshot ?? null,
    }));

    const subtotal = itemsValidos.reduce(
      (sum, item) => sum + item.cantidad * item.precio_unitario,
      0
    );
    const esExportacion = tipo_operacion === 'Exportación';
    const tasa = esExportacion ? 0 : (tasa_impuesto === 'IGV' ? 0.18 : 0);
    const igv = subtotal * tasa;
    const total = subtotal + igv;

    const count = await prisma.cotizaciones.count();
    const numero = `COT-${String(count + 1).padStart(6, '0')}`;

    const clienteIdProcesado = (() => {
      if (!cliente_id || cliente_id === 'none' || cliente_id.trim() === '') return null;
      return BigInt(cliente_id);
    })();

    const notasConClienteManual =
      nombre_cliente_manual && !clienteIdProcesado
        ? `CLIENTE MANUAL: ${nombre_cliente_manual}\n\n${notas_internas ?? ''}`.trim()
        : notas_internas;

    const notasCompletas = notasConClienteManual?.includes('[ERP_META]')
      ? notasConClienteManual
      : (() => {
          const erpMetadata = JSON.stringify({
            empresa: empresa || 'Modas y Estilos Guor S.a.C.',
            contacto, tipo_destino, vendedor, tipo_venta, unidad_negocio,
            forma_pago, metodo, direccion_entrega, direccion_factura,
            condicion_entrega, tiempo_entrega, tasa_impuesto, tipo_operacion,
            idioma, referencia, probabilidad, fecha_cierre,
          });
          return notasConClienteManual
            ? `${notasConClienteManual}\n\n[ERP_META]: ${erpMetadata}`
            : `[ERP_META]: ${erpMetadata}`;
        })();

    //  Separar transaction del include — $transaction no propaga includes
    const cotizacionCreada = await prisma.$transaction(async (tx) => {
      return tx.cotizaciones.create({
        data: {
          numero,
          cliente_id: clienteIdProcesado,
          estado: 'borrador',
          subtotal:  new Prisma.Decimal(subtotal),
          igv:       new Prisma.Decimal(igv),
          total:     new Prisma.Decimal(total),
          valida_hasta: new Date(valida_hasta),
          expira_at:    new Date(valida_hasta),
          notas_internas: notasCompletas,
          moneda: moneda ?? 'PEN',
          cotizacion_items: {
            create: itemsValidos.map((item) => ({
              producto_id:              BigInt(item.producto_id),
              cantidad:                 item.cantidad,
              precio_unitario_snapshot: new Prisma.Decimal(item.precio_unitario),
              subtotal:                 new Prisma.Decimal(item.cantidad * item.precio_unitario),
              color_snapshot:           item.color_snapshot,
              talla_snapshot:           item.talla_snapshot,
              modelo_snapshot:          item.modelo_snapshot,
              prenda_tipo_snapshot:     item.prenda_tipo_snapshot,
            })),
          },
        },
      });
    });

    // Include FUERA de la transacción — consulta separada con clientes
    const result = await prisma.cotizaciones.findUnique({
      where: { id: cotizacionCreada.id },
      include: { clientes: true },
    });

    revalidatePath('/admin/Panel-Administrativo/cotizaciones');

    const row: CotizacionRow = {
      id:               Number(cotizacionCreada.id),
      cotizacion_id:    cotizacionCreada.numero,
      cliente:          result?.clientes?.razon_social ?? null,
      descripcion:      cotizacionCreada.notas_internas ?? null,
      monto:            Number(cotizacionCreada.total ?? 0),
      estado:           cotizacionCreada.estado ?? 'borrador',
      fecha_vencimiento: cotizacionCreada.valida_hasta.toISOString().split('T')[0],
      fecha_creacion:   cotizacionCreada.created_at?.toISOString().split('T')[0] ?? '',
    };

    return { success: true, data: serializePrismaPayload(row) };
  } catch (err: any) {
    console.error('Error creating cotizacion:', err);
    return { success: false, error: err.message ?? 'Error interno del servidor' };
  }
}

export async function getProductosList(): Promise<{ id: number; nombre: string; sku: string; precio: number }[]> {
  const productos = await prisma.productos.findMany({
    where: { estado: EstadoProducto.activo },
    select: { id: true, nombre: true, sku: true, precio: true },
    orderBy: { nombre: 'asc' },
  });

  return serializePrismaPayload(
    productos.map((p) => ({
      id:     Number(p.id),
      nombre: p.nombre,
      sku:    p.sku,
      precio: Number(p.precio),
    }))
  );
}

export async function getClientesList(): Promise<{ id: number; razon_social: string | null; ruc: string }[]> {
  const clientes = await prisma.clientes.findMany({
    where: {
      activo:         EstadoCliente.activo,
    },
    select: { id: true, razon_social: true, ruc: true },
    orderBy: { razon_social: 'asc' },
  });

  return serializePrismaPayload(
    clientes.map((c) => ({
      id:           Number(c.id),
      razon_social: c.razon_social,
      ruc:          c.ruc,
    }))
  );
}

export async function aprobarCotizacion(
  cotizacionId: string | bigint
): Promise<{ success: boolean; pedidoId?: number; error?: string }> {
  try {
    const id = typeof cotizacionId === 'string' ? BigInt(cotizacionId) : cotizacionId;

    const cotizacion = await prisma.cotizaciones.findUnique({
      where: { id },
      include: { cotizacion_items: true },
    });

    if (!cotizacion) return { success: false, error: 'Cotización no encontrada' };

    if (!['pendiente', 'borrador'].includes(cotizacion.estado ?? '')) {
      return {
        success: false,
        error: `No se puede aprobar una cotización con estado '${cotizacion.estado}'`,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const validaHasta = new Date(cotizacion.valida_hasta);
    validaHasta.setHours(0, 0, 0, 0);

    if (today > validaHasta) {
      return { success: false, error: 'La cotización está expirada. No se puede aprobar.' };
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.cotizaciones.update({
        where: { id },
        data: { estado: 'aceptada', aprobado_at: new Date() },
      });

      let pedidoId: number | undefined;

      if (cotizacion.aprobacion_automatica === true) {
        const totalUnidades = cotizacion.cotizacion_items.reduce(
          (sum, item) => sum + item.cantidad,
          0
        );

        const pedido = await tx.pedidos.create({
          data: {
            cliente_id:      cotizacion.cliente_id,
            estado:          'pendiente',
            prioridad:       'normal',
            notas_pedido:    cotizacion.notas_internas ?? null,
            total_estimado:  cotizacion.total ?? new Prisma.Decimal(0),
            total_unidades:  totalUnidades,
            pedido_items: {
              create: cotizacion.cotizacion_items.map((item) => ({
                producto_id:     item.producto_id,
                variante_id:     item.variante_id,
                cantidad:        item.cantidad,
                especificaciones: {
                  precio_unitario: Number(item.precio_unitario_snapshot),
                  subtotal:        Number(item.subtotal),
                },
              })),
            },
          },
        });

        pedidoId = Number(pedido.id);

        await tx.cotizaciones.update({
          where: { id },
          data: { pedido_id: pedido.id },
        });
      }

      return { pedidoId };
    });

    revalidatePath('/admin/Panel-Administrativo/cotizaciones');
    revalidatePath('/admin/Panel-Administrativo/pedidos');

    return { success: true, pedidoId: result.pedidoId };
  } catch (err: any) {
    console.error('Error aprobando cotización:', err);
    return { success: false, error: err.message ?? 'Error interno del servidor' };
  }
}

export async function rechazarCotizacion(
  cotizacionId: string | bigint,
  motivo?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const id = typeof cotizacionId === 'string' ? BigInt(cotizacionId) : cotizacionId;

    const cotizacion = await prisma.cotizaciones.findUnique({ where: { id } });
    if (!cotizacion) return { success: false, error: 'Cotización no encontrada' };

    if (!['pendiente', 'borrador'].includes(cotizacion.estado ?? '')) {
      return {
        success: false,
        error: `No se puede rechazar una cotización con estado '${cotizacion.estado}'`,
      };
    }

    await prisma.cotizaciones.update({
      where: { id },
      data: {
        estado: 'rechazada',
        notas_internas: motivo
          ? `${cotizacion.notas_internas ?? ''}\n[RECHAZO]: ${motivo}`.trim()
          : cotizacion.notas_internas,
      },
    });

    revalidatePath('/admin/Panel-Administrativo/cotizaciones');
    return { success: true };
  } catch (err: any) {
    console.error('Error rechazando cotización:', err);
    return { success: false, error: err.message ?? 'Error interno del servidor' };
  }
}

export async function actualizarEstadoCotizacion(
  cotizacionId: string | bigint,
  nuevoEstado: 'pendiente' | 'aceptada' | 'rechazada' | 'expirada' | 'borrador',
  motivo?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const id = typeof cotizacionId === 'string' ? BigInt(cotizacionId) : cotizacionId;

    const cotizacion = await prisma.cotizaciones.findUnique({ where: { id } });
    if (!cotizacion) return { success: false, error: 'Cotización no encontrada' };

    const transicionesValidas: Record<string, string[]> = {
      borrador:  ['pendiente'],
      pendiente: ['aceptada', 'rechazada', 'expirada'],
      aceptada:  [],
      rechazada: ['pendiente'],
      expirada:  ['pendiente'],
    };

    const estadoActual = cotizacion.estado ?? 'borrador';
    const transicionesPermitidas = transicionesValidas[estadoActual] ?? [];

    if (!transicionesPermitidas.includes(nuevoEstado)) {
      return {
        success: false,
        error: `No se puede cambiar de '${estadoActual}' a '${nuevoEstado}'. Permitidos: ${transicionesPermitidas.join(', ')}`,
      };
    }

    const updateData: Prisma.cotizacionesUpdateInput = { estado: nuevoEstado };
    if (nuevoEstado === 'aceptada') updateData.aprobado_at = new Date();
    if (motivo) {
      const prefijo = nuevoEstado === 'rechazada' ? '[RECHAZO]' : '[NOTA]';
      updateData.notas_internas =
        `${cotizacion.notas_internas ?? ''}\n${prefijo}: ${motivo}`.trim();
    }

    await prisma.cotizaciones.update({ where: { id }, data: updateData });

    revalidatePath('/admin/Panel-Administrativo/cotizaciones');
    return { success: true };
  } catch (err: any) {
    console.error('Error actualizando estado de cotización:', err);
    return { success: false, error: err.message ?? 'Error interno del servidor' };
  }
}

export async function expirarCotizacionesVencidas(): Promise<{
  success: boolean;
  count: number;
  error?: string;
}> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cotizacionesVencidas = await prisma.cotizaciones.findMany({
      where: { estado: 'pendiente', valida_hasta: { lt: today } },
      select: { id: true },
    });

    return { success: true, count: cotizacionesVencidas.length };
  } catch (err: any) {
    console.error('Error verificando cotizaciones vencidas:', err);
    return { success: false, count: 0, error: err.message ?? 'Error interno del servidor' };
  }
}