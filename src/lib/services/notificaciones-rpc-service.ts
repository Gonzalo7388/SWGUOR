/**
 * Service de Notificaciones con RPC
 * Gestiona notificaciones del sistema usando RPC
 */

import { prisma } from "@/lib/prisma";
import {
  crearNotificacion,
  obtenerNotificacionesNoLeidas,
  marcarNotificacionesComoLeidas,
} from "@/lib/helpers/rpc-helpers";
import { notificaciones } from "@prisma/client";

// ============================================================================
// TIPOS
// ============================================================================

export type TipoNotificacion =
  | "cotizacion_expirada"
  | "devolucion_solicitada"
  | "stock_bajo"
  | "pago_pendiente"
  | "confeccion_completada"
  | "pedido_listo"
  | "orden_compra_recibida"
  | "ficha_tecnica_aprobada"
  | "incidencia_reportada";

export interface CrearNotificacionInput {
  usuarioId: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  referenciaType?: string;
  referenciaId?: number;
  urlDestino?: string;
}

export interface NotificacionConDetalles extends notificaciones {
  referenciaNombre?: string;
  usuarioEmail?: string;
}

// ============================================================================
// SERVICIOS PRINCIPALES
// ============================================================================

/**
 * Crea una nueva notificación
 */
export async function crearNotificacionNueva(
  input: CrearNotificacionInput
): Promise<notificaciones> {
  try {
    const notificacion = await prisma.notificaciones.create({
      data: {
        usuario_id: input.usuarioId,
        tipo: input.tipo as any,
        titulo: input.titulo,
        mensaje: input.mensaje,
        referencia_tipo: input.referenciaType,
        referencia_id: input.referenciaId,
        url_destino: input.urlDestino,
      },
    });

    return notificacion;
  } catch (error) {
    console.error("Error en crearNotificacionNueva:", error);
    throw new Error("No se pudo crear la notificación");
  }
}

/**
 * Obtiene notificaciones no leídas de un usuario
 */
export async function obtenerNoLeidas(usuarioId: number): Promise<notificaciones[]> {
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
    console.error("Error en obtenerNoLeidas:", error);
    throw new Error("No se pudieron obtener las notificaciones");
  }
}

/**
 * Obtiene todas las notificaciones de un usuario con paginación
 */
export async function obtenerNotificacionesUsuario(
  usuarioId: number,
  limit: number = 50,
  offset: number = 0
): Promise<{
  total: number;
  notificaciones: NotificacionConDetalles[];
}> {
  try {
    const [total, notificaciones] = await Promise.all([
      prisma.notificaciones.count({
        where: { usuario_id: usuarioId },
      }),
      prisma.notificaciones.findMany({
        where: { usuario_id: usuarioId },
        orderBy: { created_at: "desc" },
        take: limit,
        skip: offset,
        include: {
          usuarios: {
            select: { email: true },
          },
        },
      }),
    ]);

    return {
      total,
      notificaciones: notificaciones.map((n) => ({
        ...n,
        usuarioEmail: (n.usuarios as any)?.email,
      })) as any,
    };
  } catch (error) {
    console.error("Error en obtenerNotificacionesUsuario:", error);
    throw new Error("No se pudieron obtener las notificaciones");
  }
}

/**
 * Marca una notificación como leída
 */
export async function marcarComoLeida(notificacionId: number): Promise<notificaciones> {
  try {
    return await prisma.notificaciones.update({
      where: { id: notificacionId },
      data: {
        leido: true,
        leido_at: new Date(),
      },
    });
  } catch (error) {
    console.error("Error en marcarComoLeida:", error);
    throw new Error("No se pudo marcar la notificación como leída");
  }
}

/**
 * Marca múltiples notificaciones como leídas
 */
export async function marcarVariasComoLeidas(
  notificacionIds: number[]
): Promise<void> {
  try {
    await prisma.notificaciones.updateMany({
      where: {
        id: { in: notificacionIds },
      },
      data: {
        leido: true,
        leido_at: new Date(),
      },
    });
  } catch (error) {
    console.error("Error en marcarVariasComoLeidas:", error);
    throw new Error("No se pudieron marcar las notificaciones");
  }
}

/**
 * Marca todas las notificaciones de un usuario como leídas
 */
export async function marcarTodasComoLeidas(usuarioId: number): Promise<void> {
  try {
    await prisma.notificaciones.updateMany({
      where: {
        usuario_id: usuarioId,
        leido: false,
      },
      data: {
        leido: true,
        leido_at: new Date(),
      },
    });
  } catch (error) {
    console.error("Error en marcarTodasComoLeidas:", error);
    throw new Error("No se pudieron marcar las notificaciones");
  }
}

/**
 * Elimina una notificación
 */
export async function eliminarNotificacion(notificacionId: number): Promise<void> {
  try {
    await prisma.notificaciones.delete({
      where: { id: notificacionId },
    });
  } catch (error) {
    console.error("Error en eliminarNotificacion:", error);
    throw new Error("No se pudo eliminar la notificación");
  }
}

/**
 * Elimina múltiples notificaciones
 */
export async function eliminarVariasNotificaciones(
  notificacionIds: number[]
): Promise<void> {
  try {
    await prisma.notificaciones.deleteMany({
      where: {
        id: { in: notificacionIds },
      },
    });
  } catch (error) {
    console.error("Error en eliminarVariasNotificaciones:", error);
    throw new Error("No se pudieron eliminar las notificaciones");
  }
}

/**
 * Obtiene estadísticas de notificaciones de un usuario
 */
export async function obtenerEstadisticasNotificaciones(
  usuarioId: number
): Promise<{
  totalNotificaciones: number;
  noLeidas: number;
  porTipo: Record<string, number>;
}> {
  try {
    const [total, noLeidas, porTipo] = await Promise.all([
      prisma.notificaciones.count({
        where: { usuario_id: usuarioId },
      }),
      prisma.notificaciones.count({
        where: {
          usuario_id: usuarioId,
          leido: false,
        },
      }),
      prisma.notificaciones.groupBy({
        by: ["tipo"],
        where: { usuario_id: usuarioId },
        _count: true,
      }),
    ]);

    const porTipoMap: Record<string, number> = {};
    porTipo.forEach((item) => {
      porTipoMap[item.tipo || "sin_tipo"] = item._count;
    });

    return {
      totalNotificaciones: total,
      noLeidas,
      porTipo: porTipoMap,
    };
  } catch (error) {
    console.error("Error en obtenerEstadisticasNotificaciones:", error);
    throw new Error("No se pudieron obtener las estadísticas");
  }
}

// ============================================================================
// SERVICIOS DE GENERACIÓN DE NOTIFICACIONES POR EVENTO
// ============================================================================

/**
 * Notifica cuando una cotización expira
 */
export async function notificarCotizacionExpirada(data: {
  cotizacionId: number;
  cotizacionNumero: string;
}): Promise<void> {
  try {
    // Obtener usuarios administradores
    const admins = await prisma.usuarios.findMany({
      where: {
        rol: "administrador",
        estado: "activo",
      },
    });

    // Crear notificación para cada admin
    for (const admin of admins) {
      await crearNotificacionNueva({
        usuarioId: admin.id,
        tipo: "cotizacion_expirada",
        titulo: `Cotización expirada: ${data.cotizacionNumero}`,
        mensaje: `La cotización ${data.cotizacionNumero} ha expirado sin ser aprobada.`,
        referenciaType: "cotizaciones",
        referenciaId: data.cotizacionId,
        urlDestino: `/admin/Panel-Administrativo/cotizaciones/${data.cotizacionId}`,
      });
    }
  } catch (error) {
    console.error("Error en notificarCotizacionExpirada:", error);
  }
}

/**
 * Notifica cuando hay una devolución de cliente
 */
export async function notificarDevolucionSolicitada(data: {
  devolucionId: number;
  clienteId: number;
  productoNombre: string;
}): Promise<void> {
  try {
    const admins = await prisma.usuarios.findMany({
      where: {
        rol: "administrador",
        estado: "activo",
      },
    });

    for (const admin of admins) {
      await crearNotificacionNueva({
        usuarioId: admin.id,
        tipo: "devolucion_solicitada",
        titulo: "Nueva devolución solicitada",
        mensaje: `El cliente solicitó una devolución para: ${data.productoNombre}`,
        referenciaType: "devoluciones_cliente",
        referenciaId: data.devolucionId,
        urlDestino: `/admin/Panel-Administrativo/devoluciones/${data.devolucionId}`,
      });
    }
  } catch (error) {
    console.error("Error en notificarDevolucionSolicitada:", error);
  }
}

/**
 * Notifica cuando stock está bajo
 */
export async function notificarStockBajo(data: {
  itemId: number;
  itemNombre: string;
  stockActual: number;
  stockMinimo: number;
  tipoItem: "producto" | "insumo" | "material";
}): Promise<void> {
  try {
    const usuarios = await prisma.usuarios.findMany({
      where: {
        rol: { in: ["administrador", "almacenero"] },
        estado: "activo",
      },
    });

    for (const usuario of usuarios) {
      await crearNotificacionNueva({
        usuarioId: usuario.id,
        tipo: "stock_bajo",
        titulo: `Stock bajo: ${data.itemNombre}`,
        mensaje: `El stock de "${data.itemNombre}" bajó a ${data.stockActual} (mínimo: ${data.stockMinimo})`,
        referenciaType: data.tipoItem,
        referenciaId: data.itemId,
        urlDestino: "/admin/Panel-Administrativo/inventario",
      });
    }
  } catch (error) {
    console.error("Error en notificarStockBajo:", error);
  }
}

/**
 * Notifica pago pendiente a taller
 */
export async function notificarPagoPendiente(data: {
  confeccionId: number;
  tallerNombre: string;
  monto: number;
}): Promise<void> {
  try {
    const admins = await prisma.usuarios.findMany({
      where: {
        rol: "administrador",
        estado: "activo",
      },
    });

    for (const admin of admins) {
      await crearNotificacionNueva({
        usuarioId: admin.id,
        tipo: "pago_pendiente",
        titulo: `Pago pendiente a taller: ${data.tallerNombre}`,
        mensaje: `La confección #${data.confeccionId} fue completada. Hay un pago pendiente de $${data.monto} al taller ${data.tallerNombre}.`,
        referenciaType: "confecciones",
        referenciaId: data.confeccionId,
        urlDestino: "/admin/Panel-Administrativo/talleres/pagos",
      });
    }
  } catch (error) {
    console.error("Error en notificarPagoPendiente:", error);
  }
}

/**
 * Notifica cuando confección está completada
 */
export async function notificarConfeccionCompletada(data: {
  confeccionId: number;
  pedidoId: number;
}): Promise<void> {
  try {
    const pedido = await prisma.pedidos.findUnique({
      where: { id: data.pedidoId },
      select: {
        clientes: {
          select: { usuario_id: true },
        },
      },
    });

    if (pedido?.clientes?.usuario_id) {
      await crearNotificacionNueva({
        usuarioId: pedido.clientes.usuario_id,
        tipo: "confeccion_completada",
        titulo: "Tu confección está completada",
        mensaje: `La confección del pedido #${data.pedidoId} ha sido completada y está lista para despacho.`,
        referenciaType: "confecciones",
        referenciaId: data.confeccionId,
      });
    }
  } catch (error) {
    console.error("Error en notificarConfeccionCompletada:", error);
  }
}

export default {
  crearNotificacionNueva,
  obtenerNoLeidas,
  obtenerNotificacionesUsuario,
  marcarComoLeida,
  marcarVariasComoLeidas,
  marcarTodasComoLeidas,
  eliminarNotificacion,
  eliminarVariasNotificaciones,
  obtenerEstadisticasNotificaciones,
  notificarCotizacionExpirada,
  notificarDevolucionSolicitada,
  notificarStockBajo,
  notificarPagoPendiente,
  notificarConfeccionCompletada,
};
