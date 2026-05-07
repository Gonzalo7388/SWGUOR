'use client';

import {
  createContext, useContext, useEffect, useState,
  useCallback, useMemo, ReactNode,
} from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';

// ── Tipos ────────────────────────────────────────────────────────
export interface ClientePortal {
  id: number;
  ruc: number;
  razon_social: string;
  nombre_comercial: string;
  direccion?: string;
  email: string | null;
  telefono: number | null;
  tipo_cliente: string;
}

export interface ItemCotizacion {
  producto_id: number;
  variante_id: number;
  nombre: string;
  sku: string;
  imagen: string | null;
  precio_unitario: number;
  cantidad: number;
  talla: string;
  color: string;
  subtotal: number;
  stock_disponible: number;
  colores_disponibles?: string[];
  tallas_disponibles?: string[];
  variantes?: Array<{
    id: number;
    color: string;
    talla: string;
    stock: number;
  }>;
}

export type ZonaEnvio = 'cercana_sjl' | 'media' | 'lejana';

export const ZONAS_ENVIO: Record<ZonaEnvio, { label: string; costo: number }> = {
  cercana_sjl: { label: 'Cercana a SJL', costo: 15 },
  media: { label: 'Zona media', costo: 20 },
  lejana: { label: 'Zona lejana', costo: 25 },
};

export interface ResumenCotizacion {
  subtotal: number;
  total_unidades: number;
  descuento_pct: number;
  descuento_monto: number;
  base_igv: number;
  igv: number;
  costo_envio: number;
  total: number;
  descripcion_descuento: string;
  descripcion_envio: string;
}

interface PortalCtx {
  cliente: ClientePortal | null;
  loading: boolean;
  items: ItemCotizacion[];
  resumen: ResumenCotizacion;
  zonaEnvio: ZonaEnvio;
  actualizarZonaEnvio: (zona: ZonaEnvio) => void;
  agregarAlBorrador: (item: any) => void;
  actualizarCantidad: (variante_id: number, cantidad: number) => void;
  eliminarDelBorrador: (variante_id: number) => void;
  limpiarBorrador: () => void;
  actualizarItem: (params: {
    variante_id: number;
    nueva_variante_id?: number;
    talla?: string;
    color?: string;
    cantidad?: number;
  }) => void;
  stats: { cotizaciones_activas: number; ordenes_activas: number; despachos_en_ruta: number };
}

// ── Reglas de negocio ────────────────────────────────────────────
export const MOQ_MINIMO = 400;
const IGV = 0.18;
const ESCALAS = [
  { min: 2000, pct: 15, label: '≥ 2,000 uds' },
  { min: 1000, pct: 10, label: '≥ 1,000 uds' },
  { min: 500,  pct: 5,  label: '≥ 500 uds'   },
];

function getCostoEnvio(zona: ZonaEnvio): number {
  return ZONAS_ENVIO[zona]?.costo ?? 0;
}

function calcularResumen(items: ItemCotizacion[], zonaEnvio: ZonaEnvio): ResumenCotizacion {
  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
  const total_unidades = items.reduce((s, i) => s + i.cantidad, 0);
  const escala = ESCALAS.find(e => total_unidades >= e.min);
  const descuento_pct = escala?.pct ?? 0;
  const descuento_monto = subtotal * (descuento_pct / 100);
  const base_igv = subtotal - descuento_monto;
  const igv = base_igv * IGV;
  const costo_envio = items.length > 0 ? getCostoEnvio(zonaEnvio) : 0;
  return {
    subtotal,
    total_unidades,
    descuento_pct,
    descuento_monto,
    base_igv,
    igv,
    costo_envio,
    total: base_igv + igv + costo_envio,
    descripcion_descuento: escala
      ? `Descuento escala ${escala.pct}% (${escala.label})`
      : 'Sin descuento por volumen',
    descripcion_envio: ZONAS_ENVIO[zonaEnvio].label,
  };
}

const PortalContext = createContext<PortalCtx | null>(null);

export function PortalProvider({ children }: { children: ReactNode }) {
  const [cliente, setCliente] = useState<ClientePortal | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ItemCotizacion[]>([]);
  const [zonaEnvio, setZonaEnvio] = useState<ZonaEnvio>('cercana_sjl');
  const [stats, setStats] = useState({
    cotizaciones_activas: 0, ordenes_activas: 0, despachos_en_ruta: 0,
  });

  useEffect(() => {
    const init = async () => {
      const supabase = getSupabaseBrowserClient();
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        setLoading(false);
        return;
      }

      try {
        // 1. Obtener el ID del usuario
        const { data: usuarioData, error: userError } = await supabase
          .from('usuarios')
          .select('id')
          .eq('auth_id', user.id)
          .maybeSingle();

        if (userError || !usuarioData) {
          setLoading(false);
          return;
        }

        // 2. Obtener los datos del cliente usando el JOIN explícito
        const { data: perfilCompleto, error: joinError } = await supabase
          .from('usuarios')
          .select(`
            id,
            cliente_datos:clientes!clientes_usuario_id_fkey (*)
          `)
          .eq('id', usuarioData.id)
          .single();

        if (joinError) console.error("Error join:", joinError.message);

        // 3. Extraer el objeto cliente de forma segura
        const datosCliente = Array.isArray(perfilCompleto?.cliente_datos) 
          ? perfilCompleto?.cliente_datos[0] 
          : perfilCompleto?.cliente_datos;

        if (datosCliente) {
          const clienteAdaptado: ClientePortal = {
            id: datosCliente.id,
            ruc: Number(datosCliente.ruc), 
            razon_social: datosCliente.razon_social || 'Sin Razón Social',
            direccion: datosCliente.direccion_fiscal || undefined,
            email: datosCliente.email,
            telefono: datosCliente.telefono ? Number(datosCliente.telefono.replace(/\D/g, '')) : null,
            tipo_cliente: datosCliente.tipo_cliente || 'corporativo',
            nombre_comercial: datosCliente.nombre_comercial || 'Sin Nombre Comercial',
          };

          setCliente(clienteAdaptado);
          
          // 4. CARGAR ESTADÍSTICAS
          try {
            const [cotRes, ordRes, dspRes] = await Promise.all([
              supabase.from('cotizaciones').select('id', { count: 'exact', head: true })
                .eq('cliente_id', datosCliente.id).in('estado', ['borrador', 'enviada', 'aprobada']),
              supabase.from('pedidos').select('id', { count: 'exact', head: true })
                .eq('cliente_id', datosCliente.id).not('estado', 'in', '(finalizado,cancelado)'),
              supabase.from('despachos').select('id', { count: 'exact', head: true })
                .eq('estado', 'en_ruta'),
            ]);

            setStats({
              cotizaciones_activas: cotRes.count ?? 0,
              ordenes_activas: ordRes.count ?? 0,
              despachos_en_ruta: dspRes.count ?? 0,
            });
          } catch (e) {
            console.warn("Error en estadísticas:", e);
          }
        }
      } catch (err) {
        console.error("Falla general:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const resumen = useMemo(() => calcularResumen(items, zonaEnvio), [items, zonaEnvio]);

  const actualizarItem = useCallback(({ variante_id, nueva_variante_id, talla, color, cantidad }: {
    variante_id: number;
    nueva_variante_id?: number;
    talla?: string;
    color?: string;
    cantidad?: number;
  }) => {
    setItems(prev =>
      prev.map(item => {
        if (item.variante_id !== variante_id) return item;

        const updates: Partial<ItemCotizacion> = {};
        
        if (nueva_variante_id !== undefined) updates.variante_id = nueva_variante_id;
        if (talla !== undefined) updates.talla = talla;
        if (color !== undefined) updates.color = color;
        if (cantidad !== undefined) {
          updates.cantidad = Math.max(1, cantidad);
          updates.subtotal = Math.max(1, cantidad) * item.precio_unitario;
        }

        return { ...item, ...updates };
      })
    );
  }, []);

  const agregarAlBorrador = useCallback((nuevoItem: any) => {
    console.log('nuevoItem ', nuevoItem);
    setItems((prev: ItemCotizacion[]) => { 
      const idx = prev.findIndex(i => i.producto_id === nuevoItem.id);
      
      if (idx >= 0) {
        return prev.map((i, n) => n === idx
          ? { 
              ...i, 
              cantidad: i.cantidad + (nuevoItem.cantidad || 1), 
              subtotal: (i.cantidad + (nuevoItem.cantidad || 1)) * i.precio_unitario 
            }
          : i
        );
      }

      const itemFormateado: ItemCotizacion = {
        producto_id: nuevoItem.id,
        variante_id: nuevoItem.id,
        nombre: nuevoItem.nombre,
        sku: `SKU-${nuevoItem.id.toString().slice(0, 5)}`,
        imagen: nuevoItem.imagen || nuevoItem.imagen_url,
        precio_unitario: nuevoItem.precio || nuevoItem.precio_base,
        cantidad: nuevoItem.cantidad || 1,
        talla: 'M',
        color: 'Estándar',
        subtotal: (nuevoItem.cantidad || 1) * (nuevoItem.precio || nuevoItem.precio_base),
        stock_disponible: 1000,
        colores_disponibles: nuevoItem.colores_disponibles || [],
        tallas_disponibles: nuevoItem.tallas_disponibles || [],
        variantes: nuevoItem.variantes || []
      };

      console.log('Agregando al borrador:', itemFormateado);

      return [...prev, itemFormateado];
    });
  }, []);

  const actualizarCantidad = useCallback((variante_id: number, cantidad: number) => {
    setItems(prev => prev.map(i =>
      i.variante_id === variante_id
        ? { ...i, cantidad: Math.max(1, cantidad), subtotal: Math.max(1, cantidad) * i.precio_unitario }
        : i
    ));
  }, []);

  const eliminarDelBorrador = useCallback((vid: number) =>
    setItems(prev => prev.filter(i => i.variante_id !== vid)), []);
  
  const limpiarBorrador = useCallback(() => setItems([]), []);
  const actualizarZonaEnvio = useCallback((zona: ZonaEnvio) => setZonaEnvio(zona), []);

  return (
    <PortalContext.Provider value={{
      cliente, loading, items, resumen, zonaEnvio, actualizarZonaEnvio, stats,
      agregarAlBorrador,
      actualizarCantidad,
      actualizarItem,
      eliminarDelBorrador,
      limpiarBorrador,
    }}>
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error('usePortal debe estar dentro de PortalProvider');
  return ctx;
}