import { Pago } from '@/lib/schemas/pagosSchema';

export const pagosHelpers = {
  estaCompletado: (pago: Pago): boolean =>
    pago.estatus === 'COMPLETADO',

  estaPendiente: (pago: Pago): boolean =>
    pago.estatus === 'PENDIENTE',

  estaProcesando: (pago: Pago): boolean =>
    pago.estatus === 'PROCESANDO',

  estaRechazado: (pago: Pago): boolean =>
    pago.estatus === 'RECHAZADO',

  estaReembolsado: (pago: Pago): boolean =>
    pago.estatus === 'REEMBOLSADO',

  agruparPorEstatus: (pagos: Pago[]) =>
    pagos.reduce((acc, curr) => {
      if (!acc[curr.estatus]) acc[curr.estatus] = [];
      acc[curr.estatus].push(curr);
      return acc;
    }, {} as Record<string, Pago[]>),

  agruparPorMetodo: (pagos: Pago[]) =>
    pagos.reduce((acc, curr) => {
      if (!acc[curr.metodoPago]) acc[curr.metodoPago] = [];
      acc[curr.metodoPago].push(curr);
      return acc;
    }, {} as Record<string, Pago[]>),

  obtenerMontoTotalCompletado: (pagos: Pago[]): number =>
    pagos
      .filter(p => pagosHelpers.estaCompletado(p))
      .reduce((sum, p) => sum + p.monto, 0),

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
