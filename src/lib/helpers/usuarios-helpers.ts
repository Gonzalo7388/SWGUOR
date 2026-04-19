import type { ApiResponse } from '@/lib/schemas/usuarios';

const API = '/api/admin/usuarios';

export async function fetchUsuarios(): Promise<any[]> {
  const res = await fetch(API, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar usuarios');
  const result = await res.json();
  return result.data ?? [];
}

export async function fetchUsuarioById(id: string): Promise<any> {
  const res = await fetch(`${API}/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Usuario no encontrado');
  const result = await res.json();
  return result.data;
}

export async function createUsuario(data: {
  email:    string;
  rol:      string;
  estado?:  string;
  password: string;
  personal?: {
    dni:             number;
    nombre_completo: string;
    cargo:           string;
    telefono?:       number;
    fecha_ingreso?:  string;
  };
}): Promise<ApiResponse> {
  const res = await fetch(API, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  });
  return res.json();
}

// ← email agregado al tipo para compatibilidad con perfil/page.tsx
export async function updateUsuario(
  id: string,
  data: Partial<{
    rol:    string;
    estado: string;
    email:  string;
    personal: {
      dni?:             number;
      nombre_completo?: string;
      cargo?:           string;
      telefono?:        number;
      fecha_ingreso?:   string;
      estado?:          boolean;
    };
  }>
): Promise<{ error: any }> {
  try {
    const res = await fetch(`${API}/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    });
    const result = await res.json();
    if (!result.success) return { error: result.error ?? 'Error al actualizar' };
    return { error: null };
  } catch (error) {
    return { error };
  }
}

export async function toggleEstadoUsuario(
  id: string,
  estado: 'activo' | 'inactivo' | 'suspendido'
): Promise<ApiResponse> {
  const res = await fetch(`${API}/${id}`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ estado }),
  });
  return res.json();
}

export async function deleteUsuario(id: string): Promise<ApiResponse> {
  const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
  return res.json();
}

// ← retorna { data, error } para compatibilidad con perfil/page.tsx
export async function getUsuarioData(_authId?: string): Promise<{ data: any; error: any }> {
  try {
    const res = await fetch(`${API}/me`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al obtener datos del usuario');
    const result = await res.json();
    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// ← retorna { error } para compatibilidad con perfil/page.tsx
export async function updatePersonalInterno(
  usuarioId: string,
  data: Partial<{
    nombre_completo: string;
    dni:             number;
    cargo:           string;
    telefono:        number;
    fecha_ingreso:   string;
    estado:          boolean;
  }>
): Promise<{ error: any }> {
  try {
    const res = await fetch(`${API}/${usuarioId}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ personal: data }),
    });
    const result = await res.json();
    if (!result.success) return { error: result.error ?? 'Error al actualizar' };
    return { error: null };
  } catch (error) {
    return { error };
  }
}