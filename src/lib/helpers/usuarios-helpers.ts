import { createClient } from '@/lib/supabase/client';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import type { Database } from '@/types/database';

// ─── Tipos ────────────────────────────────────────────────────────────────────
type EstadoUsuario = Database['public']['Enums']['EstadoUsuario'];
type Rol = Database['public']['Enums']['Rol'];

type UsuarioUpdate = {
  email?: string;
  estado?: EstadoUsuario | null;
  rol?: Rol | null;
  updated_at?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const getUsuarioData = async (userId: string) => {
  const supabase = getSupabaseBrowserClient();
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select(`
        id,
        email,
        rol,
        estado,
        created_at,
        updated_at,
        ultimo_acceso,
        auth_id,
        created_by,
        personal_interno (
           id,
            nombre_completo,
            dni,
            cargo,
            telefono
          )
      `)
      .eq("auth_id", userId)
      .single();

    if (error) throw error;

    const flattened = data ? {
      ...data,
      nombre_completo: (data.personal_interno as any)?.[0]?.nombre_completo ?? '',
      personal_interno_id: (data.personal_interno as any)?.[0]?.id ?? null,
      telefono: (data.personal_interno as any)?.[0]?.telefono ?? null,
      dni: (data.personal_interno as any)?.[0]?.dni ?? null,
    } : null;

    return { data: flattened, error: null };
  } catch (error: any) {
    console.error("Error en getUsuarioData:", error.message);
    return { data: null, error };
  }
};

export const updateUsuario = async (
  userId: string,
  updates: UsuarioUpdate
) => {
  const supabase = getSupabaseBrowserClient();
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .update(updates)
      .eq("auth_id", userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Error en updateUsuario:", error.message);
    return { data: null, error };
  }
};

export const updatePersonalInterno = async (
  personalInternoId: number | bigint,
  updates: { nombre_completo?: string }
) => {
  const supabase = getSupabaseBrowserClient();
  try {
    const { data, error } = await supabase
      .from("personal_interno")
      .update(updates)
      .eq("id", Number(personalInternoId))
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Error en updatePersonalInterno:", error.message);
    return { data: null, error };
  }
};

export const obtenerPerfilUsuario = async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: perfil } = await supabase
    .from('usuarios')
    .select(`
      *,
      personal_interno (
        id,
        nombre_completo
      )
    `)
    .eq('auth_id', user.id)
    .single();

  return perfil; // sin cast forzado
};

export const obtenerClienteAsociado = async (userId: string) => {
  const supabase = createClient();

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('id')
    .eq('auth_id', userId)
    .single();

  if (!usuario) return null;

  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('usuario_id', usuario.id)
    .single();

  if (error) {
    console.error("Error al obtener cliente:", error.message);
    return null;
  }

  return data;
};