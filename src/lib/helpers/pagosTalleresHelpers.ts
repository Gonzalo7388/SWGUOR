import { PagoTaller } from '@/lib/schemas/pagosTalleresSchema';

export const pagosTalleresHelpers = {
  obtenerMontoPendiente: (pago: PagoTaller): number =>
    pago.montoTotal - pago.montoPagado,

  estaCompleto: (pago: PagoTaller): boolean =>
    pago.montoPagado >= pago.montoTotal,

  estaAtrasado: (pago: PagoTaller): boolean =>
    new Date() > pago.fechaProgramada && !pagosTalleresHelpers.estaCompleto(pago),

  obtenerPorcentajePagado: (pago: PagoTaller): number =>
    (pago.montoPagado / pago.montoTotal) * 100,

  agruparPorEstatus: (pagos: PagoTaller[]) =>
    pagos.reduce((acc, curr) => {
      if (!acc[curr.estatus]) acc[curr.estatus] = [];
      acc[curr.estatus].push(curr);
      return acc;
    }, {} as Record<string, PagoTaller[]>),

  obtenerMontoTotalPendiente: (pagos: PagoTaller[]): number =>
    pagos
      .filter(p => p.estatus === 'PENDIENTE' || p.estatus === 'PARCIAL')
      .reduce((sum, p) => sum + pagosTalleresHelpers.obtenerMontoPendiente(p), 0),

  obtenerMontoTotalPagado: (pagos: PagoTaller[]): number =>
    pagos.reduce((sum, p) => sum + p.montoPagado, 0),

  filtrarAtrasados: (pagos: PagoTaller[]) =>
    pagos.filter(p => pagosTalleresHelpers.estaAtrasado(p)),

  calcularPromedioDeuda: (pagos: PagoTaller[]): number => {
    const incompletos = pagos.filter(p => !pagosTalleresHelpers.estaCompleto(p));
    if (incompletos.length === 0) return 0;
    return pagosTalleresHelpers.obtenerMontoTotalPendiente(incompletos) / incompletos.length;
  },
};
