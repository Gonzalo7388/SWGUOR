import type { ApiResponse, Taller, TallerForm } from '@/lib/schemas/talleres';

const API = '/api/admin/talleres';

export async function fetchTalleres(): Promise<Taller[]> {
  const res = await fetch(API, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar talleres');
  return res.json();
}

export async function createTaller(data: TallerForm): Promise<ApiResponse<Taller>> {
  const res = await fetch(API, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  });
  return res.json();
}

export async function updateTaller(id: string, data: Partial<TallerForm>): Promise<ApiResponse<Taller>> {
  const res = await fetch(API, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ id, ...data }),
  });
  return res.json();
}

export async function deactivateTaller(id: string): Promise<ApiResponse> {
  const res = await fetch(`${API}?id=${id}`, { method: 'DELETE' });
  return res.json();
}