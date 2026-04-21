export interface UsuarioConRelaciones {
  id: string;
  email: string;
  estado: string;
  rol: string | null;
  ultimo_acceso: string | null;
  created_at: string;
  auth_id: string | null;

  personal_interno?: {
    nombre_completo: string | null;
    cargo: string | null;
    dni: string | null;
  } | null;

  clientes?: {
    id: string;
    ruc: string;
    razon_social: string | null;
    activo: string;
  } | null;
}