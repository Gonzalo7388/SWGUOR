import { getSupabaseBrowserClient } from "@/lib/supabase";

const API = '/api/admin/usuarios';

// --- API ROUTES (Consumidos por el Panel Administrativo) ---

export async function fetchUsuarios(): Promise<any[]> {
  const res = await fetch(API, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar usuarios');
  return await res.json();
}

export async function fetchUsuarioById(id: string): Promise<any> {
  const res = await fetch(`${API}/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Usuario no encontrado');
  return await res.json();
}

export async function createUsuario(data: any): Promise<any> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) return { success: false, error: result.error };
  return { success: true, data: result };
}

export async function toggleEstadoUsuario(id: string, estado: string): Promise<any> {
  const res = await fetch(API, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, estado }),
  });
  const result = await res.json();
  if (!res.ok) return { success: false, error: result.error };
  return { success: true };
}

export async function deleteUsuario(id: string): Promise<any> {
  const res = await fetch(`${API}?id=${id}`, { method: 'DELETE' });
  const result = await res.json();
  if (!res.ok) return { success: false, error: result.error };
  return { success: true };
}

// --- DIRECT SUPABASE (Consumidos por la página de Perfil) ---

export const getUsuarioData = async (authId: string) => {
  const supabase = getSupabaseBrowserClient();
  
  const { data, error } = await supabase
    .from("usuarios")
    .select(`
      *,
      personal_interno (*),
      clientes (
        *,
        direcciones_cliente (*)
      )
    `)
    .eq("auth_id", authId)
    .single();

  if (error || !data) return { data: null, error };

  // Aplanamos la relación 1:N que Prisma/Supabase devuelve como array
  const pInterno = Array.isArray(data.personal_interno) ? data.personal_interno[0] : data.personal_interno;
  const cliente = Array.isArray(data.clientes) ? data.clientes[0] : data.clientes;

  const formattedData = {
    ...data,
    personal_interno: pInterno || null,
    clientes: cliente || null,
    personal_interno_id: pInterno?.id || null,
    nombre_completo: pInterno?.nombre_completo || cliente?.razon_social || "",
    dni: pInterno?.dni?.toString() || cliente?.ruc || "",
    telefono: pInterno?.telefono?.toString() || cliente?.telefono || ""
  };

  return { data: formattedData, error: null };
};

export const updatePersonalInterno = async (id: string, updates: any) => {
  const supabase = getSupabaseBrowserClient();
  return await supabase
    .from("personal_interno")
    .update(updates)
    .eq("id", Number(id));
};

export const updateUsuario = async (id: string, updates: any) => {
  const supabase = getSupabaseBrowserClient();
  return await supabase
    .from("usuarios")
    .update(updates)
    .eq("id", Number(id));
};