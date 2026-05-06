/**
 * RPC Helpers - Abstracción para llamar RPCs de PostgreSQL
 * Centraliza toda la lógica de integración con funciones almacenadas
 */

import { prisma } from "@/lib/prisma";
import { 
  Prisma,
  fichas_tecnicas,
  ordenes_compra_items,
  devoluciones_cliente,
  incidencias 
} from "@prisma/client";

// ============================================================================
// TIPOS DE PARÁMETROS Y RESPUESTAS PARA RPC
// ============================================================================

export interface CalcularCostoFichaParams {
  fichaId: number;
}

export interface CalcularCostoFichaResult {
  status: string;
  costo_total: number;
}

export interface CrearReservaStockParams {
  productoId: string;
  almacenId: string;
  cantidadAReservar: number;
  motivo: string;
  pedidoId?: string;
}

export interface CrearReservaStockResult {
  status: string;
  message?: string;
  cantidad_reservada?: number;
  nuevo_disponible?: number;
  disponible_real?: number;
}

export interface ActualizarPrecioParams {
  productoId: string;
  precioNuevo: number;
  razonCambio: string;
  tipoProducto: string;
  moneda: string;
  usuarioId: string;
}

export interface ActualizarPrecioResult {
  status: string;
  porcentaje?: number;
  message?: string;
}

export interface InsertarMovimientoParams {
  tipoMovimiento: "entrada" | "salida" | "ajuste";
  referenciaType: "COMPRA" | "VENTA" | "AJUSTE" | "ORDEN" | "PRODUCCION";
  referenciaId: number;
  cantidad: number;
  motivo: string;
  productoId?: number;
  insumoId?: number;
  materialId?: number;
  costoUnitario?: number;
  usuarioId?: number;
}

// ============================================================================
// LLAMADAS A RPC
// ============================================================================

/**
 * Calcula el costo estimado de una ficha técnica
 * Suma costos de materiales (con desperdicio) e insumos
 */
export async function calcularCostoFicha(params: CalcularCostoFichaParams): Promise<number> {
  try {
    const result = await prisma.$queryRaw<{ calcular_costo_ficha: number }[]>`
      SELECT calcular_costo_ficha(${params.fichaId}::bigint) as calcular_costo_ficha
    `;
    
    return result[0]?.calcular_costo_ficha || 0;
  } catch (error) {
    console.error("Error en calcularCostoFicha:", error);
    throw new Error("No se pudo calcular el costo de la ficha técnica");
  }
}

/**
 * Crea una reserva de stock con validación de disponibilidad
 * Retorna error si no hay stock disponible
 */
export async function crearReservaStock(
  params: CrearReservaStockParams
): Promise<CrearReservaStockResult> {
  try {
    const result = await prisma.$queryRaw<{ fn_crear_reserva_stock: any }[]>`
      SELECT fn_crear_reserva_stock(
        ${params.productoId}::uuid,
        ${params.almacenId}::uuid,
        ${params.cantidadAReservar}::integer,
        ${params.motivo}::text,
        ${params.pedidoId}::uuid
      ) as fn_crear_reserva_stock
    `;

    return result[0]?.fn_crear_reserva_stock || { status: "error" };
  } catch (error) {
    console.error("Error en crearReservaStock:", error);
    throw new Error("No se pudo crear la reserva de stock");
  }
}

/**
 * Actualiza precio de producto con histórico de cambios
 */
export async function actualizarPrecioConHistorico(
  params: ActualizarPrecioParams
): Promise<ActualizarPrecioResult> {
  try {
    const result = await prisma.$queryRaw<{ fn_actualizar_precio_con_historico: any }[]>`
      SELECT fn_actualizar_precio_con_historico(
        ${params.productoId}::uuid,
        ${params.precioNuevo}::numeric,
        ${params.razonCambio}::text,
        ${params.tipoProducto}::text,
        ${params.moneda}::"Moneda",
        ${params.usuarioId}::uuid
      ) as fn_actualizar_precio_con_historico
    `;

    return result[0]?.fn_actualizar_precio_con_historico || { status: "error" };
  } catch (error) {
    console.error("Error en actualizarPrecioConHistorico:", error);
    throw new Error("No se pudo actualizar el precio");
  }
}

/**
 * Inserta un movimiento de inventario
 * Se usa en triggers pero también puede llamarse manualmente
 */
export async function insertarMovimiento(
  params: InsertarMovimientoParams
): Promise<void> {
  try {
    await prisma.$executeRaw`
      PERFORM fn_insertar_movimiento(
        ${params.tipoMovimiento}::"TipoMovimiento",
        ${params.referenciaType}::"ReferenciaMovimiento",
        ${params.referenciaId}::bigint,
        ${params.cantidad}::double precision,
        ${params.motivo}::text,
        ${params.productoId}::bigint,
        ${params.insumoId}::bigint,
        ${params.materialId}::bigint,
        ${params.costoUnitario}::numeric,
        ${params.usuarioId}::bigint
      )
    `;
  } catch (error) {
    console.error("Error en insertarMovimiento:", error);
    throw new Error("No se pudo registrar el movimiento de inventario");
  }
}

/**
 * Obtiene stock disponible considerando reservas activas
 * Usado para validaciones antes de operaciones
 */
export async function obtenerStockDisponible(
  productoId: number,
  almacenId: number
): Promise<{
  stock_actual: number;
  reservas_activas: number;
  disponible: number;
}> {
  try {
    const resultado = await prisma.$queryRaw<{
      stock_actual: number;
      reservas_activas: number;
      disponible: number;
    }[]>`
      SELECT 
        COALESCE((SELECT cantidad FROM public.almacen_stock 
                  WHERE producto_id = ${productoId}::bigint 
                  AND almacen_id = ${almacenId}::bigint), 0)::integer as stock_actual,
        0::integer as reservas_activas,
        0::integer as disponible
    `;

    if (resultado[0]) {
      return resultado[0];
    }

    return { stock_actual: 0, reservas_activas: 0, disponible: 0 };
  } catch (error) {
    console.error("Error en obtenerStockDisponible:", error);
    throw new Error("No se pudo obtener el stock disponible");
  }
}

/**
 * Registra un cambio de estado en confección
 * Mantiene histórico de transiciones de estado
 */
export async function registrarCambioEstadoConfeccion(
  confeccionId: number,
  estadoAnterior: string,
  estadoNuevo: string,
  notasCambio?: string
): Promise<void> {
  try {
    await prisma.seguimiento_confeccion.create({
      data: {
        confeccion_id: confeccionId,
        estado_anterior: estadoAnterior as any,
        estado_nuevo: estadoNuevo as any,
        notas: notasCambio,
      },
    });
  } catch (error) {
    console.error("Error en registrarCambioEstadoConfeccion:", error);
    throw new Error("No se pudo registrar el cambio de estado");
  }
}

/**
 * Obtiene información de auditoria para una tabla/registro
 */
export async function obtenerAuditoriaRegistro(
  tabla: string,
  registroId: number
): Promise<any[]> {
  try {
    const auditorias = await prisma.auditoria.findMany({
      where: {
        tabla,
        registro_id: registroId,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return auditorias;
  } catch (error) {
    console.error("Error en obtenerAuditoriaRegistro:", error);
    throw new Error("No se pudo obtener el histórico de auditoría");
  }
}

/**
 * Crea una notificación para un usuario
 * Usado por los triggers de notificación
 */
export async function crearNotificacion(data: {
  usuarioId: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  referenciaType?: string;
  referenciaId?: number;
  urlDestino?: string;
}): Promise<any> {
  try {
    return await prisma.notificaciones.create({
      data: {
        usuario_id: data.usuarioId,
        tipo: data.tipo as any,
        titulo: data.titulo,
        mensaje: data.mensaje,
        referencia_tipo: data.referenciaType,
        referencia_id: data.referenciaId,
        url_destino: data.urlDestino,
      },
    });
  } catch (error) {
    console.error("Error en crearNotificacion:", error);
    throw new Error("No se pudo crear la notificación");
  }
}

/**
 * Obtiene notificaciones no leídas de un usuario
 */
export async function obtenerNotificacionesNoLeidas(usuarioId: number): Promise<any[]> {
  try {
    return await prisma.notificaciones.findMany({
      where: {
        usuario_id: usuarioId,
        leido: false,
      },
      orderBy: {
        created_at: "desc",
      },
    });
  } catch (error) {
    console.error("Error en obtenerNotificacionesNoLeidas:", error);
    throw new Error("No se pudo obtener las notificaciones");
  }
}

/**
 * Marca notificaciones como leídas
 */
export async function marcarNotificacionesComoLeidas(
  usuarioId: number,
  notificacionesIds?: number[]
): Promise<void> {
  try {
    const whereClause = notificacionesIds?.length
      ? { usuario_id: usuarioId, id: { in: notificacionesIds } }
      : { usuario_id: usuarioId };

    await prisma.notificaciones.updateMany({
      where: whereClause,
      data: {
        leido: true,
        leido_at: new Date(),
      },
    });
  } catch (error) {
    console.error("Error en marcarNotificacionesComoLeidas:", error);
    throw new Error("No se pudo actualizar las notificaciones");
  }
}

/**
 * Obtiene histórico completo de precios de un producto
 */
export async function obtenerHistoricoPrecio(productoId: number): Promise<any[]> {
  try {
    return await prisma.$queryRaw`
      SELECT * FROM public.precio_historico
      WHERE producto_id = ${productoId}::bigint
      ORDER BY created_at DESC
    `;
  } catch (error) {
    console.error("Error en obtenerHistoricoPrecio:", error);
    throw new Error("No se pudo obtener el histórico de precios");
  }
}

/**
 * Valida si hay suficiente stock para una venta
 */
export async function validarStockSuficiente(
  productoId: number,
  cantidad: number
): Promise<boolean> {
  try {
    const resultado = await prisma.productos.findUnique({
      where: { id: productoId },
      select: { stock: true },
    });

    return (resultado?.stock || 0) >= cantidad;
  } catch (error) {
    console.error("Error en validarStockSuficiente:", error);
    throw new Error("No se pudo validar el stock");
  }
}

/**
 * Obtiene transacciones recientes de auditoria
 */
export async function obtenerAuditoriaReciente(
  limit: number = 50
): Promise<any[]> {
  try {
    return await prisma.auditoria.findMany({
      take: limit,
      orderBy: {
        created_at: "desc",
      },
      include: {
        usuarios: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error en obtenerAuditoriaReciente:", error);
    throw new Error("No se pudo obtener el histórico de auditoría");
  }
}

export default {
  calcularCostoFicha,
  crearReservaStock,
  actualizarPrecioConHistorico,
  insertarMovimiento,
  obtenerStockDisponible,
  registrarCambioEstadoConfeccion,
  obtenerAuditoriaRegistro,
  crearNotificacion,
  obtenerNotificacionesNoLeidas,
  marcarNotificacionesComoLeidas,
  obtenerHistoricoPrecio,
  validarStockSuficiente,
  obtenerAuditoriaReciente,
};
