import { prisma } from '@/lib/prisma';
import { CrearAsientoContable, AsientoContable } from '@/lib/schemas/asientosContablesSchema';

export const asientosContablesService = {
  crear: async (datos: CrearAsientoContable): Promise<any> => {
    const ultimoAsiento = await prisma.asientosContables.findFirst({
      orderBy: { numero: 'desc' },
      select: { numero: true },
    });

    const proximoNumero = (ultimoAsiento?.numero ? parseInt(ultimoAsiento.numero) : 0) + 1;

    const totalDebito = detalles.reduce((sum, d) => sum + (d.debito || 0), 0);
    const totalCredito = detalles.reduce((sum, d) => sum + (d.credito || 0), 0);

    if (Math.abs(totalDebito - totalCredito) > 0.01) {
      throw new Error('El asiento no está balanceado. Débito debe igual a Crédito');
    }

    return await prisma.asientosContables.create({
      data: {
        numero: proximoNumero.toString(),
        fecha: datos.fecha,
        concepto: datos.concepto,
        tipoAsiento: datos.tipoAsiento,
        estado: 'BORRADOR',
        moneda: datos.moneda,
        tasaCambio: datos.tasaCambio,
        creadoPor: datos.creadoPor,
        referencia: datos.referencia,
        observaciones: datos.observaciones,
        totalDebito,
        totalCredito,
        detalles: {
          createMany: {
            data: detalles.map((d: any) => ({
              cuentaId: d.cuentaId,
              descripcion: d.descripcion,
              debito: d.debito,
              credito: d.credito,
              referencia: d.referencia,
            })),
          },
        },
      },
      include: { detalles: true },
    }) as Promise<AsientoContable>;
  },

  obtenerTodas: async (filtros?: any): Promise<any[]> => {
    const where: any = {};
    if (filtros?.tipoAsiento) where.tipoAsiento = filtros.tipoAsiento;
    if (filtros?.estado) where.estado = filtros.estado;

    return await prisma.asientosContables.findMany({
      where,
      orderBy: { fecha: 'desc' },
      include: { detalles: true },
    }) as Promise<AsientoContable[]>;
  },

  aprobar: async (asientoId: string, aprobadoPor: string): Promise<AsientoContable> => {
    return await prisma.asientosContables.update({
      where: { id: asientoId },
      data: {
        estado: 'REGISTRADO',
        aprobadoPor,
      },
      include: { detalles: true },
    }) as Promise<AsientoContable>;
  },

  reversear: async (asientoId: string, motivo: string): Promise<AsientoContable> => {
    return await prisma.asientosContables.update({
      where: { id: asientoId },
      data: {
        estado: 'REVERSADO',
        observaciones: `REVERSADO: ${motivo}`,
      },
      include: { detalles: true },
    }) as Promise<AsientoContable>;
  },

  obtenerPorPeriodo: async (desde: Date, hasta: Date): Promise<AsientoContable[]> => {
    return await prisma.asientosContables.findMany({
      where: {
        fecha: { gte: desde, lte: hasta },
        estado: { not: 'BORRADOR' },
      },
      orderBy: { fecha: 'desc' },
      include: { detalles: true },
    }) as Promise<AsientoContable[]>;
  },
};
