import { OrdenCompra } from '@/lib/schemas/ordenesCompraSchema';

export const ordenesCompraHelpers = {
  estaPendiente: (orden: OrdenCompra): boolean =>
    orden.estatus === 'BORRADOR' || orden.estatus === 'EMITIDA',

  estaAprobada: (orden: OrdenCompra): boolean =>
    orden.estatus === 'ACEPTADA',

  estaRecibida: (orden: OrdenCompra): boolean =>
    orden.estatus === 'RECIBIDA',

  estaCancelada: (orden: OrdenCompra): boolean =>
    orden.estatus === 'CANCELADA' || orden.estatus === 'RECHAZADA',

  estaVencida: (orden: OrdenCompra): boolean =>
    new Date() > orden.fechaVencimiento && orden.estatus !== 'RECIBIDA',

  agruparPorEstatus: (ordenes: OrdenCompra[]) =>
    ordenes.reduce((acc, curr) => {
      if (!acc[curr.estatus]) acc[curr.estatus] = [];
      acc[curr.estatus].push(curr);
      return acc;
    }, {} as Record<string, OrdenCompra[]>),

  obtenerMontoTotalPendiente: (ordenes: OrdenCompra[]): number =>
    ordenes
      .filter(o => !ordenesCompraHelpers.estaRecibida(o))
      .reduce((sum, o) => sum + o.montoTotal, 0),

  obtenerMontoTotalRecibido: (ordenes: OrdenCompra[]): number =>
    ordenes
      .filter(o => ordenesCompraHelpers.estaRecibida(o))
      .reduce((sum, o) => sum + o.montoTotal, 0),

  filtrarVencidas: (ordenes: OrdenCompra[]) =>
    ordenes.filter(o => ordenesCompraHelpers.estaVencida(o)),

  obtenerDiasRestantes: (orden: OrdenCompra): number => {
    const hoy = new Date();
    const msRestantes = orden.fechaVencimiento.getTime() - hoy.getTime();
    return Math.ceil(msRestantes / (1000 * 60 * 60 * 24));
  },

  obtenerProveedor: (orden: OrdenCompra): string => orden.proveedorId,

  agruparPorProveedor: (ordenes: OrdenCompra[]) =>
    ordenes.reduce((acc, curr) => {
      if (!acc[curr.proveedorId]) acc[curr.proveedorId] = [];
      acc[curr.proveedorId].push(curr);
      return acc;
    }, {} as Record<string, OrdenCompra[]>),
};
