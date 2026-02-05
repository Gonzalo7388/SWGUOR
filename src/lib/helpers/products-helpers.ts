/**
 * Helpers para Productos
 * Funciones para gestionar productos, inventario, y cálculos relacionados
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';
import type {
  Producto,
  ProductoInsert,
  ProductoUpdate,
  Inventario,
  InventarioInsert,
  EstadoProducto,
  TipoInsumo
} from '@/types/database';

/**
 * Obtener todos los productos con filtros
 */
export async function obtenerProductos(filtros?: {
  categoria_id?: number;
  estado?: EstadoProducto;
  busqueda?: string;
}): Promise<{ data: Producto[] | null; error: string | null }> {
  try {
    const supabase = getSupabaseBrowserClient();

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

    // Filtro por búsqueda (cliente side)
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

/**
 * Obtener un producto por ID
 */
export async function obtenerProductoPorId(
  productoId: number
): Promise<{ data: Producto | null; error: string | null }> {
  try {
    const supabase = getSupabaseBrowserClient();

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

/**
 * Crear un nuevo producto
 */
export async function crearProducto(
  productoData: ProductoInsert
): Promise<{ data: Producto | null; error: string | null }> {
  try {
    const supabase = getSupabaseBrowserClient();

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

/**
 * Actualizar un producto
 */
export async function actualizarProducto(
  productoId: number,
  updates: ProductoUpdate
): Promise<{ data: Producto | null; error: string | null }> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await (supabase as any)
      .from('productos')
      .update(updates)
      .eq('id', productoId)
      .select()
      .single();

    if (error) throw error;

    return { data: data as Producto, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

/**
 * Eliminar un producto
 */
export async function eliminarProducto(productoId: number): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase.from('productos').delete().eq('id', productoId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Obtener inventario por producto
 */
export async function obtenerInventarioPorProducto(
  productoId: number
): Promise<{ data: Inventario | null; error: string | null }> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from('inventario')
      .select('*')
      .eq('producto_id', productoId)
      .single();

    if (error) throw error;

    return { data: data as Inventario, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

/**
 * Obtener todos los insumos
 */
export async function obtenerInsumos(tipo?: TipoInsumo): Promise<{ data: Inventario[] | null; error: string | null }> {
  try {
    const supabase = getSupabaseBrowserClient();

    let query = supabase.from('inventario').select('*').order('nombre', { ascending: true });

    if (tipo) {
      query = query.eq('tipo', tipo);
    }

    const { data, error } = await query;
    if (error) throw error;

    return { data: (data as Inventario[]) || [], error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

/**
 * Crear un insumo
 */
export async function crearInsumo(
  insumoData: InventarioInsert
): Promise<{ data: Inventario | null; error: string | null }> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from('inventario')
      .insert(insumoData as any)
      .select()
      .single();

    if (error) throw error;

    return { data: data as Inventario, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

/**
 * Actualizar stock de un insumo
 */
export async function actualizarStockInsumo(
  inventarioId: number,
  nuevoStock: number
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { error } = await (supabase as any)
      .from('inventario')
      .update({ stock_actual: nuevoStock, updated_at: new Date().toISOString() })
      .eq('id', inventarioId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Descontar stock (para cuando se crea una orden)
 */
export async function descontarStock(
  inventarioId: number,
  cantidad: number
): Promise<{ success: boolean; nuevoStock?: number; error: string | null }> {
  try {
    const supabase = getSupabaseBrowserClient();

    // Primero obtenemos el stock actual
    const { data: inventario, error: fetchError } = await (supabase as any)
      .from('inventario')
      .select('stock_actual')
      .eq('id', inventarioId)
      .single();

    if (fetchError) throw fetchError;

    const nuevoStock = (inventario?.stock_actual || 0) - cantidad;

    if (nuevoStock < 0) {
      throw new Error('Stock insuficiente para descontar');
    }

    const { error: updateError } = await (supabase as any)
      .from('inventario')
      .update({ stock_actual: nuevoStock, updated_at: new Date().toISOString() })
      .eq('id', inventarioId);

    if (updateError) throw updateError;

    return { success: true, nuevoStock, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Incrementar stock (devoluciones o ajustes)
 */
export async function incrementarStock(
  inventarioId: number,
  cantidad: number
): Promise<{ success: boolean; nuevoStock?: number; error: string | null }> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data: inventario, error: fetchError } = await (supabase as any)
      .from('inventario')
      .select('stock_actual')
      .eq('id', inventarioId)
      .single();

    if (fetchError) throw fetchError;

    const nuevoStock = (inventario?.stock_actual || 0) + cantidad;

    const { error: updateError } = await (supabase as any)
      .from('inventario')
      .update({ stock_actual: nuevoStock, updated_at: new Date().toISOString() })
      .eq('id', inventarioId);

    if (updateError) throw updateError;

    return { success: true, nuevoStock, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Verificar si el stock está bajo el mínimo
 */
export function stockBajoMinimo(stockActual: number, stockMinimo: number): boolean {
  return stockActual <= stockMinimo;
}

/**
 * Calcular margen de ganancia
 */
export function calcularMargen(costoUnitario: number, precioVenta: number): number {
  if (costoUnitario === 0) return 0;
  return ((precioVenta - costoUnitario) / costoUnitario) * 100;
}

/**
 * Calcular precio de venta desde costo y margen deseado
 */
export function calcularPrecioVenta(costoUnitario: number, margenPorcentaje: number): number {
  return costoUnitario + costoUnitario * (margenPorcentaje / 100);
}

/**
 * Obtener productos agotados
 */
export async function obtenerProductosAgotados(): Promise<{
  data: Inventario[] | null;
  error: string | null;
}> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from('inventario')
      .select('*')
      .eq('stock_actual', 0)
      .order('nombre', { ascending: true });

    if (error) throw error;

    return { data: (data as Inventario[]) || [], error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

/**
 * Obtener productos con stock bajo
 */
export async function obtenerProductosStockBajo(): Promise<{
  data: Inventario[] | null;
  error: string | null;
}> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from('inventario')
      .select('*')
      .lt('stock_actual', 'stock_minimo')
      .order('nombre', { ascending: true });

    if (error) throw error;

    return { data: (data as Inventario[]) || [], error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}
