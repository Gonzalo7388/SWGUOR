import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

type Orden = Database['public']['Tables']['ordenes']['Row'];
type OrdenInsert = Database['public']['Tables']['ordenes']['Insert'];
type EstadoOrden = Database['public']['Enums']['EstadoOrden'];
type MetodoPago = Database['public']['Enums']['MetodoPago'];

/**
 * Obtiene órdenes con filtros opcionales y relación con clientes
 */
export const obtenerOrdenes = async (filtros?: { estado?: EstadoOrden }) : Promise<{ data: Orden[] | null, error: string | null }> => {
  const supabase = createClient();
  let query = supabase
    .from('ordenes')
    .select('*, clientes(razon_social, ruc)');

  if (filtros?.estado) {
    query = query.eq('estado', filtros.estado);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  
  return { 
    data: data as any[], 
    error: error ? error.message : null 
  };
};

/**
 * Crea una orden y sus detalles
 * Se eliminan subtotal e impuestos del Omit para que puedan ser calculados
 */
export const crearOrden = async (
  ordenData: Omit<OrdenInsert, 'total_orden' | 'subtotal' | 'impuestos'>, 
  detalles: any[]
) => {
  const supabase = createClient();
  
  // Lógica de cálculo básica para evitar que el total sea 0
  const subtotal = detalles.reduce((acc, item) => acc + (item.precio_unitario * item.cantidad), 0);
  const impuestos = subtotal * 0.18;
  const total = subtotal + impuestos;

  const { data, error } = await supabase
    .from('ordenes')
    .insert([{ 
      ...ordenData, 
      subtotal,
      impuestos,
      total_orden: total 
    }]) 
    .select()
    .single();

  return { data, error: error ? error.message : null };
};

/**
 * Cambia el estado y actualiza datos de pago
 * Se maneja el ID como string para evitar problemas de precisión con BigInt en JS
 */
export const cambiarEstadoOrden = async (
  ordenId: string | number,
  nuevoEstado: EstadoOrden,
  dataExtra?: { metodo_pago?: MetodoPago; payment_id?: string }
) => {
  const supabase = createClient();
  
  // Mantenemos la conversión a número para el BigInt de la DB
  const idBusqueda = typeof ordenId === 'string' ? parseInt(ordenId, 10) : ordenId;

  const { error } = await supabase
    .from('ordenes')
    .update({ 
      estado: nuevoEstado,
      ...dataExtra 
    })
    .eq('id', idBusqueda);

  return { success: !error, error: error?.message || null };
};

/**
 * Verifica stock disponible para una lista de productos
 * Corregido para UUIDs (Strings) según schema.prisma
 */
export const verificarStock = async (items: Array<{ producto_id: string; cantidad: number }>) => {
  const supabase = createClient();
  
  const ids: string[] = items.map(i => i.producto_id);

  // Usamos 'as any' en el filtro .in para saltar la validación si el 
  // archivo database.types.ts no se ha actualizado tras la migración a UUID
  const { data: productos, error } = await supabase
    .from('productos')
    .select('id, stock, nombre')
    .in('id', ids as any); 

  if (error) return { disponible: false, error: error.message };

  const faltantes = items.filter(item => {
    const prod = productos?.find(p => String(p.id) === String(item.producto_id));
    // Validamos contra stock nulo o insuficiente
    return !prod || (prod.stock ?? 0) < item.cantidad;
  });

  return {
    disponible: faltantes.length === 0,
    faltantes
  };
};