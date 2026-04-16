export type UsuarioData = {
  id: number;
  email: string;
  rol: 'administrador' | 'cortador' | 'disenador' | 'recepcionista' | 'ayudante' | 'representante_taller' | 'cliente' | 'gerente' | null;
  estado: 'activo' | 'inactivo' | 'suspendido' | null;
  created_at: string | null;
  updated_at: string | null;
  ultimo_acceso: string | null;
  auth_id: string | null;
  created_by: string | null;
  personal_interno_id: number | null;
  personal_interno?: { nombre_completo: string; telefono: number | null, dni: number | null  }[];
  nombre_completo: string | null;
  telefono: number | null;
  dni: number | null;
};


export interface ProfileState {
  // Form data
  nombreCompleto: string;
  email: string;
  telefono: string | number | null;
  dni: string | number | null;
  avatarUrl: string;

  // Password change
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  showPasswordSection: boolean;

  // Password visibility
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;

  // UI state
  isLoading: boolean;
  isSaving: boolean;
  uploadingImage: boolean;

  // Feedback
  success: string;
  error: string;
}

export type ProfileAction =
  | { type: 'SET_FIELD'; field: keyof ProfileState; value: any }
  | { type: 'SET_PROFILE_DATA'; data: Partial<UsuarioData> }
  | { type: 'RESET_PASSWORD_FIELDS' }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_SAVING'; saving: boolean }
  | { type: 'SET_UPLOADING'; uploading: boolean }
  | { type: 'SET_SUCCESS'; message: string }
  | { type: 'SET_ERROR'; message: string }
  | { type: 'CLEAR_FEEDBACK' };
