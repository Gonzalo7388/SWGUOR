import type { ApiResponse } from '@/lib/schemas/clientes';

const API = '/api/admin/clientes';

export async function fetchClientes(params?: {
  busqueda?:    string;
  tipo_cliente?: string;
  activo?:      string;
}): Promise<any[]> {
  const query = new URLSearchParams();
  if (params?.busqueda)     query.set('busqueda',     params.busqueda);
  if (params?.tipo_cliente) query.set('tipo_cliente', params.tipo_cliente);
  if (params?.activo)       query.set('activo',       params.activo);

  const res = await fetch(`${API}?${query.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar clientes');
  const result = await res.json();
  return result.data ?? [];
}

export async function fetchClienteById(id: string): Promise<any> {
  const res = await fetch(`${API}/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Cliente no encontrado');
  const result = await res.json();
  return result.data;
}

export async function updateCliente(
  id: string,
  data: Partial<{
    razon_social:    string;
    nombre_comercial: string;
    telefono:        string;
    email:           string;
    direccion_fiscal: string;
    tipo_cliente:    string;
  }>
): Promise<ApiResponse> {
  const res = await fetch(`${API}/${id}`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  });
  return res.json();
}

export async function desactivarCliente(id: string): Promise<ApiResponse> {
  const res = await fetch(`${API}/${id}`, {
    method:  'DELETE',
  });
  return res.json();
}