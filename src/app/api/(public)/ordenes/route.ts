import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Tipo para la orden con relaciones
type OrdenConRelaciones = {
  id: string;
  cliente_id: number;
  total: number;
  estado: string;
  metodo_pago: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  clientes: {
    razon_social: string | null;
    ruc: number;
  } | null;
};

// GET: Obtener todas las órdenes con información del cliente
export async function GET() {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from('ordenes')
      .select(`
        *,
        clientes (
          razon_social,
          ruc,
          email,
          telefono
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error obteniendo órdenes:', error);
      throw error;
    }

    return NextResponse.json(data || [], { status: 200 });
  } catch (error: any) {
    console.error('Error en GET /api/ordenes:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Error al obtener las órdenes',
        details: error.details || null 
      }, 
      { status: 500 }
    );
  }
}

// POST: Crear una nueva orden con sus detalles
export async function POST(req: Request) {
  const supabase = await createClient();
  
  try {
    // 1. Validar y parsear el body
    const body = await req.json();
    const { cliente_id, productos, metodo_pago, user_id } = body;

    // 2. Validaciones básicas
    if (!cliente_id) {
      return NextResponse.json(
        { error: 'El cliente_id es requerido' },
        { status: 400 }
      );
    }

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return NextResponse.json(
        { error: 'Debe incluir al menos un producto' },
        { status: 400 }
      );
    }

    if (!user_id) {
      return NextResponse.json(
        { error: 'El user_id es requerido' },
        { status: 400 }
      );
    }

    // 3. Calcular totales
    let subtotal = 0;
    for (const item of productos) {
      if (!item.precio || !item.cantidad) {
        return NextResponse.json(
          { error: 'Cada producto debe tener precio y cantidad' },
          { status: 400 }
        );
      }
      subtotal += item.precio * item.cantidad;
    }

    const impuestos = subtotal * 0.18; // IGV 18% para Perú
    const total = subtotal + impuestos;

    // 4. Insertar la orden
    const { data: orden, error: ordenError } = await supabase
      .from('ordenes')
      .insert({
        cliente_id,
        user_id,
        metodo_pago: metodo_pago || null,
        total,
        estado: 'solicitado', // Estado inicial según tu ENUM
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (ordenError) {
      console.error('Error creando orden:', ordenError);
      throw new Error(`Error al crear la orden: ${ordenError.message}`);
    }

    if (!orden) {
      throw new Error('No se pudo crear la orden');
    }

    console.log('Orden creada:', orden.id);

    // 5. Insertar los detalles de la orden
    const detallesParaInsertar = productos.map((item: any) => ({
      orden_id: orden.id,
      producto_id: item.producto_id || item.id,
      cantidad: item.cantidad,
      precio_unitario: item.precio,
      subtotal: item.precio * item.cantidad,
      talla: item.talla || 'N/A',
      color: item.color || null
    }));

    const { error: detallesError } = await supabase
      .from('detalles_orden')
      .insert(detallesParaInsertar);

    if (detallesError) {
      console.error('Error insertando detalles:', detallesError);
      
      // Rollback: eliminar la orden si falla la inserción de detalles
      await supabase
        .from('ordenes')
        .delete()
        .eq('id', orden.id);

      throw new Error(`Error al crear detalles de la orden: ${detallesError.message}`);
    }

    console.log(` ${detallesParaInsertar.length} detalles insertados`);

    // 6. Obtener la orden completa con detalles para retornar
    const { data: ordenCompleta, error: fetchError } = await supabase
      .from('ordenes')
      .select(`
        *,
        clientes (
          razon_social,
          ruc,
          email,
          telefono
        ),
        detalles_orden (
          *,
          productos (
            nombre,
            sku
          )
        )
      `)
      .eq('id', orden.id)
      .single();

    if (fetchError) {
      console.warn('Orden creada pero error al obtener datos completos:', fetchError);
      // No es crítico, retornamos la orden básica
      return NextResponse.json(orden, { status: 201 });
    }

    return NextResponse.json(ordenCompleta, { status: 201 });

  } catch (error: any) {
    console.error('Error en POST /api/ordenes:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Error al crear la orden',
        details: error.details || null
      }, 
      { status: 500 }
    );
  }
}

// PATCH: Actualizar el estado de una orden
export async function PATCH(req: Request) {
  const supabase = await createClient();

  try {
    const body = await req.json();
    const { orden_id, estado, metodo_pago } = body;

    if (!orden_id) {
      return NextResponse.json(
        { error: 'El orden_id es requerido' },
        { status: 400 }
      );
    }

    // Preparar datos a actualizar
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (estado) updateData.estado = estado;
    if (metodo_pago !== undefined) updateData.metodo_pago = metodo_pago;

    const { data, error } = await supabase
      .from('ordenes')
      .update(updateData)
      .eq('id', orden_id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando orden:', error);
      throw error;
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error('Error en PATCH /api/ordenes:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Error al actualizar la orden',
        details: error.details || null
      }, 
      { status: 500 }
    );
  }
}

// DELETE: Eliminar una orden (solo si está en estado 'solicitado' o 'cancelado')
export async function DELETE(req: Request) {
  const supabase = await createClient();

  try {
    const { searchParams } = new URL(req.url);
    const orden_id = searchParams.get('orden_id');

    if (!orden_id) {
      return NextResponse.json(
        { error: 'El orden_id es requerido' },
        { status: 400 }
      );
    }

    // Verificar estado de la orden
    const { data: orden, error: fetchError } = await supabase
      .from('ordenes')
      .select('estado')
      .eq('id', orden_id)
      .single();

    if (fetchError || !orden) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    // Solo permitir eliminar órdenes en ciertos estados
    const estadosEliminables = ['solicitado', 'cancelado'];
    if (!estadosEliminables.includes(orden.estado)) {
      return NextResponse.json(
        { error: `No se puede eliminar una orden en estado: ${orden.estado}` },
        { status: 400 }
      );
    }

    // Eliminar detalles primero (por foreign key)
    const { error: detallesError } = await supabase
      .from('detalles_orden')
      .delete()
      .eq('orden_id', orden_id);

    if (detallesError) {
      console.error('Error eliminando detalles:', detallesError);
      throw detallesError;
    }

    // Eliminar la orden
    const { error: deleteError } = await supabase
      .from('ordenes')
      .delete()
      .eq('id', orden_id);

    if (deleteError) {
      console.error('Error eliminando orden:', deleteError);
      throw deleteError;
    }

    return NextResponse.json(
      { message: 'Orden eliminada correctamente' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error en DELETE /api/ordenes:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Error al eliminar la orden',
        details: error.details || null
      }, 
      { status: 500 }
    );
  }
}