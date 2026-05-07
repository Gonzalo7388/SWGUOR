/**
 * Service de Fichas Técnicas - Integración con RPC
 * Gestiona toda la lógica de fichas técnicas incluyendo cálculos de costo
 */

import { prisma } from "@/lib/prisma";
import {
  calcularCostoFicha,
  insertarMovimiento,
  obtenerAuditoriaRegistro,
} from "@/lib/helpers/rpc-helpers";
import {
  fichas_tecnicas,
  fichas_tecnicas_detalle,
  Prisma,
} from "@prisma/client";

// ============================================================================
// TIPOS PERSONALIZADOS
// ============================================================================

export interface FichaTecnicaConDetalles extends fichas_tecnicas {
  detalles: fichas_tecnicas_detalle[];
  costoCalculado?: number;
}

export interface CrearFichaTecnicaInput {
  productoId: number;
  version?: string;
  descripcionDetallada?: string;
  imagenGeometral?: string;
  samTotal?: number;
  createdBy?: number;
  detalles?: Array<{
    materialId?: number;
    insumoId?: number;
    cantidadConsumo: number;
    porcentajeDesperdicio?: number;
    observaciones?: string;
  }>;
}

export interface ActualizarFichaTecnicaInput {
  version?: string;
  descripcionDetallada?: string;
  estado?: "borrador" | "en_revision" | "aprobada" | "obsoleta";
  samTotal?: number;
  detalles?: Array<{
    materialId?: number;
    insumoId?: number;
    cantidadConsumo: number;
    porcentajeDesperdicio?: number;
    observaciones?: string;
  }>;
}

// ============================================================================
// SERVICIOS PRINCIPALES
// ============================================================================

/**
 * Obtiene una ficha técnica con todos sus detalles
 */
export async function obtenerFichaTecnica(
  fichaId: number
): Promise<FichaTecnicaConDetalles | null> {
  try {
    const ficha = await prisma.fichas_tecnicas.findUnique({
      where: { id: fichaId },
      include: {
        fichas_tecnicas_detalle: {
          include: {
            materiales: {
              select: {
                id: true,
                nombre: true,
                precio_unitario: true,
              },
            },
            insumo: {
              select: {
                id: true,
                nombre: true,
                precio_unitario: true,
              },
            },
          },
        },
        productos: {
          select: {
            id: true,
            nombre: true,
            sku: true,
          },
        },
      },
    });

    if (!ficha) return null;

    // Calcular costo usando RPC
    let costoCalculado = 0;
    try {
      costoCalculado = await calcularCostoFicha({ fichaId });
    } catch (error) {
      console.warn("No se pudo calcular costo de ficha:", error);
    }

    return {
      ...ficha,
      costoCalculado,
    } as any;
  } catch (error) {
    console.error("Error en obtenerFichaTecnica:", error);
    throw new Error("No se pudo obtener la ficha técnica");
  }
}

/**
 * Crea una nueva ficha técnica con detalles
 */
export async function crearFichaTecnica(
  input: CrearFichaTecnicaInput
): Promise<FichaTecnicaConDetalles> {
  try {
    const ficha = await prisma.fichas_tecnicas.create({
      data: {
        id_producto: input.productoId,
        version: input.version || "1.0",
        descripcion_detallada: input.descripcionDetallada,
        imagen_geometral: input.imagenGeometral,
        sam_total: input.samTotal
          ? new Prisma.Decimal(input.samTotal)
          : undefined,
        estado: "borrador",
        created_by: input.createdBy,
        fichas_tecnicas_detalle: {
          create: input.detalles
            ? input.detalles.map((detalle) => ({
                material_id: detalle.materialId,
                insumo_id: detalle.insumoId,
                cantidad_consumo: new Prisma.Decimal(detalle.cantidadConsumo),
                porcentaje_desperdicio: detalle.porcentajeDesperdicio
                  ? new Prisma.Decimal(detalle.porcentajeDesperdicio)
                  : new Prisma.Decimal(0),
                observaciones: detalle.observaciones,
              }))
            : [],
        },
      },
      include: {
        fichas_tecnicas_detalle: true,
      },
    });

    // Registrar movimiento de auditoria
    await insertarMovimiento({
      tipoMovimiento: "entrada",
      referenciaType: "PRODUCCION",
      referenciaId: Number(ficha.id),
      cantidad: 1,
      motivo: `Ficha técnica creada para producto ${input.productoId}`,
      usuarioId: input.createdBy,
    }).catch(() => null);

    // Calcular costo
    let costoCalculado = 0;
    try {
      costoCalculado = await calcularCostoFicha({ fichaId: Number(ficha.id) });
    } catch (error) {
      console.warn("No se pudo calcular costo inicial:", error);
    }

    return {
      ...ficha,
      costoCalculado,
    } as any;
  } catch (error) {
    console.error("Error en crearFichaTecnica:", error);
    throw new Error("No se pudo crear la ficha técnica");
  }
}

/**
 * Actualiza una ficha técnica existente
 */
export async function actualizarFichaTecnica(
  fichaId: number,
  input: ActualizarFichaTecnicaInput
): Promise<FichaTecnicaConDetalles> {
  try {
    // Eliminar detalles anteriores si se proporcionan nuevos
    if (input.detalles) {
      await prisma.fichas_tecnicas_detalle.deleteMany({
        where: { ficha_id: fichaId },
      });
    }

    const ficha = await prisma.fichas_tecnicas.update({
      where: { id: fichaId },
      data: {
        version: input.version,
        descripcion_detallada: input.descripcionDetallada,
        estado: input.estado,
        sam_total: input.samTotal
          ? new Prisma.Decimal(input.samTotal)
          : undefined,
        fichas_tecnicas_detalle: input.detalles
          ? {
              create: input.detalles.map((detalle) => ({
                material_id: detalle.materialId,
                insumo_id: detalle.insumoId,
                cantidad_consumo: new Prisma.Decimal(
                  detalle.cantidadConsumo
                ),
                porcentaje_desperdicio: detalle.porcentajeDesperdicio
                  ? new Prisma.Decimal(detalle.porcentajeDesperdicio)
                  : new Prisma.Decimal(0),
                observaciones: detalle.observaciones,
              })),
            }
          : undefined,
      },
      include: {
        fichas_tecnicas_detalle: true,
      },
    });

    // Recalcular costo
    let costoCalculado = 0;
    try {
      costoCalculado = await calcularCostoFicha({ fichaId });
    } catch (error) {
      console.warn("No se pudo recalcular costo:", error);
    }

    return {
      ...ficha,
      costoCalculado,
    } as any;
  } catch (error) {
    console.error("Error en actualizarFichaTecnica:", error);
    throw new Error("No se pudo actualizar la ficha técnica");
  }
}

/**
 * Obtiene el costo de una ficha técnica
 */
export async function obtenerCostoFicha(fichaId: number): Promise<number> {
  try {
    const costo = await calcularCostoFicha({ fichaId });
    return costo;
  } catch (error) {
    console.error("Error en obtenerCostoFicha:", error);
    throw new Error("No se pudo obtener el costo de la ficha");
  }
}

/**
 * Aprueba una ficha técnica
 */
export async function aprobarFichaTecnica(
  fichaId: number,
  usuarioId: number
): Promise<fichas_tecnicas> {
  try {
    const ficha = await prisma.fichas_tecnicas.update({
      where: { id: fichaId },
      data: {
        estado: "aprobada",
        updated_at: new Date(),
      },
    });

    // Registrar en auditoría
    await obtenerAuditoriaRegistro("fichas_tecnicas", fichaId).catch(
      () => null
    );

    return ficha;
  } catch (error) {
    console.error("Error en aprobarFichaTecnica:", error);
    throw new Error("No se pudo aprobar la ficha técnica");
  }
}

/**
 * Marca ficha técnica como obsoleta
 */
export async function marcarFichaComObsoleta(
  fichaId: number
): Promise<fichas_tecnicas> {
  try {
    return await prisma.fichas_tecnicas.update({
      where: { id: fichaId },
      data: {
        estado: "obsoleta",
        updated_at: new Date(),
      },
    });
  } catch (error) {
    console.error("Error en marcarFichaComObsoleta:", error);
    throw new Error("No se pudo marcar la ficha como obsoleta");
  }
}

/**
 * Obtiene fichas técnicas por producto
 */
export async function obtenerFichasPorProducto(
  productoId: number
): Promise<fichas_tecnicas[]> {
  try {
    return await prisma.fichas_tecnicas.findMany({
      where: {
        id_producto: productoId,
      },
      orderBy: {
        version: "desc",
      },
    });
  } catch (error) {
    console.error("Error en obtenerFichasPorProducto:", error);
    throw new Error("No se pudieron obtener las fichas técnicas");
  }
}

/**
 * Obtiene histórico de cambios en una ficha
 */
export async function obtenerHistoricoFicha(
  fichaId: number
): Promise<any[]> {
  try {
    return await obtenerAuditoriaRegistro("fichas_tecnicas", fichaId);
  } catch (error) {
    console.error("Error en obtenerHistoricoFicha:", error);
    return [];
  }
}

/**
 * Valida que una ficha tenga todos los datos requeridos
 */
export async function validarFichaTecnica(fichaId: number): Promise<{
  valida: boolean;
  errores: string[];
}> {
  try {
    const ficha = await obtenerFichaTecnica(fichaId);

    if (!ficha) {
      return {
        valida: false,
        errores: ["Ficha técnica no encontrada"],
      };
    }

    const errores: string[] = [];

    if (!ficha.id_producto) {
      errores.push("Ficha técnica debe estar asociada a un producto");
    }

    if (!ficha.descripcion_detallada) {
      errores.push("Descripción detallada es requerida");
    }

    if (!ficha.fichas_tecnicas_detalle || ficha.fichas_tecnicas_detalle.length === 0) {
      errores.push("Ficha técnica debe tener al menos un detalle de material o insumo");
    }

    return {
      valida: errores.length === 0,
      errores,
    };
  } catch (error) {
    console.error("Error en validarFichaTecnica:", error);
    return {
      valida: false,
      errores: ["Error al validar ficha técnica"],
    };
  }
}

export default {
  obtenerFichaTecnica,
  crearFichaTecnica,
  actualizarFichaTecnica,
  obtenerCostoFicha,
  aprobarFichaTecnica,
  marcarFichaComObsoleta,
  obtenerFichasPorProducto,
  obtenerHistoricoFicha,
  validarFichaTecnica,
};
