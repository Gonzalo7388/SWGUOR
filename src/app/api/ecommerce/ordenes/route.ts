import { createClient } from '@/lib/supabase/server';
import { obtenerOrdenes, crearOrden, verificarStock, cambiarEstadoOrden } from '@/lib/helpers/orden-helpers';
import { NextResponse } from 'next/server';

// GET: Obtener órdenes con validaciones - SOLO ADMIN
export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    
    // Verificar que sea admin o autorizado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data, error } = await obtenerOrdenes({ estado: 'solicitado' as any });

    if (error) {
      console.error('Error obteniendo órdenes:', error);
      throw new Error(error);
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

// POST: Crear una nueva orden con validación de stock
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cliente_id, productos, metodo_pago, user_id } = body;

    // Validaciones básicas
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

    // 1. Verificar stock disponible ANTES de crear orden
    const { disponible, faltantes } = await verificarStock(
      productos.map((p: any) => ({
        producto_id: p.producto_id || p.id,
        cantidad: p.cantidad
      }))
    );

    if (!disponible) {
      return NextResponse.json(
        { 
          error: 'Stock insuficiente',
          faltantes 
        },
        { status: 400 }
      );
    }

    // 2. Preparar detalles
    const detalles = productos.map((item: any) => ({
      producto_id: item.producto_id || item.id,
      cantidad: item.cantidad,
      precio_unitario: item.precio,
      talla: item.talla || 'N/A',
      color: item.color || null
    }));

    // 3. Crear orden con helpers
    const { data, error } = await crearOrden(
      {
        cliente_id,
        user_id,
        metodo_pago: metodo_pago || null,
        estado: 'solicitado'
      },
      detalles
    );

    if (error) {
      console.error('Error creando orden:', error);
      throw new Error(error);
    }

    console.log('Orden creada exitosamente:', data?.id);
    return NextResponse.json(data, { status: 201 });

  } catch (error: any) {
    console.error('Error en POST /api/ordenes:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear la orden' },
      { status: 500 }
    );
  }
}

// PATCH: Actualizar el estado de una orden
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { orden_id, estado, metodo_pago } = body;

    if (!orden_id) {
      return NextResponse.json(
        { error: 'El orden_id es requerido' },
        { status: 400 }
      );
    }

    // Usar helper para cambiar estado
    const { success, error } = await cambiarEstadoOrden(orden_id, estado as any, { metodo_pago });

    if (error) {
      console.error('Error actualizando orden:', error);
      throw new Error(error);
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Error al actualizar estado' },
        { status: 400 }
      );
    }

    // Obtener orden actualizada
    const supabase = await createClient();
    const { data } = await (supabase as any)
      .from('ordenes')
      .select()
      .eq('id', orden_id)
      .single();

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

// DELETE: Eliminar una orden (solo si está en estado 'solicitado')
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
    const { data: orden, error: fetchError } = await (supabase as any)
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

    // Solo permitir eliminar órdenes solicitadas
    if (orden.estado !== 'solicitado') {
      return NextResponse.json(
        { error: `No se puede eliminar una orden en estado: ${orden.estado}` },
        { status: 400 }
      );
    }

    // Eliminar detalles y orden
    const { error: detallesError } = await (supabase as any)
      .from('detalles_orden')
      .delete()
      .eq('orden_id', orden_id);

    if (detallesError) {
      console.error('Error eliminando detalles:', detallesError);
      throw new Error(detallesError.message);
    }

    const { error: deleteError } = await (supabase as any)
      .from('ordenes')
      .delete()
      .eq('id', orden_id);

    if (deleteError) {
      console.error('Error eliminando orden:', deleteError);
      throw new Error(deleteError.message);
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