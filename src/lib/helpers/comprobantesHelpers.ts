import { Comprobante } from '@/lib/schemas/comprobantesSchema';

export const comprobantesHelpers = {
  estaPagada: (comprobante: Comprobante): boolean =>
    comprobante.estado === 'PAGADA',

  estaVencida: (comprobante: Comprobante): boolean =>
    comprobante.estado === 'VENCIDA' || new Date() > comprobante.fechaVencimiento,

  estaPendiente: (comprobante: Comprobante): boolean =>
    comprobante.estado === 'EMITIDA' || comprobante.estado === 'ENVIADA',

  estaAnulada: (comprobante: Comprobante): boolean =>
    comprobante.estado === 'ANULADA',

  esFactura: (comprobante: Comprobante): boolean =>
    comprobante.tipo === 'FACTURA',

  esBoleta: (comprobante: Comprobante): boolean =>
    comprobante.tipo === 'BOLETA',

  tieneValidacionSUNAT: (comprobante: Comprobante): boolean =>
    !!comprobante.sunatRespuesta && !!comprobante.cdrUrl,

  agruparPorTipo: (comprobantes: Comprobante[]) =>
    comprobantes.reduce((acc, curr) => {
      if (!acc[curr.tipo]) acc[curr.tipo] = [];
      acc[curr.tipo].push(curr);
      return acc;
    }, {} as Record<string, Comprobante[]>),

  agruparPorEstado: (comprobantes: Comprobante[]) =>
    comprobantes.reduce((acc, curr) => {
      if (!acc[curr.estado]) acc[curr.estado] = [];
      acc[curr.estado].push(curr);
      return acc;
    }, {} as Record<string, Comprobante[]>),

  obtenerMontoTotalPendiente: (comprobantes: Comprobante[]): number =>
    comprobantes
      .filter(c => comprobantesHelpers.estaPendiente(c))
      .reduce((sum, c) => sum + c.montoTotal, 0),

  calcularDiasAlVencimiento: (comprobante: Comprobante): number => {
    const hoy = new Date();
    const msRestantes = comprobante.fechaVencimiento.getTime() - hoy.getTime();
    return Math.ceil(msRestantes / (1000 * 60 * 60 * 24));
  },

  generarNumeroSecuencial: (serie: string, numero: number): string =>
    `${serie}-${numero.toString().padStart(8, '0')}`,

  filtrarVencidas: (comprobantes: Comprobante[]) =>
    comprobantes.filter(c => comprobantesHelpers.estaVencida(c)),

  obtenerMontoAcumulado: (comprobantes: Comprobante[]): number =>
    comprobantes.reduce((sum, c) => sum + c.montoTotal, 0),
};
