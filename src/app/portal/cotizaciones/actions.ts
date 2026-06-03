'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireServerAuth } from '@/lib/auth/server';
import { serializePrismaPayload } from '@/lib/serializers';
import { ORIGEN_COTIZACION_SOLICITUD } from '@/lib/constants/portal-b2b';
import type {
  CategoriaCotizar,
  ItemSolicitudCotizacionInput,
  ProductoParaCotizar,
} from './nueva/types';
import { Prisma, EstadoCotizacion } from '@prisma/client';

// ─── Constantes ───────────────────────────────────────────────────────────────

const DIAS_VALIDEZ = 7;

/** Solo cotizaciones aprobadas pueden convertirse en pedido */
const ESTADOS_CONVERTIBLES: EstadoCotizacion[] = [
  EstadoCotizacion.aprobada,
];

/** Estados desde los cuales se permite lanzar una recotización */
const ESTADOS_RECOTIZABLES: EstadoCotizacion[] = [
  EstadoCotizacion.expirada,
  EstadoCotizacion.rechazada,
  EstadoCotizacion.convertida,
  EstadoCotizacion.enviada,
  EstadoCotizacion.aprobada,
  EstadoCotizacion.borrador,
];

// ─── Helpers internos ─────────────────────────────────────────────────────────

function generarNumeroPedido(id: number): string {
  const now = new Date();
  const YY = String(now.getFullYear()).slice(2);
  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const DD = String(now.getDate()).padStart(2, '0');
  return `PED-${YY}${MM}${DD}-${String(id).padStart(4, '0')}`;
}

function generarNumeroCotizacion(id: number): string {
  const now = new Date();
  const YY = String(now.getFullYear()).slice(2);
  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const DD = String(now.getDate()).padStart(2, '0');
  const HH = String(now.getHours()).padStart(2, '0');
  const Min = String(now.getMinutes()).padStart(2, '0');
  const SS = String(now.getSeconds()).padStart(2, '0');
  return `COT-${YY}${MM}${DD}-${HH}${Min}${SS}-${id}`;
}

function normalizarImagen(img: string | null | undefined): string | null {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return img;
  return `${base}/storage/v1/object/public/productos/${img}`;
}

function labelEstadoOrigen(estado: EstadoCotizacion): string {
  const mapa: Record<EstadoCotizacion, string> = {
    [EstadoCotizacion.borrador]: 'Borrador',
    [EstadoCotizacion.enviada]: 'Enviada (en revisión)',
    [EstadoCotizacion.aprobada]: 'Aprobada',
    [EstadoCotizacion.rechazada]: 'Rechazada',
    [EstadoCotizacion.expirada]: 'Expirada',
    [EstadoCotizacion.convertida]: 'Convertida en pedido',
  };
  return mapa[estado] ?? estado;
}

function calcularTotalesSolicitud(
  items: { precio_unitario: number; cantidad: number }[],
) {
  const subtotalBruto = items.reduce(
    (acc, i) => acc + i.precio_unitario * i.cantidad,
    0,
  );
  const igv = subtotalBruto * 0.18;
  return { subtotalBruto, igv, total: subtotalBruto + igv };
}

async function obtenerClienteIdUsuario() {
  const auth = await requireServerAuth();
  if (!auth.success) return { error: auth.error as string };

  const cliente = await prisma.clientes.findFirst({
    where: { usuario_id: BigInt(auth.user.id) },
    select: { id: true, estado: true },
  });

  if (!cliente) return { error: 'cliente_no_encontrado' };
  if (cliente.estado !== 'activo') return { error: 'cliente_inactivo' };

  return { clienteId: cliente.id };
}

// ─── Tipos de respuesta ───────────────────────────────────────────────────────

/** Resultado tipado para convertirCotizacionAPedido */
export type ConvertirResult =
  | { success: true; pedidoId: number; numeroPedido: string }
  | { success: false; error: ConvertirError };

export type ConvertirError =
  | 'no_autenticado'
  | 'cotizacion_no_encontrada'
  | 'cotizacion_no_pertenece_al_cliente'  // ownership check
  | 'estado_no_convertible'               // solo aprobada puede convertirse
  | 'ya_convertida'                       // idempotencia explícita
  | 'sin_items'
  | 'error_interno';

export type RecotizarResult =
  | { success: true; id: number; numero: string; origen_id: number }
  | { success: false; error: RecotizarError };

export type RecotizarError =
  | 'no_autenticado'
  | 'cliente_no_encontrado'
  | 'cliente_inactivo'
  | 'cotizacion_no_encontrada'
  | 'cotizacion_sin_items'
  | 'estado_no_recotizable'
  | 'sin_variantes_activas'
  | 'error_interno';

// ─── convertirCotizacionAPedido ───────────────────────────────────────────────

/**
 * Convierte una cotización aprobada en un pedido formal.
 */
export async function convertirCotizacionAPedido(
  cotizacionId: number,
): Promise<ConvertirResult> {

  // ── 1. Autenticación ──────────────────────────────────────────────────────
  const auth = await requireServerAuth();
  if (!auth.success) {
    return { success: false, error: 'no_autenticado' };
  }

  // Resolvemos el clienteId del usuario autenticado para ownership check
  const cliente = await prisma.clientes.findFirst({
    where: { usuario_id: BigInt(auth.user.id) },
    select: { id: true },
  });

  if (!cliente) {
    return { success: false, error: 'no_autenticado' };
  }

  try {
    const resultado = await prisma.$transaction(async (tx) => {

      // ── 2. Obtener cotización con sus ítems ─────────────────────────────
      const cotizacion = await tx.cotizaciones.findUnique({
        where: { id: BigInt(cotizacionId) },
        include: {
          cotizacion_items: {
            select: {
              id: true,
              producto_id: true,
              variante_id: true,
              cantidad: true,
              precio_unitario_snapshot: true,
              color_snapshot: true,
              talla_snapshot: true,
              // moq real del producto para calcular moq_aplicado
              productos: { select: { moq: true } },
            },
          },
        },
      });

      if (!cotizacion) {
        throw Object.assign(new Error(), { code: 'cotizacion_no_encontrada' });
      }

      // ── 3. Ownership check ──────────────────────────────────────────────
      // La cotización debe pertenecer exactamente al cliente que hace la llamada
      if (cotizacion.cliente_id !== cliente.id) {
        throw Object.assign(new Error(), { code: 'cotizacion_no_pertenece_al_cliente' });
      }

      // ── 4. Validación de estado ─────────────────────────────────────────
      if (cotizacion.estado === EstadoCotizacion.convertida) {
        throw Object.assign(new Error(), { code: 'ya_convertida' });
      }

      if (!ESTADOS_CONVERTIBLES.includes(cotizacion.estado as EstadoCotizacion)) {
        throw Object.assign(new Error(), { code: 'estado_no_convertible' });
      }

      const items = cotizacion.cotizacion_items;
      if (items.length === 0) {
        throw Object.assign(new Error(), { code: 'sin_items' });
      }

      // ── 5. Calcular campos derivados ────────────────────────────────────

      const totalUnidades = items.reduce(
        (acc, item) => acc + Number(item.cantidad),
        0,
      );

      const moqAplicado = items.reduce((min, item) => {
        const moq = item.productos?.moq != null ? Number(item.productos.moq) : Infinity;
        return Math.min(min, moq);
      }, Infinity);
      const moqFinal = isFinite(moqAplicado) ? moqAplicado : 0;
      const subtotalBase = cotizacion.subtotal ?? new Prisma.Decimal(0);
      const igvBase = cotizacion.igv ?? new Prisma.Decimal(0);
      const descuentoBase = cotizacion.monto_descuento ?? new Prisma.Decimal(0);
      const envioBase = cotizacion.costo_envio ?? new Prisma.Decimal(0);
      const totalBase = cotizacion.total ?? new Prisma.Decimal(0);

      const saldoPendiente = new Prisma.Decimal(totalBase);

      // ── 6. Crear el pedido ──────────────────────────────────────────────
      const nuevoPedido = await tx.pedidos.create({
        data: {
          cliente_id: cotizacion.cliente_id,
          cotizacion_id: cotizacion.id,
          estado: 'pendiente',
          prioridad: 'normal',
          subtotal: subtotalBase,
          igv: igvBase,
          monto_descuento: descuentoBase,
          costo_envio: envioBase,
          total: totalBase,
          total_estimado: totalBase,
          total_unidades: totalUnidades,
          moq_aplicado: moqFinal,
          moneda: cotizacion.moneda ?? 'PEN',
          direccion_despacho: cotizacion.direccion_despacho,
          zona_envio_id: cotizacion.zona_envio_id,
          monto_pagado: new Prisma.Decimal(0),
          saldo_pendiente: saldoPendiente,
          notas_pedido: cotizacion.notas_internas
            ?? 'Generado automáticamente desde Cotización.',
        },
        select: { id: true },
      });

      const numeroPedido = generarNumeroPedido(Number(nuevoPedido.id));

      // ── 7. Crear pedido_items + decrementar stock en paralelo ───────────
      await Promise.all(
        items.map(async (item) => {
          await tx.pedido_items.create({
            data: {
              pedido_id: nuevoPedido.id,
              producto_id: item.producto_id,
              variante_id: item.variante_id,
              cantidad: Number(item.cantidad),
              especificaciones: {
                color_snapshot: item.color_snapshot,
                talla_snapshot: item.talla_snapshot,
                precio_congelado: item.precio_unitario_snapshot
                  ? Number(item.precio_unitario_snapshot)
                  : 0,
              } as Prisma.InputJsonValue,
            },
          });

          // Solo decrementa si hay variante asignada
          if (item.variante_id) {
            await tx.variantes_producto.update({
              where: { id: item.variante_id },
              data: { stock: { decrement: Number(item.cantidad) } },
            });
          }
        }),
      );

      // ── 8. Marcar la cotización como convertida ─────────────────────────
      await tx.cotizaciones.update({
        where: { id: cotizacion.id },
        data: { estado: EstadoCotizacion.convertida },
      });

      return { pedidoId: Number(nuevoPedido.id), numeroPedido };
    });

    // ── 9. Revalidar cachés ───────────────────────────────────────────────
    revalidatePath('/portal/cotizaciones');
    revalidatePath(`/portal/cotizaciones/${cotizacionId}`);
    revalidatePath('/portal/pedidos');

    return {
      success: true,
      pedidoId: resultado.pedidoId,
      numeroPedido: resultado.numeroPedido,
    };

  } catch (err: unknown) {
    console.error('[CONVERT_COTIZACION_ERROR]:', err);

    // Errores controlados lanzados desde dentro de la transacción
    const code = (err as { code?: string })?.code;
    if (
      code === 'cotizacion_no_encontrada' ||
      code === 'cotizacion_no_pertenece_al_cliente' ||
      code === 'estado_no_convertible' ||
      code === 'ya_convertida' ||
      code === 'sin_items'
    ) {
      return { success: false, error: code as ConvertirError };
    }

    return { success: false, error: 'error_interno' };
  }
}

/** Mensajes de error legibles para convertirCotizacionAPedido */
export function mensajeErrorConversion(error: ConvertirError): string {
  const mensajes: Record<ConvertirError, string> = {
    no_autenticado: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
    cotizacion_no_encontrada: 'La cotización no existe o fue eliminada.',
    cotizacion_no_pertenece_al_cliente: 'No tienes permiso para convertir esta cotización.',
    estado_no_convertible: 'Solo las cotizaciones aprobadas pueden convertirse en pedido.',
    ya_convertida: 'Esta cotización ya fue convertida en un pedido anteriormente.',
    sin_items: 'La cotización no tiene productos.',
    error_interno: 'Ocurrió un error inesperado. Intenta nuevamente.',
  };
  return mensajes[error] ?? 'Error desconocido.';
}

// ─── recotizarCotizacion ──────────────────────────────────────────────────────

export async function recotizarCotizacion(
  cotizacionOrigenId: number,
  opcionesOverride?: {
    mensaje?: string;
    costo_envio?: number;
    zona_envio_id?: number;
    direccion?: string;
  },
): Promise<RecotizarResult> {

  const auth = await requireServerAuth();
  if (!auth.success) return { success: false, error: 'no_autenticado' };

  const cliente = await prisma.clientes.findFirst({
    where: { usuario_id: BigInt(auth.user.id) },
    select: { id: true, estado: true },
  });

  if (!cliente) return { success: false, error: 'cliente_no_encontrado' };
  if (cliente.estado !== 'activo') return { success: false, error: 'cliente_inactivo' };

  const origen = await prisma.cotizaciones.findUnique({
    where: { id: BigInt(cotizacionOrigenId) },
    include: {
      cotizacion_items: {
        include: {
          variantes_producto: {
            select: { id: true, estado: true, stock: true, precio_adicional: true },
          },
          productos: {
            select: { id: true, precio: true, estado: true },
          },
        },
      },
    },
  });

  if (!origen) return { success: false, error: 'cotizacion_no_encontrada' };

  if (!ESTADOS_RECOTIZABLES.includes(origen.estado as EstadoCotizacion)) {
    return { success: false, error: 'estado_no_recotizable' };
  }

  const items = origen.cotizacion_items;
  if (items.length === 0) return { success: false, error: 'cotizacion_sin_items' };

  const itemsActivos = items.filter(
    (it) =>
      it.productos?.estado === 'activo' &&
      it.variantes_producto?.estado === 'activo',
  );

  if (itemsActivos.length === 0) return { success: false, error: 'sin_variantes_activas' };

  const itemsRecalculados = itemsActivos.map((it) => {
    const precioBase = Number(it.productos?.precio ?? it.precio_unitario_snapshot ?? 0);
    const precioExtra = Number(it.variantes_producto?.precio_adicional ?? 0);
    const precioFinal = precioBase + precioExtra;
    const cantidad = Number(it.cantidad);

    return {
      producto_id: it.producto_id,
      variante_id: it.variante_id,
      cantidad,
      precio_unitario: precioFinal,
      subtotal: precioFinal * cantidad,
      color_snapshot: it.color_snapshot,
      talla_snapshot: it.talla_snapshot,
    };
  });

  const subtotalBruto = itemsRecalculados.reduce((acc, i) => acc + i.subtotal, 0);
  const igv = subtotalBruto * 0.18;
  const costoEnvio = opcionesOverride?.costo_envio ?? Number(origen.costo_envio ?? 0);
  const total = subtotalBruto + igv + costoEnvio;

  const validaHasta = new Date();
  validaHasta.setDate(validaHasta.getDate() + DIAS_VALIDEZ);

  const mensajeBase = opcionesOverride?.mensaje?.trim()
    ?? `Recotización generada desde ${origen.numero} (estado: ${labelEstadoOrigen(origen.estado as EstadoCotizacion)}).`;

  try {
    const nueva = await prisma.$transaction(async (tx) => {
      const cotizacion = await tx.cotizaciones.create({
        data: {
          numero: 'PENDIENTE',
          cliente_id: cliente.id,
          estado: EstadoCotizacion.enviada,
          origen: ORIGEN_COTIZACION_SOLICITUD,
          subtotal: new Prisma.Decimal(subtotalBruto),
          igv: new Prisma.Decimal(igv),
          total: new Prisma.Decimal(total),
          monto_descuento: new Prisma.Decimal(0),
          costo_envio: new Prisma.Decimal(costoEnvio),
          costo_total_estimado: new Prisma.Decimal(total),
          moneda: origen.moneda ?? 'PEN',
          valida_hasta: validaHasta,
          expira_at: validaHasta,
          notas_internas: mensajeBase,
          direccion_despacho: opcionesOverride?.direccion ?? origen.direccion_despacho,
          zona_envio_id: opcionesOverride?.zona_envio_id != null
            ? opcionesOverride.zona_envio_id
            : origen.zona_envio_id != null
              ? Number(origen.zona_envio_id)
              : null,
          cotizacion_items: {
            create: itemsRecalculados.map((it) => ({
              producto_id: it.producto_id,
              variante_id: it.variante_id,
              cantidad: it.cantidad,
              precio_unitario_snapshot: new Prisma.Decimal(it.precio_unitario),
              subtotal: new Prisma.Decimal(it.subtotal),
              color_snapshot: it.color_snapshot,
              talla_snapshot: it.talla_snapshot,
            })),
          },
        },
      });

      const numero = generarNumeroCotizacion(Number(cotizacion.id));
      return tx.cotizaciones.update({
        where: { id: cotizacion.id },
        data: { numero },
        select: { id: true, numero: true },
      });
    });

    revalidatePath('/portal/cotizaciones');
    revalidatePath(`/portal/cotizaciones/${cotizacionOrigenId}`);

    return serializePrismaPayload({
      success: true as const,
      id: Number(nueva.id),
      numero: nueva.numero,
      origen_id: cotizacionOrigenId,
    });

  } catch (err) {
    console.error('[RECOTIZAR_ERROR]:', err);
    return { success: false, error: 'error_interno' };
  }
}

/** Mensajes de error para recotizarCotizacion */
export function mensajeErrorRecotizacion(error: RecotizarError): string {
  const mensajes: Record<RecotizarError, string> = {
    no_autenticado: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
    cliente_no_encontrado: 'No se encontró tu perfil de cliente.',
    cliente_inactivo: 'Tu cuenta está inactiva. Contacta a soporte.',
    cotizacion_no_encontrada: 'La cotización no existe o fue eliminada.',
    cotizacion_sin_items: 'La cotización no tiene productos para recotizar.',
    estado_no_recotizable: 'Esta cotización no puede recotizarse en su estado actual.',
    sin_variantes_activas: 'Todos los productos de esta cotización fueron dados de baja del catálogo.',
    error_interno: 'Ocurrió un error inesperado. Intenta nuevamente.',
  };
  return mensajes[error] ?? 'Error desconocido.';
}

// ─── obtenerProductosParaCotizar ──────────────────────────────────────────────

export async function obtenerProductosParaCotizar(): Promise<
  | { success: true; productos: ProductoParaCotizar[]; categorias: CategoriaCotizar[] }
  | { success: false; error: string }
> {
  const sesion = await obtenerClienteIdUsuario();
  if ('error' in sesion) return { success: false, error: sesion.error as string };

  const [productosRaw, categoriasRaw] = await Promise.all([
    prisma.productos.findMany({
      where: { estado: 'activo' },
      include: {
        categorias: { select: { id: true, nombre: true } },
        variantes_producto: {
          where: { estado: 'activo' },
          select: { id: true, color: true, talla: true, stock: true, precio_adicional: true, sku: true },
          orderBy: [{ talla: 'asc' }, { color: 'asc' }],
        },
      },
      orderBy: { nombre: 'asc' },
      take: 200,
    }),
    prisma.categorias.findMany({
      where: { activo: { not: false } },
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' },
    }),
  ]);

  const productos: ProductoParaCotizar[] = productosRaw
    .filter((p) => p.variantes_producto.length > 0)
    .map((p) => ({
      id: Number(p.id),
      nombre: p.nombre,
      sku: p.sku,
      moq: Number(p.moq),
      precio: Number(p.precio),
      stock: p.stock,
      imagen: normalizarImagen(p.imagen),
      descripcion: p.descripcion,
      categoria: p.categorias
        ? { id: Number(p.categorias.id), nombre: p.categorias.nombre }
        : null,
      variantes: p.variantes_producto.map((v) => ({
        id: Number(v.id),
        color: v.color,
        talla: v.talla,
        stock: v.stock,
        precio_adicional: Number(v.precio_adicional),
        sku: v.sku,
      })),
    }));

  const categorias: CategoriaCotizar[] = categoriasRaw.map((c) => ({
    id: Number(c.id),
    nombre: c.nombre,
  }));

  return serializePrismaPayload({ success: true as const, productos, categorias });
}

// ─── crearSolicitudCotizacion ─────────────────────────────────────────────────

export async function crearSolicitudCotizacion(input: {
  mensaje: string;
  items: ItemSolicitudCotizacionInput[];
}): Promise<
  | { success: true; id: number; numero: string }
  | { success: false; error: string }
> {
  const sesion = await obtenerClienteIdUsuario();
  if ('error' in sesion) return { success: false, error: sesion.error as string };

  const mensaje = input.mensaje?.trim() ?? '';
  if (!mensaje) return { success: false, error: 'mensaje_requerido' };

  const items = input.items ?? [];
  if (items.length === 0) return { success: false, error: 'items_requeridos' };

  for (const item of items) {
    if (!item.variante_id || item.cantidad < 1) {
      return { success: false, error: 'item_invalido' };
    }
  }

  const totales = calcularTotalesSolicitud(items);
  const validaHasta = new Date();
  validaHasta.setDate(validaHasta.getDate() + 7);

  try {
    const cotizacion = await prisma.$transaction(async (tx) => {
      const nueva = await tx.cotizaciones.create({
        data: {
          numero: 'PENDIENTE',
          cliente_id: sesion.clienteId,
          estado: 'enviada',
          origen: ORIGEN_COTIZACION_SOLICITUD,
          subtotal: new Prisma.Decimal(totales.subtotalBruto),
          igv: new Prisma.Decimal(totales.igv),
          total: new Prisma.Decimal(totales.total),
          valida_hasta: validaHasta,
          expira_at: validaHasta,
          monto_descuento: new Prisma.Decimal(0),
          costo_envio: new Prisma.Decimal(0),
          costo_total_estimado: new Prisma.Decimal(totales.total),
          moneda: 'PEN',
          notas_internas: mensaje,
          cotizacion_items: {
            create: items.map((item) => ({
              producto_id: BigInt(item.producto_id),
              variante_id: BigInt(item.variante_id),
              cantidad: Number(item.cantidad),
              precio_unitario_snapshot: new Prisma.Decimal(item.precio_unitario),
              subtotal: new Prisma.Decimal(item.cantidad * item.precio_unitario),
              color_snapshot: item.color_snapshot,
              talla_snapshot: item.talla_snapshot,
            })),
          },
        },
      });

      const numero = generarNumeroCotizacion(Number(nueva.id));
      return tx.cotizaciones.update({
        where: { id: nueva.id },
        data: { numero },
        select: { id: true, numero: true },
      });
    });

    revalidatePath('/portal/cotizaciones');

    return { success: true, id: Number(cotizacion.id), numero: cotizacion.numero };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al crear la solicitud';
    console.error('[Portal] crearSolicitudCotizacion:', err);
    return { success: false, error: message };
  }
}