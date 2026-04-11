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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      asientos_contables: {
        Row: {
          created_at: string
          cuenta: Database["public"]["Enums"]["CuentaContable"]
          descripcion: string | null
          fecha: string
          id: number
          monto: number
          orden_id: number | null
          pago_id: number | null
          tipo: Database["public"]["Enums"]["TipoAsiento"]
          usuario_id: number | null
          venta_id: string | null
        }
        Insert: {
          created_at?: string
          cuenta: Database["public"]["Enums"]["CuentaContable"]
          descripcion?: string | null
          fecha?: string
          id?: number
          monto: number
          orden_id?: number | null
          pago_id?: number | null
          tipo: Database["public"]["Enums"]["TipoAsiento"]
          usuario_id?: number | null
          venta_id?: string | null
        }
        Update: {
          created_at?: string
          cuenta?: Database["public"]["Enums"]["CuentaContable"]
          descripcion?: string | null
          fecha?: string
          id?: number
          monto?: number
          orden_id?: number | null
          pago_id?: number | null
          tipo?: Database["public"]["Enums"]["TipoAsiento"]
          usuario_id?: number | null
          venta_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asientos_contables_orden_id_fkey"
            columns: ["orden_id"]
            isOneToOne: false
            referencedRelation: "ordenes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asientos_contables_pago_id_fkey"
            columns: ["pago_id"]
            isOneToOne: false
            referencedRelation: "pagos_orden"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asientos_contables_venta_id_fkey"
            columns: ["venta_id"]
            isOneToOne: false
            referencedRelation: "ventas"
            referencedColumns: ["id"]
          },
        ]
      }
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
          apellido_materno: string | null
          apellido_paterno: string | null
          categoria_cliente: string | null
          codigo_cliente: string | null
          created_at: string
          direccion_fiscal: string | null
          email: string | null
          estado_comercial: string | null
          forma_pago_defecto: string | null
          id: number
          impuesto_defecto: string | null
          lista_precios: string | null
          metodo_comercial: string | null
          moneda_defecto: string | null
          nombre: string | null
          nombre_comercial: string | null
          pais: string | null
          razon_social: string | null
          ruc: string
          sector: string | null
          sub_sector: string | null
          telefono: string | null
          tipo_documento: string | null
          tipo_pedido_defecto: string | null
          updated_at: string
          usuario_id: number | null
        }
        Insert: {
          activo?: Database["public"]["Enums"]["EstadoCliente"] | null
          apellido_materno?: string | null
          apellido_paterno?: string | null
          categoria_cliente?: string | null
          codigo_cliente?: string | null
          created_at?: string
          direccion_fiscal?: string | null
          email?: string | null
          estado_comercial?: string | null
          forma_pago_defecto?: string | null
          id?: number
          impuesto_defecto?: string | null
          lista_precios?: string | null
          metodo_comercial?: string | null
          moneda_defecto?: string | null
          nombre?: string | null
          nombre_comercial?: string | null
          pais?: string | null
          razon_social?: string | null
          ruc: string
          sector?: string | null
          sub_sector?: string | null
          telefono?: string | null
          tipo_documento?: string | null
          tipo_pedido_defecto?: string | null
          updated_at?: string
          usuario_id?: number | null
        }
        Update: {
          activo?: Database["public"]["Enums"]["EstadoCliente"] | null
          apellido_materno?: string | null
          apellido_paterno?: string | null
          categoria_cliente?: string | null
          codigo_cliente?: string | null
          created_at?: string
          direccion_fiscal?: string | null
          email?: string | null
          estado_comercial?: string | null
          forma_pago_defecto?: string | null
          id?: number
          impuesto_defecto?: string | null
          lista_precios?: string | null
          metodo_comercial?: string | null
          moneda_defecto?: string | null
          nombre?: string | null
          nombre_comercial?: string | null
          pais?: string | null
          razon_social?: string | null
          ruc?: string
          sector?: string | null
          sub_sector?: string | null
          telefono?: string | null
          tipo_documento?: string | null
          tipo_pedido_defecto?: string | null
          updated_at?: string
          usuario_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      comprobantes: {
        Row: {
          correlativo: string
          emitido_en: string | null
          id: number
          orden_id: number
          pdf_url: string | null
          serie: string
          tipo: string
          xml_url: string | null
        }
        Insert: {
          correlativo: string
          emitido_en?: string | null
          id?: number
          orden_id: number
          pdf_url?: string | null
          serie: string
          tipo: string
          xml_url?: string | null
        }
        Update: {
          correlativo?: string
          emitido_en?: string | null
          id?: number
          orden_id?: number
          pdf_url?: string | null
          serie?: string
          tipo?: string
          xml_url?: string | null
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
          responsable_id: number | null
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
          responsable_id?: number | null
          taller_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          estado?: Database["public"]["Enums"]["EstadoConfeccion"]
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: number
          observaciones?: string | null
          pedido_id?: number
          responsable_id?: number | null
          taller_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "confecciones_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "confecciones_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "confecciones_taller_id_fkey"
            columns: ["taller_id"]
            isOneToOne: false
            referencedRelation: "talleres"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracion_sistema: {
        Row: {
          categoria: string
          clave: string
          descripcion: string | null
          id: number
          tipo_dato: string
          updated_at: string
          updated_by: string | null
          valor: string
        }
        Insert: {
          categoria?: string
          clave: string
          descripcion?: string | null
          id?: number
          tipo_dato?: string
          updated_at?: string
          updated_by?: string | null
          valor: string
        }
        Update: {
          categoria?: string
          clave?: string
          descripcion?: string | null
          id?: number
          tipo_dato?: string
          updated_at?: string
          updated_by?: string | null
          valor?: string
        }
        Relationships: []
      }
      cotizacion_items: {
        Row: {
          cantidad: number
          cotizacion_id: number | null
          id: number
          precio_unitario_snapshot: number
          producto_id: number | null
          subtotal: number
          variante_id: number | null
        }
        Insert: {
          cantidad: number
          cotizacion_id?: number | null
          id?: number
          precio_unitario_snapshot: number
          producto_id?: number | null
          subtotal: number
          variante_id?: number | null
        }
        Update: {
          cantidad?: number
          cotizacion_id?: number | null
          id?: number
          precio_unitario_snapshot?: number
          producto_id?: number | null
          subtotal?: number
          variante_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cotizacion_items_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizacion_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizacion_items_variante_id_fkey"
            columns: ["variante_id"]
            isOneToOne: false
            referencedRelation: "variantes_producto"
            referencedColumns: ["id"]
          },
        ]
      }
      cotizaciones: {
        Row: {
          aprobacion_automatica: boolean | null
          aprobado_at: string | null
          cliente_id: number | null
          costo_envio: number | null
          costo_total_estimado: number | null
          created_at: string | null
          direccion_despacho: string | null
          estado: string | null
          expira_at: string | null
          id: number
          id_regla_descuento: number | null
          igv: number | null
          metodo_pago: Database["public"]["Enums"]["MetodoPago"] | null
          moneda: string
          monto_descuento: number | null
          notas_internas: string | null
          numero: string
          pedido_id: number | null
          subtotal: number | null
          total: number | null
          updated_at: string | null
          valida_hasta: string
        }
        Insert: {
          aprobacion_automatica?: boolean | null
          aprobado_at?: string | null
          cliente_id?: number | null
          costo_envio?: number | null
          costo_total_estimado?: number | null
          created_at?: string | null
          direccion_despacho?: string | null
          estado?: string | null
          expira_at?: string | null
          id?: number
          id_regla_descuento?: number | null
          igv?: number | null
          metodo_pago?: Database["public"]["Enums"]["MetodoPago"] | null
          moneda?: string
          monto_descuento?: number | null
          notas_internas?: string | null
          numero: string
          pedido_id?: number | null
          subtotal?: number | null
          total?: number | null
          updated_at?: string | null
          valida_hasta: string
        }
        Update: {
          aprobacion_automatica?: boolean | null
          aprobado_at?: string | null
          cliente_id?: number | null
          costo_envio?: number | null
          costo_total_estimado?: number | null
          created_at?: string | null
          direccion_despacho?: string | null
          estado?: string | null
          expira_at?: string | null
          id?: number
          id_regla_descuento?: number | null
          igv?: number | null
          metodo_pago?: Database["public"]["Enums"]["MetodoPago"] | null
          moneda?: string
          monto_descuento?: number | null
          notas_internas?: string | null
          numero?: string
          pedido_id?: number | null
          subtotal?: number | null
          total?: number | null
          updated_at?: string | null
          valida_hasta?: string
        }
        Relationships: [
          {
            foreignKeyName: "cotizaciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_id_regla_descuento_fkey"
            columns: ["id_regla_descuento"]
            isOneToOne: false
            referencedRelation: "reglas_descuento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
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
          updated_at?: string
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
        Relationships: [
          {
            foreignKeyName: "despachos_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "despachos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      detalle_ficha_insumos: {
        Row: {
          consumo_unitario: number | null
          created_at: string
          id: number
          id_ficha: number | null
          id_insumo: number | null
          merma_permitida: number | null
        }
        Insert: {
          consumo_unitario?: number | null
          created_at?: string
          id?: number
          id_ficha?: number | null
          id_insumo?: number | null
          merma_permitida?: number | null
        }
        Update: {
          consumo_unitario?: number | null
          created_at?: string
          id?: number
          id_ficha?: number | null
          id_insumo?: number | null
          merma_permitida?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "detalle_ficha_insumos_id_ficha_fkey"
            columns: ["id_ficha"]
            isOneToOne: false
            referencedRelation: "fichas_tecnicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "detalle_ficha_insumos_id_insumo_fkey"
            columns: ["id_insumo"]
            isOneToOne: false
            referencedRelation: "insumo"
            referencedColumns: ["id"]
          },
        ]
      }
      direcciones_cliente: {
        Row: {
          alias: string
          ciudad: string | null
          cliente_id: number
          created_at: string | null
          departamento: string | null
          direccion: string
          es_principal: boolean | null
          id: number
        }
        Insert: {
          alias: string
          ciudad?: string | null
          cliente_id: number
          created_at?: string | null
          departamento?: string | null
          direccion: string
          es_principal?: boolean | null
          id?: number
        }
        Update: {
          alias?: string
          ciudad?: string | null
          cliente_id?: number
          created_at?: string | null
          departamento?: string | null
          direccion?: string
          es_principal?: boolean | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "direcciones_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      estados_produccion: {
        Row: {
          activo: boolean
          completado_en: string | null
          created_at: string
          duracion_minutos: number | null
          etapa: Database["public"]["Enums"]["EtapaProduccion"]
          id: number
          iniciado_en: string
          observaciones: string | null
          orden_id: number
          updated_at: string | null
          usuario_id: number | null
        }
        Insert: {
          activo?: boolean
          completado_en?: string | null
          created_at?: string
          duracion_minutos?: number | null
          etapa: Database["public"]["Enums"]["EtapaProduccion"]
          id?: number
          iniciado_en?: string
          observaciones?: string | null
          orden_id: number
          updated_at?: string | null
          usuario_id?: number | null
        }
        Update: {
          activo?: boolean
          completado_en?: string | null
          created_at?: string
          duracion_minutos?: number | null
          etapa?: Database["public"]["Enums"]["EtapaProduccion"]
          id?: number
          iniciado_en?: string
          observaciones?: string | null
          orden_id?: number
          updated_at?: string | null
          usuario_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "estados_produccion_orden_id_fkey"
            columns: ["orden_id"]
            isOneToOne: false
            referencedRelation: "ordenes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estados_produccion_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_cliente: {
        Row: {
          atencion_personal: number | null
          calidad_producto: number | null
          canal: string | null
          cliente_id: number
          comentarios: string | null
          created_at: string
          enviado_en: string | null
          id: number
          orden_id: number
          puntuacion: number
          recomendaria: boolean | null
          respondido_en: string | null
          tiempo_entrega: number | null
          updated_at: string | null
        }
        Insert: {
          atencion_personal?: number | null
          calidad_producto?: number | null
          canal?: string | null
          cliente_id: number
          comentarios?: string | null
          created_at?: string
          enviado_en?: string | null
          id?: number
          orden_id: number
          puntuacion: number
          recomendaria?: boolean | null
          respondido_en?: string | null
          tiempo_entrega?: number | null
          updated_at?: string | null
        }
        Update: {
          atencion_personal?: number | null
          calidad_producto?: number | null
          canal?: string | null
          cliente_id?: number
          comentarios?: string | null
          created_at?: string
          enviado_en?: string | null
          id?: number
          orden_id?: number
          puntuacion?: number
          recomendaria?: boolean | null
          respondido_en?: string | null
          tiempo_entrega?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_cliente_orden_id_fkey"
            columns: ["orden_id"]
            isOneToOne: false
            referencedRelation: "ordenes"
            referencedColumns: ["id"]
          },
        ]
      }
      ficha_medidas: {
        Row: {
          created_at: string
          id: number
          id_ficha: number | null
          punto_medida: string | null
          talla: string | null
          tolerancia: number | null
          valor_cm: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          id_ficha?: number | null
          punto_medida?: string | null
          talla?: string | null
          tolerancia?: number | null
          valor_cm?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          id_ficha?: number | null
          punto_medida?: string | null
          talla?: string | null
          tolerancia?: number | null
          valor_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ficha_medidas_id_ficha_fkey"
            columns: ["id_ficha"]
            isOneToOne: false
            referencedRelation: "fichas_tecnicas"
            referencedColumns: ["id"]
          },
        ]
      }
      fichas_tecnicas: {
        Row: {
          costo_estimado: number | null
          created_at: string
          descripcion_detallada: string | null
          estado: Database["public"]["Enums"]["estado_ficha"] | null
          id: number
          id_producto: number | null
          imagen_geometral: string | null
          sam_total: number | null
          version: string | null
        }
        Insert: {
          costo_estimado?: number | null
          created_at?: string
          descripcion_detallada?: string | null
          estado?: Database["public"]["Enums"]["estado_ficha"] | null
          id?: number
          id_producto?: number | null
          imagen_geometral?: string | null
          sam_total?: number | null
          version?: string | null
        }
        Update: {
          costo_estimado?: number | null
          created_at?: string
          descripcion_detallada?: string | null
          estado?: Database["public"]["Enums"]["estado_ficha"] | null
          id?: number
          id_producto?: number | null
          imagen_geometral?: string | null
          sam_total?: number | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fichas-tecnicas_id_producto_fkey"
            columns: ["id_producto"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      incidencias_taller: {
        Row: {
          asignado_a: number | null
          confeccion_id: number | null
          created_at: string
          descripcion: string
          fecha_reporte: string
          fecha_resolucion: string | null
          foto_url: string | null
          id: number
          impacto_horas: number | null
          orden_id: number
          reportado_por: number | null
          resuelto: boolean
          severidad: Database["public"]["Enums"]["SeveridadIncidencia"]
          solucion: string | null
          tipo: Database["public"]["Enums"]["TipoIncidencia"]
          updated_at: string | null
        }
        Insert: {
          asignado_a?: number | null
          confeccion_id?: number | null
          created_at?: string
          descripcion: string
          fecha_reporte?: string
          fecha_resolucion?: string | null
          foto_url?: string | null
          id?: number
          impacto_horas?: number | null
          orden_id: number
          reportado_por?: number | null
          resuelto?: boolean
          severidad?: Database["public"]["Enums"]["SeveridadIncidencia"]
          solucion?: string | null
          tipo: Database["public"]["Enums"]["TipoIncidencia"]
          updated_at?: string | null
        }
        Update: {
          asignado_a?: number | null
          confeccion_id?: number | null
          created_at?: string
          descripcion?: string
          fecha_reporte?: string
          fecha_resolucion?: string | null
          foto_url?: string | null
          id?: number
          impacto_horas?: number | null
          orden_id?: number
          reportado_por?: number | null
          resuelto?: boolean
          severidad?: Database["public"]["Enums"]["SeveridadIncidencia"]
          solucion?: string | null
          tipo?: Database["public"]["Enums"]["TipoIncidencia"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incidencias_taller_asignado_a_fkey"
            columns: ["asignado_a"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidencias_taller_confeccion_id_fkey"
            columns: ["confeccion_id"]
            isOneToOne: false
            referencedRelation: "confecciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidencias_taller_orden_id_fkey"
            columns: ["orden_id"]
            isOneToOne: false
            referencedRelation: "ordenes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidencias_taller_reportado_por_fkey"
            columns: ["reportado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      insumo: {
        Row: {
          alerta_bajo_stock: boolean | null
          categoria_insumo: Database["public"]["Enums"]["CategoriaInsumo"]
          created_at: string
          id: number
          nombre: string
          precio_unitario: number | null
          proveedor_id: number | null
          stock_actual: number
          stock_maximo: number | null
          stock_minimo: number
          tipo: Database["public"]["Enums"]["TipoInsumo"]
          ubicacion_almacen: string | null
          unidad_medida: Database["public"]["Enums"]["UnidadMedida"]
          updated_at: string | null
        }
        Insert: {
          alerta_bajo_stock?: boolean | null
          categoria_insumo?: Database["public"]["Enums"]["CategoriaInsumo"]
          created_at?: string
          id?: number
          nombre: string
          precio_unitario?: number | null
          proveedor_id?: number | null
          stock_actual?: number
          stock_maximo?: number | null
          stock_minimo?: number
          tipo: Database["public"]["Enums"]["TipoInsumo"]
          ubicacion_almacen?: string | null
          unidad_medida?: Database["public"]["Enums"]["UnidadMedida"]
          updated_at?: string | null
        }
        Update: {
          alerta_bajo_stock?: boolean | null
          categoria_insumo?: Database["public"]["Enums"]["CategoriaInsumo"]
          created_at?: string
          id?: number
          nombre?: string
          precio_unitario?: number | null
          proveedor_id?: number | null
          stock_actual?: number
          stock_maximo?: number | null
          stock_minimo?: number
          tipo?: Database["public"]["Enums"]["TipoInsumo"]
          ubicacion_almacen?: string | null
          unidad_medida?: Database["public"]["Enums"]["UnidadMedida"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insumo_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
        ]
      }
      movimientos_inventario: {
        Row: {
          cantidad: number | null
          costo_unitario: number | null
          created_at: string
          id: number
          insumo_id: number | null
          motivo: string | null
          producto_id: number | null
          referencia_id: number | null
          referencia_tipo: string | null
          stock_anterior: number | null
          stock_posterior: number | null
          tipo_movimiento: Database["public"]["Enums"]["TipoMovimiento"] | null
          updated_at: string | null
          usuario_id: number | null
        }
        Insert: {
          cantidad?: number | null
          costo_unitario?: number | null
          created_at?: string
          id?: number
          insumo_id?: number | null
          motivo?: string | null
          producto_id?: number | null
          referencia_id?: number | null
          referencia_tipo?: string | null
          stock_anterior?: number | null
          stock_posterior?: number | null
          tipo_movimiento?: Database["public"]["Enums"]["TipoMovimiento"] | null
          updated_at?: string | null
          usuario_id?: number | null
        }
        Update: {
          cantidad?: number | null
          costo_unitario?: number | null
          created_at?: string
          id?: number
          insumo_id?: number | null
          motivo?: string | null
          producto_id?: number | null
          referencia_id?: number | null
          referencia_tipo?: string | null
          stock_anterior?: number | null
          stock_posterior?: number | null
          tipo_movimiento?: Database["public"]["Enums"]["TipoMovimiento"] | null
          updated_at?: string | null
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
          costo_envio_real: number | null
          cotizacion_id: number | null
          created_at: string | null
          entregado_cliente_at: string | null
          enviado_taller_at: string | null
          estado: Database["public"]["Enums"]["EstadoOrden"] | null
          estado_pago: string | null
          fecha_prometida_entrega: string | null
          id: number
          metodo_pago: Database["public"]["Enums"]["MetodoPago"] | null
          prioridad: string | null
          proveedor_id: number | null
          recibido_taller_at: string | null
          saldo_pendiente: number | null
          total_orden: number
          total_pagado: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cliente_id?: number | null
          costo_envio_real?: number | null
          cotizacion_id?: number | null
          created_at?: string | null
          entregado_cliente_at?: string | null
          enviado_taller_at?: string | null
          estado?: Database["public"]["Enums"]["EstadoOrden"] | null
          estado_pago?: string | null
          fecha_prometida_entrega?: string | null
          id?: number
          metodo_pago?: Database["public"]["Enums"]["MetodoPago"] | null
          prioridad?: string | null
          proveedor_id?: number | null
          recibido_taller_at?: string | null
          saldo_pendiente?: number | null
          total_orden?: number
          total_pagado?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cliente_id?: number | null
          costo_envio_real?: number | null
          cotizacion_id?: number | null
          created_at?: string | null
          entregado_cliente_at?: string | null
          enviado_taller_at?: string | null
          estado?: Database["public"]["Enums"]["EstadoOrden"] | null
          estado_pago?: string | null
          fecha_prometida_entrega?: string | null
          id?: number
          metodo_pago?: Database["public"]["Enums"]["MetodoPago"] | null
          prioridad?: string | null
          proveedor_id?: number | null
          recibido_taller_at?: string | null
          saldo_pendiente?: number | null
          total_orden?: number
          total_pagado?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ordenes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordenes_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordenes_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
        ]
      }
      pagos_orden: {
        Row: {
          comprobante_url: string | null
          created_at: string
          fecha_pago: string
          id: number
          metodo_pago: Database["public"]["Enums"]["MetodoPago"]
          monto: number
          notas: string | null
          orden_id: number
          updated_at: string | null
          usuario_id: number | null
        }
        Insert: {
          comprobante_url?: string | null
          created_at?: string
          fecha_pago?: string
          id?: number
          metodo_pago: Database["public"]["Enums"]["MetodoPago"]
          monto: number
          notas?: string | null
          orden_id: number
          updated_at?: string | null
          usuario_id?: number | null
        }
        Update: {
          comprobante_url?: string | null
          created_at?: string
          fecha_pago?: string
          id?: number
          metodo_pago?: Database["public"]["Enums"]["MetodoPago"]
          monto?: number
          notas?: string | null
          orden_id?: number
          updated_at?: string | null
          usuario_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_orden_orden_id_fkey"
            columns: ["orden_id"]
            isOneToOne: false
            referencedRelation: "ordenes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_orden_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      pedido_items: {
        Row: {
          cantidad: number
          especificaciones: Json | null
          id: number
          pedido_id: number | null
          producto_id: number | null
          variante_id: number | null
        }
        Insert: {
          cantidad: number
          especificaciones?: Json | null
          id?: number
          pedido_id?: number | null
          producto_id?: number | null
          variante_id?: number | null
        }
        Update: {
          cantidad?: number
          especificaciones?: Json | null
          id?: number
          pedido_id?: number | null
          producto_id?: number | null
          variante_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pedido_items_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_items_variante_id_fkey"
            columns: ["variante_id"]
            isOneToOne: false
            referencedRelation: "variantes_producto"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          cliente_id: number | null
          created_at: string | null
          created_by: string | null
          estado: Database["public"]["Enums"]["EstadoPedido"] | null
          id: number
          moq_aplicado: number
          notas_cliente: string | null
          notas_pedido: string | null
          prioridad: Database["public"]["Enums"]["PrioridadPedido"] | null
          total_estimado: number | null
          total_unidades: number
          updated_at: string | null
        }
        Insert: {
          cliente_id?: number | null
          created_at?: string | null
          created_by?: string | null
          estado?: Database["public"]["Enums"]["EstadoPedido"] | null
          id?: number
          moq_aplicado?: number
          notas_cliente?: string | null
          notas_pedido?: string | null
          prioridad?: Database["public"]["Enums"]["PrioridadPedido"] | null
          total_estimado?: number | null
          total_unidades?: number
          updated_at?: string | null
        }
        Update: {
          cliente_id?: number | null
          created_at?: string | null
          created_by?: string | null
          estado?: Database["public"]["Enums"]["EstadoPedido"] | null
          id?: number
          moq_aplicado?: number
          notas_cliente?: string | null
          notas_pedido?: string | null
          prioridad?: Database["public"]["Enums"]["PrioridadPedido"] | null
          total_estimado?: number | null
          total_unidades?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_interno: {
        Row: {
          cargo: Database["public"]["Enums"]["RolPersonal"] | null
          created_at: string | null
          dni: number | null
          estado: boolean | null
          fecha_ingreso: string | null
          id: number
          nombre_completo: string | null
          updated_at: string | null
          usuario_id: number | null
        }
        Insert: {
          cargo?: Database["public"]["Enums"]["RolPersonal"] | null
          created_at?: string | null
          dni?: number | null
          estado?: boolean | null
          fecha_ingreso?: string | null
          id?: number
          nombre_completo?: string | null
          updated_at?: string | null
          usuario_id?: number | null
        }
        Update: {
          cargo?: Database["public"]["Enums"]["RolPersonal"] | null
          created_at?: string | null
          dni?: number | null
          estado?: boolean | null
          fecha_ingreso?: string | null
          id?: number
          nombre_completo?: string | null
          updated_at?: string | null
          usuario_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_interno_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      precio_historico: {
        Row: {
          creado_por: string | null
          id: number
          motivo: string | null
          precio: number
          producto_id: number
          vigente_desde: string
          vigente_hasta: string | null
        }
        Insert: {
          creado_por?: string | null
          id?: number
          motivo?: string | null
          precio: number
          producto_id: number
          vigente_desde?: string
          vigente_hasta?: string | null
        }
        Update: {
          creado_por?: string | null
          id?: number
          motivo?: string | null
          precio?: number
          producto_id?: number
          vigente_desde?: string
          vigente_hasta?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "precio_historico_producto_id_fkey"
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
          ficha_tecnica: Json | null
          id: number
          imagen: string | null
          moq: number
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
          ficha_tecnica?: Json | null
          id?: number
          imagen?: string | null
          moq?: number
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
          ficha_tecnica?: Json | null
          id?: number
          imagen?: string | null
          moq?: number
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
      proveedores: {
        Row: {
          categoria_suministro: string
          contacto: string
          created_at: string
          direccion: string
          email: string
          estado: string
          id: number
          razon_social: string
          ruc: string
          telefono: string
          updated_at: string
        }
        Insert: {
          categoria_suministro: string
          contacto: string
          created_at?: string
          direccion: string
          email: string
          estado?: string
          id?: number
          razon_social: string
          ruc: string
          telefono: string
          updated_at?: string
        }
        Update: {
          categoria_suministro?: string
          contacto?: string
          created_at?: string
          direccion?: string
          email?: string
          estado?: string
          id?: number
          razon_social?: string
          ruc?: string
          telefono?: string
          updated_at?: string
        }
        Relationships: []
      }
      reglas_descuento: {
        Row: {
          aplica_a: string | null
          cantidad_max: number | null
          cantidad_min: number
          descuento_pct: number
          id: number
          nombre: string
        }
        Insert: {
          aplica_a?: string | null
          cantidad_max?: number | null
          cantidad_min: number
          descuento_pct: number
          id?: number
          nombre: string
        }
        Update: {
          aplica_a?: string | null
          cantidad_max?: number | null
          cantidad_min?: number
          descuento_pct?: number
          id?: number
          nombre?: string
        }
        Relationships: []
      }
      reservas_stock: {
        Row: {
          cantidad: number
          cotizacion_id: number | null
          estado: string
          expira_en: string
          id: number
          orden_id: number | null
          variante_id: number
        }
        Insert: {
          cantidad: number
          cotizacion_id?: number | null
          estado?: string
          expira_en?: string
          id?: number
          orden_id?: number | null
          variante_id: number
        }
        Update: {
          cantidad?: number
          cotizacion_id?: number | null
          estado?: string
          expira_en?: string
          id?: number
          orden_id?: number | null
          variante_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "reservas_stock_orden_id_fkey"
            columns: ["orden_id"]
            isOneToOne: false
            referencedRelation: "ordenes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_stock_variante_id_fkey"
            columns: ["variante_id"]
            isOneToOne: false
            referencedRelation: "variantes_producto"
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
          updated_at?: string
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
          created_at: string | null
          created_by: string | null
          email: string
          estado: Database["public"]["Enums"]["EstadoUsuario"] | null
          id: number
          nombre_completo: string
          rol: Database["public"]["Enums"]["RolPersonal"] | null
          telefono: number | null
          ultimo_acceso: string | null
          updated_at: string | null
        }
        Insert: {
          auth_id?: string | null
          created_at?: string | null
          created_by?: string | null
          email: string
          estado?: Database["public"]["Enums"]["EstadoUsuario"] | null
          id?: number
          nombre_completo: string
          rol?: Database["public"]["Enums"]["RolPersonal"] | null
          telefono?: number | null
          ultimo_acceso?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_id?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string
          estado?: Database["public"]["Enums"]["EstadoUsuario"] | null
          id?: number
          nombre_completo?: string
          rol?: Database["public"]["Enums"]["RolPersonal"] | null
          telefono?: number | null
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
          estado_pago: string
          id: string
          impuestos: number
          metodo_pago: Database["public"]["Enums"]["MetodoPago"] | null
          numero_comprobante: string | null
          orden_id: number
          referencia_pago: string | null
          subtotal: number
          tipo_comprobante:
            | Database["public"]["Enums"]["TipoComprobante"]
            | null
          total: number
          updated_at: string | null
          usuario_id: number | null
          vendedor_id: string | null
        }
        Insert: {
          created_at?: string | null
          estado_pago?: string
          id?: string
          impuestos?: number
          metodo_pago?: Database["public"]["Enums"]["MetodoPago"] | null
          numero_comprobante?: string | null
          orden_id: number
          referencia_pago?: string | null
          subtotal?: number
          tipo_comprobante?:
            | Database["public"]["Enums"]["TipoComprobante"]
            | null
          total?: number
          updated_at?: string | null
          usuario_id?: number | null
          vendedor_id?: string | null
        }
        Update: {
          created_at?: string | null
          estado_pago?: string
          id?: string
          impuestos?: number
          metodo_pago?: Database["public"]["Enums"]["MetodoPago"] | null
          numero_comprobante?: string | null
          orden_id?: number
          referencia_pago?: string | null
          subtotal?: number
          tipo_comprobante?:
            | Database["public"]["Enums"]["TipoComprobante"]
            | null
          total?: number
          updated_at?: string | null
          usuario_id?: number | null
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
          {
            foreignKeyName: "ventas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      ventas_anuladas: {
        Row: {
          fecha_anulacion: string
          id: number
          monto_devuelto: number
          motivo: string
          venta_id: string
        }
        Insert: {
          fecha_anulacion?: string
          id?: number
          monto_devuelto: number
          motivo: string
          venta_id: string
        }
        Update: {
          fecha_anulacion?: string
          id?: number
          monto_devuelto?: number
          motivo?: string
          venta_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ventas_anuladas_venta_id_fkey"
            columns: ["venta_id"]
            isOneToOne: false
            referencedRelation: "ventas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      CategoriaInsumo:
        | "tela"
        | "avios"
        | "empaque"
        | "hilo"
        | "etiquetas"
        | "forro"
        | "otro"
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
      CuentaContable:
        | "caja"
        | "bancos"
        | "cuentas_por_cobrar"
        | "inventario"
        | "ventas"
        | "costo_ventas"
        | "cuentas_por_pagar"
        | "capital"
        | "igv"
        | "descuentos"
        | "gastos_operativos"
      EspecialidadTaller:
        | "corte"
        | "confección"
        | "bordado"
        | "estampado"
        | "costura"
        | "acabados"
        | "otro"
      estado_ficha: "borrador" | "en_revision" | "aprobada" | "obsoleta"
      EstadoCategoria: "activo" | "inactivo"
      EstadoCliente: "activo" | "inactivo" | "suspendido" | "potencial"
      EstadoConfeccion: "corte" | "confeccionando" | "remallado" | "terminado"
      EstadoCotizacion:
        | "borrador"
        | "enviada"
        | "aprobada"
        | "rechazada"
        | "expirada"
        | "convertida"
      EstadoDespacho:
        | "pendiente"
        | "en_ruta"
        | "entregado"
        | "preparando"
        | "incidencia"
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
      EtapaProduccion:
        | "diseno"
        | "patronaje"
        | "corte"
        | "confeccion"
        | "remallado"
        | "bordado_estampado"
        | "control_calidad"
        | "acabado"
        | "listo_entrega"
      MetodoPago:
        | "efectivo"
        | "transferencia_bcp"
        | "yape"
        | "plin"
        | "visa"
        | "mastercard"
      PrioridadPedido: "baja" | "normal" | "alta" | "urgente"
      RolPersonal:
        | "administrador"
        | "cortador"
        | "disenador"
        | "recepcionista"
        | "ayudante"
        | "representante_taller"
        | "cliente"
        | "gerente"
      SeveridadIncidencia: "baja" | "media" | "alta" | "critica"
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
      TipoAsiento: "debe" | "haber"
      TipoCategoria: "producto" | "insumo"
      TipoCliente: "corporativo" | "minorista" | "distribuidor"
      TipoComprobante: "boleta" | "factura" | "nota_venta"
      TipoIncidencia:
        | "averia_maquina"
        | "falta_material"
        | "error_diseno"
        | "defecto_corte"
        | "defecto_confeccion"
        | "retraso"
        | "otro"
      TipoInsumo:
        | "tela"
        | "hilo"
        | "avio"
        | "boton"
        | "cierre"
        | "empaque"
        | "otro"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      CategoriaInsumo: [
        "tela",
        "avios",
        "empaque",
        "hilo",
        "etiquetas",
        "forro",
        "otro",
      ],
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
      CuentaContable: [
        "caja",
        "bancos",
        "cuentas_por_cobrar",
        "inventario",
        "ventas",
        "costo_ventas",
        "cuentas_por_pagar",
        "capital",
        "igv",
        "descuentos",
        "gastos_operativos",
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
      estado_ficha: ["borrador", "en_revision", "aprobada", "obsoleta"],
      EstadoCategoria: ["activo", "inactivo"],
      EstadoCliente: ["activo", "inactivo", "suspendido", "potencial"],
      EstadoConfeccion: ["corte", "confeccionando", "remallado", "terminado"],
      EstadoCotizacion: [
        "borrador",
        "enviada",
        "aprobada",
        "rechazada",
        "expirada",
        "convertida",
      ],
      EstadoDespacho: [
        "pendiente",
        "en_ruta",
        "entregado",
        "preparando",
        "incidencia",
      ],
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
      EtapaProduccion: [
        "diseno",
        "patronaje",
        "corte",
        "confeccion",
        "remallado",
        "bordado_estampado",
        "control_calidad",
        "acabado",
        "listo_entrega",
      ],
      MetodoPago: [
        "efectivo",
        "transferencia_bcp",
        "yape",
        "plin",
        "visa",
        "mastercard",
      ],
      PrioridadPedido: ["baja", "normal", "alta", "urgente"],
      RolPersonal: [
        "administrador",
        "cortador",
        "disenador",
        "recepcionista",
        "ayudante",
        "representante_taller",
        "cliente",
        "gerente",
      ],
      SeveridadIncidencia: ["baja", "media", "alta", "critica"],
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
      TipoAsiento: ["debe", "haber"],
      TipoCategoria: ["producto", "insumo"],
      TipoCliente: ["corporativo", "minorista", "distribuidor"],
      TipoComprobante: ["boleta", "factura", "nota_venta"],
      TipoIncidencia: [
        "averia_maquina",
        "falta_material",
        "error_diseno",
        "defecto_corte",
        "defecto_confeccion",
        "retraso",
        "otro",
      ],
      TipoInsumo: [
        "tela",
        "hilo",
        "avio",
        "boton",
        "cierre",
        "empaque",
        "otro",
      ],
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
