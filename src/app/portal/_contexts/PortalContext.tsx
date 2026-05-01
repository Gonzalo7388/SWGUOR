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
}

export interface ResumenCotizacion {
  subtotal: number;
  total_unidades: number;
  total_modelos: number;        // ✅ cantidad de productos distintos
  descuento_pct: number;
  descuento_monto: number;
  base_igv: number;
  igv: number;
  total: number;
  descripcion_descuento: string;
}

interface PortalCtx {
  cliente: ClientePortal | null;
  loading: boolean;
  items: ItemCotizacion[];
  resumen: ResumenCotizacion;
  agregarAlBorrador: (item: any) => void;
  actualizarCantidad: (variante_id: number, cantidad: number) => void;
  eliminarDelBorrador: (variante_id: number) => void;
  limpiarBorrador: () => void;
  stats: { cotizaciones_activas: number; ordenes_activas: number; despachos_en_ruta: number };
}

// ── Reglas de negocio ─────────────────────────────────────────────────────────
export const MOQ_MINIMO = 400;
const IGV = 0.18;

/**
 * Escalas de descuento reales (tabla reglas_descuento, tipo_conteo = 'modelos_distintos')
 * El descuento se aplica según la cantidad de modelos/productos DISTINTOS en el carrito.
 * Ordenadas de mayor a menor para que .find() devuelva la escala más alta que aplica.
 *
 * id=4  40+ modelos → 30 %
 * id=3  25+ modelos → 20 %
 * id=2  15+ modelos → 15 %
 * id=1  11+ modelos → 10 %
 */
const ESCALAS_DESCUENTO = [
  { min: 40, pct: 30, label: '≥ 40 modelos distintos' },
  { min: 25, pct: 20, label: '≥ 25 modelos distintos' },
  { min: 15, pct: 15, label: '≥ 15 modelos distintos' },
  { min: 11, pct: 10, label: '≥ 11 modelos distintos' },
];

function calcularResumen(items: ItemCotizacion[]): ResumenCotizacion {
  const subtotal       = items.reduce((s, i) => s + i.subtotal, 0);
  const total_unidades = items.reduce((s, i) => s + i.cantidad, 0);

  const total_modelos  = new Set(items.map(i => i.producto_id)).size;

  const escala         = ESCALAS_DESCUENTO.find(e => total_modelos >= e.min);
  const descuento_pct  = escala?.pct ?? 0;
  const descuento_monto = subtotal * (descuento_pct / 100);
  const base_igv       = subtotal - descuento_monto;
  const igv            = base_igv * IGV;

  return {
    subtotal,
    total_unidades,
    total_modelos,
    descuento_pct,
    descuento_monto,
    base_igv,
    igv,
    total: base_igv + igv,
    descripcion_descuento: escala
      ? `Descuento ${escala.pct}% por ${escala.label}`
      : 'Sin descuento (requiere ≥ 11 modelos distintos)',
  };
}

const PortalContext = createContext<PortalCtx | null>(null);

export function PortalProvider({ children }: { children: ReactNode }) {
  const [cliente, setCliente] = useState<ClientePortal | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ItemCotizacion[]>([]);
  const [stats, setStats] = useState({
    cotizaciones_activas: 0, ordenes_activas: 0, despachos_en_ruta: 0,
  });

  useEffect(() => {
    const init = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) { setLoading(false); return; }

      try {
        const { data: usuarioData, error: userError } = await supabase
          .from('usuarios')
          .select('id')
          .eq('auth_id', user.id)
          .maybeSingle();

        if (userError || !usuarioData) { setLoading(false); return; }

        const { data: perfilCompleto, error: joinError } = await supabase
          .from('usuarios')
          .select(`id, cliente_datos:clientes!clientes_usuario_id_fkey (*)`)
          .eq('id', usuarioData.id)
          .single();

        if (joinError) console.error('Error join:', joinError.message);

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
            telefono: datosCliente.telefono
              ? Number(datosCliente.telefono.replace(/\D/g, ''))
              : null,
            tipo_cliente: datosCliente.tipo_cliente || 'corporativo',
          });

          try {
            const [cotRes, ordRes, dspRes] = await Promise.all([
              supabase
                .from('cotizaciones')
                .select('id', { count: 'exact', head: true })
                .eq('cliente_id', datosCliente.id)
                .in('estado', ['borrador', 'enviada', 'aprobada']),
              supabase
                .from('pedidos')
                .select('id', { count: 'exact', head: true })
                .eq('cliente_id', datosCliente.id)
                .not('estado', 'in', '(entregado,cancelado)'),
              supabase
                .from('despachos')
                .select('id', { count: 'exact', head: true })
                .eq('estado', 'en_ruta'),
            ]);

            setStats({
              cotizaciones_activas: cotRes.count ?? 0,
              ordenes_activas:      ordRes.count ?? 0,
              despachos_en_ruta:    dspRes.count ?? 0,
            });
          } catch (e) {
            console.warn('Error en estadísticas:', e);
          }
        }
      } catch (err) {
        console.error('Falla general:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const resumen = useMemo(() => calcularResumen(items), [items]);

  const agregarAlBorrador = useCallback((nuevoItem: any) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.variante_id === nuevoItem.variante_id);

      if (idx >= 0) {
        return prev.map((i, n) => n === idx
          ? {
              ...i,
              cantidad: i.cantidad + (nuevoItem.cantidad || 1),
              subtotal: (i.cantidad + (nuevoItem.cantidad || 1)) * i.precio_unitario,
            }
          : i
        );
      }

      const itemFormateado: ItemCotizacion = {
        producto_id:      nuevoItem.producto_id ?? nuevoItem.id,
        variante_id:      nuevoItem.variante_id ?? nuevoItem.id,
        nombre:           nuevoItem.nombre,
        sku:              nuevoItem.sku ?? `SKU-${String(nuevoItem.id).slice(0, 5)}`,
        imagen:           nuevoItem.imagen ?? nuevoItem.imagen_url ?? null,
        precio_unitario:  nuevoItem.precio_unitario ?? nuevoItem.precio ?? nuevoItem.precio_base,
        cantidad:         nuevoItem.cantidad || 1,
        talla:            nuevoItem.talla ?? 'M',
        color:            nuevoItem.color ?? 'Estándar',
        subtotal:         (nuevoItem.cantidad || 1) * (nuevoItem.precio_unitario ?? nuevoItem.precio ?? nuevoItem.precio_base),
        stock_disponible: nuevoItem.stock_disponible ?? 1000,
      };

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

  return (
    <PortalContext.Provider value={{
      cliente, loading, items, resumen, stats,
      agregarAlBorrador,
      actualizarCantidad,
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