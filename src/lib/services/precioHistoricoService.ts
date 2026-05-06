import { prisma } from '@/lib/prisma';
import { CrearPrecioHistorico, PrecioHistorico } from '@/lib/schemas/precioHistoricoSchema';

export const precioHistoricoService = {
  crear: async (datos: CrearPrecioHistorico): Promise<PrecioHistorico> => {
    const porcentajeCambio = ((datos.precioNuevo - datos.precioAnterior) / datos.precioAnterior) * 100;

    return await prisma.precioHistorico.create({
      data: {
        productoId: datos.productoId,
        precioAnterior: datos.precioAnterior,
        precioNuevo: datos.precioNuevo,
        moneda: datos.moneda,
        tipoProducto: datos.tipoProducto,
        fechaVigencia: datos.fechaVigencia,
        razonCambio: datos.razonCambio,
        porcentajeCambio,
        creadoPor: datos.creadoPor,
      },
    }) as Promise<PrecioHistorico>;
  },

  obtenerHistorico: async (productoId: string, desde?: Date, hasta?: Date): Promise<PrecioHistorico[]> => {
    const where: any = { productoId };
    if (desde || hasta) {
      where.fechaVigencia = {};
      if (desde) where.fechaVigencia.gte = desde;
      if (hasta) where.fechaVigencia.lte = hasta;
    }

    return await prisma.precioHistorico.findMany({
      where,
      orderBy: { fechaVigencia: 'desc' },
    }) as Promise<PrecioHistorico[]>;
  },

  obtenerPrecioActual: async (productoId: string): Promise<PrecioHistorico | null> => {
    return await prisma.precioHistorico.findFirst({
      where: { productoId },
      orderBy: { fechaVigencia: 'desc' },
    }) as Promise<PrecioHistorico | null>;
  },

  obtenerUltimoCambio: async (productoId: string): Promise<PrecioHistorico | null> => {
    return await precioHistoricoService.obtenerPrecioActual(productoId);
  },

  obtenerPromedioPorPeriodo: async (productoId: string, desde: Date, hasta: Date): Promise<number> => {
    const precios = await precioHistoricoService.obtenerHistorico(productoId, desde, hasta);
    if (precios.length === 0) return 0;
    return precios.reduce((sum, p) => sum + p.precioNuevo, 0) / precios.length;
  },

  generarReporte: async (categoriaProducto?: string, desde?: Date, hasta?: Date) => {
    let where: any = {};
    if (desde || hasta) {
      where.fechaVigencia = {};
      if (desde) where.fechaVigencia.gte = desde;
      if (hasta) where.fechaVigencia.lte = hasta;
    }

    const registros = await prisma.precioHistorico.findMany({
      where,
      orderBy: { fechaVigencia: 'desc' },
      include: { producto: true },
    });

    return {
      total: registros.length,
      registros,
      periodoDesde: desde?.toISOString(),
      periodoHasta: hasta?.toISOString(),
    };
  },
};
