import { prisma } from '@/lib/prisma';
import { pagos_taller, Prisma, MetodoPago, EstadoPagoTaller } from '@prisma/client';

// Campos reales del modelo 'pagos_taller':
//   id, taller_id, confeccion_id, orden_produccion_id, monto, moneda,
//   metodo_pago, estado (pendiente|pagado|anulado), fecha_pago,
//   numero_operacion, comprobante_url, notas, registrado_por,
//   created_at, updated_at

interface FiltrosPagosTaller {
  taller_id?: number | bigint;
  estado?:    EstadoPagoTaller;
}

interface CrearPagoTallerInput {
  taller_id:           number | bigint;
  monto:               Prisma.Decimal | number | string;
  metodo_pago:         MetodoPago;
  fecha_pago:          Date;
  orden_produccion_id?: number | bigint;
  confeccion_id?:      number | bigint;
  moneda?:             string;
  notas?:              string;
  registrado_por?:     number | bigint;
}

export const pagosTalleresService = {
  crear: async (datos: CrearPagoTallerInput): Promise<pagos_taller> => {
    return prisma.pagos_taller.create({
      data: {
        taller_id:           BigInt(datos.taller_id),
        monto:               datos.monto,
        metodo_pago:         datos.metodo_pago,
        fecha_pago:          datos.fecha_pago,
        estado:              'pendiente',
        moneda:              datos.moneda              ?? 'PEN',
        notas:               datos.notas               ?? null,
        orden_produccion_id: datos.orden_produccion_id ? BigInt(datos.orden_produccion_id) : null,
        confeccion_id:       datos.confeccion_id       ? BigInt(datos.confeccion_id)       : null,
        registrado_por:      datos.registrado_por      ? BigInt(datos.registrado_por)      : null,
      },
    });
  },

  obtenerTodos: async (filtros?: FiltrosPagosTaller): Promise<pagos_taller[]> => {
    return prisma.pagos_taller.findMany({
      where: {
        ...(filtros?.taller_id && { taller_id: BigInt(filtros.taller_id) }),
        ...(filtros?.estado    && { estado:    filtros.estado }),
      },
      orderBy: { fecha_pago: 'asc' },
    });
  },

  registrarPago: async (
    pagoId:           bigint,
    monto:            Prisma.Decimal | number | string,
    fecha:            Date,
    metodo_pago:      MetodoPago,
    numero_operacion?: string,
  ): Promise<pagos_taller> => {
    const pago = await prisma.pagos_taller.findUnique({ where: { id: pagoId } });
    if (!pago) throw new Error('Pago no encontrado');

    return prisma.pagos_taller.update({
      where: { id: pagoId },
      data:  {
        monto,
        estado:          'pagado',
        metodo_pago,
        numero_operacion: numero_operacion ?? null,
        fecha_pago:       fecha,
      },
    });
  },

  obtenerPendientes: async (tallerId: bigint): Promise<pagos_taller[]> => {
    return prisma.pagos_taller.findMany({
      where:   { taller_id: tallerId, estado: 'pendiente' },
      orderBy: { fecha_pago: 'asc' },
    });
  },

  obtenerMontoTotalPendiente: async (tallerId: bigint): Promise<number> => {
    const pagos = await pagosTalleresService.obtenerPendientes(tallerId);
    return pagos.reduce((sum, p) => sum + Number(p.monto), 0);
  },
};