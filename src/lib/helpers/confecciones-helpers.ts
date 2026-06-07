import type { ConfeccionOutput } from '@/lib/schemas/confecciones';

const API = '/api/admin/confecciones';
const SEG_API = '/api/admin/seguimiento-confeccion';

export async function fetchConfecciones(params?: {
  estado?: string;
  taller_id?: string;
  pedido_id?: string;
}): Promise<any[]> {
  const query = new URLSearchParams();
  if (params?.estado && params.estado !== 'todos') query.set('estado', params.estado);
  if (params?.taller_id && params.taller_id !== 'todos') query.set('taller_id', params.taller_id);
  if (params?.pedido_id) query.set('pedido_id', params.pedido_id);

  const res = await fetch(`${API}?${query.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar confecciones');
  return res.json();
}

export async function fetchConfeccionById(id: string): Promise<any> {
  const res = await fetch(`${API}/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Confección no encontrada');
  return res.json();
}

export async function createConfeccion(data: ConfeccionOutput): Promise<any> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? 'Error al crear confección');
  }
  return res.json();
}

// ─── Actualiza estado + registra seguimiento en una sola llamada ───────────────
// Llama POST /api/admin/confecciones/[id] que invoca ConfeccionesService.actualizarEstado
// (transacción: update estado + create seguimiento_confeccion)
export async function updateEstadoConfeccion(
  id: string,
  estado: string,
  notas?: string,
): Promise<any> {
  const res = await fetch(`${API}/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado, notas }),
  });
  if (!res.ok) throw new Error('Error al actualizar estado');
  return res.json();
}

// ─── Ya no es necesario llamarlo manualmente desde el detalle ─────────────────
// updateEstadoConfeccion ya crea el seguimiento internamente.
// Se mantiene por si se usa en otros contextos.
export async function registrarSeguimientoConfeccion(data: {
  confeccion_id: string;
  estado_anterior: string;
  estado_nuevo: string;
  notas?: string;
}): Promise<any> {
  const res = await fetch(SEG_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al registrar seguimiento');
  return res.json();
}

export async function fetchSeguimientosConfeccion(confeccion_id: string): Promise<any[]> {
  const res = await fetch(`${SEG_API}?confeccion_id=${confeccion_id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar seguimientos');
  const result = await res.json();
  return result.data ?? [];
}