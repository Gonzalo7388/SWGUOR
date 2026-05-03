const API = '/api/admin/precio-historico';

export async function fetchPrecioHistorico(producto_id?: string): Promise<any[]> {
  const query = producto_id ? `?producto_id=${producto_id}` : '';
  const res = await fetch(`${API}${query}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar histórico de precios');
  const result = await res.json();
  return result.data ?? [];
}

export async function createPrecioHistorico(data: {
  producto_id: string | number;
  precio: number;
  motivo?: string;
  vigente_desde: string;
  vigente_hasta?: string;
  creado_por?: string | number;
}): Promise<any> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updatePrecioHistorico(id: string, data: Partial<{
  producto_id: string | number;
  precio: number;
  motivo?: string;
  vigente_desde: string;
  vigente_hasta?: string;
  creado_por?: string | number;
}>): Promise<any> {
  const res = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deletePrecioHistorico(id: string): Promise<any> {
  const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
  return res.json();
}
