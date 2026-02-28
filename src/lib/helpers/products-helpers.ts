/**
 * Helpers para Productos e Insumos
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';
import type {
  Producto,
  ProductoInsert,
  ProductoUpdate,
  Insumo,
  InsumoInsert,
  EstadoProducto,
  TipoInsumo
} from '@/types';

// Helper para obtener el cliente — cast a any solo para la tabla 'insumo'
// porque su definición puede no estar sincronizada con el tipo Database generado.
const getClient = () => getSupabaseBrowserClient();
const getClientAny = () => getSupabaseBrowserClient() as any;

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
        p =>
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

    return { data: data as Producto, error: null };
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
      .insert(productoData as any)
      .select()
      .single();

    if (error) throw error;

    return { data: data as Producto, error: null };
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
      .update(updates as any)
      .eq('id', productoId)
      .select()
      .single();

    if (error) throw error;

    return { data: data as Producto, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export async function eliminarProducto(
  productoId: number
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = getClient();

    const { error } = await supabase.from('productos').delete().eq('id', productoId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// SECCIÓN: INSUMOS (Tabla: 'insumo')
// Usamos getClientAny() porque la tabla 'insumo' no está en el tipo
// Database generado (o tiene nombre distinto). El tipado de retorno
// lo garantizamos con los tipos manuales Insumo / InsumoInsert.
// ==========================================

export async function obtenerInsumos(
  tipo?: TipoInsumo
): Promise<{ data: Insumo[] | null; error: string | null }> {
  try {
    const supabase = getClientAny();

    let query = supabase
      .from('insumo')
      .select('*')
      .order('nombre', { ascending: true });

    if (tipo) {
      query = query.eq('tipo', tipo);
    }

    const { data, error } = await query;
    if (error) throw error;

    return { data: (data as Insumo[]) || [], error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export async function crearInsumo(
  insumoData: InsumoInsert
): Promise<{ data: Insumo | null; error: string | null }> {
  try {
    const supabase = getClientAny();

    const { data, error } = await supabase
      .from('insumo')
      .insert(insumoData)
      .select()
      .single();

    if (error) throw error;

    return { data: data as Insumo, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export async function actualizarStockInsumo(
  insumoId: number,
  nuevoStock: number
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = getClientAny();

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
    const supabase = getClientAny();

    const { data: insumo, error: fetchError } = await supabase
      .from('insumo')
      .select('stock_actual')
      .eq('id', insumoId)
      .single();

    if (fetchError) throw fetchError;

    const stockActual: number = insumo?.stock_actual ?? 0;
    const nuevoStock = stockActual - cantidad;

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
    const supabase = getClientAny();

    const { data: insumo, error: fetchError } = await supabase
      .from('insumo')
      .select('stock_actual')
      .eq('id', insumoId)
      .single();

    if (fetchError) throw fetchError;

    const stockActual: number = insumo?.stock_actual ?? 0;
    const nuevoStock = stockActual + cantidad;

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
    const supabase = getClientAny();

    const { data, error } = await supabase
      .from('insumo')
      .select('*')
      .eq('stock_actual', 0)
      .order('nombre', { ascending: true });

    if (error) throw error;

    return { data: (data as Insumo[]) || [], error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export async function obtenerInsumosStockBajo(): Promise<{
  data: Insumo[] | null;
  error: string | null;
}> {
  try {
    const supabase = getClientAny();

    const { data, error } = await supabase
      .from('insumo')
      .select('*')
      .order('stock_actual', { ascending: true });

    if (error) throw error;

    const filtrados = (data as Insumo[]).filter(
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