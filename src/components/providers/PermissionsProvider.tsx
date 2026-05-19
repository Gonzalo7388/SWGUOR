"use client";

import React, { createContext, useContext, useMemo } from 'react';
import { 
  RolUsuario, 
  RecursoKey, 
  AccionRecurso, 
  PermisosRecurso, 
  PERMISOS_RECURSO_POR_ROL 
} from '@/lib/constants/roles';

export interface UsuarioContext {
  id: number;
  email?: string;
  rol: RolUsuario;
  estado: string;
  auth_id?: string | null;
  ultimo_acceso?: string | null;
  created_at?: string;
}

export interface PermissionsContextType {
  usuario: UsuarioContext | null;
  role: RolUsuario | null;
  isAdmin: boolean;
  isLoading: boolean;
  permissions: PermisosRecurso;
  can: (accion: AccionRecurso, recurso: RecursoKey) => boolean;
  hasRole: (rol: RolUsuario | RolUsuario[]) => boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function PermissionsProvider({ 
  usuario, 
  isLoading = false,
  children 
}: { 
  usuario: UsuarioContext | null; 
  isLoading?: boolean;
  children: React.ReactNode 
}) {
  const role = useMemo(() => {
    if (!usuario?.rol) return null;
    // Normalizar rol si es necesario (ya viene normalizado del servidor usualmente)
    return usuario.rol as RolUsuario;
  }, [usuario?.rol]);

  const isAdmin = useMemo(() => 
    role === 'administrador' || role === 'gerente',
  [role]);
  
  const permissions = useMemo(() => {
    if (!role) return {};
    return PERMISOS_RECURSO_POR_ROL[role] || {};
  }, [role]);

  const can = (accion: AccionRecurso, recurso: RecursoKey): boolean => {
    return permissions[recurso]?.includes(accion) ?? false;
  };

  const hasRole = (rol: RolUsuario | RolUsuario[]): boolean => {
    if (!role) return false;
    return Array.isArray(rol) ? rol.includes(role) : role === rol;
  };

  const value = useMemo(() => ({
    usuario,
    role,
    isAdmin,
    isLoading,
    permissions,
    can,
    hasRole
  }), [usuario, role, isAdmin, isLoading, permissions]);

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissionsContext() {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    // Si no hay context, devolvemos un estado por defecto para evitar crashes,
    // pero idealmente siempre debería estar bajo un provider en la zona admin.
    return null;
  }
  return context;
}
