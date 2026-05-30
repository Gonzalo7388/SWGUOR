'use client';

import { createContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { useNotificationsPortal } from '@/lib/hooks/useNotificacionPortal';
import { calcularResumen } from './portalCalculos';
import type { ProductoBase } from '@/types/portal';
import { resolveCartMoq } from '@/lib/constants/portal-b2b';
import { useCartStore } from '@/lib/store/useCartStore';
import { useQuotationStore } from '@/lib/store/useQuotationStore';
import { toast } from 'sonner';

// ── Interfaces y Tipos (Exportaciones limpias) ───────────────────────────────
export interface ClientePortal { id: number; usuario_id: number; ruc: number; razon_social: string; nombre_comercial: string; direccion_fiscal?: string; email: string | null; telefono: number | null; tipo_cliente: string; }
export type ItemCotizacion = ItemLineaB2B;
export type ItemCarrito = ItemLineaB2B;
export type ZonaEnvio = 'cercana_sjl' | 'media' | 'lejana';
export interface CostoEnvioDb { id: number; zona: ZonaEnvio; costo: number; activo: boolean; }
export interface ReglaDescuento { id: number; nombre: string; cantidad_min: number | null; monto_min_compra: number | null; tipo_beneficio: string; valor_descuento: number; fecha_inicio: string; fecha_fin: string; activo: boolean | null; tipo_conteo: string | null; }
export interface CategoriaPortal { id: number; nombre: string; }
export interface ProductoPortal extends ProductoBase {
    id: number; nombre: string;
    descripcion: string | null; created_at: string; imagen: string | null;
    precio: number; stock: number; updated_at: string;
    estado: 'activo' | 'inactivo' | 'en_produccion' | 'agotado' | 'descontinuado';
    sku: string; destacado: boolean | null;
    categoria_id: number | null; moq: number;
    colores_disponibles: string[] | null;
    tallas_disponibles: string[] | null;
    reglas_descuento: string[] | null;
    almacen_id: number | null;
}
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

export const MAX_UNIDADES = 2000;

export function PortalProvider({ children }: { children: ReactNode }) {
    // ── 1. ESTADOS REACTIVOS DESDE ZUSTAND ──
    const storeItemsBorrador = useQuotationStore((state) => state.itemsBorrador);
    const storeItemsCarrito = useCartStore((state) => state.items);
    const zonaEnvio = useQuotationStore((state) => state.zonaEnvio);
    const actualizarZonaEnvioState = useQuotationStore((state) => state.actualizarZonaEnvio);

    // ── 2. ESTADOS LOCALES BASE ──
    const [cliente, setCliente] = useState<ClientePortal | null>(null);
    const [loading, setLoading] = useState(true);
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

    // Inicialización del Portal B2B con consulta única optimizada
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
                if (productosRes.data) setProductos(productosRes.data as ProductoPortal[]);
                if (categoriasRes.data) setCategorias(categoriasRes.data);
                if (costosRes.data) {
                    setCostosEnvio(costosRes.data.map(c => ({ id: c.id, zona: c.zona as ZonaEnvio, costo: Number(c.costo), activo: c.activo })));
                }

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
                        direccion_fiscal: datosCliente.direccion_fiscal || 'Sin Dirección',
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

    // ── 3. NORMALIZACIÓN DE TIPOS Y ADAPTACIÓN PARA CALCULOS (Corrige error de TypeScript) ──
    const itemsBorradorAdaptados = useMemo<ItemLineaB2B[]>(() => {
        return storeItemsBorrador.map((item) => ({
            producto_id: item.producto_id,
            variante_id: item.variante_id,
            nombre: item.nombre,
            sku: item.sku,
            imagen: item.imagen,
            precio_unitario: item.precio_unitario,
            cantidad: item.cantidad,
            talla: item.talla,
            color: item.color,
            stock_disponible: item.stock_disponible ?? 9999,
            subtotal: item.precio_unitario * item.cantidad // Inyectamos dinámicamente la propiedad faltante
        }));
    }, [storeItemsBorrador]);

    const itemsCarritoAdaptados = useMemo<ItemLineaB2B[]>(() => {
        return storeItemsCarrito.map((item) => ({
            producto_id: item.producto_id,
            variante_id: item.variante_id ?? 0,
            nombre: item.nombre,
            sku: '',
            imagen: item.imagen_url,
            precio_unitario: item.precio,
            cantidad: item.cantidad,
            talla: item.talla,
            color: item.color,
            stock_disponible: 9999,
            subtotal: item.precio * item.cantidad
        }));
    }, [storeItemsCarrito]);

    // ── 4. MEMOS DE RESÚMENES FINANCIEROS ──
    const resumenBorrador = useMemo(() => calcularResumen(itemsBorradorAdaptados, zonaEnvio, reglas, esClienteNuevo), [itemsBorradorAdaptados, zonaEnvio, reglas, esClienteNuevo]);
    const resumenCarrito = useMemo(() => calcularResumen(itemsCarritoAdaptados, zonaEnvio, reglas, esClienteNuevo), [itemsCarritoAdaptados, zonaEnvio, reglas, esClienteNuevo]);

    // ── 5. ACCIONES CONECTADAS DIRECTAMENTE A ZUSTAND ──
    const actualizarZonaEnvio = useCallback((zona: ZonaEnvio) => {
        actualizarZonaEnvioState(zona);
    }, [actualizarZonaEnvioState]);

    const agregarACotizacion = useCallback((p: AgregarCotizacionPayload) => {
        useQuotationStore.getState().addItemToBorrador({
            producto_id: p.producto_id,
            variante_id: p.variante_id,
            nombre: p.nombre,
            sku: p.sku,
            imagen: p.imagen,
            precio_unitario: p.precio_unitario,
            talla: p.talla,
            color: p.color,
            stock_disponible: 9999
        }, p.cantidad);
    }, []);

    const agregarDesdeCatalogo = useCallback((producto: any, varianteId?: number, cantidad: number = 1) => {
        // 1. Si no especificó variante, buscamos la primera variante activa de este producto
        let v_id = varianteId;

        if (!v_id && producto.variantes && producto.variantes.length > 0) {
            v_id = producto.variantes[0].id; // Forzar la primera variante disponible
        }

        // 2. Extraer la información extendida de la variante para Zustand
        const varianteSeleccionada = producto.variantes?.find((v: any) => v.id === v_id);

        // 3. Insertar al useCartStore de manera segura con todas sus propiedades limpias
        useCartStore.getState().addItem({
            producto_id: producto.id,
            variante_id: v_id,
            nombre: producto.nombre,
            precio: Number(producto.precio),
            moq: producto.moq || 1,
            imagen_url: varianteSeleccionada?.imagen_url || producto.imagen || null,
            talla: varianteSeleccionada?.talla || 'U',
            color: varianteSeleccionada?.color || 'Estándar'
        }, cantidad);

        toast.success(`${producto.nombre} agregado al borrador de pedido.`);
    }, []);

    const actualizarCantidadBorrador = useCallback((id: number, q: number) => useQuotationStore.getState().updateBorradorQuantity(id, q), []);
    const actualizarCantidadCarrito = useCallback((v_id: number, q: number) => {
        const item = useCartStore.getState().items.find(i => i.variante_id === v_id);
        if (item) {
            useCartStore.getState().updateQuantity(item.producto_id, v_id, q);
        }
    }, []);
    const eliminarDelBorrador = useCallback((id: number) => useQuotationStore.getState().removeItemFromBorrador(id), []);
    const eliminarDelCarrito = useCallback((v_id: number) => {
        const item = useCartStore.getState().items.find(i => i.variante_id === v_id);
        if (item) {
            useCartStore.getState().removeItem(item.producto_id, v_id);
        }
    }, []);
    const limpiarBorrador = useCallback(() => useQuotationStore.getState().clearBorrador(), []);
    const limpiarCarrito = useCallback(() => useCartStore.getState().clearCart(), []);

    const actualizarCliente = useCallback((u: Partial<ClientePortal>) => setCliente(prev => prev ? { ...prev, ...u } : prev), []);

    return (
        <PortalContext.Provider value={{
            cliente, loading, itemsBorrador: itemsBorradorAdaptados, itemsCarrito: itemsCarritoAdaptados, resumenBorrador, resumenCarrito, zonaEnvio, costosEnvio, productos, categorias, stats,
            actualizarZonaEnvio, agregarACotizacion, agregarDesdeCatalogo, actualizarCantidadBorrador, actualizarCantidadCarrito, eliminarDelBorrador, eliminarDelCarrito, limpiarBorrador, limpiarCarrito, actualizarCliente,
            notificaciones, unreadCount, loadingNotifs, markAsRead, markAllAsRead, refetchNotifs
        }}>
            {children}
        </PortalContext.Provider>
    );
}