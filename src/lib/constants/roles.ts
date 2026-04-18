/**
 * Constantes de Roles y Permisos — Fuente Única de Verdad
 * Todos los permisos del sistema se definen aquí.
 * Esto asegura consistencia en toda la aplicación y facilita la gestión de roles.
 *
 * Estructura:
 * - Tipos base: RolUsuario, EstadoUsuario, PermissionKey, AccionRecurso, RecursoKey, PermisosRecurso
 * - Mapa de permisos planos por rol (PERMISOS_POR_ROL)
 * - Derivación automática de permisos por recurso (PERMISOS_RECURSO_POR_ROL)
 * - Información adicional de roles (ROLES_INFO)
 * - Helpers para validación y checks de permisos
 * - Función de validación de integridad para detectar permisos mal nombrados en desarrollo
 */

// ─────────────────────────────────────────────
// TIPOS BASE
// ─────────────────────────────────────────────

export type RolUsuario =
  | 'gerente'
  | 'administrador'
  | 'recepcionista'
  | 'disenador'
  | 'cortador'
  | 'ayudante'
  | 'representante_taller'
  | 'cliente';

export type EstadoUsuario = 'activo' | 'inactivo' | 'suspendido';

// ─────────────────────────────────────────────
// PERMISOS PLANOS (usados en guards y middleware)
// ─────────────────────────────────────────────

export type PermissionKey =
  // Dashboard
  | 'ver_dashboard'
  | 'exportar_data'
  // Órdenes
  | 'ver_ordenes'
  | 'crear_ordenes'
  | 'editar_ordenes'
  | 'eliminar_ordenes'
  | 'exportar_ordenes'
  // Pedidos
  | 'ver_pedidos'
  | 'crear_pedidos'
  | 'editar_pedidos'
  | 'cancelar_pedidos'
  | 'cambiar_estado_pedidos'
  | 'exportar_pedidos'
  // Inventario
  | 'ver_inventario'
  | 'crear_inventario'
  | 'editar_inventario'
  | 'eliminar_inventario'
  | 'ajustar_stock'
  | 'exportar_inventario'
  // Productos
  | 'ver_productos'
  | 'crear_productos'
  | 'editar_productos'
  | 'eliminar_productos'
  | 'exportar_productos'
  | 'subir_ficha_tecnica'
  | 'subir_ficha_medidas'
  // Variantes
  | 'ver_variantes'
  | 'crear_variantes'
  | 'editar_variantes'
  | 'eliminar_variantes'
  | 'exportar_variantes'
  // Categorías
  | 'ver_categorias'
  | 'crear_categorias'
  | 'editar_categorias'
  | 'eliminar_categorias'
  | 'exportar_categorias'
  // Clientes
  | 'ver_clientes'
  | 'editar_clientes'
  | 'eliminar_clientes'
  | 'exportar_clientes'
  // Usuarios
  | 'ver_usuarios'
  | 'crear_usuarios'
  | 'editar_usuarios'
  | 'eliminar_usuarios'
  | 'exportar_usuarios'
  // Reportes
  | 'ver_reportes'
  | 'filtrar_reportes'
  | 'exportar_reportes'
  // Despachos
  | 'ver_despachos'
  | 'crear_despachos'
  | 'editar_despachos'
  | 'actualizar_estado_despachos'
  | 'exportar_despachos'
  // Confecciones
  | 'ver_confecciones'
  | 'crear_confecciones'
  | 'editar_confecciones'
  | 'actualizar_estado_confecciones'
  | 'exportar_confecciones'
  // Talleres
  | 'ver_talleres'
  | 'crear_talleres'
  | 'editar_talleres'
  | 'eliminar_talleres'
  | 'exportar_talleres'
  // Pagos
  | 'ver_pagos'
  | 'registrar_pagos'
  | 'exportar_pagos'
  // Cotizaciones
  | 'ver_cotizaciones'
  | 'editar_cotizaciones'
  | 'aprobar_cotizaciones'
  | 'exportar_cotizaciones'
  // Materiales
  | 'ver_materiales'
  | 'crear_materiales'
  | 'editar_materiales'
  | 'eliminar_materiales'
  | 'exportar_materiales'
  // Ventas
  | 'ver_ventas'
  | 'editar_ventas'
  | 'exportar_ventas'
  // Configuración
  | 'ver_configuracion'
  | 'editar_configuracion'
  // Proveedores
  | 'ver_proveedores'
  | 'crear_proveedores'
  | 'editar_proveedores'
  | 'eliminar_proveedores'
  | 'exportar_proveedores'
  
  // Notificaciones
  | 'ver_notificaciones'
  
  // Perfil
  |  'ver_perfil'
  | 'editar_perfil';

// ─────────────────────────────────────────────
// TIPOS DE ACCIONES Y RECURSOS
// ─────────────────────────────────────────────

export type AccionRecurso =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'export'
  | 'cancel'
  | 'approve'
  | 'adjust'
  | 'update_status'
  | 'upload';

/**
 * RecursoKey se deriva automáticamente desde PermissionKey.
 * Esto hace que can('edit', recurso) sea type-safe —
 * TypeScript rechazará cualquier string que no sea un recurso real del sistema.
 *
 * Cómo funciona: extrae la parte después del primer verbo en cada PermissionKey.
 * Ejemplo: 'editar_productos' → 'productos', 'actualizar_estado_despachos' → 'despachos'
 */
type ExtractRecurso<K extends string> =
  K extends `ver_${infer R}`               ? R :
  K extends `crear_${infer R}`             ? R :
  K extends `editar_${infer R}`            ? R :
  K extends `eliminar_${infer R}`          ? R :
  K extends `exportar_${infer R}`          ? R :
  K extends `cancelar_${infer R}`          ? R :
  K extends `aprobar_${infer R}`           ? R :
  K extends `ajustar_${infer R}`           ? R :
  K extends `registrar_${infer R}`         ? R :
  K extends `subir_${infer R}`             ? R :
  K extends `actualizar_estado_${infer R}` ? R :
  K extends `cambiar_estado_${infer R}`    ? R :
  K extends `filtrar_${infer R}`           ? R :
  never;

export type RecursoKey = ExtractRecurso<PermissionKey>;

export type PermisosRecurso = Partial<Record<RecursoKey, AccionRecurso[]>>;

// ─────────────────────────────────────────────
// MAPA DE ACCIONES
// Prefijos reconocidos → AccionRecurso tipada.
// Si añades un nuevo verbo en PermissionKey, agrégalo aquí también.
// ─────────────────────────────────────────────

const ACCION_MAP: Record<string, AccionRecurso> = {
  ver:               'view',
  crear:             'create',
  editar:            'edit',
  eliminar:          'delete',
  exportar:          'export',
  cancelar:          'cancel',
  aprobar:           'approve',
  ajustar:           'adjust',
  registrar:         'create',
  subir:             'upload',
  actualizar_estado: 'update_status',
  cambiar_estado:    'update_status',
  filtrar:           'view',
} as const;

// ─────────────────────────────────────────────
// MATRIZ DE PERMISOS PLANOS POR ROL
// ─────────────────────────────────────────────

export const PERMISOS_POR_ROL: Record<RolUsuario, PermissionKey[]> = {

  /**
   * GERENTE — Visibilidad total + operaciones críticas de negocio.
   * Solo acciones que un gerente necesita ejecutar directamente:
   * aprobar cotizaciones, registrar pagos, editar configuración.
   * No gestiona usuarios ni inventario operativo (eso es del administrador).
   */
  gerente: [
    'ver_dashboard', 'exportar_data',
    'ver_ordenes', 'exportar_ordenes',
    'ver_pedidos', 'exportar_pedidos',
    'ver_inventario', 'exportar_inventario',
    'ver_productos', 'exportar_productos',
    'ver_variantes', 'exportar_variantes',
    'ver_categorias', 'exportar_categorias',
    'ver_clientes', 'exportar_clientes',
    'ver_usuarios', 'exportar_usuarios',
    'ver_reportes', 'filtrar_reportes', 'exportar_reportes',
    'ver_despachos', 'exportar_despachos',
    'ver_confecciones', 'exportar_confecciones',
    'ver_talleres', 'exportar_talleres',
    // Operaciones críticas de negocio que el gerente puede ejecutar:
    'ver_pagos', 'registrar_pagos', 'exportar_pagos',
    'ver_cotizaciones', 'aprobar_cotizaciones', 'exportar_cotizaciones',
    'ver_materiales', 'exportar_materiales',
    'ver_ventas', 'exportar_ventas',
    'ver_configuracion', 'editar_configuracion',
    'ver_proveedores', 'exportar_proveedores',
    'ver_notificaciones',
    'ver_perfil', 'editar_perfil',
  ],

  administrador: [
    'ver_dashboard', 'exportar_data',
    // Órdenes
    'ver_ordenes', 'exportar_ordenes',
    // Pedidos
    'ver_pedidos', 'exportar_pedidos',
    // Inventario
    'ver_inventario', 'exportar_inventario',
    // Productos
    'ver_productos', 'exportar_productos',
    // Variantes
    'ver_variantes','exportar_variantes',
    // Categorías
    'ver_categorias', 'crear_categorias', 'editar_categorias', 'eliminar_categorias', 'exportar_categorias',
    // Clientes
    'ver_clientes', 'editar_clientes', 'eliminar_clientes', 'exportar_clientes',
    // Usuarios
    'ver_usuarios', 'crear_usuarios', 'editar_usuarios', 'eliminar_usuarios', 'exportar_usuarios',
    // Reportes
    'ver_reportes', 'filtrar_reportes', 'exportar_reportes',
    // Despachos
    'ver_despachos', 'exportar_despachos',
    // Confecciones
    'ver_confecciones', 'exportar_confecciones',
    // Talleres
    'ver_talleres', 'crear_talleres', 'editar_talleres', 'eliminar_talleres', 'exportar_talleres',
    // Pagos
    'ver_pagos', 'registrar_pagos', 'exportar_pagos',
    // Cotizaciones
    'ver_cotizaciones', 'editar_cotizaciones', 'aprobar_cotizaciones', 'exportar_cotizaciones',
    // Materiales
    'ver_materiales', 'crear_materiales', 'editar_materiales', 'eliminar_materiales', 'exportar_materiales',
    // Ventas
    'ver_ventas', 'editar_ventas', 'exportar_ventas',
    // Configuración
    'ver_configuracion', 'editar_configuracion',
    // Proveedores
    'ver_proveedores', 'crear_proveedores', 'editar_proveedores', 'eliminar_proveedores', 'exportar_proveedores',
    // Notificaciones
    'ver_notificaciones',
    // Perfil
    'ver_perfil', 'editar_perfil',
  ],

  recepcionista: [
    'ver_dashboard',
    'ver_ordenes', 'crear_ordenes', 'editar_ordenes', 'exportar_ordenes',
    'ver_pedidos', 'crear_pedidos', 'editar_pedidos', 'cancelar_pedidos', 'exportar_pedidos',
    'ver_inventario', 'exportar_inventario',
    'ver_productos', 'exportar_productos',
    'ver_variantes', 'exportar_variantes',
    'ver_clientes', 'editar_clientes', 'exportar_clientes',
    'ver_pagos', 'registrar_pagos', 'exportar_pagos',
    'ver_cotizaciones', 'editar_cotizaciones', 'aprobar_cotizaciones',
    'ver_despachos', 'crear_despachos', 'exportar_despachos',
    'ver_notificaciones',
    'ver_perfil', 'editar_perfil',
  ],

  disenador: [
    'ver_dashboard',
    'ver_pedidos',
    'ver_inventario',
    'ver_materiales',
    'ver_productos', 'crear_productos', 'editar_productos', 'subir_ficha_tecnica',
    'ver_variantes', 'crear_variantes', 'editar_variantes',
    'ver_categorias', 'crear_categorias', 'editar_categorias',
    'ver_confecciones', 'crear_confecciones', 'editar_confecciones',
    'ver_reportes',
    'ver_notificaciones',
    'ver_perfil', 'editar_perfil',
  ],

  cortador: [
    'ver_dashboard',
    'ver_pedidos',
    'ver_inventario',
    'ver_materiales', 'editar_materiales',
    'ver_confecciones', 'actualizar_estado_confecciones',
    'ver_productos', 'ver_variantes', 'subir_ficha_medidas',
    'ver_notificaciones',
    'ver_perfil', 'editar_perfil',
  ],

  ayudante: [
    'ver_dashboard',
    'ver_inventario',
    'ver_productos', 'ver_variantes',
    'ver_confecciones',
    'ver_despachos',
    'ver_notificaciones',
    'ver_perfil', 'editar_perfil',
  ],

  representante_taller: [
    'ver_dashboard',
    'ver_pedidos',
    'ver_inventario', 'editar_inventario',
    'ver_materiales',
    'ver_confecciones', 'crear_confecciones', 'editar_confecciones', 'actualizar_estado_confecciones',
    'ver_talleres', 'editar_talleres',
    'ver_despachos',
    'ver_productos',
    'ver_notificaciones',
    'ver_perfil', 'editar_perfil',
  ],

  cliente: [
    'ver_productos',
    'ver_variantes',
    'ver_pedidos', 'crear_pedidos',
    'ver_cotizaciones',
    'ver_notificaciones',
    'ver_perfil', 'editar_perfil',
  ],
};

// ─────────────────────────────────────────────
// DERIVACIÓN AUTOMÁTICA: PERMISOS POR RECURSO
// No editar manualmente — se genera desde PERMISOS_POR_ROL.
// ─────────────────────────────────────────────

function derivarPermisosRecurso(permisos: PermissionKey[]): PermisosRecurso {
  const resultado: PermisosRecurso = {};

  for (const permiso of permisos) {
    const partes = permiso.split('_');
    let accion: AccionRecurso | undefined;
    let recurso: string | undefined;

    // Busca el prefijo más largo que coincida en ACCION_MAP (greedy desde la derecha)
    for (let i = partes.length - 1; i >= 1; i--) {
      const posibleAccion = partes.slice(0, i).join('_');
      if (ACCION_MAP[posibleAccion]) {
        accion = ACCION_MAP[posibleAccion];
        recurso = partes.slice(i).join('_');
        break;
      }
    }

    // Si no se pudo derivar acción/recurso, omitir este permiso con advertencia en dev.
    // Antes fallaba silenciosamente — ahora es evidente al momento de agregar un permiso mal nombrado.
    if (!accion || !recurso) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[roles] No se pudo derivar acción/recurso para el permiso: "${permiso}". ` +
          `Verifica que el prefijo esté registrado en ACCION_MAP.`
        );
      }
      continue;
    }

    const key = recurso as RecursoKey;
    if (!resultado[key]) resultado[key] = [];
    if (!resultado[key]!.includes(accion)) {
      resultado[key]!.push(accion);
    }
  }

  return resultado;
}

export const PERMISOS_RECURSO_POR_ROL: Record<RolUsuario, PermisosRecurso> =
  Object.fromEntries(
    (Object.keys(PERMISOS_POR_ROL) as RolUsuario[]).map(rol => [
      rol,
      derivarPermisosRecurso(PERMISOS_POR_ROL[rol]),
    ])
  ) as Record<RolUsuario, PermisosRecurso>;

// ─────────────────────────────────────────────
// VALIDADOR DE INTEGRIDAD (solo dev / tests)
// Llama a esta función en tus unit tests para detectar
// permisos mal nombrados antes de llegar a producción.
//
// Uso: import { validatePermissionKeys } from '@/lib/constants/roles'
//      describe('roles', () => { it('todos los permisos son parseables', validatePermissionKeys) })
// ─────────────────────────────────────────────

export function validatePermissionKeys(): void {
  const errores: string[] = [];

  for (const [rol, permisos] of Object.entries(PERMISOS_POR_ROL)) {
    for (const permiso of permisos) {
      const partes = permiso.split('_');
      let encontrado = false;

      for (let i = partes.length - 1; i >= 1; i--) {
        if (ACCION_MAP[partes.slice(0, i).join('_')]) {
          encontrado = true;
          break;
        }
      }

      if (!encontrado) {
        errores.push(`  Rol "${rol}" → permiso "${permiso}" no tiene prefijo reconocido en ACCION_MAP`);
      }
    }
  }

  if (errores.length > 0) {
    throw new Error(`[roles] Permisos mal nombrados detectados:\n${errores.join('\n')}`);
  }
}

// ─────────────────────────────────────────────
// INFORMACIÓN DE ROLES
// ─────────────────────────────────────────────

export const ROLES_INFO: Record<RolUsuario, {
  label: string;
  descripcion: string;
  color: string;
  /**
   * Nivel de acceso jerárquico. Escala:
   * 0 = externo (cliente)
   * 1 = operativo básico
   * 2 = operativo especializado
   * 3 = operativo con gestión
   * 4 = administrativo
   * 5 = dirección / solo lectura global
   *
   * puedeGestionarRol(a, b) es verdadero si nivel(a) > nivel(b).
   * Un administrador (4) puede gestionar a todos excepto al gerente (5).
   */
  nivel: number;
}> = {
  gerente:              { label: 'Gerente General',         descripcion: 'Visibilidad total + aprobaciones clave',  color: 'bg-violet-100 text-violet-700',   nivel: 5 },
  administrador:        { label: 'Administrador',           descripcion: 'Acceso operativo total',                  color: 'bg-sky-100 text-sky-700',         nivel: 4 },
  recepcionista:        { label: 'Recepcionista',           descripcion: 'Maneja órdenes y clientes',               color: 'bg-pink-100 text-pink-700',       nivel: 3 },
  disenador:            { label: 'Diseñador',               descripcion: 'Responsable del diseño de prendas',       color: 'bg-fuchsia-100 text-fuchsia-700', nivel: 2 },
  cortador:             { label: 'Cortador',                descripcion: 'Responsable del corte de prendas',        color: 'bg-orange-100 text-orange-600',   nivel: 2 },
  representante_taller: { label: 'Representante de Taller', descripcion: 'Responsable de taller externo',           color: 'bg-lime-100 text-lime-700',       nivel: 2 },
  ayudante:             { label: 'Ayudante',                descripcion: 'Asiste en tareas generales',              color: 'bg-teal-100 text-teal-700',       nivel: 1 },
  cliente:              { label: 'Cliente',                 descripcion: 'Acceso al portal de compras',             color: 'bg-amber-100 text-amber-700',     nivel: 0 },
};

export const ROLE_COLORS: Record<RolUsuario, string> = Object.fromEntries(
  (Object.keys(ROLES_INFO) as RolUsuario[]).map(r => [r, ROLES_INFO[r].color])
) as Record<RolUsuario, string>;

export const ROLE_LABELS: Record<RolUsuario, string> = Object.fromEntries(
  (Object.keys(ROLES_INFO) as RolUsuario[]).map(r => [r, ROLES_INFO[r].label])
) as Record<RolUsuario, string>;

export const LISTA_ROLES = Object.keys(ROLES_INFO) as RolUsuario[];

export const ESTADO_LABELS: Record<EstadoUsuario, string> = {
  activo:     'Activo',
  inactivo:   'Inactivo',
  suspendido: 'Suspendido',
};

export const ESTADO_COLORS: Record<EstadoUsuario, string> = {
  activo:     'bg-green-100 text-green-800',
  inactivo:   'bg-gray-100 text-gray-800',
  suspendido: 'bg-red-100 text-red-800',
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

export function tienePermiso(rol: RolUsuario, permiso: PermissionKey): boolean {
  return PERMISOS_POR_ROL[rol]?.includes(permiso) ?? false;
}

export function getNivelAcceso(rol: RolUsuario): number {
  return ROLES_INFO[rol]?.nivel ?? 0;
}

export function puedeGestionarRol(rolUsuario: RolUsuario, rolAGestionar: RolUsuario): boolean {
  return getNivelAcceso(rolUsuario) > getNivelAcceso(rolAGestionar);
}

export function getEtiquetaRol(rol: RolUsuario): string {
  return ROLES_INFO[rol]?.label ?? rol;
}