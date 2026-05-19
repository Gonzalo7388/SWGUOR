import { OrdenCompra } from '@/lib/schemas/ordenes-compra';

export const ordenesCompraHelpers = {
  estaPendiente: (orden: OrdenCompra): boolean =>
    orden.estado === 'pendiente',

  estaAprobada: (orden: OrdenCompra): boolean =>
    orden.estado === 'confirmada',

  estaRecibida: (orden: OrdenCompra): boolean =>
    orden.estado === 'completada',

  estaCancelada: (orden: OrdenCompra): boolean =>
    orden.estado === 'cancelada',

  estaVencida: (orden: OrdenCompra): boolean => {
    if (!orden.fecha_prometida) return false;
    return new Date() > orden.fecha_prometida && orden.estado !== 'completada';
  },

  agruparPorEstatus: (ordenes: OrdenCompra[]) =>
    ordenes.reduce((acc, curr) => {
      if (!acc[curr.estado]) acc[curr.estado] = [];
      acc[curr.estado].push(curr);
      return acc;
    }, {} as Record<string, OrdenCompra[]>),

  obtenerMontoTotalPendiente: (ordenes: OrdenCompra[]): number =>
    ordenes
      .filter(o => !ordenesCompraHelpers.estaRecibida(o))
      .reduce((sum, o) => sum + Number(o.total_orden), 0),

  obtenerMontoTotalRecibido: (ordenes: OrdenCompra[]): number =>
    ordenes
      .filter(o => ordenesCompraHelpers.estaRecibida(o))
      .reduce((sum, o) => sum + Number(o.total_orden), 0),

  filtrarVencidas: (ordenes: OrdenCompra[]) =>
    ordenes.filter(o => ordenesCompraHelpers.estaVencida(o)),

  obtenerDiasRestantes: (orden: OrdenCompra): number => {
    if (!orden.fecha_prometida) return 0;
    const hoy = new Date();
    const msRestantes = orden.fecha_prometida.getTime() - hoy.getTime();
    return Math.ceil(msRestantes / (1000 * 60 * 60 * 24));
  },

  obtenerProveedor: (orden: OrdenCompra): string => orden.proveedor_id.toString(),

  agruparPorProveedor: (ordenes: OrdenCompra[]) =>
    ordenes.reduce((acc, curr) => {
      const key = curr.proveedor_id.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(curr);
      return acc;
    }, {} as Record<string, OrdenCompra[]>),
};
