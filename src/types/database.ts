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
export type EstadoPedido = 'pendiente' | 'corte' | 'costura' | 'acabado' | 'completado' | 'cancelado';
export type EstadoConfeccion = 'corte' | 'confeccionando' | 'remallado' | 'terminado';
export type EstadoDespacho = 'pendiente' | 'en_ruta' | 'entregado';
export type EstadoProducto = 'activo' | 'inactivo' | 'agotado';
export type EstadoTaller = 'activo' | 'inactivo' | 'suspendido';
export type PrioridadPedido = 'baja' | 'normal' | 'alta' | 'urgente';
export type RolUsuario = 'administrador' | 'cortador' | 'diseñador' | 'recepcionista' | 'ayudante' | 'representante_taller';
export type EstadoUsuario = 'activo' | 'inactivo' | 'suspendido';
export type EstadoOrden = 'solicitado' | 'cotizado' | 'aprobado' | 'pagado' | 'en_proceso' | 'finalizado' | 'cancelado';
export type EstadoCliente = 'activo' | 'inactivo' | 'suspendido' | 'potencial';
export type EstadoCategoria = 'activo' | 'inactivo';
export type TipoComprobante = 'boleta' | 'factura' | 'nota_venta';
export type MetodoPago = 'efectivo' | 'yape' | 'plin' | 'transferencia_bcp' | 'transferencia_interbank' | 'tarjeta';
export type TipoInsumo = 'insumo' | 'producto_terminado';
export type UnidadMedida = 'metros' | 'unidades' | 'conos' | 'docenas' | 'kilogramos' | 'set';
export type TipoCliente = 'corporativo' | 'minorista' | 'distribuidor';
export type EstadoCotizacion = 'pendiente' | 'aceptada' | 'rechazada' | 'vencida';

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
          activo: EstadoCategoria
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          nombre: string
          descripcion?: string | null
          activo?: EstadoCategoria
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          nombre?: string
          descripcion?: string | null
          activo?: EstadoCategoria
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
          tipo: TipoCliente
          activo: EstadoCliente | null
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
          tipo?: TipoCliente
          activo?: EstadoCliente | null
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
          tipo?: TipoCliente
          activo?: EstadoCliente | null
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
          updated_at?: string
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

      // Tabla: cotizaciones
      cotizaciones:{
        Row: {
          id: number
          cotizacion_id: string
          cliente_id: number
          descripcion: string | null
          monto: number
          estado: EstadoCotizacion
          vencimiento: string
          fecha_creacion: string
          updated_at: string

        }
        Insert: {
          id?: number
          cotizacion_id: string
          cliente_id: number
          descripcion?: string | null
          monto: number
          estado?: EstadoCotizacion
          vencimiento: string
          fecha_creacion?: string
          updated_at?: string
        }
        Update: {
          cotizacion_id?: string
          cliente_id?: number
          descripcion?: string | null
          monto?: number
          estado?: EstadoCotizacion
          vencimiento?: string
          fecha_creacion?: string
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
          updated_at?: string
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
          sku: string | null
          nombre: string
          tipo: TipoInsumo
          unidad_medida: UnidadMedida 
          stock_actual: number
          stock_minimo: number
          costo_unitario: number | null
          precio_venta: number | null
          categoria_id: number | null
          producto_id: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: never // El ID es generado por identidad
          sku?: string | null
          nombre: string
          tipo: TipoInsumo
          unidad_medida?: UnidadMedida
          stock_actual?: number
          stock_minimo?: number
          costo_unitario?: number | null
          precio_venta?: number | null
          categoria_id?: number | null
          producto_id?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          sku?: string | null
          nombre?: string
          tipo?: TipoInsumo
          unidad_medida?: UnidadMedida
          stock_actual?: number
          stock_minimo?: number
          costo_unitario?: number | null
          precio_venta?: number | null
          categoria_id?: number | null
          producto_id?: number | null
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

      // Tabla: ordenes (El encabezado)
      ordenes: {
        Row: {
          id: string
          cliente_id: number
          total: number
          estado: EstadoOrden
          metodo_pago: MetodoPago | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          cliente_id: number
          total: number
          estado?: EstadoOrden
          metodo_pago?: MetodoPago | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cliente_id?: number
          total?: number
          estado?: EstadoOrden
          metodo_pago?: MetodoPago | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }

      // Tabla: detalles_orden
      detalles_orden: {
        Row: {
          id: number
          orden_id: string
          producto_id: number
          cantidad: number
          precio_unitario: number
          subtotal: number
          talla: string
          color: string | null
        }
        Insert: {
          id?: never
          orden_id: string
          producto_id: number
          cantidad: number
          precio_unitario: number
          subtotal?: number
          talla: string
          color?: string | null
        }
        Update: {
          id?: number
          orden_id?: string
          producto_id?: number
          cantidad?: number
          precio_unitario?: number
          subtotal?: number
          talla?: string
          color?: string | null
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
          updated_at?: string
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
          updated_at?: string
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
          avatar_url: string | null
        }
        Insert: {
          id?: never
          email: string
          nombre_completo: string
          telefono?: string | null
          estado?: EstadoUsuario
          rol?: RolUsuario
          created_at?: string
          updated_at?: string
          auth_id?: string | null
          ultimo_acceso?: string | null
          created_by?: string | null
          avatar_url?: string | null
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
          avatar_url?: string | null
        }
      }

      // Tabla: ventas
      ventas: {
        Row: {
          id: number
          orden_id: string
          vendedor_id: number
          subtotal: number
          impuestos: number
          total: number
          metodo_pago: MetodoPago
          tipo_comprobante: TipoComprobante
          numero_comprobante: string | null
          created_at: string
        }
        Insert: {
          id?: never
          orden_id: string
          vendedor_id: number
          subtotal: number
          impuestos: number
          total: number
          metodo_pago: MetodoPago
          tipo_comprobante: TipoComprobante
          numero_comprobante?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          orden_id?: string
          vendedor_id?: number
          subtotal?: number
          impuestos?: number
          total?: number
          metodo_pago?: MetodoPago
          tipo_comprobante?: TipoComprobante
          numero_comprobante?: string | null
          created_at?: string
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
      estado_pedido: EstadoPedido
      estado_confeccion: EstadoConfeccion
      estado_despacho: EstadoDespacho
      estado_producto: EstadoProducto
      estado_taller: EstadoTaller
      prioridad_pedido: PrioridadPedido
      rol: RolUsuario
      estado_usuario: EstadoUsuario
      estado_orden: EstadoOrden
      estado_cliente: EstadoCliente
      estado_categoria: EstadoCategoria
      tipo_comprobante: TipoComprobante
      metodo_pago: MetodoPago
      tipo_insumo: TipoInsumo
      unidad_medida: UnidadMedida
      tipo_cliente: TipoCliente
      estado_cotizacion: EstadoCotizacion
    }
    CompositeTypes: {
      [_ in never]: never
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
export type DetalleOrden = Database['public']['Tables']['detalles_orden']['Row']
export type Cotizacion = Database['public']['Tables']['cotizaciones']['Row']

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
export type DetalleOrdenInsert = Database['public']['Tables']['detalles_orden']['Insert']
export type CotizacionInsert = Database['public']['Tables']['cotizaciones']['Insert']

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
export type VentaUpdate = Database['public']['Tables']['ventas']['Update']
export type DetalleOrdenUpdate = Database['public']['Tables']['detalles_orden']['Update']
export type CotizacionUpdate = Database['public']['Tables']['cotizaciones']['Update']

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

/**
 *  Interfaz para filtros de búsqueda en el Panel
 */
export interface FiltrosOrden {
  estado?: EstadoOrden;
  cliente_id?: number;
  user_id?: string;
  metodo_pago?: MetodoPago;
  fecha_desde?: string;
  fecha_hasta?: string;
}

/**
 *  Estructura para los KPIs del Dashboard
 */
export interface EstadisticasOrden {
  total_ordenes: number;
  total_ventas: number;
  promedio_venta: number;
  ordenes_por_estado: Record<EstadoOrden, number>;
}

/**
 *  Verificación de stock para el carrito
 */
export interface VerificacionStock {
  disponible: boolean;
  faltantes: {
    producto_id: number;
    nombre: string;
    requerido: number;
    disponible: number;
    faltante: number;
  }[];
}

/**
 *  Orden con datos del Cliente y Detalles
 *  Se usa en obtenerOrdenPorId y obtenerOrdenes
 */
export type OrdenCompleta = Orden & {
  clientes: Pick<Cliente, 'id' | 'razon_social' | 'ruc' | 'email' | 'telefono' | 'direccion'> | null;
  detalles_orden?: (DetalleOrden & {
    productos: Pick<Producto, 'id' | 'nombre' | 'sku' | 'imagen' | 'precio'> | null;
  })[];
  usuarios?: Pick<Usuario, 'nombre_completo' | 'rol'> | null;
};