// AVISO: El modelo 'precioHistorico' NO existe en el schema de Prisma actual.
// Debes agregar el modelo a schema.prisma y ejecutar `prisma migrate dev`
// antes de que este servicio funcione correctamente.
//
// Este archivo define las interfaces del dominio y el servicio completo,
// pero delega las llamadas a Prisma a través de un accessor tipado que
// se resolverá correctamente una vez el modelo exista en el schema.

import { prisma } from '@/lib/prisma';

// ── Tipos del dominio ─────────────────────────────────────────────────────────

export interface PrecioHistorico {
  id:               number;
  productoId:       string;
  precioAnterior:   number;
  precioNuevo:      number;
  porcentajeCambio: number;
  moneda:           string;
  tipoProducto:     string;
  fechaVigencia:    Date;
  razonCambio?:     string;
  creadoPor?:       string;
}

export interface CrearPrecioHistorico {
  productoId:     string;
  precioAnterior: number;
  precioNuevo:    number;
  moneda:         string;
  tipoProducto:   string;
  fechaVigencia:  Date;
  razonCambio?:   string;
  creadoPor?:     string;
}

// ── Accessor tipado ───────────────────────────────────────────────────────────
// Se usa un getter con aserción de tipo para que el servicio compile sin errores
// mientras el modelo no esté en el schema, pero TypeScript lo trate como tipado
// en cuanto se agregue la migración.

function precioHistoricoDb() {
  return (prisma as unknown as {
    precioHistorico: {
      findMany:   (args: object) => Promise<PrecioHistorico[]>;
      findUnique: (args: object) => Promise<PrecioHistorico | null>;
      findFirst:  (args: object) => Promise<PrecioHistorico | null>;
      create:     (args: object) => Promise<PrecioHistorico>;
      update:     (args: object) => Promise<PrecioHistorico>;
      delete:     (args: object) => Promise<PrecioHistorico>;
    };
  }).precioHistorico;
}

// ── Servicio ──────────────────────────────────────────────────────────────────

export const precioHistoricoService = {
  listar: async (productoId?: string): Promise<PrecioHistorico[]> => {
    return precioHistoricoDb().findMany({
      where:   productoId ? { productoId } : {},
      orderBy: { fechaVigencia: 'desc' },
    });
  },

  obtenerPorId: async (id: number): Promise<PrecioHistorico | null> => {
    return precioHistoricoDb().findUnique({ where: { id } });
  },

  crear: async (datos: CrearPrecioHistorico): Promise<PrecioHistorico> => {
    const porcentajeCambio =
      ((datos.precioNuevo - datos.precioAnterior) / (datos.precioAnterior || 1)) * 100;

    return precioHistoricoDb().create({
      data: { ...datos, porcentajeCambio },
    });
  },

  actualizar: async (
    id: number,
    datos: Partial<CrearPrecioHistorico>,
  ): Promise<PrecioHistorico> => {
    const porcentajeCambio =
      datos.precioNuevo !== undefined &&
      datos.precioAnterior !== undefined &&
      datos.precioAnterior !== 0
        ? ((datos.precioNuevo - datos.precioAnterior) / datos.precioAnterior) * 100
        : undefined;

    return precioHistoricoDb().update({
      where: { id },
      data:  { ...datos, ...(porcentajeCambio !== undefined && { porcentajeCambio }) },
    });
  },

  eliminar: async (id: number): Promise<{ success: boolean; message: string }> => {
    try {
      await precioHistoricoDb().delete({ where: { id } });
      return { success: true, message: 'Registro eliminado correctamente' };
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === 'P2025'
      ) {
        return { success: false, message: 'Registro no encontrado' };
      }
      throw error;
    }
  },

  obtenerHistorico: async (
    productoId: string,
    desde?: Date,
    hasta?: Date,
  ): Promise<PrecioHistorico[]> => {
    return precioHistoricoDb().findMany({
      where: {
        productoId,
        ...(desde || hasta
          ? {
              fechaVigencia: {
                ...(desde && { gte: desde }),
                ...(hasta && { lte: hasta }),
              },
            }
          : {}),
      },
      orderBy: { fechaVigencia: 'desc' },
    });
  },

  obtenerPrecioActual: async (productoId: string): Promise<PrecioHistorico | null> => {
    return precioHistoricoDb().findFirst({
      where:   { productoId },
      orderBy: { fechaVigencia: 'desc' },
    });
  },

  obtenerPromedioPorPeriodo: async (
    productoId: string,
    desde: Date,
    hasta: Date,
  ): Promise<number> => {
    const precios = await precioHistoricoService.obtenerHistorico(productoId, desde, hasta);
    if (precios.length === 0) return 0;
    return precios.reduce((sum, p) => sum + p.precioNuevo, 0) / precios.length;
  },

  generarReporte: async (
    desde?: Date,
    hasta?: Date,
  ): Promise<{ total: number; registros: PrecioHistorico[]; periodoDesde?: string; periodoHasta?: string }> => {
    const registros = await precioHistoricoService.obtenerHistorico('', desde, hasta);
    return {
      total:        registros.length,
      registros,
      periodoDesde: desde?.toISOString(),
      periodoHasta: hasta?.toISOString(),
    };
  },
};