import type { Database } from '@/types/database';

type Insumo = Database['public']['Tables']['insumo']['Row'];
type InsumoInsert = Database['public']['Tables']['insumo']['Insert'];
type ProductoPortal = Database['public']['Tables']['productos']['Row'];

/**
 * PRODUCTOS (Panel Administrativo & API)
 */
// Cambiamos id: number por id: string para soportar UUID
export async function obtenerProductos(supabase: any, filtros?: any) {
  let query = supabase
    .from('productos')
    .select(`
      *,
      categorias (nombre)
    `);

  if (filtros?.categoria_id) query = query.eq('categoria_id', filtros.categoria_id);
  if (filtros?.estado) query = query.eq('estado', filtros.estado);
  if (filtros?.busqueda) query = query.ilike('nombre', `%${filtros.busqueda}%`);

  return await query.order('created_at', { ascending: false });
}

export async function crearProducto(supabase: any, datos: any) {
  return await supabase
    .from('productos')
    .insert([datos])
    .select()
    .single();
}

export async function actualizarProducto(supabase: any, id: string, datos: any) {
  return await supabase
    .from('productos')
    .update(datos)
    .eq('id', id)
    .select()
    .single();
}

export async function eliminarProducto(supabase: any, id: string) {
  return await supabase
    .from('productos')
    .delete()
    .eq('id', id);
}

/**
 * PRODUCTOS DEL PORTAL (Venta B2B)
 */
export const obtenerProductosPortal = async (supabase: any): Promise<any[]> => {
  const { data, error } = await supabase
    .from('productos')
    .select(`
      id,
      nombre,
      sku,
      precio,
      stock,
      categorias (nombre)
    `)
    .eq('estado', 'activo'); // Ajustado según tu enum EstadoProducto

  if (error) {
    console.error('Error al obtener productos portal:', error);
    return [];
  }

  return data.map((p: any) => ({
    id: p.id,
    nombre: p.nombre,
    sku: p.sku,
    precioBase: p.precio,
    stockActual: p.stock,
    categoria: p.categorias?.nombre || 'General'
  }));
};

/**
 * INSUMOS (Materia Prima / Taller)
 * Corregido nombre de tabla a 'insumo' (singular) según tu SQL
 */
export const obtenerInsumos = async (supabase: any): Promise<Insumo[]> => {
  const { data, error } = await supabase
    .from('insumo') 
    .select('*')
    .order('nombre', { ascending: true });

  if (error) throw new Error(error.message);
  return data as Insumo[];
};

export const crearInsumo = async (supabase: any, insumo: InsumoInsert) => {
  const { data, error } = await supabase
    .from('insumo')
    .insert([insumo])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * ACTUALIZAR STOCK
 * Se cambia id a string para resolver el error 2345
 */
export const actualizarStockInsumo = async (supabase: any, id: string, nuevoStock: number) => {
  try {
    const { error } = await supabase
      .from('insumo')
      .update({ stock_actual: nuevoStock })
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * UTILITARIOS
 */
export const actualizarStockFisico = async (supabase: any, id: string, cantidad: number, operacion: 'sumar' | 'restar') => {
  const { data: insumo } = await supabase
    .from('insumo')
    .select('stock_actual')
    .eq('id', id)
    .single();

  if (!insumo) return null;

  const nuevoStock = operacion === 'sumar' 
    ? insumo.stock_actual + cantidad 
    : insumo.stock_actual - cantidad;

  const { data, error } = await supabase
    .from('insumo')
    .update({ stock_actual: nuevoStock })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export function calcularMargen(costo: number, precio: number) {
  if (!costo || !precio) return 0;
  return ((precio - costo) / precio) * 100;
}