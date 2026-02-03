import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET: Obtener la lista de producción (Lo que el taller debe fabricar)
export async function GET() {
  const supabase = await createClient();
  
  try {
    // CAMBIO CLAVE: Consultamos 'ordenes' directamente para la cabecera del pedido
    const { data, error } = await supabase
      .from('ordenes')
      .select(`
        id,
        estado,
        total,
        created_at,
        metodo_pago,
        clientes (
          razon_social,
          ruc
        ),
        detalles:detalles_orden (
          id,
          cantidad,
          talla,
          color,
          productos (nombre)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Retornamos los pedidos. Cada pedido ahora contiene su lista de productos dentro.
    return NextResponse.json(data || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
  
// POST: Asignar una tarea de producción a un miembro del taller
export async function POST(req: Request) {
  const supabase = await createClient();
  
  try {
    const body = await req.json();
    const { detalle_orden_id, asignado_a, tarea_tipo } = body; 
    // tarea_tipo podría ser: 'corte', 'confección', 'acabado'

    const { data, error } = await supabase
      .from('confecciones') // Usamos tu tabla de confecciones vista en el panel
      .insert([{
        detalle_id: detalle_orden_id,
        usuario_asignado_id: asignado_a,
        tipo: tarea_tipo,
        estado: 'pendiente',
        fecha_inicio: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}