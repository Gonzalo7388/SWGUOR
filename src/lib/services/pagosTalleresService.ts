import { prisma } from '@/lib/prisma';
import { CrearPagoTaller, PagoTaller } from '@/lib/schemas/pagosTalleresSchema';

export const pagosTalleresService = {
  crear: async (datos: CrearPagoTaller): Promise<PagoTaller> => {
    return await prisma.pagosTalleres.create({
      data: {
        tallerId: datos.tallerId,
        ordinanId: datos.ordinanId,
        montoTotal: datos.montoTotal,
        montoRestante: datos.montoTotal,
        moneda: datos.moneda,
        estatus: 'PENDIENTE',
        metodoPago: datos.metodoPago,
        fechaProgramada: datos.fechaProgramada,
        referencia: datos.referencia,
        observaciones: datos.observaciones,
      },
    }) as Promise<PagoTaller>;
  },

  obtenerTodos: async (filtros?: any): Promise<PagoTaller[]> => {
    const where: any = {};
    if (filtros?.tallerId) where.tallerId = filtros.tallerId;
    if (filtros?.estatus) where.estatus = filtros.estatus;

    return await prisma.pagosTalleres.findMany({
      where,
      orderBy: { fechaProgramada: 'asc' },
    }) as Promise<PagoTaller[]>;
  },

  registrarPago: async (pagoId: string, monto: number, fecha: Date, metodoPago: string, numeroComprobante?: string): Promise<PagoTaller> => {
    const pago = await prisma.pagosTalleres.findUnique({ where: { id: pagoId } });
    if (!pago) throw new Error('Pago no encontrado');

    const montoPagado = (pago.montoPagado as number) + monto;
    const montoRestante = Math.max(0, (pago.montoTotal as number) - montoPagado);
    const nuevoEstatus = montoRestante === 0 ? 'PAGADO' : 'PARCIAL';

    return await prisma.pagosTalleres.update({
      where: { id: pagoId },
      data: {
        montoPagado,
        montoRestante,
        estatus: nuevoEstatus,
        metodoPago,
        numeroComprobante,
        fechaEfectiva: fecha,
      },
    }) as Promise<PagoTaller>;
  },

  obtenerPendientes: async (tallerId: string): Promise<PagoTaller[]> => {
    return await prisma.pagosTalleres.findMany({
      where: {
        tallerId,
        estatus: { in: ['PENDIENTE', 'PARCIAL'] },
      },
      orderBy: { fechaProgramada: 'asc' },
    }) as Promise<PagoTaller[]>;
  },

  obtenerMontoTotalPendiente: async (tallerId: string): Promise<number> => {
    const pagos = await pagosTalleresService.obtenerPendientes(tallerId);
    return pagos.reduce((sum, p) => sum + (p.montoRestante as number), 0);
  },
};
