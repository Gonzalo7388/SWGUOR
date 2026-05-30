import type { EstadoPedido } from '@prisma/client';

const TRANSICIONES_VALIDAS: Partial<Record<EstadoPedido, EstadoPedido[]>> = {
  pendiente: ['en_produccion'],
  pagado: ['en_produccion'],
  en_produccion: ['listo_para_despacho'],
  listo_para_despacho: ['entregado'],
};

export function obtenerEstadosSiguientes(
  estadoActual: EstadoPedido | string | null | undefined,
): EstadoPedido[] {
  const key = (estadoActual ?? 'pendiente') as EstadoPedido;
  return TRANSICIONES_VALIDAS[key] ?? [];
}

export function puedeTransicionar(
  desde: EstadoPedido | string | null | undefined,
  hacia: EstadoPedido | string,
): boolean {
  return obtenerEstadosSiguientes(desde).includes(hacia as EstadoPedido);
}
