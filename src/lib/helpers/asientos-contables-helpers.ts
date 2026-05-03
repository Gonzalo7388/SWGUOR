const API = '/api/admin/asientos-contables';

export async function fetchAsientosContables(filter?: {
  pedido_id?: string;
  pago_id?: string;
}): Promise<any[]> {
  const params = new URLSearchParams();
  if (filter?.pedido_id) params.append('pedido_id', filter.pedido_id);
  if (filter?.pago_id) params.append('pago_id', filter.pago_id);
  const res = await fetch(`${API}?${params.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar asientos contables');
  const result = await res.json();
  return result.data ?? [];
}

export async function createAsientoContable(data: {
  fecha?: string;
  tipo: 'debe' | 'haber';
  monto: number;
  cuenta: string;
  descripcion?: string;
  pedido_id?: string | number;
  pago_id?: string | number;
  usuario_id?: string | number;
}): Promise<any> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateAsientoContable(id: string, data: Partial<{
  fecha?: string;
  tipo?: 'debe' | 'haber';
  monto?: number;
  cuenta?: string;
  descripcion?: string;
  pedido_id?: string | number | null;
  pago_id?: string | number | null;
  usuario_id?: string | number | null;
}>): Promise<any> {
  const res = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteAsientoContable(id: string): Promise<any> {
  const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
  return res.json();
}
