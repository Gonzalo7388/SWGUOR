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

/** Carga todos los proveedores activos paginando (máx. 100 por página en API) */
export async function fetchAllProveedoresActivos(): Promise<
  Array<{ id: string; razon_social: string; ruc: string }>
> {
  const all: Array<{ id: string; razon_social: string; ruc: string }> = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const res = await fetchProveedores(page, 100, '', 'activo');
    const batch = (res.data ?? []) as Array<{
      id: string | number;
      razon_social: string;
      ruc: string;
    }>;
    all.push(
      ...batch.map((p) => ({
        id: String(p.id),
        razon_social: p.razon_social,
        ruc: p.ruc,
      })),
    );
    totalPages = res.pagination?.totalPages ?? 1;
    page += 1;
  }

  return all;
}

export async function saveProveedor(data: ProveedorForm): Promise<ApiResponse<Proveedor>> {
  const res = await fetch(API, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  });
  const json = (await res.json()) as ApiResponse<Proveedor>;
  if (!res.ok && json.success !== true) {
    return {
      success: false,
      data: json.data,
      error: json.error || 'Error al guardar proveedor',
    };
  }
  return json;
}

export async function deactivateProveedor(id: string): Promise<ApiResponse> {
  const res = await fetch(`${API}?id=${id}`, { method: 'DELETE' });
  return res.json();
}