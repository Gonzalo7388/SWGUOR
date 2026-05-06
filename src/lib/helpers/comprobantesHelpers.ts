import { Comprobante } from '@/lib/schemas/comprobantesSchema';

export const comprobantesHelpers = {
  estaAceptada: (comprobante: Comprobante): boolean =>
    comprobante.estado_sunat === 'aceptado',

  estaRechazada: (comprobante: Comprobante): boolean =>
    comprobante.estado_sunat === 'rechazado',

  estaPendiente: (comprobante: Comprobante): boolean =>
    comprobante.estado_sunat === 'pendiente',

  estaEnviada: (comprobante: Comprobante): boolean =>
    comprobante.estado_sunat === 'enviado',

  esFactura: (comprobante: Comprobante): boolean =>
    comprobante.tipo === 'factura',

  esBoleta: (comprobante: Comprobante): boolean =>
    comprobante.tipo === 'boleta',

  tieneValidacionSUNAT: (comprobante: Comprobante): boolean =>
    !!comprobante.respuesta_sunat && !!comprobante.cdr_url,

  agruparPorTipo: (comprobantes: Comprobante[]) =>
    comprobantes.reduce((acc, curr) => {
      if (!acc[curr.tipo]) acc[curr.tipo] = [];
      acc[curr.tipo].push(curr);
      return acc;
    }, {} as Record<string, Comprobante[]>),

  agruparPorEstadoSUNAT: (comprobantes: Comprobante[]) =>
    comprobantes.reduce((acc, curr) => {
      if (!acc[curr.estado_sunat]) acc[curr.estado_sunat] = [];
      acc[curr.estado_sunat].push(curr);
      return acc;
    }, {} as Record<string, Comprobante[]>),

  obtenerMontoTotalPendiente: (comprobantes: Comprobante[]): number =>
    comprobantes
      .filter(c => comprobantesHelpers.estaPendiente(c))
      .reduce((sum, c) => sum + c.total, 0),

  generarNumeroSecuencial: (serie: string, numero: number): string =>
    `${serie}-${numero.toString().padStart(8, '0')}`,

  filtrarRechazadas: (comprobantes: Comprobante[]) =>
    comprobantes.filter(c => comprobantesHelpers.estaRechazada(c)),

  obtenerMontoAcumulado: (comprobantes: Comprobante[]): number =>
    comprobantes.reduce((sum, c) => sum + c.total, 0),

  obtenerTotal: (comprobantes: Comprobante[]): number =>
    comprobantes.reduce((sum, c) => sum + c.total, 0),
};
