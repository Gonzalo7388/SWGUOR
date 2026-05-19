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

export interface CostoEnvioDb {
  id: number;
  zona: ZonaEnvio;
  costo: number;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export const ZONAS_ENVIO: Record<ZonaEnvio, { label: string; costo: number }> = {
  cercana_sjl: { label: 'Cercana a SJL', costo: 15 },
  media: { label: 'Zona media', costo: 20 },
  lejana: { label: 'Zona lejana', costo: 25 },
};

// ── Tipo para reglas de descuento ────────────────────────────────
interface ReglaDescuento {
  id: number;
  nombre: string;
  cantidad_min: number | null;
  monto_min_compra: number | null;
  tipo_beneficio: string;
  valor_descuento: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean | null;
  tipo_conteo: string | null;
}

export interface ResumenCotizacion {
  subtotal: number;
  total_unidades: number;
  modelos_distintos: number;
  descuento_pct: number;
  descuento_monto: number;
  base_igv: number;
  igv: number;
  costo_envio: number;
  total: number;
  descripcion_descuento: string;
  descripcion_envio: string;
  es_cliente_nuevo: boolean;
}

interface PortalCtx {
  cliente: ClientePortal | null;
  loading: boolean;
  items: ItemCotizacion[];
  resumen: ResumenCotizacion;
  zonaEnvio: ZonaEnvio;
  costosEnvio: CostoEnvioDb[];
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

// ── Constantes ──────────────────────────────────────────────────
export const MOQ_MINIMO = 400;
export const MAX_UNIDADES = 2000;
const IGV = 0.18;
const TIPO_CLIENTE_NUEVO = 'nuevo';

// ── Lógica de negocio ───────────────────────────────────────────
function resolverDescuento(
  items: ItemCotizacion[],
  reglas: ReglaDescuento[],
  esClienteNuevo: boolean,
): { pct: number; descripcion: string } {
  if (items.length === 0) return { pct: 0, descripcion: 'Sin descuento' };

  const ahora = new Date();
  const reglasActivas = reglas.filter(r =>
    r.activo &&
    new Date(r.fecha_inicio) <= ahora &&
    new Date(r.fecha_fin) >= ahora,
  );

  if (esClienteNuevo) {
    const reglaCliente = reglasActivas.find(r =>
      r.tipo_conteo === 'modelos_distintos' &&
      r.cantidad_min !== null &&
      r.cantidad_min <= 1 &&
      r.valor_descuento === 20,
    );
    if (reglaCliente) return { pct: 20, descripcion: `${reglaCliente.nombre} (20%)` };
  }

  const modelos = items.length;
  const reglasEscala = reglasActivas
    .filter(r => r.tipo_conteo === 'modelos_distintos' && (r.cantidad_min ?? 0) > 1)
    .sort((a, b) => (b.cantidad_min ?? 0) - (a.cantidad_min ?? 0));

  const reglaAplicable = reglasEscala.find(r => modelos >= (r.cantidad_min ?? 0));

  if (reglaAplicable) {
    const pct = reglaAplicable.valor_descuento;
    return { pct, descripcion: `${reglaAplicable.nombre} (${pct}%) — ${modelos} modelos` };
  }

  return { pct: 0, descripcion: 'Sin descuento por volumen' };
}

function calcularResumen(
  items: ItemCotizacion[],
  zonaEnvio: ZonaEnvio,
  reglas: ReglaDescuento[],
  esClienteNuevo: boolean,
): ResumenCotizacion {
  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
  const total_unidades = items.reduce((s, i) => s + i.cantidad, 0);
  const modelos_distintos = items.length;

  const { pct: descuento_pct, descripcion: descripcion_descuento } =
    resolverDescuento(items, reglas, esClienteNuevo);

  const descuento_monto = subtotal * (descuento_pct / 100);
  const base_igv = subtotal - descuento_monto;
  const igv = base_igv * IGV;
  const costo_envio = items.length > 0 ? (ZONAS_ENVIO[zonaEnvio]?.costo ?? 0) : 0;

  return {
    subtotal,
    total_unidades,
    modelos_distintos,
    descuento_pct,
    descuento_monto,
    base_igv,
    igv,
    costo_envio,
    total: base_igv + igv + costo_envio,
    descripcion_descuento,
    descripcion_envio: ZONAS_ENVIO[zonaEnvio].label,
    es_cliente_nuevo: esClienteNuevo,
  };
}

const PortalContext = createContext<PortalCtx | null>(null);

export function PortalProvider({ children }: { children: ReactNode }) {
  const [cliente, setCliente] = useState<ClientePortal | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ItemCotizacion[]>([]);
  const [zonaEnvio, setZonaEnvio] = useState<ZonaEnvio>('cercana_sjl');
  const [reglas, setReglas] = useState<ReglaDescuento[]>([]);
  const [stats, setStats] = useState({
    cotizaciones_activas: 0, ordenes_activas: 0, despachos_en_ruta: 0,
  });
  const [costosEnvio, setCostosEnvio] = useState<CostoEnvioDb[]>([]);

  useEffect(() => {
    const init = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) { setLoading(false); return; }

      try {
        // 1. Reglas
        const { data: reglasData } = await supabase.from('reglas_descuento').select('*').eq('activo', true);
        if (reglasData) setReglas(reglasData);

        // 2. Usuario
        const { data: usuarioData } = await supabase.from('usuarios').select('id').eq('auth_id', user.id).maybeSingle();
        if (!usuarioData) { setLoading(false); return; }

        // 3. Perfil Cliente
        const { data: perfilCompleto } = await supabase
          .from('usuarios')
          .select(`id, cliente_datos:clientes!clientes_usuario_id_fkey (*)`)
          .eq('id', usuarioData.id)
          .single();

        const datosCliente = Array.isArray(perfilCompleto?.cliente_datos)
          ? perfilCompleto?.cliente_datos[0]
          : perfilCompleto?.cliente_datos;

        if (datosCliente) {
          setCliente({
            id: datosCliente.id,
            ruc: Number(datosCliente.ruc),
            razon_social: datosCliente.razon_social || 'Sin Razón Social',
            direccion: datosCliente.direccion_fiscal || undefined,
            email: datosCliente.email,
            telefono: datosCliente.telefono ? Number(datosCliente.telefono.replace(/\D/g, '')) : null,
            tipo_cliente: datosCliente.tipo_cliente || 'corporativo',
            nombre_comercial: datosCliente.nombre_comercial || 'Sin Nombre Comercial',
          });

          // 4. Estadísticas y Costos
          const [cotRes, ordRes, dspRes, costosRes] = await Promise.all([
            supabase.from('cotizaciones').select('id', { count: 'exact', head: true })
              .eq('cliente_id', datosCliente.id).in('estado', ['borrador', 'enviada', 'aprobada']),
            supabase.from('pedidos').select('id', { count: 'exact', head: true })
              .eq('cliente_id', datosCliente.id).not('estado', 'in', '(finalizado,cancelado)'),
            supabase.from('despachos').select('id', { count: 'exact', head: true }).eq('estado', 'en_ruta'),
            supabase.from('costo_envio').select('*').eq('activo', true).order('id')
          ]);

          setStats({
            cotizaciones_activas: cotRes.count ?? 0,
            ordenes_activas: ordRes.count ?? 0,
            despachos_en_ruta: dspRes.count ?? 0,
          });

          if (costosRes.data) {
            // Mapeo seguro para transformar valores de DB a ZonaEnvio (enum del código)
            const mapping: Record<string, ZonaEnvio> = {
              'cercana_sjl': 'cercana_sjl',
              'Cercana a SJL': 'cercana_sjl', // Por si la DB guarda el label
              'media': 'media',
              'Zona media': 'media',
              'lejana': 'lejana',
              'Zona lejana': 'lejana'
            };

            const formateados: CostoEnvioDb[] = costosRes.data.map(c => ({
              id: c.id,
              zona: mapping[c.zona] || 'cercana_sjl',
              costo: Number(c.costo),
              activo: c.activo
            }));
            setCostosEnvio(formateados);
          }
        }
      } catch (err) {
        console.error('Error init Portal:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const esClienteNuevo = cliente?.tipo_cliente === TIPO_CLIENTE_NUEVO;

  const resumen = useMemo(
    () => calcularResumen(items, zonaEnvio, reglas, esClienteNuevo),
    [items, zonaEnvio, reglas, esClienteNuevo]
  );

  const actualizarItem = useCallback(({ variante_id, nueva_variante_id, talla, color, cantidad }: any) => {
    setItems(prev => prev.map(item => {
      if (item.variante_id !== variante_id) return item;
      const updates: any = {};
      if (nueva_variante_id !== undefined) updates.variante_id = nueva_variante_id;
      if (talla !== undefined) updates.talla = talla;
      if (color !== undefined) updates.color = color;
      if (cantidad !== undefined) {
        const cant = Math.min(MAX_UNIDADES, Math.max(1, cantidad));
        updates.cantidad = cant;
        updates.subtotal = cant * item.precio_unitario;
      }
      return { ...item, ...updates };
    }));
  }, []);

  const agregarAlBorrador = useCallback((nuevoItem: any) => {
    setItems((prev: ItemCotizacion[]) => {
      const idx = prev.findIndex(i => i.producto_id === nuevoItem.id);
      if (idx >= 0) {
        return prev.map((i, n) => n === idx
          ? {
            ...i,
            cantidad: Math.min(MAX_UNIDADES, i.cantidad + (nuevoItem.cantidad || 1)),
            subtotal: Math.min(MAX_UNIDADES, i.cantidad + (nuevoItem.cantidad || 1)) * i.precio_unitario,
          }
          : i
        );
      }
      return [...prev, {
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
        variantes: nuevoItem.variantes || [],
      }];
    });
  }, []);

  const actualizarCantidad = useCallback((variante_id: number, cantidad: number) => {
    setItems(prev => prev.map(i => {
      if (i.variante_id !== variante_id) return i;
      const cant = Math.min(MAX_UNIDADES, Math.max(1, cantidad));
      return { ...i, cantidad: cant, subtotal: cant * i.precio_unitario };
    }));
  }, []);

  const eliminarDelBorrador = useCallback((vid: number) => setItems(prev => prev.filter(i => i.variante_id !== vid)), []);
  const limpiarBorrador = useCallback(() => setItems([]), []);
  const actualizarZonaEnvio = useCallback((zona: ZonaEnvio) => setZonaEnvio(zona), []);

  return (
    <PortalContext.Provider value={{
      cliente, loading, items, resumen, zonaEnvio, costosEnvio, // <-- Se incluyó costosEnvio
      actualizarZonaEnvio, stats, agregarAlBorrador,
      actualizarCantidad, actualizarItem, eliminarDelBorrador, limpiarBorrador,
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