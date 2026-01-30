export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/**
 * Enums de la Base de Datos
 */
export type EstadoPedido = 'PENDIENTE' | 'CORTE' | 'COSTURA' | 'ACABADO' | 'COMPLETADO' | 'CANCELADO'
export type EstadoConfeccion = 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'CON_OBSERVACIONES' | 'RECHAZADA'
export type EstadoCotizacion = 'PENDIENTE' | 'ENVIADA' | 'ACEPTADA' | 'RECHAZADA' | 'VENCIDA'
export type EstadoDespacho = 'PENDIENTE' | 'EMPAQUETADO' | 'EN_TRANSITO' | 'ENTREGADO' | 'DEVUELTO'
export type EstadoProducto = 'activo' | 'inactivo' | 'agotado'
export type EstadoTaller = 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO'
export type PrioridadPedido = 'BAJA' | 'NORMAL' | 'ALTA' | 'URGENTE'
export type RolUsuario = 'administrador' | 'cortador' | 'diseñador' | 'recepcionista' | 'ayudante' | 'representante_taller'
export type EstadoUsuario = 'activo' | 'inactivo' | 'suspendido'
export type EstadoOrden = 'SOLICITUD' | 'COTIZADO' | 'APROBADO' | 'PAGADO' | 'EN_PRODUCCION' | 'FINALIZADO' | 'CANCELADO'

/**
 * Schema de la Base de Datos
 */
export interface Database {
  public: {
    Tables: {

      //Tabla: categorias
      categorias: {
        Row: {
          id: number
          nombre: string
          descripcion: string | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          nombre: string
          descripcion?: string | null
          activo?: boolean
          created_at?: string
          updated_at: string
        }
        Update: {
          id?: number
          nombre?: string
          descripcion?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      // Tabla: clientes
      clientes: {
        Row: {
          id: number
          ruc: number
          razon_social: string | null
          email: string | null
          telefono: number | null
          direccion: string | null
          activo: boolean | null
          created_at: string
          updated_at: string
          auth_id: string | null
        }
        Insert: {
          id?: never
          ruc: number
          razon_social?: string | null
          email?: string | null
          telefono?: number | null
          direccion?: string | null
          activo?: boolean | null
          created_at?: string
          updated_at?: string
          auth_id?: string | null
        }
        Update: {
          ruc?: number
          razon_social?: string | null
          email?: string | null
          telefono?: number | null
          direccion?: string | null
          activo?: boolean | null
          created_at?: string
          updated_at?: string
          auth_id?: string | null
        }
      }

      // Tabla: confecciones
      confecciones: {
        Row: {
          id: number
          pedido_id: number
          taller_id: number
          estado: EstadoConfeccion
          fecha_inicio: string
          fecha_fin: string | null
          observaciones: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          pedido_id: number
          taller_id: number
          estado?: EstadoConfeccion
          fecha_inicio: string
          fecha_fin?: string | null
          observaciones?: string | null
          created_at?: string
          updated_at: string
        }
        Update: {
          id?: number
          pedido_id?: number
          taller_id?: number
          estado?: EstadoConfeccion
          fecha_inicio?: string
          fecha_fin?: string | null
          observaciones?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // Tabla: despachos
      despachos: {
        Row: {
          id: number
          pedido_id: number
          fecha_despacho: string
          created_at: string
          direccion_entrega: string
          fecha_entrega: string | null
          updated_at: string
          usuario_id: number
          estado: EstadoDespacho
        }
        Insert: {
          id?: never
          pedido_id: number
          fecha_despacho: string
          created_at?: string
          direccion_entrega: string
          fecha_entrega?: string | null
          updated_at: string
          usuario_id: number
          estado?: EstadoDespacho
        }
        Update: {
          pedido_id?: number
          fecha_despacho?: string
          created_at?: string
          direccion_entrega?: string
          fecha_entrega?: string | null
          updated_at?: string
          usuario_id?: number
          estado?: EstadoDespacho
        }
      }

      // Tabla: inventario
      inventario: {
        Row: {
          id: number
          nombre: string
          tipo: string
          unidad_medida: string
          stock_actual: number
          stock_minimo: number
          categoria_id: number | null
          producto_id: number | null
          cantidad_usada: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: never 
          nombre: string
          tipo: string
          unidad_medida: string
          stock_actual: number
          stock_minimo: number
          categoria_id?: number | null
          producto_id?: number | null
          cantidad_usada?: number | null
          created_at?: string
          updated_at: string
        }
        Update: {
          nombre?: string
          tipo?: string
          unidad_medida?: string
          stock_actual?: number
          stock_minimo?: number
          categoria_id?: number | null
          producto_id?: number | null
          cantidad_usada?: number | null
          created_at?: string
          updated_at?: string
        }
      }

      // Tabla: lista_materiales
      lista_materiales: {
        Row: {
          id: number
          producto_id: number | null
          insumo_id: number | null
          created_at: string
          cantidad_requerida: number | null
          updated_at: string | null
        }
        Insert: {
          id?: never
          producto_id?: number | null
          insumo_id?: number | null
          created_at?: string
          cantidad_requerida?: number | null
          updated_at?: string | null
        }
        Update: {
          producto_id?: number | null
          insumo_id?: number | null
          created_at?: string
          cantidad_requerida?: number | null
          updated_at?: string | null
        }
      }

      // Tabla: ordenes
      ordenes: {
        Row: {
          id: string
          cliente_id: string | null
          total: number
          estado: EstadoOrden
          metodo_pago: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          cliente_id?: string | null
          total: number
          estado?: EstadoOrden
          metodo_pago?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          total?: number
          estado?: EstadoOrden
          metodo_pago?: string | null
          updated_at?: string
        }
      }

      // Tabla: pedidos
      pedidos: {
        Row: {
          id: number
          orden_id: string
          producto_id: number
          cantidad: number
          talla: string
          precio_unitario: number
          estado: EstadoPedido
          especificaciones: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: never
          orden_id: string
          producto_id: number
          cantidad: number
          talla: string
          precio_unitario: number
          estado?: EstadoPedido
          especificaciones?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          cantidad?: number
          talla?: string
          estado?: EstadoPedido
          especificaciones?: Json | null
          updated_at?: string
        }
      }

      // Tabla: productos
      productos: {
        Row: {
          id: number
          nombre: string
          descripcion: string | null
          created_at: string
          categoria_id: number
          imagen: string | null
          precio: number
          stock: number
          stock_minimo: number
          updated_at: string
          estado: EstadoProducto
          sku: string
          ficha_url: string | null
        }
        Insert: {
          id?: never
          nombre: string
          descripcion?: string | null
          created_at?: string
          categoria_id: number
          imagen?: string | null
          precio: number
          stock?: number
          stock_minimo?: number
          updated_at: string
          estado?: EstadoProducto
          sku: string
          ficha_url?: string | null
        }
        Update: {
          nombre?: string
          descripcion?: string | null
          categoria_id?: number
          imagen?: string | null
          precio?: number
          stock?: number
          stock_minimo?: number
          updated_at?: string
          estado?: EstadoProducto
          sku?: string
          ficha_url?: string | null
        }
      }

      // Tabla: talleres
      talleres: {
        Row: {
          id: number
          nombre: string
          direccion: string
          telefono: string
          email: string | null
          created_at: string
          updated_at: string
          ruc: string
          contacto: string
          especialidad: string | null
          estado: EstadoTaller
        }
        Insert: {
          id?: number
          nombre: string
          direccion: string
          telefono: string
          email?: string | null
          created_at?: string
          updated_at: string
          ruc: string
          contacto: string
          especialidad?: string | null
          estado?: EstadoTaller
        }
        Update: {
          id?: number
          nombre?: string
          direccion?: string
          telefono?: string
          email?: string | null
          created_at?: string
          updated_at?: string
          ruc?: string
          contacto?: string
          especialidad?: string | null
          estado?: EstadoTaller
        }
      }

      // Tabla: usuarios
      usuarios: {
        Row: {
          id: number
          email: string
          nombre_completo: string
          telefono: string | null
          estado: EstadoUsuario
          rol: RolUsuario
          created_at: string
          updated_at: string
          auth_id: string | null
          ultimo_acceso: string | null
          created_by: string | null
        }
        Insert: {
          id?: number
          email: string
          nombre_completo: string
          telefono?: string | null
          estado?: EstadoUsuario
          rol?: RolUsuario
          created_at?: string
          updated_at: string
          auth_id?: string | null
          ultimo_acceso?: string | null
          created_by?: string | null
        }
        Update: {
          id?: number
          email?: string
          nombre_completo?: string
          telefono?: string | null
          estado?: EstadoUsuario
          rol?: RolUsuario
          created_at?: string
          updated_at?: string
          auth_id?: string | null
          ultimo_acceso?: string | null
          created_by?: string | null
        }
      }

      // Tabla: ventas
      ventas: {
        Row: {
          id: number
          orden_id: string
          subtotal: number
          impuestos: number
          total: number
          metodo_pago: string
          created_at: string
        }
        Insert: {
          id?: never
          orden_id: string
          subtotal: number
          impuestos: number
          total: number
          metodo_pago: string
          created_at?: string
        }
        Update: {
          // Generalmente no se actualiza
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      EstadoPedido: EstadoPedido
      EstadoConfeccion: EstadoConfeccion
      EstadoDespacho: EstadoDespacho
      EstadoProducto: EstadoProducto
      EstadoTaller: EstadoTaller
      PrioridadPedido: PrioridadPedido
      RolUsuario: RolUsuario
      EstadoUsuario: EstadoUsuario
      EstadoOrden: EstadoOrden
    }
  }
}

/**
 * Tipos de conveniencia
 */
export type Categoria = Database['public']['Tables']['categorias']['Row']
export type Cliente = Database['public']['Tables']['clientes']['Row']
export type Confeccion = Database['public']['Tables']['confecciones']['Row']
export type Despacho = Database['public']['Tables']['despachos']['Row']
export type Inventario = Database['public']['Tables']['inventario']['Row']
export type ListaMaterial = Database['public']['Tables']['lista_materiales']['Row']
export type Pedido = Database['public']['Tables']['pedidos']['Row']
export type Producto = Database['public']['Tables']['productos']['Row']
export type Taller = Database['public']['Tables']['talleres']['Row']
export type Usuario = Database['public']['Tables']['usuarios']['Row']
export type Orden = Database['public']['Tables']['ordenes']['Row']
export type Venta = Database['public']['Tables']['ventas']['Row']

/**
 * Tipos para inserts
 */
export type CategoriaInsert = Database['public']['Tables']['categorias']['Insert']
export type ClienteInsert = Database['public']['Tables']['clientes']['Insert']
export type ConfeccionInsert = Database['public']['Tables']['confecciones']['Insert']
export type DespachoInsert = Database['public']['Tables']['despachos']['Insert']
export type InventarioInsert = Database['public']['Tables']['inventario']['Insert']
export type ListaMaterialInsert = Database['public']['Tables']['lista_materiales']['Insert']
export type PedidoInsert = Database['public']['Tables']['pedidos']['Insert']
export type ProductoInsert = Database['public']['Tables']['productos']['Insert']
export type TallerInsert = Database['public']['Tables']['talleres']['Insert']
export type UsuarioInsert = Database['public']['Tables']['usuarios']['Insert']
export type OrdenInsert = Database['public']['Tables']['ordenes']['Insert']
export type VentaInsert = Database['public']['Tables']['ventas']['Insert']

/**
 * Tipos para updates
 */
export type CategoriaUpdate = Database['public']['Tables']['categorias']['Update']
export type ClienteUpdate = Database['public']['Tables']['clientes']['Update']
export type ConfeccionUpdate = Database['public']['Tables']['confecciones']['Update']
export type DespachoUpdate = Database['public']['Tables']['despachos']['Update']
export type InventarioUpdate = Database['public']['Tables']['inventario']['Update']
export type ListaMaterialUpdate = Database['public']['Tables']['lista_materiales']['Update']
export type PedidoUpdate = Database['public']['Tables']['pedidos']['Update']
export type ProductoUpdate = Database['public']['Tables']['productos']['Update']
export type TallerUpdate = Database['public']['Tables']['talleres']['Update']
export type UsuarioUpdate = Database['public']['Tables']['usuarios']['Update']
export type OrdenUpdate = Database['public']['Tables']['ordenes']['Update']

/**
 * Tipo extendido para Inventario
 */
export type InventarioConRelaciones = Inventario & {
  categorias: {
    nombre: string
  } | null
  productos: {
    nombre: string
  } | null
}