'use client';

import { createContext, useEffect, useState, useCallback, useMemo, ReactNode, useReducer } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { useNotificationsPortal } from '@/lib/hooks/useNotificacionPortal';
import { portalReducer, PortalState } from './portalReducer';
import { calcularResumen } from './portalCalculos';

// ── Interfaces y Tipos (Exportaciones limpias) ───────────────────────────────
export interface ClientePortal { id: number; usuario_id: number; ruc: number; razon_social: string; nombre_comercial: string; direccion?: string; email: string | null; telefono: number | null; tipo_cliente: string; }
export type ItemCotizacion = ItemLineaB2B;
export type ItemCarrito = ItemLineaB2B;
export type ZonaEnvio = 'cercana_sjl' | 'media' | 'lejana';
export interface CostoEnvioDb { id: number; zona: ZonaEnvio; costo: number; activo: boolean; }
export interface ReglaDescuento { id: number; nombre: string; cantidad_min: number | null; monto_min_compra: number | null; tipo_beneficio: string; valor_descuento: number; fecha_inicio: string; fecha_fin: string; activo: boolean | null; tipo_conteo: string | null; }
export interface CategoriaPortal { id: number; nombre: string; }
export interface ProductoPortal { id: number; nombre: string; descripcion: string | null; created_at: string; imagen: string | null; precio: number; stock: number; updated_at: string; estado: 'activo' | 'inactivo' | 'en_produccion' | 'agotado' | 'descontinuado'; sku: string; destacado: boolean | null; categoria_id: number | null; moq: number; colores_disponibles: string[] | null; tallas_disponibles: string[] | null; reglas_descuento: string[] | null; almacen_id: number | null; }
export interface ResumenCotizacion { subtotal: number; total_unidades: number; modelos_distintos: number; descuento_pct: number; descuento_monto: number; base_igv: number; igv: number; costo_envio: number; total: number; descripcion_descuento: string; descripcion_envio: string; es_cliente_nuevo: boolean; }

export interface AgregarCotizacionPayload { variante_id: number; producto_id: number; cantidad: number; nombre: string; sku: string; imagen: string | null; color: string; talla: string; precio_unitario: number; }
export type AgregarPedidoPayload = | { tipo: 'catalogo_rapido'; producto: ProductoPortal } | { tipo: 'picker_variante'; variante_id: number; producto: ProductoPortal; cantidad: number };

export const ZONAS_ENVIO: Record<ZonaEnvio, { label: string; costo: number }> = {
    cercana_sjl: { label: 'Cercana a SJL', costo: 15 },
    media: { label: 'Zona media', costo: 20 },
    lejana: { label: 'Zona lejana', costo: 25 },
};

export interface ItemLineaB2B {
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

export interface PortalCtxProps {
    cliente: ClientePortal | null;
    loading: boolean;
    itemsBorrador: ItemCotizacion[];
    itemsCarrito: ItemCotizacion[];
    resumenBorrador: ResumenCotizacion;
    resumenCarrito: ResumenCotizacion;
    zonaEnvio: ZonaEnvio;
    costosEnvio: CostoEnvioDb[];
    productos: ProductoPortal[];
    categorias: CategoriaPortal[];
    stats: { cotizaciones_activas: number; ordenes_activas: number; despachos_en_ruta: number };
    actualizarZonaEnvio: (zona: ZonaEnvio) => void;
    agregarACotizacion: (payload: AgregarCotizacionPayload) => void;
    agregarDesdeCatalogo: (payload: AgregarPedidoPayload) => void;
    actualizarCantidadBorrador: (variante_id: number, cantidad: number) => void;
    actualizarCantidadCarrito: (variante_id: number, cantidad: number) => void;
    eliminarDelBorrador: (variante_id: number) => void;
    eliminarDelCarrito: (variante_id: number) => void;
    limpiarBorrador: () => void;
    limpiarCarrito: () => void;
    actualizarCliente: (updates: Partial<ClientePortal>) => void;
    notificaciones: ReturnType<typeof useNotificationsPortal>['notificaciones'];
    unreadCount: number;
    loadingNotifs: boolean;
    markAsRead: (id: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refetchNotifs: () => Promise<void>;
}

export const PortalContext = createContext<PortalCtxProps | null>(null);

export const MOQ_MINIMO = 400;
export const MAX_UNIDADES = 2000;

const SS_BORRADOR = 'guor_portal_borrador';
const SS_CARRITO = 'guor_portal_carrito';
const SS_ZONA = 'guor_portal_zona';

const initialState: PortalState = { itemsBorrador: [], itemsCarrito: [] };

export function PortalProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(portalReducer, initialState);
    const [cliente, setCliente] = useState<ClientePortal | null>(null);
    const [loading, setLoading] = useState(true);
    const [zonaEnvio, setZonaEnvioState] = useState<ZonaEnvio>('cercana_sjl');
    const [reglas, setReglas] = useState<ReglaDescuento[]>([]);
    const [stats, setStats] = useState({ cotizaciones_activas: 0, ordenes_activas: 0, despachos_en_ruta: 0 });
    const [costosEnvio, setCostosEnvio] = useState<CostoEnvioDb[]>([
        { id: 1, zona: 'cercana_sjl', costo: 15, activo: true },
        { id: 2, zona: 'media', costo: 20, activo: true },
        { id: 3, zona: 'lejana', costo: 25, activo: true }
    ]);
    const [productos, setProductos] = useState<ProductoPortal[]>([]);
    const [categorias, setCategorias] = useState<CategoriaPortal[]>([]);

    const { notificaciones, unreadCount, loading: loadingNotifs, markAsRead, markAllAsRead, refetch: refetchNotifs } = useNotificationsPortal(cliente?.usuario_id);

    // Carga inicial segura de SessionStorage en Cliente (Previene desajustes de SSR)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const b = sessionStorage.getItem(SS_BORRADOR);
            const c = sessionStorage.getItem(SS_CARRITO);
            const z = sessionStorage.getItem(SS_ZONA);
            dispatch({
                type: 'SET_INITIAL_STATES',
                borrador: b ? JSON.parse(b) : [],
                carrito: c ? JSON.parse(c) : []
            });
            if (z) setZonaEnvioState(JSON.parse(z));
        } catch (e) { console.error(e); }
    }, []);

    // Sincronizadores automáticos e independientes de almacenamiento local
    useEffect(() => { sessionStorage.setItem(SS_BORRADOR, JSON.stringify(state.itemsBorrador)); }, [state.itemsBorrador]);
    useEffect(() => { sessionStorage.setItem(SS_CARRITO, JSON.stringify(state.itemsCarrito)); }, [state.itemsCarrito]);

    // Inicialización del Portal B2B con consulta única optimizada (Mitiga Latencia de Red / LCP)
    useEffect(() => {
        const init = async () => {
            const supabase = getSupabaseBrowserClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { setLoading(false); return; }

            try {
                const [reglasRes, productosRes, categoriasRes, costosRes] = await Promise.all([
                    supabase.from('reglas_descuento').select('*').eq('activo', true),
                    supabase.from('productos').select('*').order('nombre', { ascending: true }),
                    supabase.from('categorias').select('id, nombre').order('nombre', { ascending: true }),
                    supabase.from('costo_envio').select('*').eq('activo', true).order('id'),
                ]);

                if (reglasRes.data) setReglas(reglasRes.data);
                if (productosRes.data) setProductos(productosRes.data as unknown as ProductoPortal[]);
                if (categoriasRes.data) setCategorias(categoriasRes.data);
                if (costosRes.data) {
                    setCostosEnvio(costosRes.data.map(c => ({ id: c.id, zona: c.zona as ZonaEnvio, costo: Number(c.costo), activo: c.activo })));
                }

                // Consulta relacional en un solo viaje limpio
                const { data: usuarioPerfil } = await supabase
                    .from('usuarios')
                    .select(`id, cliente_datos:clientes!clientes_usuario_id_fkey (*)`)
                    .eq('auth_id', user.id)
                    .maybeSingle();

                const datosCliente = Array.isArray(usuarioPerfil?.cliente_datos)
                    ? usuarioPerfil?.cliente_datos[0]
                    : usuarioPerfil?.cliente_datos;

                if (datosCliente) {
                    setCliente({
                        id: datosCliente.id,
                        usuario_id: usuarioPerfil!.id,
                        ruc: Number(datosCliente.ruc),
                        razon_social: datosCliente.razon_social || 'Sin Razón Social',
                        direccion: datosCliente.direccion_fiscal || 'Sin Dirección',
                        email: datosCliente.email,
                        telefono: datosCliente.telefono ? Number(datosCliente.telefono.replace(/\D/g, '')) : null,
                        tipo_cliente: datosCliente.tipo_cliente || 'corporativo',
                        nombre_comercial: datosCliente.nombre_comercial || 'Sin Nombre Comercial',
                    });

                    const [cotRes, ordRes, dspRes] = await Promise.all([
                        supabase.from('cotizaciones').select('id', { count: 'exact', head: true }).eq('cliente_id', datosCliente.id).in('estado', ['borrador', 'enviada', 'aprobada']),
                        supabase.from('pedidos').select('id', { count: 'exact', head: true }).eq('cliente_id', datosCliente.id).not('estado', 'in', '(finalizado,cancelado)'),
                        supabase.from('despachos').select('id', { count: 'exact', head: true }).eq('estado', 'en_ruta'),
                    ]);

                    setStats({ cotizaciones_activas: cotRes.count ?? 0, ordenes_activas: ordRes.count ?? 0, despachos_en_ruta: dspRes.count ?? 0 });
                }
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        init();
    }, []);

    const esClienteNuevo = cliente?.tipo_cliente === 'nuevo';

    const resumenBorrador = useMemo(() => calcularResumen(state.itemsBorrador, zonaEnvio, reglas, esClienteNuevo), [state.itemsBorrador, zonaEnvio, reglas, esClienteNuevo]);
    const resumenCarrito = useMemo(() => calcularResumen(state.itemsCarrito, zonaEnvio, reglas, esClienteNuevo), [state.itemsCarrito, zonaEnvio, reglas, esClienteNuevo]);

    const actualizarZonaEnvio = useCallback((zona: ZonaEnvio) => { setZonaEnvioState(zona); sessionStorage.setItem(SS_ZONA, JSON.stringify(zona)); }, []);

    // ── FLUJO 1: AGREGAR A COTIZACIÓN (Borrador interno aislado del carrito comercial) ──
    const agregarACotizacion = useCallback((p: AgregarCotizacionPayload) => {
        dispatch({
            type: 'AGREGAR_A_BORRADOR',
            item: {
                producto_id: p.producto_id,
                variante_id: p.variante_id,
                nombre: p.nombre,
                sku: p.sku,
                imagen: p.imagen,
                precio_unitario: p.precio_unitario,
                cantidad: p.cantidad,
                talla: p.talla,
                color: p.color,
                subtotal: p.cantidad * p.precio_unitario,
                stock_disponible: 9999
            }
        });
    }, []);

    // ── FLUJO 2: AGREGAR AL CARRITO (Pedido Directo / Compra Inmediata) ──
    const agregarDesdeCatalogo = useCallback((payload: AgregarPedidoPayload) => {
        let v_id: number, cant: number, t: string, c: string;
        const prod = payload.producto;

        if (payload.tipo === 'catalogo_rapido') {
            cant = prod.moq || MOQ_MINIMO;
            const reglasJson = prod.reglas_descuento as any;
            const vars = Array.isArray(reglasJson?.variantes) ? reglasJson.variantes : [];
            v_id = vars[0]?.id || prod.id;
            t = vars[0]?.talla || prod.tallas_disponibles?.[0] || 'M';
            c = vars[0]?.color || prod.colores_disponibles?.[0] || 'Estándar';
        } else {
            v_id = payload.variante_id;
            cant = payload.cantidad;
            const reglasJson = prod.reglas_descuento as any;
            const vars = Array.isArray(reglasJson?.variantes) ? reglasJson.variantes : [];
            const f = vars.find((v: any) => v.id === v_id);
            t = f?.talla || 'M'; c = f?.color || 'Estándar';
        }

        dispatch({
            type: 'AGREGAR_A_CARRITO',
            item: {
                producto_id: prod.id,
                variante_id: v_id,
                nombre: prod.nombre,
                sku: prod.sku,
                imagen: prod.imagen,
                precio_unitario: prod.precio,
                cantidad: cant,
                talla: t,
                color: c,
                subtotal: cant * prod.precio,
                stock_disponible: prod.stock || 1000
            }
        });
    }, []);

    const actualizarCantidadBorrador = useCallback((id: number, q: number) => dispatch({ type: 'ACTUALIZAR_CANTIDAD_BORRADOR', variante_id: id, cantidad: q }), []);
    const actualizarCantidadCarrito = useCallback((id: number, q: number) => dispatch({ type: 'ACTUALIZAR_CANTIDAD_CARRITO', variante_id: id, cantidad: q }), []);
    const eliminarDelBorrador = useCallback((id: number) => dispatch({ type: 'ELIMINAR_DE_BORRADOR', variante_id: id }), []);
    const eliminarDelCarrito = useCallback((id: number) => dispatch({ type: 'ELIMINAR_DE_CARRITO', variante_id: id }), []);
    const limpiarBorrador = useCallback(() => dispatch({ type: 'LIMPIAR_BORRADOR' }), []);
    const limpiarCarrito = useCallback(() => dispatch({ type: 'LIMPIAR_CARRITO' }), []);
    const actualizarCliente = useCallback((u: Partial<ClientePortal>) => setCliente(prev => prev ? { ...prev, ...u } : prev), []);

    return (
        <PortalContext.Provider value={{
            cliente, loading, itemsBorrador: state.itemsBorrador, itemsCarrito: state.itemsCarrito, resumenBorrador, resumenCarrito, zonaEnvio, costosEnvio, productos, categorias, stats,
            actualizarZonaEnvio, agregarACotizacion, agregarDesdeCatalogo, actualizarCantidadBorrador, actualizarCantidadCarrito, eliminarDelBorrador, eliminarDelCarrito, limpiarBorrador, limpiarCarrito, actualizarCliente,
            notificaciones, unreadCount, loadingNotifs, markAsRead, markAllAsRead, refetchNotifs
        }}>
            {children}
        </PortalContext.Provider>
    );
}