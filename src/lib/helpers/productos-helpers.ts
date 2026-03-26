import { createClient } from '@/lib/supabase/server';
import type { ProductoPortal, Insumo, InsumoInsert } from '@/types';

/**
 * PRODUCTOS DEL PORTAL (Venta B2B)
 */
export const obtenerProductosPortal = async (): Promise<ProductoPortal[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('productos')
    .select(`
      id,
      nombre,
      sku,
      precio_base,
      stock_actual,
      categorias (nombre)
    `)
    .eq('activo', true);

  if (error) {
    console.error('Error al obtener productos:', error);
    return [];
  }

  // Mapeo para que coincida con tu interfaz ProductoPortal
  return data.map((p: any) => ({
    id: p.id.toString(),
    nombre: p.nombre,
    sku: p.sku,
    precioBase: p.precio_base,
    stockActual: p.stock_actual,
    categoria: p.categorias?.nombre || 'General'
  }));
};

/**
 * INSUMOS (Materia Prima / Taller)
 */
export const obtenerInsumos = async (): Promise<Insumo[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('insumos')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) throw new Error(error.message);
  return data as Insumo[];
};

export const crearInsumo = async (insumo: InsumoInsert) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('insumos')
    .insert([insumo])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * UTILITARIOS DE INVENTARIO
 */
export const actualizarStockFisico = async (id: number, cantidad: number, operacion: 'sumar' | 'restar') => {
  const supabase = await createClient();
  
  // Primero obtenemos el stock actual
  const { data: insumo } = await supabase
    .from('insumos')
    .select('stock_actual')
    .eq('id', id)
    .single();

  if (!insumo) return null;

  const nuevoStock = operacion === 'sumar' 
    ? insumo.stock_actual + cantidad 
    : insumo.stock_actual - cantidad;

  const { data, error } = await supabase
    .from('insumos')
    .update({ stock_actual: nuevoStock })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};