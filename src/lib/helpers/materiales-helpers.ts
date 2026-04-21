const API       = '/api/admin/materiales';
const STOCK_API = '/api/admin/materiales';

export async function fetchMateriales(params?: {
  tipo?:      string;
  busqueda?:  string;
  stockBajo?: boolean;
}): Promise<any[]> {
  const query = new URLSearchParams();
  if (params?.tipo      && params.tipo !== 'todos') query.set('tipo',      params.tipo);
  if (params?.busqueda)                              query.set('busqueda',  params.busqueda);
  if (params?.stockBajo)                             query.set('stockBajo', 'true');

  const res = await fetch(`${API}?${query.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar materiales');
  const result = await res.json();
  return result.data ?? [];
}

export async function fetchMaterialById(id: string): Promise<any> {
  const res = await fetch(`${API}/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Material no encontrado');
  const result = await res.json();
  return result.data;
}

export async function createMaterial(data: any) {
  const res = await fetch(API, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  });
  return res.json();
}

export async function updateMaterial(id: string, data: any) {
  const res = await fetch(API, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ id, ...data }),
  });
  return res.json();
}

export async function deleteMaterial(id: string) {
  const res = await fetch(`${API}?id=${id}`, { method: 'DELETE' });
  return res.json();
}

export async function ajustarStockMaterial(
  id: string,
  data: { operacion: 'sumar' | 'restar' | 'absoluto'; cantidad: number; motivo?: string }
) {
  const res = await fetch(`${STOCK_API}/${id}/stock`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  });
  return res.json();
}