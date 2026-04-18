import type { ApiResponse, Proveedor, ProveedorForm } from '@/lib/schemas/proveedor';

const API = '/api/admin/proveedores';

export async function fetchProveedores(
  page: number,
  limit: number,
  busqueda: string,
  estado: string,
): Promise<ApiResponse> {
  const params = new URLSearchParams({
    page:  String(page),
    limit: String(limit),
    ...(busqueda && { busqueda }),
    ...(estado   && { estado }),
  });
  const res = await fetch(`${API}?${params}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar proveedores');
  return res.json();
}

export async function saveProveedor(data: ProveedorForm): Promise<ApiResponse<Proveedor>> {
  const res = await fetch(API, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  });
  return res.json();
}

export async function deactivateProveedor(id: string): Promise<ApiResponse> {
  const res = await fetch(`${API}?id=${id}`, { method: 'DELETE' });
  return res.json();
}