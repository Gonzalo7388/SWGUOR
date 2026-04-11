'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { serializePrismaPayload } from '@/lib/serializers';
import { createCotizacionSchema, type CreateCotizacionInput } from '@/lib/schemas/cotizaciones';
import { Prisma } from '@prisma/client';

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

  const mapped: CotizacionRow[] = rows.map((row) => {
    const validaHasta = new Date(row.valida_hasta);
    validaHasta.setHours(0, 0, 0, 0);
    
    // Lógica de expiración visual: pendiente + fecha vencida = expirada visualmente
    const estaExpirada = row.estado === 'pendiente' && today > validaHasta;

    return {
      id: Number(row.id),
      cotizacion_id: row.numero,
      cliente: row.clientes?.razon_social ?? null,
      descripcion: row.notas_internas ?? null,
      monto: Number(row.total ?? 0),
      estado: estaExpirada ? 'expirada' : (row.estado ?? 'borrador'),
      fecha_vencimiento: row.valida_hasta.toISOString().split('T')[0],
      fecha_creacion: row.created_at
        ? row.created_at.toISOString().split('T')[0]
        : '',
      expirada: estaExpirada,
    };
  });

  return serializePrismaPayload(mapped);
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

    // Calcular totales monetarios (Decimal precision)
    const subtotal = items.reduce(
      (sum, item) => sum + item.cantidad * item.precio_unitario,
      0
    );
    // IGV condicional: exportación = 0
    const esExportacion = tipo_operacion === 'Exportación';
    const tasa = esExportacion ? 0 : (tasa_impuesto === 'IGV' ? 0.18 : 0);
    const igv = subtotal * tasa;
    const total = subtotal + igv;

    // Generar número secuencial de cotización
    const count = await prisma.cotizaciones.count();
    const numero = `COT-${String(count + 1).padStart(6, '0')}`;

    // Procesar cliente_id: convertir 'none' o vacío a null, o convertir a BigInt válido
    const clienteIdProcesado = (() => {
      if (!cliente_id || cliente_id === 'none' || cliente_id.trim() === '') {
        return null;
      }
      return BigInt(cliente_id);
    })();

    // Si hay cliente manual, agregarlo al inicio de notas_internas
    const notasConClienteManual = nombre_cliente_manual && !clienteIdProcesado
      ? `CLIENTE MANUAL: ${nombre_cliente_manual}\n\n${notas_internas ?? ''}`.trim()
      : notas_internas;

    // Si notas_internas ya viene con [ERP_META], usarlo tal cual (desde form)
    // Si no, construir la metadata aquí (desde server action directo)
    const notasCompletas = notasConClienteManual?.includes('[ERP_META]')
      ? notasConClienteManual
      : (() => {
          const erpMetadata = JSON.stringify({
            empresa: empresa || 'Modas y Estilos Guor S.a.C.',
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
          });
          return notasConClienteManual
            ? `${notasConClienteManual}\n\n[ERP_META]: ${erpMetadata}`
            : `[ERP_META]: ${erpMetadata}`;
        })();

    // Transacción atómica: cotización + ítems
    const result = await prisma.$transaction(async (tx) => {
      const cotizacion = await tx.cotizaciones.create({
        data: {
          numero,
          // Usar cliente_id procesado (null si es 'none' o vacío, BigInt si es válido)
          cliente_id: clienteIdProcesado,
          estado: 'borrador',
          subtotal: new Prisma.Decimal(subtotal),
          igv: new Prisma.Decimal(igv),
          total: new Prisma.Decimal(total),
          valida_hasta: new Date(valida_hasta),
          expira_at: new Date(valida_hasta),
          notas_internas: notasCompletas,
          moneda: moneda ?? 'PEN',
          cotizacion_items: {
            create: items.map((item) => ({
              // Convertimos el string a BigInt para Prisma
              producto_id: BigInt(item.producto_id),
              cantidad: item.cantidad,
              precio_unitario_snapshot: new Prisma.Decimal(item.precio_unitario),
              subtotal: new Prisma.Decimal(item.cantidad * item.precio_unitario),
            })),
          },
        },
        include: {
          clientes: true,
        },
      });

      return cotizacion;
    });

    // ¡Aquí está la magia que recarga la tabla!
    revalidatePath('/admin/Panel-Administrativo/cotizaciones');

    const row: CotizacionRow = {
      id: Number(result.id),
      cotizacion_id: result.numero,
      cliente: result.clientes?.razon_social ?? null,
      descripcion: result.notas_internas ?? null,
      monto: Number(result.total ?? 0),
      estado: result.estado ?? 'borrador',
      fecha_vencimiento: result.valida_hasta.toISOString().split('T')[0],
      fecha_creacion: result.created_at
        ? result.created_at.toISOString().split('T')[0]
        : '',
    };

    return { success: true, data: serializePrismaPayload(row) };
  } catch (err: any) {
    console.error('Error creating cotizacion:', err);
    return { success: false, error: err.message ?? 'Error interno del servidor' };
  }
}

export async function getProductosList(): Promise<{ id: number; nombre: string; sku: string }[]> {
  const productos = await prisma.productos.findMany({
    where: { estado: 'activo' },
    select: { id: true, nombre: true, sku: true },
    orderBy: { nombre: 'asc' },
  });

  return serializePrismaPayload(
    productos.map((p) => ({
      id: Number(p.id),
      nombre: p.nombre,
      sku: p.sku,
    }))
  );
}

export async function getClientesList(): Promise<{ id: number; razon_social: string | null }[]> {
  const clientes = await prisma.clientes.findMany({
    where: { activo: 'activo' },
    select: { id: true, razon_social: true },
    orderBy: { razon_social: 'asc' },
  });

  return serializePrismaPayload(
    clientes.map((c) => ({
      id: Number(c.id),
      razon_social: c.razon_social,
    }))
  );
}

/**
 * Aprobar cotización - Cambia estado a 'aceptada' y registra timestamp
 * Si tiene aprobacion_automatica=true, crea automáticamente un pedido
 */
export async function aprobarCotizacion(
  cotizacionId: string | bigint
): Promise<{ success: boolean; pedidoId?: number; error?: string }> {
  try {
    const id = typeof cotizacionId === 'string' ? BigInt(cotizacionId) : cotizacionId;

    // Obtener cotización completa con ítems
    const cotizacion = await prisma.cotizaciones.findUnique({
      where: { id },
      include: {
        cotizacion_items: true,
        clientes: true,
      },
    });

    if (!cotizacion) {
      return { success: false, error: 'Cotización no encontrada' };
    }

    // Validar que se pueda aprobar
    if (!['pendiente', 'borrador'].includes(cotizacion.estado ?? '')) {
      return { success: false, error: `No se puede aprobar una cotización con estado '${cotizacion.estado}'` };
    }

    // Validar que no esté expirada
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const validaHasta = new Date(cotizacion.valida_hasta);
    validaHasta.setHours(0, 0, 0, 0);

    if (today > validaHasta) {
      return { success: false, error: 'La cotización está expirada. No se puede aprobar.' };
    }

    // Transacción atómica: actualizar cotización + crear pedido si es automático
    const result = await prisma.$transaction(async (tx) => {
      // 1. Actualizar cotización a 'aceptada'
      const cotizacionActualizada = await tx.cotizaciones.update({
        where: { id },
        data: {
          estado: 'aceptada',
          aprobado_at: new Date(),
        },
      });

      let pedidoId: number | undefined;

      // 2. Si tiene aprobación automática, crear pedido/orden
      if (cotizacion.aprobacion_automatica === true) {
        // Generar número de pedido secuencial
        const count = await tx.pedidos.count();
        const numeroPedido = `PED-${String(count + 1).padStart(6, '0')}`;

        // Calcular total de unidades
        const totalUnidades = cotizacion.cotizacion_items.reduce(
          (sum, item) => sum + item.cantidad,
          0
        );

        // Crear el pedido con los datos de la cotización
        const pedido = await tx.pedidos.create({
          data: {
            cliente_id: cotizacion.cliente_id,
            estado: 'pendiente',
            prioridad: 'normal',
            notas_pedido: cotizacion.notas_internas ?? null,
            total_estimado: cotizacion.total ?? new Prisma.Decimal(0),
            total_unidades: totalUnidades,
            // Crear ítems del pedido basados en los ítems de la cotización
            pedido_items: {
              create: cotizacion.cotizacion_items.map((item) => ({
                producto_id: item.producto_id,
                variante_id: item.variante_id,
                cantidad: item.cantidad,
                especificaciones: {
                  precio_unitario: Number(item.precio_unitario_snapshot),
                  subtotal: Number(item.subtotal),
                },
              })),
            },
          },
        });

        pedidoId = Number(pedido.id);

        // Actualizar el pedido_id en la cotización para mantener el link
        await tx.cotizaciones.update({
          where: { id },
          data: {
            pedido_id: pedido.id,
          },
        });
      }

      return { cotizacionActualizada, pedidoId };
    });

    revalidatePath('/admin/Panel-Administrativo/cotizaciones');
    revalidatePath('/admin/Panel-Administrativo/pedidos');

    return {
      success: true,
      pedidoId: result.pedidoId,
    };
  } catch (err: any) {
    console.error('Error aprobando cotización:', err);
    return { success: false, error: err.message ?? 'Error interno del servidor' };
  }
}

/**
 * Rechazar cotización - Cambia estado a 'rechazada'
 * Permite agregar un motivo de rechazo
 */
export async function rechazarCotizacion(
  cotizacionId: string | bigint,
  motivo?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const id = typeof cotizacionId === 'string' ? BigInt(cotizacionId) : cotizacionId;

    const cotizacion = await prisma.cotizaciones.findUnique({
      where: { id },
    });

    if (!cotizacion) {
      return { success: false, error: 'Cotización no encontrada' };
    }

    if (!['pendiente', 'borrador'].includes(cotizacion.estado ?? '')) {
      return { success: false, error: `No se puede rechazar una cotización con estado '${cotizacion.estado}'` };
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

/**
 * Actualizar estado de cotización manualmente (recepcionista)
 * Permite transiciones: borrador -> pendiente -> aceptada/rechazada
 */
export async function actualizarEstadoCotizacion(
  cotizacionId: string | bigint,
  nuevoEstado: 'pendiente' | 'aceptada' | 'rechazada' | 'expirada' | 'borrador',
  motivo?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const id = typeof cotizacionId === 'string' ? BigInt(cotizacionId) : cotizacionId;

    const cotizacion = await prisma.cotizaciones.findUnique({
      where: { id },
    });

    if (!cotizacion) {
      return { success: false, error: 'Cotización no encontrada' };
    }

    // Validar transiciones de estado (máquina de estados)
    const transicionesValidas: Record<string, string[]> = {
      borrador: ['pendiente'],
      pendiente: ['aceptada', 'rechazada', 'expirada'],
      aceptada: [], // Inmutable - solo se puede anular con acción específica
      rechazada: ['pendiente'], // Se puede reabrir
      expirada: ['pendiente'], // Se puede reactivar si se extiende la fecha
    };

    const estadoActual = cotizacion.estado ?? 'borrador';
    const transicionesPermitidas = transicionesValidas[estadoActual] ?? [];

    if (!transicionesPermitidas.includes(nuevoEstado)) {
      return {
        success: false,
        error: `No se puede cambiar de '${estadoActual}' a '${nuevoEstado}'. Transiciones permitidas: ${transicionesPermitidas.join(', ')}`,
      };
    }

    // Preparar datos de actualización
    const updateData: Record<string, any> = {
      estado: nuevoEstado,
    };

    // Si se aprueba, registrar timestamp
    if (nuevoEstado === 'aceptada') {
      updateData.aprobado_at = new Date();
    }

    // Si se agrega motivo, anexar a notas_internas
    if (motivo) {
      const prefijo = nuevoEstado === 'rechazada' ? '[RECHAZO]' : '[NOTA]';
      updateData.notas_internas = `${cotizacion.notas_internas ?? ''}\n${prefijo}: ${motivo}`.trim();
    }

    await prisma.cotizaciones.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/admin/Panel-Administrativo/cotizaciones');

    return { success: true };
  } catch (err: any) {
    console.error('Error actualizando estado de cotización:', err);
    return { success: false, error: err.message ?? 'Error interno del servidor' };
  }
}

/**
 * Expirar cotizaciones pendientes vencidas (job para ejecutar periódicamente)
 * Actualiza visualmente el estado sin modificar la base de datos permanentemente
 */
export async function expirarCotizacionesVencidas(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Buscar cotizaciones pendientes con fecha vencida
    const cotizacionesVencidas = await prisma.cotizaciones.findMany({
      where: {
        estado: 'pendiente',
        valida_hasta: {
          lt: today,
        },
      },
      select: { id: true },
    });

    // NO actualizamos el estado en BD (inmutabilidad), solo retornamos count
    // La expiración es visual en el UI (ya implementada en getCotizaciones)
    
    return {
      success: true,
      count: cotizacionesVencidas.length,
    };
  } catch (err: any) {
    console.error('Error verificando cotizaciones vencidas:', err);
    return { success: false, count: 0, error: err.message ?? 'Error interno del servidor' };
  }
}
