/**
 * Helpers para Productos e Insumos
 * Tipos derivados del schema regenerado de Supabase.
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';
import type {
  Producto,
  ProductoInsert,
  ProductoUpdate,
  Insumo,
  InsumoInsert,
  EstadoProducto,
  TipoInsumo,
} from '@/types';

const getClient = () => getSupabaseBrowserClient();

// ==========================================
// SECCIÓN: PRODUCTOS (Tabla: 'productos')
// ==========================================

export async function obtenerProductos(filtros?: {
  categoria_id?: number;
  estado?: EstadoProducto;
  busqueda?: string;
}): Promise<{ data: Producto[] | null; error: string | null }> {
  try {
    const supabase = getClient();

    let query = supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false });

    if (filtros?.categoria_id) {
      query = query.eq('categoria_id', filtros.categoria_id);
    }

    if (filtros?.estado) {
      query = query.eq('estado', filtros.estado);
    }

    const { data, error } = await query;
    if (error) throw error;

    let productos = (data as Producto[]) || [];

    if (filtros?.busqueda) {
      const busquedaBaja = filtros.busqueda.toLowerCase();
      productos = productos.filter(
        (p) =>
          p.nombre.toLowerCase().includes(busquedaBaja) ||
          p.sku.toLowerCase().includes(busquedaBaja) ||
          p.descripcion?.toLowerCase().includes(busquedaBaja)
      );
    }

    return { data: productos, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export async function obtenerProductoPorId(
  productoId: number
): Promise<{ data: Producto | null; error: string | null }> {
  try {
    const supabase = getClient();

    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('id', productoId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export async function crearProducto(
  productoData: ProductoInsert
): Promise<{ data: Producto | null; error: string | null }> {
  try {
    const supabase = getClient();

    const { data, error } = await supabase
      .from('productos')
      .insert(productoData)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export async function actualizarProducto(
  productoId: number,
  updates: ProductoUpdate
): Promise<{ data: Producto | null; error: string | null }> {
  try {
    const supabase = getClient();

    const { data, error } = await supabase
      .from('productos')
      .update(updates)
      .eq('id', productoId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export async function eliminarProducto(
  productoId: number
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = getClient();

    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', productoId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// SECCIÓN: INSUMOS (Tabla: 'insumo')
// ==========================================

export async function obtenerInsumos(
  tipo?: TipoInsumo
): Promise<{ data: Insumo[] | null; error: string | null }> {
  try {
    const supabase = getClient();

    let query = supabase
      .from('insumo')
      .select('*')
      .order('nombre', { ascending: true });

    if (tipo) {
      query = query.eq('tipo', tipo);
    }

    const { data, error } = await query;
    if (error) throw error;

    return { data: data || [], error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export async function crearInsumo(
  insumoData: InsumoInsert
): Promise<{ data: Insumo | null; error: string | null }> {
  try {
    const supabase = getClient();

    const { data, error } = await supabase
      .from('insumo')
      .insert(insumoData)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export async function actualizarStockInsumo(
  insumoId: number,
  nuevoStock: number
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = getClient();

    const { error } = await supabase
      .from('insumo')
      .update({ stock_actual: nuevoStock })
      .eq('id', insumoId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function descontarStock(
  insumoId: number,
  cantidad: number
): Promise<{ success: boolean; nuevoStock?: number; error: string | null }> {
  try {
    const supabase = getClient();

    const { data: insumo, error: fetchError } = await supabase
      .from('insumo')
      .select('stock_actual')
      .eq('id', insumoId)
      .single();

    if (fetchError) throw fetchError;

    const nuevoStock = (insumo?.stock_actual ?? 0) - cantidad;

    if (nuevoStock < 0) throw new Error('Stock insuficiente');

    const { error: updateError } = await supabase
      .from('insumo')
      .update({ stock_actual: nuevoStock })
      .eq('id', insumoId);

    if (updateError) throw updateError;

    return { success: true, nuevoStock, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function incrementarStock(
  insumoId: number,
  cantidad: number
): Promise<{ success: boolean; nuevoStock?: number; error: string | null }> {
  try {
    const supabase = getClient();

    const { data: insumo, error: fetchError } = await supabase
      .from('insumo')
      .select('stock_actual')
      .eq('id', insumoId)
      .single();

    if (fetchError) throw fetchError;

    const nuevoStock = (insumo?.stock_actual ?? 0) + cantidad;

    const { error: updateError } = await supabase
      .from('insumo')
      .update({ stock_actual: nuevoStock })
      .eq('id', insumoId);

    if (updateError) throw updateError;

    return { success: true, nuevoStock, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// SECCIÓN: REPORTES / ALERTAS
// ==========================================

export async function obtenerInsumosAgotados(): Promise<{
  data: Insumo[] | null;
  error: string | null;
}> {
  try {
    const supabase = getClient();

    const { data, error } = await supabase
      .from('insumo')
      .select('*')
      .eq('stock_actual', 0)
      .order('nombre', { ascending: true });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export async function obtenerInsumosStockBajo(): Promise<{
  data: Insumo[] | null;
  error: string | null;
}> {
  try {
    const supabase = getClient();

    const { data, error } = await supabase
      .from('insumo')
      .select('*')
      .order('stock_actual', { ascending: true });

    if (error) throw error;

    const filtrados = (data || []).filter(
      (i) => i.stock_actual <= i.stock_minimo
    );

    return { data: filtrados, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

// ==========================================
// SECCIÓN: CÁLCULOS (Frontend — sin Supabase)
// ==========================================

export function stockBajoMinimo(stockActual: number, stockMinimo: number): boolean {
  return stockActual <= stockMinimo;
}

export function calcularMargen(costoUnitario: number, precioVenta: number): number {
  if (costoUnitario === 0) return 0;
  return ((precioVenta - costoUnitario) / costoUnitario) * 100;
}

export function calcularPrecioVenta(costoUnitario: number, margenPorcentaje: number): number {
  return costoUnitario + costoUnitario * (margenPorcentaje / 100);
}