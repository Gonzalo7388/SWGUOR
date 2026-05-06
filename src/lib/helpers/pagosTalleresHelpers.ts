import { PagoTaller } from '@/lib/schemas/pagosTalleresSchema';

export const pagosTalleresHelpers = {
  estaPendiente: (pago: PagoTaller): boolean =>
    pago.estado === 'pendiente',

  estaPagado: (pago: PagoTaller): boolean =>
    pago.estado === 'pagado',

  estaAnulado: (pago: PagoTaller): boolean =>
    pago.estado === 'anulado',

  estaAtrasado: (pago: PagoTaller): boolean =>
    new Date() > pago.fecha_pago && pago.estado === 'pendiente',

  agruparPorEstado: (pagos: PagoTaller[]) =>
    pagos.reduce((acc, curr) => {
      if (!acc[curr.estado]) acc[curr.estado] = [];
      acc[curr.estado].push(curr);
      return acc;
    }, {} as Record<string, PagoTaller[]>),

  agruparPorMetodoPago: (pagos: PagoTaller[]) =>
    pagos.reduce((acc, curr) => {
      if (!acc[curr.metodo_pago]) acc[curr.metodo_pago] = [];
      acc[curr.metodo_pago].push(curr);
      return acc;
    }, {} as Record<string, PagoTaller[]>),

  obtenerMontoTotalPendiente: (pagos: PagoTaller[]): number =>
    pagos
      .filter(p => p.estado === 'pendiente')
      .reduce((sum, p) => sum + p.monto, 0),

  obtenerMontoTotalPagado: (pagos: PagoTaller[]): number =>
    pagos
      .filter(p => p.estado === 'pagado')
      .reduce((sum, p) => sum + p.monto, 0),

  obtenerMontoTotal: (pagos: PagoTaller[]): number =>
    pagos.reduce((sum, p) => sum + p.monto, 0),

  filtrarAtrasados: (pagos: PagoTaller[]) =>
    pagos.filter(p => pagosTalleresHelpers.estaAtrasado(p)),

  filtrarPendientes: (pagos: PagoTaller[]) =>
    pagos.filter(p => pagosTalleresHelpers.estaPendiente(p)),

  calcularPromedioDeuda: (pagos: PagoTaller[]): number => {
    const pendientes = pagos.filter(p => pagosTalleresHelpers.estaPendiente(p));
    if (pendientes.length === 0) return 0;
    return pagosTalleresHelpers.obtenerMontoTotalPendiente(pendientes) / pendientes.length;
  },
};
