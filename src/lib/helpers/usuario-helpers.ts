import { getSupabaseBrowserClient } from "@/lib/supabase";

export type UsuarioRow = {
  id: number;
  nombre_completo: string;
  email: string;
  telefono: string | null;
  avatar_url: string | null;
  estado: string;
  rol: string;
  ultimo_acceso: string;
};

/**
 * Helper para actualizar usuarios sin problemas de tipado
 */
export async function updateUsuario(
  userId: number,
  data: Partial<UsuarioRow>
) {
  const supabase = getSupabaseBrowserClient();
  
  const { error } = await supabase
    .from('usuarios')
    .update(data as never)
    .eq('id', userId);

  return { error };
}

/**
 * Helper para obtener datos del usuario
 */
export async function getUsuarioData(userId: number) {
  const supabase = getSupabaseBrowserClient();
  
  const { data, error } = await supabase
    .from('usuarios')
    .select('nombre_completo, email, telefono, avatar_url, created_at, ultimo_acceso, rol, estado')
    .eq('id', userId)
    .single();

  return { data, error };
}