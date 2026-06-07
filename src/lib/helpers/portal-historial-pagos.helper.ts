/** Estados de pago expuestos al portal en el historial de transacciones */
export type EstadoPagoHistorialPortal = 'pendiente' | 'parcial' | 'pagado';

export function resolverEstadoPagoHistorialPortal(
  montoPagado: number,
  saldoPendiente: number,
): EstadoPagoHistorialPortal {
  const pagado = Number(montoPagado);
  const saldo = Number(saldoPendiente);

  if (pagado > 0 && saldo <= 0) return 'pagado';
  if (pagado > 0 && saldo > 0) return 'parcial';
  return 'pendiente';
}
