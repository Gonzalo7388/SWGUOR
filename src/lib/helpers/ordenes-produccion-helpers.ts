import type { ApiResponse } from '@/lib/schemas/ordenes-produccion';

const API     = '/api/admin/ordenes-produccion';
const SEG_API = '/api/admin/seguimiento-produccion';

export async function fetchOrdenesProduccion(producto_id?: string): Promise<any[]> {
  const params = producto_id ? `?producto_id=${producto_id}` : '';
  const res    = await fetch(`${API}${params}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar órdenes');
  const result = await res.json();
  return result.data ?? [];
}

export async function createOrdenProduccion(data: {
  producto_id:         string | number;
  taller_id:           string | number;
  ficha_id:            string | number;
  cantidad_solicitada: number;
  fecha_entrega?:      string;
  notas?:              string;
}): Promise<ApiResponse> {
  const res = await fetch(API, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  });
  return res.json();
}

export async function updateOrdenProduccion(
  id: string,
  data: { estado?: string; fecha_entrega?: string; notas?: string }
): Promise<ApiResponse> {
  const res = await fetch(API, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ id, ...data }),
  });
  return res.json();
}

export async function registrarEtapaProduccion(data: {
  orden_id:     string;
  etapa:        string;
  observaciones?: string;
}): Promise<ApiResponse> {
  const res = await fetch(SEG_API, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  });
  return res.json();
}

export async function fetchSeguimientosProduccion(orden_id: string): Promise<any[]> {
  const res = await fetch(`${SEG_API}?orden_id=${orden_id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar seguimientos');
  const result = await res.json();
  return result.data ?? [];
}