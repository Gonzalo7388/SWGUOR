export interface AuditLog {
  id: string;
  usuario_id: string | null;
  accion: 'CREAR' | 'ACTUALIZAR' | 'ELIMINAR' | 'LOGIN' | 'LOGOUT' | 'EXPORTAR' | 'IMPORTAR';
  tabla: string;
  registro_id: string;
  datos_antes: any;
  datos_despues: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  usuarios: {
    email: string;
    personal_interno?: { nombre_completo: string }[];
  } | null;
}

export interface PaginationData {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
}
