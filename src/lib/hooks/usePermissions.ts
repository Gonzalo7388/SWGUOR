import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import {
  type RolUsuario,
  type EstadoUsuario,
  type PermisosRecurso,
  type AccionRecurso,
  type RecursoKey,
  PERMISOS_RECURSO_POR_ROL,
} from '@/lib/constants/roles';

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

export interface Usuario {
  id: number;
  email?: string;
  rol: RolUsuario;
  estado: EstadoUsuario;
  auth_id?: string | null;
  ultimo_acceso?: string | null;
  created_at?: string;
}

// Tipo explícito del valor retornado por el hook.
// Esto evita que los consumidores dependan de inferencia implícita
// y facilita mockear el hook en tests.
export interface UsePermissionsReturn {
  usuario: Usuario | null;
  role: RolUsuario | null;
  isAdmin: boolean;
  isLoading: boolean;
  permissions: PermisosRecurso;
  /** Type-safe: recurso debe ser un RecursoKey válido del sistema */
  can: (accion: AccionRecurso, recurso: RecursoKey) => boolean;
  hasRole: (rol: RolUsuario | RolUsuario[]) => boolean;
}

// ─────────────────────────────────────────────
// CONSTANTES INTERNAS
// ─────────────────────────────────────────────

const ROLES_VALIDOS: RolUsuario[] = [
  'gerente',
  'administrador',
  'recepcionista',
  'disenador',
  'cortador',
  'ayudante',
  'representante_taller',
  'cliente',
];

const ROLES_ADMIN: RolUsuario[] = ['administrador', 'gerente'];

// ─────────────────────────────────────────────
// HELPERS INTERNOS
// ─────────────────────────────────────────────

/** Normaliza texto: minúsculas, sin espacios, sin tildes */
function normalizar(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Convierte el rol guardado en BD al RolUsuario tipado del sistema */
function resolverRol(rolBD: string): RolUsuario | null {
  const rolNormalizado = normalizar(rolBD);
  const encontrado = ROLES_VALIDOS.find(r => normalizar(r) === rolNormalizado);

  if (!encontrado) {
    console.warn(
      `[usePermissions] Rol no reconocido: "${rolBD}" (normalizado: "${rolNormalizado}"). ` +
      `Roles válidos: ${ROLES_VALIDOS.join(', ')}`
    );
    return null;
  }

  return encontrado;
}

// ─────────────────────────────────────────────
// ESTADO INICIAL — evita tener el objeto literal duplicado
// ─────────────────────────────────────────────

const ESTADO_INICIAL = {
  usuario: null as Usuario | null,
  permissions: {} as PermisosRecurso,
};

// ─────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────

export function usePermissions(): UsePermissionsReturn {
  const [usuario, setUsuario] = useState<Usuario | null>(ESTADO_INICIAL.usuario);
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState<PermisosRecurso>(ESTADO_INICIAL.permissions);

  const resetear = useCallback(() => {
    setUsuario(null);
    setPermissions({});
  }, []);

  const fetchUserPermissions = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        resetear();
        return;
      }

      const { data: userData, error } = await supabase
        .from('usuarios')
        .select('id, rol, estado, email, auth_id, ultimo_acceso, created_at')
        .eq('auth_id', session.user.id)
        .maybeSingle<Pick<Usuario, 'id' | 'rol' | 'estado' | 'email' | 'auth_id' | 'ultimo_acceso' | 'created_at'>>();

      if (error) {
        console.error('[usePermissions] Error al obtener usuario:', error);
        resetear();
        return;
      }

      if (!userData) {
        console.warn('[usePermissions] Usuario no encontrado en la tabla usuarios para auth_id:', session.user.id);
        resetear();
        return;
      }

      // Verificar estado activo
      if (normalizar(userData.estado) !== 'activo') {
        console.warn(`[usePermissions] Usuario con estado "${userData.estado}" no tiene acceso.`);
        resetear();
        return;
      }

      const rolResuelto = resolverRol(userData.rol);

      if (!rolResuelto) {
        resetear();
        return;
      }

      const usuarioNormalizado: Usuario = {
        ...userData,
        rol: rolResuelto,
      };

      setUsuario(usuarioNormalizado);
      setPermissions(PERMISOS_RECURSO_POR_ROL[rolResuelto] ?? {});

    } catch (err) {
      console.error('[usePermissions] Error inesperado:', err);
      resetear();
    } finally {
      setIsLoading(false);
    }
  }, [resetear]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    fetchUserPermissions();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserPermissions();
    });

    return () => subscription.unsubscribe();
  }, [fetchUserPermissions]);

  const can = useCallback(
    (accion: AccionRecurso, recurso: RecursoKey): boolean =>
      permissions[recurso]?.includes(accion) ?? false,
    [permissions],
  );

  /** Verifica si el usuario tiene uno o varios roles */
  const hasRole = useCallback(
    (rol: RolUsuario | RolUsuario[]): boolean => {
      if (!usuario?.rol) return false;
      return Array.isArray(rol)
        ? rol.includes(usuario.rol)
        : usuario.rol === rol;
    },
    [usuario],
  );

  const isAdmin = useMemo(
    () => ROLES_ADMIN.includes(usuario?.rol as RolUsuario),
    [usuario],
  );

  return useMemo(
    () => ({
      usuario,
      role: usuario?.rol ?? null,
      isAdmin,
      isLoading,
      permissions,
      can,
      hasRole,
    }),
    [usuario, isAdmin, isLoading, permissions, can, hasRole],
  );
}