import { Pago } from '@/lib/schemas/pagos';

export const pagosHelpers = {
  estaCompletado: (pago: Pago): boolean =>
    pago.estado === 'verificado',

  estaPendiente: (pago: Pago): boolean =>
    pago.estado === 'pendiente',

  estaProcesando: (pago: Pago): boolean =>
    pago.estado === 'pendiente',

  estaRechazado: (pago: Pago): boolean =>
    pago.estado === 'rechazado',

  estaReembolsado: (pago: Pago): boolean =>
    pago.estado === 'rechazado',

  agruparPorEstatus: (pagos: Pago[]) =>
    pagos.reduce((acc, curr) => {
      if (!acc[curr.estado]) acc[curr.estado] = [];
      acc[curr.estado].push(curr);
      return acc;
    }, {} as Record<string, Pago[]>),

  agruparPorMetodo: (pagos: Pago[]) =>
    pagos.reduce((acc, curr) => {
      if (!acc[curr.metodo_pago]) acc[curr.metodo_pago] = [];
      acc[curr.metodo_pago].push(curr);
      return acc;
    }, {} as Record<string, Pago[]>),

  obtenerMontoTotalCompletado: (pagos: Pago[]): number =>
    pagos
      .filter(p => pagosHelpers.estaCompletado(p))
      .reduce((sum, p) => sum + (typeof p.monto === 'number' ? p.monto : Number(p.monto)), 0),

  obtenerMontoTotalPendiente: (pagos: Pago[]): number =>
    pagos
      .filter(p => pagosHelpers.estaPendiente(p) || pagosHelpers.estaProcesando(p))
      .reduce((sum, p) => sum + p.monto, 0),

  obtenerTasaExito: (pagos: Pago[]): number => {
    if (pagos.length === 0) return 0;
    const completados = pagos.filter(p => pagosHelpers.estaCompletado(p)).length;
    return (completados / pagos.length) * 100;
  },

  filtrarCompletados: (pagos: Pago[]) =>
    pagos.filter(p => pagosHelpers.estaCompletado(p)),

  filtrarRechazados: (pagos: Pago[]) =>
    pagos.filter(p => pagosHelpers.estaRechazado(p)),

  calcularPromedioPago: (pagos: Pago[]): number => {
    if (pagos.length === 0) return 0;
    return pagos.reduce((sum, p) => sum + p.monto, 0) / pagos.length;
  },

  obtenerResumenFinanciero: (pagos: Pago[]) => ({
    total: pagos.reduce((sum, p) => sum + p.monto, 0),
    completado: pagosHelpers.obtenerMontoTotalCompletado(pagos),
    pendiente: pagosHelpers.obtenerMontoTotalPendiente(pagos),
    rechazado: pagos
      .filter(p => pagosHelpers.estaRechazado(p))
      .reduce((sum, p) => sum + p.monto, 0),
    tasaExito: pagosHelpers.obtenerTasaExito(pagos),
  }),
};
