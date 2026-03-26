export type EstadoCotizacion = 'borrador' | 'pendiente' | 'aceptada' | 'rechazada' | 'expirada' | 'convertida';
export type EstadoOrden = 'solicitado' | 'cotizado' | 'aprobado' | 'pagado' | 'en_proceso' | 'finalizado' | 'cancelado';
export type EstadoDespacho = 'pendiente' | 'preparando' | 'en_ruta' | 'entregado' | 'incidencia';

export interface ClienteB2B {
  id: string;
  razonSocial: string;
  ruc: string;
  tipo: 'corporativo' | 'distribuidor' | 'minorista';
  email: string;
}

export interface ProductoPortal {
  id: string;
  nombre: string;
  sku: string;
  precioBase: number;
  stockActual: number;
  categoria: string;
}