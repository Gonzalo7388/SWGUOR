export type UsuarioData = {
  id: number | string | bigint; // Permitir flexibilidad por BigInt
  email: string;
  rol: 'administrador' | 'cortador' | 'disenador' | 'recepcionista' | 'ayudante' | 'representante_taller' | 'cliente' | 'gerente' | null;
  estado: 'activo' | 'inactivo' | 'suspendido' | null;
  created_at: string | null;
  updated_at: string | null;
  ultimo_acceso: string | null;
  auth_id: string | null;
  created_by: string | null;
  
  // IMPORTANTE: Cambiamos para que acepte tanto el objeto aplanado como el array original
  personal_interno_id?: number | string | bigint | null;
  personal_interno?: any; // Cambiado a 'any' o a un objeto único para evitar conflictos de Array
  
  // Campos aplanados que inyectamos en el helper
  nombre_completo?: string | null;
  telefono?: number | string | bigint | null;
  dni?: number | string | bigint | null;
  
  // Relación con clientes por si el usuario es un cliente
  clientes?: any;
};

export interface ProfileState {
  nombreCompleto: string;
  email: string;
  telefono: string; // Mejor manejar siempre como string en el estado del formulario
  dni: string;     // Mejor manejar siempre como string en el estado del formulario
  avatarUrl: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  showPasswordSection: boolean;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  isLoading: boolean;
  isSaving: boolean;
  uploadingImage: boolean;
  success: string;
  error: string;
}

export type ProfileAction =
  | { type: 'SET_FIELD'; field: keyof ProfileState; value: any }
  | { type: 'SET_PROFILE_DATA'; data: any } // Cambiado a any para evitar el error de overlap
  | { type: 'RESET_PASSWORD_FIELDS' }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_SAVING'; saving: boolean }
  | { type: 'SET_UPLOADING'; uploading: boolean }
  | { type: 'SET_SUCCESS'; message: string }
  | { type: 'SET_ERROR'; message: string }
  | { type: 'CLEAR_FEEDBACK' };