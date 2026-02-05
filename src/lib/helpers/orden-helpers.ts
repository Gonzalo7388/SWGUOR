import { getSupabaseBrowserClient } from '@/lib/supabase';
import type {
  Orden,
  OrdenInsert,
  OrdenCompleta,
  EstadoOrden,
  MetodoPago,
  FiltrosOrden,
  VerificacionStock
} from '@/types/database';

const supabase = getSupabaseBrowserClient();

/**
 * Obtener todas las órdenes con filtros
 */
export async function obtenerOrdenes(
  filtros?: FiltrosOrden
): Promise<{ data: OrdenCompleta[] | null; error: string | null }> {
  try {
    const supabase = getSupabaseBrowserClient();

    let query = supabase
      .from('ordenes')
      .select(`
        *,
        clientes (
          id,
          razon_social,
          ruc,
          email,
          telefono
        )
      `)
      .order('created_at', { ascending: false });

    if (filtros?.estado) query = query.eq('estado', filtros.estado);
    if (filtros?.cliente_id) query = query.eq('cliente_id', filtros.cliente_id);
    if (filtros?.user_id) query = query.eq('user_id', filtros.user_id);
    if (filtros?.metodo_pago) query = query.eq('metodo_pago', filtros.metodo_pago);
    if (filtros?.fecha_desde) query = query.gte('created_at', filtros.fecha_desde);
    if (filtros?.fecha_hasta) query = query.lte('created_at', filtros.fecha_hasta);

    const { data, error } = await query;
    if (error) throw error;

    return { data: data as OrdenCompleta[], error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

/**
 * Crear una nueva orden con detalles
 */
export async function crearOrden(
  ordenData: Omit<OrdenInsert, 'subtotal' | 'impuestos' | 'total'>,
  detalles: any[] // Usamos any temporalmente para los items del carrito
): Promise<{ data: Orden | null; error: string | null }> {
  try {
    if (!ordenData.user_id) throw new Error('El user_id es requerido');
    if (!detalles.length) throw new Error('Debe incluir al menos un producto');

    const { subtotal, impuestos, total } = calcularTotales(detalles);

    // 1. Insertar Orden
    // Forzamos el tipo con 'as any' en el insert si el autogenerado falla
    const { data: nuevaOrden, error: ordenError } = await supabase
      .from('ordenes')
      .insert({
        ...ordenData,
        total, // Tu tabla ordenes usa 'total', ajusta si usas subtotal/impuestos
        estado: ordenData.estado || 'solicitado',
      } as any) 
      .select()
      .single();

    if (ordenError) throw ordenError;
    const ordenGenerada = nuevaOrden as Orden;

    // 2. Insertar Detalles
    const detallesConId = detalles.map(d => ({
      orden_id: ordenGenerada.id,
      producto_id: d.producto_id,
      cantidad: d.cantidad,
      precio_unitario: d.precio_unitario,
      subtotal: d.cantidad * d.precio_unitario,
      talla: d.talla || 'M'
    }));

    const { error: detallesError } = await supabase
      .from('detalles_orden')
      .insert(detallesConId as any);

    if (detallesError) {
      await supabase.from('ordenes').delete().eq('id', ordenGenerada.id);
      throw detallesError;
    }

    return { data: ordenGenerada, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

/**
 * Cambiar estado de una orden (Especial para flujo de caja y producción)
 */
export async function cambiarEstadoOrden(
  ordenId: string, // Cambiado a string por tu DB
  nuevoEstado: EstadoOrden,
  dataExtra?: { metodo_pago?: MetodoPago; payment_id?: string }
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = getSupabaseBrowserClient();

    const updates = {
      estado: nuevoEstado,
      updated_at: new Date().toISOString(),
      ...(nuevoEstado === 'pagado' && dataExtra?.metodo_pago && { metodo_pago: dataExtra.metodo_pago }),
      ...(nuevoEstado === 'pagado' && dataExtra?.payment_id && { payment_id: dataExtra.payment_id })
    };

    const { error } = await (supabase as any)
      .from('ordenes')
      .update(updates)
      .eq('id', ordenId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Verificar stock disponible en la tabla Inventario
 */
export async function verificarStock(
  items: Array<{ producto_id: number; cantidad: number }>
): Promise<VerificacionStock> {
  const supabase = getSupabaseBrowserClient();
  const faltantes: VerificacionStock['faltantes'] = [];

  for (const item of items) {
    // Buscamos en 'inventario' porque ahí está el stock físico real
    const { data: inv, error } = await supabase
      .from('inventario')
      .select('producto_id, nombre, stock_actual')
      .eq('producto_id', item.producto_id)
      .single();

    // Validamos que exista el registro y comparamos stock_actual
    if (inv) {
      const stockDisponible = (inv as any).stock_actual || 0;
      
      if (stockDisponible < item.cantidad) {
        faltantes.push({
          producto_id: item.producto_id,
          nombre: (inv as any).nombre || 'Producto',
          requerido: item.cantidad,
          disponible: stockDisponible,
          faltante: item.cantidad - stockDisponible
        });
      }
    } else {
      // Si no hay registro en inventario, asumimos que no hay stock
      faltantes.push({
        producto_id: item.producto_id,
        nombre: 'No registrado en inventario',
        requerido: item.cantidad,
        disponible: 0,
        faltante: item.cantidad
      });
    }
  }

  return { disponible: faltantes.length === 0, faltantes };
}

export function calcularTotales(detalles: any[]) {
  const subtotal = detalles.reduce((sum, d) => sum + (d.precio_unitario * d.cantidad), 0);
  const impuestos = subtotal * 0.18;
  return {
    subtotal: Number(subtotal.toFixed(2)),
    impuestos: Number(impuestos.toFixed(2)),
    total: Number((subtotal + impuestos).toFixed(2))
  };
}