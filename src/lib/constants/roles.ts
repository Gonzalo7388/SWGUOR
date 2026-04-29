/**
 * Constantes de Roles y Permisos — Fuente Única de Verdad
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
// PERMISOS PLANOS
// ─────────────────────────────────────────────

export type PermissionKey =
  // Dashboard y Data
  | 'ver_dashboard' | 'exportar_data'
  // Gestión de Insumos y Materiales
  | 'ver_insumo' | 'crear_insumo' | 'editar_insumo' | 'descontinuar_insumo' | 'exportar_insumo'
  // Productos y Fichas
  | 'ver_productos' | 'crear_productos' | 'editar_productos' | 'descontinuar_productos' | 'exportar_productos'
  | 'ver_fichas_tecnicas' | 'crear_ficha_tecnica' | 'editar_ficha_tecnica' | 'ver_detalle_ficha_tecnica'
  | 'crear_ficha_medidas' | 'editar_ficha_medidas' | 'ver_detalle_ficha_medidas'
  // Cliente
  | 'ver_clientes' | 'editar_clientes' | 'ver_detalle_cliente' | 'suspender_clientes' | 'exportar_clientes'
  // Personal Interno
  | 'ver_personal' | 'crear_personal' | 'editar_personal' | 'suspender_personal' | 'exportar_personal'
  // Inventario y Movimientos
  | 'ver_inventario' | 'agotar_inventario' | 'ver_movimiento_inventario' | 'ajustar_stock'
  // Seguimientos (Tracking)
  | 'ver_seguimiento_pedido'
  | 'ver_seguimiento_confeccion'
  | 'ver_seguimiento_produccion'
  // Órdenes de Producción
  | 'ver_orden_produccion' | 'crear_orden_produccion' | 'editar_orden_produccion' | 'asignar_orden_produccion' | 'ver_detalle_orden_produccion'
  // Incidencias de Taller
  | 'ver_incidencias_taller' | 'crear_incidencias_taller' | 'exportar_incidencias_taller'
  // Devoluciones
  | 'ver_devoluciones_cliente' | 'crear_devoluciones_cliente' | 'exportar_devoluciones_cliente'
  | 'ver_devoluciones_proveedor' | 'crear_devoluciones_proveedor' | 'exportar_devoluciones_proveedor'
  // Órdenes
  | 'ver_ordenes' | 'crear_ordenes' | 'editar_ordenes'
  // Pedidos
  | 'ver_pedidos' | 'crear_pedidos' | 'editar_pedidos' | 'cancelar_pedidos' | 'cambiar_estado_pedidos'
  // Subir archivos
  | 'subir_ficha_tecnica' | 'subir_ficha_medidas'
  // Variantes
  | 'ver_variantes' | 'crear_variantes' | 'editar_variantes' | 'descontinuar_variantes' | 'exportar_variantes'
  // Categorías
  | 'ver_categorias' | 'crear_categorias' | 'editar_categorias' | 'descontinuar_categorias' | 'exportar_categorias'
  // Usuarios
  | 'ver_usuarios' | 'crear_usuarios' | 'editar_usuarios' | 'suspender_usuarios' | 'exportar_usuarios'
  // Reportes
  | 'ver_reportes' | 'filtrar_reportes' | 'exportar_reportes'
  // Despachos
  | 'ver_despachos' | 'crear_despachos' | 'editar_despachos' | 'actualizar_estado_despachos' | 'exportar_despachos'
  // Confecciones
  | 'ver_confecciones' | 'crear_confecciones' | 'editar_confecciones' | 'actualizar_estado_confecciones' | 'exportar_confecciones' | 'asignar_ordenes_confecciones'
  // Talleres
  | 'ver_talleres' | 'crear_talleres' | 'editar_talleres' | 'suspender_talleres' | 'exportar_talleres'
  // Pagos
  | 'ver_pagos' | 'registrar_pagos' | 'realizar_pago'
  // Cotizaciones
  | 'ver_cotizaciones' | 'editar_cotizaciones' | 'ver_historial_cotizaciones' | 'crear_cotizacion' | 'descargar_cotizacion' | 'aprobar_cotizaciones' | 'exportar_cotizaciones'
  // Materiales
  | 'ver_materiales' | 'crear_materiales' | 'editar_materiales' | 'descontinuar_materiales' | 'exportar_materiales'
  // Ventas
  | 'ver_ventas' | 'editar_ventas' | 'anular_ventas'
  // Configuración
  | 'ver_configuracion' | 'editar_configuracion'
  // Proveedores
  | 'ver_proveedores' | 'crear_proveedores' | 'editar_proveedores' | 'descontinuar_proveedores' | 'exportar_proveedores'
  // Notificaciones
  | 'ver_notificaciones'
  // Perfil
  | 'ver_perfil' | 'editar_perfil';

// ─────────────────────────────────────────────
// TIPOS DE ACCIONES Y RECURSOS
// ─────────────────────────────────────────────

export type AccionRecurso =
  | 'view' | 'create' | 'edit' | 'archive' | 'export'
  | 'cancel' | 'approve' | 'adjust' | 'update_status'
  | 'download' | 'make' | 'assign' | 'upload' | 'detail';

type ExtractRecurso<K extends string> =
  K extends `ver_historial_${infer R}`     ? R :
  K extends `ver_seguimiento_${infer R}`   ? R :
  K extends `ver_${infer R}`               ? R :
  K extends `crear_${infer R}`             ? R :
  K extends `editar_${infer R}`            ? R :
  K extends `suspender_${infer R}`         ? R :
  K extends `descontinuar_${infer R}`      ? R :
  K extends `agotar_${infer R}`            ? R :
  K extends `exportar_${infer R}`          ? R :
  K extends `cancelar_${infer R}`          ? R :
  K extends `aprobar_${infer R}`           ? R :
  K extends `ajustar_${infer R}`           ? R :
  K extends `registrar_${infer R}`         ? R :
  K extends `subir_${infer R}`             ? R :
  K extends `actualizar_estado_${infer R}` ? R :
  K extends `cambiar_estado_${infer R}`    ? R :
  K extends `asignar_ordenes_${infer R}`   ? R :
  K extends `realizar_${infer R}`          ? R :
  K extends `descargar_${infer R}`         ? R :
  K extends `filtrar_${infer R}`           ? R :
  never;

export type RecursoKey = ExtractRecurso<PermissionKey>;

export type PermisosRecurso = Partial<Record<RecursoKey, AccionRecurso[]>>;

const ACCION_MAP: Record<string, AccionRecurso> = {
  ver:                'view',
  ver_historial:      'view',
  ver_seguimiento:    'view',
  crear:              'create',
  crear_cotizacion:   'create',
  editar:             'edit',
  suspender:          'archive',
  descontinuar:       'archive',
  agotar:             'archive',
  exportar:           'export',
  cancelar:           'cancel',
  aprobar:            'approve',
  ajustar:            'adjust',
  registrar:          'create',
  subir:              'upload',
  actualizar_estado:  'update_status',
  cambiar_estado:     'update_status',
  asignar_ordenes:    'assign',
  realizar:           'make',
  descargar:          'download',
  filtrar:            'view',
} as const;

// ─────────────────────────────────────────────
// MATRIZ DE PERMISOS PLANOS POR ROL
// ─────────────────────────────────────────────

export const PERMISOS_POR_ROL: Record<RolUsuario, PermissionKey[]> = {
  gerente: [
    'ver_dashboard', 'exportar_data',
    'ver_ordenes',
    'ver_pedidos',
    'ver_inventario',
    'ver_productos', 'exportar_productos',
    'ver_variantes', 'exportar_variantes',
    'ver_categorias', 'exportar_categorias',
    'ver_usuarios', 'exportar_usuarios', 'suspender_usuarios',
    'ver_clientes', 'editar_clientes', 'ver_detalle_cliente', 'exportar_clientes',
    'ver_reportes', 'filtrar_reportes', 'exportar_reportes',
    'ver_despachos', 'exportar_despachos',
    'ver_confecciones', 'exportar_confecciones',
    'ver_talleres', 'exportar_talleres',
    'ver_pagos', 'registrar_pagos',
    'ver_cotizaciones', 'ver_historial_cotizaciones', 'aprobar_cotizaciones', 'exportar_cotizaciones',
    'ver_materiales', 'exportar_materiales',
    'ver_ventas',
    'ver_configuracion', 'editar_configuracion',
    'ver_proveedores', 'exportar_proveedores',
    'ver_fichas_tecnicas', 'ver_detalle_ficha_tecnica', 'ver_detalle_ficha_medidas',
    'ver_notificaciones', 'ver_perfil', 'editar_perfil',
  ],

  administrador: [
    'ver_dashboard', 'exportar_data',
    'ver_ordenes',
    'ver_pedidos',
    'ver_inventario',
    'ver_clientes', 'editar_clientes', 'ver_detalle_cliente', 'exportar_clientes',
    'ver_insumo', 'crear_insumo', 'descontinuar_insumo',
    'ver_materiales', 'crear_materiales', 'editar_materiales', 'descontinuar_materiales', 'exportar_materiales',
    'ver_productos', 'exportar_productos',
    'ver_variantes', 'exportar_variantes',
    'ver_categorias', 'crear_categorias', 'editar_categorias', 'descontinuar_categorias', 'exportar_categorias',
    'ver_usuarios', 'crear_usuarios', 'editar_usuarios', 'suspender_usuarios', 'exportar_usuarios',
    'ver_personal', 'crear_personal', 'editar_personal', 'suspender_personal',
    'ver_reportes', 'filtrar_reportes', 'exportar_reportes',
    'ver_despachos', 'exportar_despachos',
    'ver_confecciones', 'exportar_confecciones',
    'ver_talleres', 'crear_talleres', 'editar_talleres', 'suspender_talleres', 'exportar_talleres',
    'ver_pagos', 'registrar_pagos',
    'ver_cotizaciones', 'editar_cotizaciones', 'ver_historial_cotizaciones', 'aprobar_cotizaciones', 'exportar_cotizaciones',
    'ver_ventas', 'editar_ventas', 'anular_ventas',
    'ver_configuracion', 'editar_configuracion',
    'ver_orden_produccion', 'crear_orden_produccion', 'editar_orden_produccion',
    'ver_devoluciones_proveedor', 'crear_devoluciones_proveedor',
    'ver_proveedores', 'crear_proveedores', 'editar_proveedores', 'descontinuar_proveedores', 'exportar_proveedores',
    'ver_fichas_tecnicas', 'ver_detalle_ficha_tecnica', 'ver_detalle_ficha_medidas',
    'ver_notificaciones', 'ver_perfil', 'editar_perfil',
  ],

  recepcionista: [
    'ver_dashboard',
    'ver_ordenes', 'crear_ordenes', 'editar_ordenes',
    'ver_pedidos', 'crear_pedidos', 'editar_pedidos', 'cancelar_pedidos', 'cambiar_estado_pedidos',
    'ver_inventario',
    'ver_productos', 'exportar_productos',
    'ver_variantes', 'exportar_variantes',
    'ver_pagos', 'registrar_pagos',
    'ver_seguimiento_pedido', 'ver_devoluciones_cliente', 'crear_devoluciones_cliente',
    'ver_cotizaciones', 'editar_cotizaciones', 'ver_historial_cotizaciones', 'crear_cotizacion', 'descargar_cotizacion', 'aprobar_cotizaciones',
    'ver_despachos', 'crear_despachos', 'exportar_despachos',
    'ver_notificaciones', 'ver_perfil', 'editar_perfil',
  ],

  disenador: [
    'ver_dashboard',
    'ver_pedidos',
    'ver_inventario',
    'ver_insumo',
    'ver_materiales',
    'ver_productos', 'crear_productos', 'editar_productos',
    'ver_orden_produccion', 'ver_detalle_orden_produccion', 'ver_seguimiento_produccion',
    'ver_fichas_tecnicas', 'ver_detalle_ficha_tecnica', 'crear_ficha_medidas', 'editar_ficha_medidas', 'subir_ficha_medidas',
    'crear_ficha_tecnica', 'editar_ficha_tecnica', 'subir_ficha_tecnica',
    'ver_variantes', 'crear_variantes', 'editar_variantes',
    'ver_categorias', 'crear_categorias', 'editar_categorias',
    'ver_reportes', 'ver_notificaciones', 'ver_perfil', 'editar_perfil',
  ],

  cortador: [
    'ver_dashboard',
    'ver_pedidos',
    'ver_inventario',
    'ver_orden_produccion', 'ver_detalle_orden_produccion',
    'ver_seguimiento_produccion',
    'ver_fichas_tecnicas', 'ver_detalle_ficha_tecnica',
    'ver_detalle_ficha_medidas',
    'ver_insumo', 'ver_movimiento_inventario',
    'ver_materiales', 'editar_materiales',
    'ver_confecciones', 'actualizar_estado_confecciones',
    'ver_productos', 'ver_variantes',
    'ver_notificaciones', 'ver_perfil', 'editar_perfil',
  ],

  ayudante: [
    'ver_dashboard',
    'ver_inventario', 'ver_insumo', 'ver_materiales', 'ver_movimiento_inventario',
    'ver_productos', 'ver_variantes',
    'ver_seguimiento_confeccion',
    'ver_confecciones', 'ver_despachos',
    'ver_notificaciones', 'ver_perfil', 'editar_perfil',
  ],

  representante_taller: [
    'ver_dashboard',
    'ver_pedidos',
    'ver_inventario',
    'ver_orden_produccion', 'ver_detalle_orden_produccion', 'asignar_orden_produccion',
    'ver_seguimiento_confeccion', 'ver_seguimiento_produccion',
    'ver_insumo',
    'ver_materiales',
    'ver_confecciones', 'actualizar_estado_confecciones', 'asignar_ordenes_confecciones',
    'ver_talleres', 'editar_talleres', 'crear_incidencias_taller', 'ver_incidencias_taller',
    'ver_despachos', 'ver_productos',
    'ver_notificaciones', 'ver_perfil', 'editar_perfil',
  ],

  cliente: [
    'ver_productos',
    'ver_variantes',
    'ver_pedidos', 'crear_pedidos', 'ver_seguimiento_pedido',
    'ver_historial_cotizaciones', 'crear_cotizacion', 'descargar_cotizacion',
    'realizar_pago',
    'ver_notificaciones', 'ver_perfil', 'editar_perfil',
  ],
};

// ─────────────────────────────────────────────
// DERIVACIÓN AUTOMÁTICA: PERMISOS POR RECURSO
// ─────────────────────────────────────────────

function derivarPermisosRecurso(permisos: PermissionKey[]): PermisosRecurso {
  const resultado: PermisosRecurso = {};
  for (const permiso of permisos) {
    const partes = permiso.split('_');
    let accion: AccionRecurso | undefined;
    let recurso: string | undefined;

    for (let i = partes.length - 1; i >= 1; i--) {
      const posibleAccion = partes.slice(0, i).join('_');
      if (ACCION_MAP[posibleAccion]) {
        accion = ACCION_MAP[posibleAccion];
        recurso = partes.slice(i).join('_');
        break;
      }
    }

    if (!accion || !recurso) continue;

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