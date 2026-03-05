/**
 * Constantes de Estados para el Sistema GUOR v2
 * Define los estados posibles y sus propiedades (etiquetas, colores, iconos)
 */

import type {
  EstadoPedido,
  EstadoOrden,
  EstadoCliente,
  EstadoProducto,
  EstadoConfeccion,
  EstadoDespacho,
  EstadoTaller,
  EstadoUsuario
} from '@/types';

/**
 * Estados de Órdenes
 */
export const ESTADOS_ORDEN: Record<EstadoOrden, { label: string; color: string; bgColor: string }> = {
  solicitado: {
    label: 'Solicitado',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100'
  },
  cotizado: {
    label: 'Cotizado',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100'
  },
  aprobado: {
    label: 'Aprobado',
    color: 'text-green-700',
    bgColor: 'bg-green-100'
  },
  pagado: {
    label: 'Pagado',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100'
  },
  en_proceso: {
    label: 'En Proceso',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100'
  },
  finalizado: {
    label: 'Finalizado',
    color: 'text-teal-700',
    bgColor: 'bg-teal-100'
  },
  cancelado: {
    label: 'Cancelado',
    color: 'text-red-700',
    bgColor: 'bg-red-100'
  }
};

/**
 * Estados de Pedidos
 */
export const ESTADOS_PEDIDO: Record<EstadoPedido, { label: string; color: string; bgColor: string }> = {
  pendiente: {
    label: 'Pendiente',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100'
  },
  corte: {
    label: 'En Corte',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100'
  },
  costura: {
    label: 'En Costura',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-100'
  },
  acabado: {
    label: 'En Acabado',
    color: 'text-violet-700',
    bgColor: 'bg-violet-100'
  },
  completado: {
    label: 'Completado',
    color: 'text-green-700',
    bgColor: 'bg-green-100'
  },
  cancelado: {
    label: 'Cancelado',
    color: 'text-red-700',
    bgColor: 'bg-red-100'
  }
};

/**
 * Estados de Clientes
 */
export const ESTADOS_CLIENTE: Record<EstadoCliente, { label: string; color: string; bgColor: string }> = {
  activo: {
    label: 'Activo',
    color: 'text-green-700',
    bgColor: 'bg-green-100'
  },
  inactivo: {
    label: 'Inactivo',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100'
  },
  suspendido: {
    label: 'Suspendido',
    color: 'text-red-700',
    bgColor: 'bg-red-100'
  },
  potencial: {
    label: 'Potencial',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100'
  }
};

/**
 * Estados de Productos
 */
export const ESTADOS_PRODUCTO: Record<EstadoProducto, { label: string; color: string; bgColor: string }> = {
  activo: {
    label: 'Activo',
    color: 'text-green-700',
    bgColor: 'bg-green-100'
  },
  inactivo: {
    label: 'Inactivo',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100'
  },
  agotado: {
    label: 'Agotado',
    color: 'text-red-700',
    bgColor: 'bg-red-100'
  },
  descontinuado: {         
    label: 'Descontinuado',
    color: 'text-slate-700',
    bgColor: 'bg-slate-100'
  }
};

/**
 * Estados de Confecciones
 */
export const ESTADOS_CONFECCION: Record<EstadoConfeccion, { label: string; color: string; bgColor: string }> = {
  corte: {
    label: 'En Corte',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100'
  },
  confeccionando: {
    label: 'Confeccionando',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100'
  },
  remallado: {
    label: 'Remallado',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100'
  },
  terminado: {
    label: 'Terminado',
    color: 'text-green-700',
    bgColor: 'bg-green-100'
  }
};

/**
 * Estados de Despachos
 */
export const ESTADOS_DESPACHO: Record<EstadoDespacho, { label: string; color: string; bgColor: string }> = {
  pendiente: {
    label: 'Pendiente',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100'
  },
  en_ruta: {
    label: 'En Ruta',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100'
  },
  entregado: {
    label: 'Entregado',
    color: 'text-green-700',
    bgColor: 'bg-green-100'
  }
};

/**
 * Estados de Talleres
 */
export const ESTADOS_TALLER: Record<EstadoTaller, { label: string; color: string; bgColor: string }> = {
  activo: {
    label: 'Activo',
    color: 'text-green-700',
    bgColor: 'bg-green-100'
  },
  inactivo: {
    label: 'Inactivo',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100'
  },
  suspendido: {
    label: 'Suspendido',
    color: 'text-red-700',
    bgColor: 'bg-red-100'
  }
};

/**
 * Estados de Usuarios
 */
export const ESTADOS_USUARIO: Record<EstadoUsuario, { label: string; color: string; bgColor: string }> = {
  activo: {
    label: 'Activo',
    color: 'text-green-700',
    bgColor: 'bg-green-100'
  },
  inactivo: {
    label: 'Inactivo',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100'
  },
  suspendido: {
    label: 'Suspendido',
    color: 'text-red-700',
    bgColor: 'bg-red-100'
  }
};

/**
 * Función auxiliar para obtener los datos de un estado
 */
export function getEstadoInfo(
  estado: string,
  tipoEstado: 'orden' | 'pedido' | 'cliente' | 'producto' | 'confeccion' | 'despacho' | 'taller' | 'usuario'
): { label: string; color: string; bgColor: string } | null {
  const estadosMap: Record<string, Record<string, any>> = {
    orden: ESTADOS_ORDEN,
    pedido: ESTADOS_PEDIDO,
    cliente: ESTADOS_CLIENTE,
    producto: ESTADOS_PRODUCTO,
    confeccion: ESTADOS_CONFECCION,
    despacho: ESTADOS_DESPACHO,
    taller: ESTADOS_TALLER,
    usuario: ESTADOS_USUARIO
  };

  return estadosMap[tipoEstado]?.[estado] || null;
}

/**
 * Obtener lista de estados válidos
 */
export const LISTA_ESTADOS_ORDEN = Object.keys(ESTADOS_ORDEN) as EstadoOrden[];
export const LISTA_ESTADOS_PEDIDO = Object.keys(ESTADOS_PEDIDO) as EstadoPedido[];
export const LISTA_ESTADOS_CLIENTE = Object.keys(ESTADOS_CLIENTE) as EstadoCliente[];
export const LISTA_ESTADOS_PRODUCTO = Object.keys(ESTADOS_PRODUCTO) as EstadoProducto[];
