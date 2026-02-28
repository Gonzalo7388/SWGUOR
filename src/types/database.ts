export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      categorias: {
        Row: {
          activo: boolean | null
          created_at: string
          descripcion: string | null
          id: number
          imagen: string | null
          nombre: string
          orden: number | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string
          descripcion?: string | null
          id?: number
          imagen?: string | null
          nombre: string
          orden?: number | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string
          descripcion?: string | null
          id?: number
          imagen?: string | null
          nombre?: string
          orden?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      clientes: {
        Row: {
          activo: Database["public"]["Enums"]["EstadoCliente"] | null
          auth_id: string | null
          created_at: string
          direccion: string | null
          email: string | null
          id: number
          razon_social: string | null
          ruc: number
          telefono: number | null
          tipo: Database["public"]["Enums"]["TipoCliente"] | null
          updated_at: string
        }
        Insert: {
          activo?: Database["public"]["Enums"]["EstadoCliente"] | null
          auth_id?: string | null
          created_at?: string
          direccion?: string | null
          email?: string | null
          id?: number
          razon_social?: string | null
          ruc: number
          telefono?: number | null
          tipo?: Database["public"]["Enums"]["TipoCliente"] | null
          updated_at?: string
        }
        Update: {
          activo?: Database["public"]["Enums"]["EstadoCliente"] | null
          auth_id?: string | null
          created_at?: string
          direccion?: string | null
          email?: string | null
          id?: number
          razon_social?: string | null
          ruc?: number
          telefono?: number | null
          tipo?: Database["public"]["Enums"]["TipoCliente"] | null
          updated_at?: string
        }
        Relationships: []
      }
      confecciones: {
        Row: {
          created_at: string
          estado: Database["public"]["Enums"]["EstadoConfeccion"]
          fecha_fin: string | null
          fecha_inicio: string
          id: number
          observaciones: string | null
          pedido_id: number
          taller_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          estado?: Database["public"]["Enums"]["EstadoConfeccion"]
          fecha_fin?: string | null
          fecha_inicio: string
          id?: number
          observaciones?: string | null
          pedido_id: number
          taller_id: number
          updated_at: string
        }
        Update: {
          created_at?: string
          estado?: Database["public"]["Enums"]["EstadoConfeccion"]
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: number
          observaciones?: string | null
          pedido_id?: number
          taller_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "confecciones_taller_id_fkey"
            columns: ["taller_id"]
            isOneToOne: false
            referencedRelation: "talleres"
            referencedColumns: ["id"]
          },
        ]
      }
      cotizaciones: {
        Row: {
          cliente_id: number | null
          cotizacion_id: string
          descripcion: string | null
          estado: Database["public"]["Enums"]["EstadoCotizacion"] | null
          fecha_creacion: string
          id: number
          monto: number
          updated_at: string
          vencimiento: string | null
        }
        Insert: {
          cliente_id?: number | null
          cotizacion_id: string
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["EstadoCotizacion"] | null
          fecha_creacion?: string
          id?: number
          monto?: number
          updated_at?: string
          vencimiento?: string | null
        }
        Update: {
          cliente_id?: number | null
          cotizacion_id?: string
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["EstadoCotizacion"] | null
          fecha_creacion?: string
          id?: number
          monto?: number
          updated_at?: string
          vencimiento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cotizaciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      despachos: {
        Row: {
          created_at: string
          direccion_entrega: string
          estado: Database["public"]["Enums"]["EstadoDespacho"]
          fecha_despacho: string
          fecha_entrega: string | null
          id: number
          pedido_id: number
          updated_at: string
          usuario_id: number
        }
        Insert: {
          created_at?: string
          direccion_entrega: string
          estado?: Database["public"]["Enums"]["EstadoDespacho"]
          fecha_despacho: string
          fecha_entrega?: string | null
          id?: number
          pedido_id: number
          updated_at: string
          usuario_id: number
        }
        Update: {
          created_at?: string
          direccion_entrega?: string
          estado?: Database["public"]["Enums"]["EstadoDespacho"]
          fecha_despacho?: string
          fecha_entrega?: string | null
          id?: number
          pedido_id?: number
          updated_at?: string
          usuario_id?: number
        }
        Relationships: []
      }
      detalles_orden: {
        Row: {
          cantidad: number
          color: string | null
          id: number
          orden_id: number
          precio_unitario: number
          producto_id: number
          subtotal: number
          talla: Database["public"]["Enums"]["TallaProductos"] | null
        }
        Insert: {
          cantidad: number
          color?: string | null
          id?: number
          orden_id: number
          precio_unitario: number
          producto_id: number
          subtotal: number
          talla?: Database["public"]["Enums"]["TallaProductos"] | null
        }
        Update: {
          cantidad?: number
          color?: string | null
          id?: number
          orden_id?: number
          precio_unitario?: number
          producto_id?: number
          subtotal?: number
          talla?: Database["public"]["Enums"]["TallaProductos"] | null
        }
        Relationships: [
          {
            foreignKeyName: "detalles_orden_orden_id_fkey"
            columns: ["orden_id"]
            isOneToOne: false
            referencedRelation: "ordenes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "detalles_orden_producto_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      insumo: {
        Row: {
          created_at: string
          id: number
          nombre: string
          precio_unitario: number | null
          proveedor: string | null
          stock_actual: number
          stock_minimo: number
          tipo: Database["public"]["Enums"]["TipoInsumo"]
          unidad_medida: Database["public"]["Enums"]["UnidadMedida"]
        }
        Insert: {
          created_at?: string
          id?: number
          nombre: string
          precio_unitario?: number | null
          proveedor?: string | null
          stock_actual?: number
          stock_minimo?: number
          tipo: Database["public"]["Enums"]["TipoInsumo"]
          unidad_medida?: Database["public"]["Enums"]["UnidadMedida"]
        }
        Update: {
          created_at?: string
          id?: number
          nombre?: string
          precio_unitario?: number | null
          proveedor?: string | null
          stock_actual?: number
          stock_minimo?: number
          tipo?: Database["public"]["Enums"]["TipoInsumo"]
          unidad_medida?: Database["public"]["Enums"]["UnidadMedida"]
        }
        Relationships: []
      }
      movimientos_inventario: {
        Row: {
          cantidad: number | null
          created_at: string
          id: number
          insumo_id: number | null
          motivo: string | null
          producto_id: number | null
          tipo_movimiento: Database["public"]["Enums"]["TipoMovimiento"] | null
          usuario_id: number | null
        }
        Insert: {
          cantidad?: number | null
          created_at?: string
          id?: number
          insumo_id?: number | null
          motivo?: string | null
          producto_id?: number | null
          tipo_movimiento?: Database["public"]["Enums"]["TipoMovimiento"] | null
          usuario_id?: number | null
        }
        Update: {
          cantidad?: number | null
          created_at?: string
          id?: number
          insumo_id?: number | null
          motivo?: string | null
          producto_id?: number | null
          tipo_movimiento?: Database["public"]["Enums"]["TipoMovimiento"] | null
          usuario_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_inventario_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_inventario_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_inventario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      ordenes: {
        Row: {
          cliente_id: number | null
          created_at: string
          estado: Database["public"]["Enums"]["EstadoOrden"] | null
          id: number
          impuestos: number
          metodo_pago: Database["public"]["Enums"]["MetodoPago"] | null
          notas_internas: string | null
          payment_id: string | null
          subtotal: number
          total: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cliente_id?: number | null
          created_at?: string
          estado?: Database["public"]["Enums"]["EstadoOrden"] | null
          id?: number
          impuestos?: number
          metodo_pago?: Database["public"]["Enums"]["MetodoPago"] | null
          notas_internas?: string | null
          payment_id?: string | null
          subtotal?: number
          total?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cliente_id?: number | null
          created_at?: string
          estado?: Database["public"]["Enums"]["EstadoOrden"] | null
          id?: number
          impuestos?: number
          metodo_pago?: Database["public"]["Enums"]["MetodoPago"] | null
          notas_internas?: string | null
          payment_id?: string | null
          subtotal?: number
          total?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ordenes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          cantidad: number | null
          created_at: string
          created_by: string | null
          especificaciones: Json | null
          estado: Database["public"]["Enums"]["EstadoPedido"] | null
          fecha_pedido: string | null
          id: number
          nombre_producto_snapshot: string | null
          orden_id: number | null
          precio_unitario: number | null
          prioridad: Database["public"]["Enums"]["PrioridadPedido"] | null
          producto_id: number | null
          talla: Database["public"]["Enums"]["TallaProductos"] | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          cantidad?: number | null
          created_at?: string
          created_by?: string | null
          especificaciones?: Json | null
          estado?: Database["public"]["Enums"]["EstadoPedido"] | null
          fecha_pedido?: string | null
          id?: number
          nombre_producto_snapshot?: string | null
          orden_id?: number | null
          precio_unitario?: number | null
          prioridad?: Database["public"]["Enums"]["PrioridadPedido"] | null
          producto_id?: number | null
          talla?: Database["public"]["Enums"]["TallaProductos"] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          cantidad?: number | null
          created_at?: string
          created_by?: string | null
          especificaciones?: Json | null
          estado?: Database["public"]["Enums"]["EstadoPedido"] | null
          fecha_pedido?: string | null
          id?: number
          nombre_producto_snapshot?: string | null
          orden_id?: number | null
          precio_unitario?: number | null
          prioridad?: Database["public"]["Enums"]["PrioridadPedido"] | null
          producto_id?: number | null
          talla?: Database["public"]["Enums"]["TallaProductos"] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_orden_id_fkey"
            columns: ["orden_id"]
            isOneToOne: false
            referencedRelation: "ordenes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      productos: {
        Row: {
          categoria_id: number | null
          created_at: string
          descripcion: string | null
          destacado: boolean | null
          estado: Database["public"]["Enums"]["EstadoProducto"]
          id: number
          imagen: string | null
          nombre: string
          precio: number
          sku: string
          stock: number
          updated_at: string
        }
        Insert: {
          categoria_id?: number | null
          created_at?: string
          descripcion?: string | null
          destacado?: boolean | null
          estado?: Database["public"]["Enums"]["EstadoProducto"]
          id?: number
          imagen?: string | null
          nombre: string
          precio: number
          sku: string
          stock?: number
          updated_at: string
        }
        Update: {
          categoria_id?: number | null
          created_at?: string
          descripcion?: string | null
          destacado?: boolean | null
          estado?: Database["public"]["Enums"]["EstadoProducto"]
          id?: number
          imagen?: string | null
          nombre?: string
          precio?: number
          sku?: string
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "productos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      talleres: {
        Row: {
          contacto: string
          created_at: string
          direccion: string
          email: string | null
          especialidad: Database["public"]["Enums"]["EspecialidadTaller"] | null
          estado: Database["public"]["Enums"]["EstadoTaller"]
          id: number
          nombre: string
          ruc: string
          telefono: string
          updated_at: string
        }
        Insert: {
          contacto: string
          created_at?: string
          direccion: string
          email?: string | null
          especialidad?:
            | Database["public"]["Enums"]["EspecialidadTaller"]
            | null
          estado?: Database["public"]["Enums"]["EstadoTaller"]
          id?: number
          nombre: string
          ruc: string
          telefono: string
          updated_at: string
        }
        Update: {
          contacto?: string
          created_at?: string
          direccion?: string
          email?: string | null
          especialidad?:
            | Database["public"]["Enums"]["EspecialidadTaller"]
            | null
          estado?: Database["public"]["Enums"]["EstadoTaller"]
          id?: number
          nombre?: string
          ruc?: string
          telefono?: string
          updated_at?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          auth_id: string | null
          avatar_url: string | null
          created_at: string | null
          created_by: string | null
          email: string
          estado: Database["public"]["Enums"]["EstadoUsuario"] | null
          id: number
          nombre_completo: string
          rol: Database["public"]["Enums"]["rol"] | null
          telefono: string | null
          ultimo_acceso: string | null
          updated_at: string | null
        }
        Insert: {
          auth_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string | null
          email: string
          estado?: Database["public"]["Enums"]["EstadoUsuario"] | null
          id?: number
          nombre_completo: string
          rol?: Database["public"]["Enums"]["rol"] | null
          telefono?: string | null
          ultimo_acceso?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string
          estado?: Database["public"]["Enums"]["EstadoUsuario"] | null
          id?: number
          nombre_completo?: string
          rol?: Database["public"]["Enums"]["rol"] | null
          telefono?: string | null
          ultimo_acceso?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      variantes_producto: {
        Row: {
          color: Database["public"]["Enums"]["ColorPrenda"]
          created_at: string | null
          estado: Database["public"]["Enums"]["EstadoProducto"]
          id: number
          imagen_url: string | null
          nombre: string
          precio_adicional: number
          producto_id: number
          sku: string
          stock_adicional: number
          talla: Database["public"]["Enums"]["TallaProductos"]
          updated_at: string | null
        }
        Insert: {
          color: Database["public"]["Enums"]["ColorPrenda"]
          created_at?: string | null
          estado?: Database["public"]["Enums"]["EstadoProducto"]
          id?: number
          imagen_url?: string | null
          nombre: string
          precio_adicional?: number
          producto_id: number
          sku: string
          stock_adicional?: number
          talla: Database["public"]["Enums"]["TallaProductos"]
          updated_at?: string | null
        }
        Update: {
          color?: Database["public"]["Enums"]["ColorPrenda"]
          created_at?: string | null
          estado?: Database["public"]["Enums"]["EstadoProducto"]
          id?: number
          imagen_url?: string | null
          nombre?: string
          precio_adicional?: number
          producto_id?: number
          sku?: string
          stock_adicional?: number
          talla?: Database["public"]["Enums"]["TallaProductos"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "variantes_producto_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      ventas: {
        Row: {
          created_at: string | null
          id: string
          impuestos: number
          metodo_pago: Database["public"]["Enums"]["MetodoPago"] | null
          numero_comprobante: string | null
          orden_id: number
          subtotal: number
          tipo_comprobante:
            | Database["public"]["Enums"]["TipoComprobante"]
            | null
          total: number
          updated_at: string | null
          vendedor_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          impuestos?: number
          metodo_pago?: Database["public"]["Enums"]["MetodoPago"] | null
          numero_comprobante?: string | null
          orden_id: number
          subtotal?: number
          tipo_comprobante?:
            | Database["public"]["Enums"]["TipoComprobante"]
            | null
          total?: number
          updated_at?: string | null
          vendedor_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          impuestos?: number
          metodo_pago?: Database["public"]["Enums"]["MetodoPago"] | null
          numero_comprobante?: string | null
          orden_id?: number
          subtotal?: number
          tipo_comprobante?:
            | Database["public"]["Enums"]["TipoComprobante"]
            | null
          total?: number
          updated_at?: string | null
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ventas_orden_id_fkey"
            columns: ["orden_id"]
            isOneToOne: false
            referencedRelation: "ordenes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      actualizar_ultimo_acceso: {
        Args: { usuario_id: number }
        Returns: undefined
      }
      check_user_role: {
        Args: { target_roles: Database["public"]["Enums"]["rol"][] }
        Returns: boolean
      }
      create_user_with_creator: {
        Args: {
          auth_id_input: string
          email_input: string
          nombre_completo_input: string
          rol_input: string
          telefono_input: string
        }
        Returns: undefined
      }
      decrement_inventory: {
        Args: { p_id: number; p_qty: number }
        Returns: undefined
      }
      decrement_stock: {
        Args: { quantity: number; row_id: string }
        Returns: undefined
      }
      get_dashboard_stats: { Args: never; Returns: Json }
      get_my_role: { Args: never; Returns: Database["public"]["Enums"]["rol"] }
      get_user_id: { Args: never; Returns: number }
      get_user_role: { Args: never; Returns: string }
      has_role: { Args: { required_role: string }; Returns: boolean }
      increment_stock: {
        Args: { quantity: number; row_id: string }
        Returns: undefined
      }
      insert_new_user_with_creator: {
        Args: {
          auth_id_input: string
          email_input: string
          nombre_completo_input: string
          rol_input: string
          telefono_input: string
        }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_role: {
        Args: { target_roles: Database["public"]["Enums"]["rol"][] }
        Returns: boolean
      }
      is_staff: { Args: never; Returns: boolean }
      reduce_stock_from_order: {
        Args: { p_orden_id: number }
        Returns: undefined
      }
      reset_productos_sequence: {
        Args: { new_value?: number }
        Returns: undefined
      }
      restar_stock: {
        Args: { cantidad_param: number; producto_id_param: string }
        Returns: undefined
      }
      sumar_stock: {
        Args: { cantidad_param: number; producto_id_param: string }
        Returns: undefined
      }
      verificar_stock_bajo: {
        Args: never
        Returns: {
          categoria_nombre: string
          nombre: string
          producto_id: number
          stock: number
          stock_minimo: number
        }[]
      }
    }
    Enums: {
      ColorPrenda:
        | "Blanco"
        | "Negro"
        | "Gris"
        | "Beige"
        | "Marrón pastel"
        | "Azul jean"
        | "Azul marino"
        | "Rojo"
        | "Rosa pastel"
        | "Morado claro"
        | "Verde olivo"
        | "Amarillo"
        | "Naranja"
        | "Multicolor"
        | "Único"
        | "Vino"
        | "Camel"
        | "Crema"
        | "Celeste"
        | "Amarillo limón"
      EspecialidadTaller:
        | "corte"
        | "confección"
        | "bordado"
        | "estampado"
        | "costura"
        | "acabados"
        | "otro"
      EstadoCategoria: "activo" | "inactivo"
      EstadoCliente: "activo" | "inactivo" | "suspendido" | "potencial"
      EstadoConfeccion: "corte" | "confeccionando" | "remallado" | "terminado"
      EstadoCotizacion: "pendiente" | "aceptada" | "rechazada" | "expirada"
      EstadoDespacho: "pendiente" | "en_ruta" | "entregado"
      EstadoOrden:
        | "solicitado"
        | "cotizado"
        | "aprobado"
        | "pagado"
        | "en_proceso"
        | "finalizado"
        | "cancelado"
      EstadoPago: "pendiente" | "pagado_parcial" | "pagado" | "vencido"
      EstadoPedido:
        | "pendiente"
        | "corte"
        | "costura"
        | "acabado"
        | "completado"
        | "cancelado"
      EstadoProducto: "activo" | "inactivo" | "agotado" | "descontinuado"
      EstadoTaller: "activo" | "inactivo" | "suspendido"
      EstadoUsuario: "activo" | "inactivo" | "suspendido"
      MetodoPago:
        | "efectivo"
        | "transferencia_bcp"
        | "yape"
        | "plin"
        | "visa"
        | "mastercard"
      PrioridadPedido: "baja" | "normal" | "alta" | "urgente"
      rol:
        | "administrador"
        | "cortador"
        | "diseñador"
        | "recepcionista"
        | "ayudante"
        | "representante_taller"
      TallaProductos:
        | "XS"
        | "S"
        | "M"
        | "L"
        | "XL"
        | "XXL"
        | "28"
        | "30"
        | "32"
        | "34"
      TipoCategoria: "producto" | "insumo"
      TipoCliente: "corporativo" | "minorista" | "distribuidor"
      TipoComprobante: "boleta" | "factura" | "nota_venta"
      TipoInsumo: "tela" | "hilo" | "avio" | "boton" | "cierre"
      TipoMovimiento: "entrada" | "salida" | "ajuste"
      UnidadMedida:
        | "metros"
        | "unidades"
        | "conos"
        | "docenas"
        | "kilogramos"
        | "set"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ColorPrenda: [
        "Blanco",
        "Negro",
        "Gris",
        "Beige",
        "Marrón pastel",
        "Azul jean",
        "Azul marino",
        "Rojo",
        "Rosa pastel",
        "Morado claro",
        "Verde olivo",
        "Amarillo",
        "Naranja",
        "Multicolor",
        "Único",
        "Vino",
        "Camel",
        "Crema",
        "Celeste",
        "Amarillo limón",
      ],
      EspecialidadTaller: [
        "corte",
        "confección",
        "bordado",
        "estampado",
        "costura",
        "acabados",
        "otro",
      ],
      EstadoCategoria: ["activo", "inactivo"],
      EstadoCliente: ["activo", "inactivo", "suspendido", "potencial"],
      EstadoConfeccion: ["corte", "confeccionando", "remallado", "terminado"],
      EstadoCotizacion: ["pendiente", "aceptada", "rechazada", "expirada"],
      EstadoDespacho: ["pendiente", "en_ruta", "entregado"],
      EstadoOrden: [
        "solicitado",
        "cotizado",
        "aprobado",
        "pagado",
        "en_proceso",
        "finalizado",
        "cancelado",
      ],
      EstadoPago: ["pendiente", "pagado_parcial", "pagado", "vencido"],
      EstadoPedido: [
        "pendiente",
        "corte",
        "costura",
        "acabado",
        "completado",
        "cancelado",
      ],
      EstadoProducto: ["activo", "inactivo", "agotado", "descontinuado"],
      EstadoTaller: ["activo", "inactivo", "suspendido"],
      EstadoUsuario: ["activo", "inactivo", "suspendido"],
      MetodoPago: [
        "efectivo",
        "transferencia_bcp",
        "yape",
        "plin",
        "visa",
        "mastercard",
      ],
      PrioridadPedido: ["baja", "normal", "alta", "urgente"],
      rol: [
        "administrador",
        "cortador",
        "diseñador",
        "recepcionista",
        "ayudante",
        "representante_taller",
      ],
      TallaProductos: [
        "XS",
        "S",
        "M",
        "L",
        "XL",
        "XXL",
        "28",
        "30",
        "32",
        "34",
      ],
      TipoCategoria: ["producto", "insumo"],
      TipoCliente: ["corporativo", "minorista", "distribuidor"],
      TipoComprobante: ["boleta", "factura", "nota_venta"],
      TipoInsumo: ["tela", "hilo", "avio", "boton", "cierre"],
      TipoMovimiento: ["entrada", "salida", "ajuste"],
      UnidadMedida: [
        "metros",
        "unidades",
        "conos",
        "docenas",
        "kilogramos",
        "set",
      ],
    },
  },
} as const
