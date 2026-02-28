/**
 * types/index.ts
 * 
 * Tipos derivados del schema de Supabase.
 * Importa desde aquí en lugar de directamente desde database.ts
 * para tener nombres semánticos en todo el proyecto.
 */

import type { Database, Tables, TablesInsert, TablesUpdate, Enums } from './database';

// ─── Re-export de utilidades base ────────────────────────────────────────────
export type { Database, Tables, TablesInsert, TablesUpdate, Enums };

// ─── TABLAS: Rows (lectura) ───────────────────────────────────────────────────
export type Producto          = Tables<'productos'>;
export type Insumo            = Tables<'insumo'>;
export type Categoria         = Tables<'categorias'>;
export type Usuario           = Tables<'usuarios'>;
export type Cliente           = Tables<'clientes'>;
export type Pedido            = Tables<'pedidos'>;
export type Orden             = Tables<'ordenes'>;
export type DetalleOrden      = Tables<'detalles_orden'>;
export type Confeccion        = Tables<'confecciones'>;
export type Cotizacion        = Tables<'cotizaciones'>;
export type Despacho          = Tables<'despachos'>;
export type Taller            = Tables<'talleres'>;
export type Venta             = Tables<'ventas'>;
export type VarianteProducto  = Tables<'variantes_producto'>;
export type MovimientoInventario = Tables<'movimientos_inventario'>;

// ─── TABLAS: Insert ───────────────────────────────────────────────────────────
export type ProductoInsert         = TablesInsert<'productos'>;
export type InsumoInsert           = TablesInsert<'insumo'>;
export type CategoriaInsert        = TablesInsert<'categorias'>;
export type UsuarioInsert          = TablesInsert<'usuarios'>;
export type ClienteInsert          = TablesInsert<'clientes'>;
export type PedidoInsert           = TablesInsert<'pedidos'>;
export type OrdenInsert            = TablesInsert<'ordenes'>;
export type VarianteProductoInsert = TablesInsert<'variantes_producto'>;

// ─── TABLAS: Update ───────────────────────────────────────────────────────────
export type ProductoUpdate         = TablesUpdate<'productos'>;
export type InsumoUpdate           = TablesUpdate<'insumo'>;
export type CategoriaUpdate        = TablesUpdate<'categorias'>;
export type UsuarioUpdate          = TablesUpdate<'usuarios'>;
export type PedidoUpdate           = TablesUpdate<'pedidos'>;
export type OrdenUpdate            = TablesUpdate<'ordenes'>;
export type VarianteProductoUpdate = TablesUpdate<'variantes_producto'>;

// ─── ENUMS ────────────────────────────────────────────────────────────────────
export type RolUsuario        = Enums<'rol'>;
export type EstadoUsuario     = Enums<'EstadoUsuario'>;
export type EstadoProducto    = Enums<'EstadoProducto'>;
export type TipoInsumo        = Enums<'TipoInsumo'>;
export type UnidadMedida      = Enums<'UnidadMedida'>;
export type TipoMovimiento    = Enums<'TipoMovimiento'>;
export type ColorPrenda       = Enums<'ColorPrenda'>;
export type TallaProductos    = Enums<'TallaProductos'>;
export type EstadoPedido      = Enums<'EstadoPedido'>;
export type EstadoOrden       = Enums<'EstadoOrden'>;
export type EstadoCliente     = Enums<'EstadoCliente'>;
export type TipoCliente       = Enums<'TipoCliente'>;
export type EstadoTaller      = Enums<'EstadoTaller'>;
export type EspecialidadTaller = Enums<'EspecialidadTaller'>;
export type EstadoConfeccion  = Enums<'EstadoConfeccion'>;
export type EstadoCotizacion  = Enums<'EstadoCotizacion'>;
export type EstadoDespacho    = Enums<'EstadoDespacho'>;
export type MetodoPago        = Enums<'MetodoPago'>;
export type TipoComprobante   = Enums<'TipoComprobante'>;
export type PrioridadPedido   = Enums<'PrioridadPedido'>;
export type TipoCategoria     = Enums<'TipoCategoria'>;