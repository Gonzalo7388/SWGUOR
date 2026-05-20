import type {
  ActualizarCotizacionProveedorInput,
  CrearCotizacionProveedorInput,
} from '@/lib/schemas/cotizaciones-proveedor';

const API = '/api/admin/cotizaciones-proveedor';

export interface ApiListResponse<T> {
  success: boolean;
  data?: T[];
  pagination?: { total: number; page: number; totalPages: number };
  error?: string;
}

export interface ApiItemResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function fetchCotizacionesProveedor(
  page: number,
  limit: number,
  busqueda: string,
  estado: string,
): Promise<ApiListResponse<Record<string, unknown>>> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(busqueda && { busqueda }),
    ...(estado && { estado }),
  });
  const res = await fetch(`${API}?${params}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar cotizaciones');
  return res.json();
}

export async function fetchCotizacionProveedorDetalle(
  id: string | number,
): Promise<ApiItemResponse<Record<string, unknown>>> {
  const res = await fetch(`${API}/${id}`, { cache: 'no-store' });
  return res.json();
}

export async function crearCotizacionProveedor(
  data: CrearCotizacionProveedorInput,
): Promise<ApiItemResponse<{ id: string | number }>> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function actualizarCotizacionProveedor(
  id: string | number,
  data: ActualizarCotizacionProveedorInput,
): Promise<ApiItemResponse<unknown>> {
  const res = await fetch(`${API}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function cambiarEstadoCotizacionProveedor(
  id: string | number,
  estado: string,
): Promise<ApiItemResponse<unknown>> {
  const res = await fetch(`${API}/${id}/estado`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado }),
  });
  return res.json();
}

export async function anularCotizacionProveedor(
  id: string | number,
): Promise<ApiItemResponse<unknown>> {
  const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function subirPdfCotizacionProveedor(
  id: string | number,
  file: File,
): Promise<ApiItemResponse<{ pdf_url: string }>> {
  const formData = new FormData();
  formData.append('pdf', file);
  const res = await fetch(`${API}/${id}/documento`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}
