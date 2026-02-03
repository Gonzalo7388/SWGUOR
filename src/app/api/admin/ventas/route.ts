import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET: Obtener todas las ventas con sus relaciones (Orden y Cliente)
export async function GET() {
  
  const supabase = await createClient();

  try {
      const { data, error } = await supabase
        .from('ventas')
        .select(`
          *,
          ordenes (
            estado,
            metodo_pago,
            clientes (
              razon_social,
              ruc,
              email,
              telefono
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error SQL:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data || []);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

// POST: Registrar una venta manualmente (aunque usualmente lo hace el trigger)
export async function POST(req: Request) {
  const supabase = await createClient();
  try {
    const body = await req.json();

    // Validaciones básicas
    if (!body.orden_id || !body.total) {
      return NextResponse.json(
        { error: 'orden_id y total son requeridos' }, 
        { status: 400 }
      );
    }

    // Normalizar tipos de comprobante
    const tipoNormalizado = body.tipo_comprobante 
      ? body.tipo_comprobante.toLowerCase().trim() 
      : 'nota_venta';

    const tiposValidos = ['boleta', 'factura', 'nota_venta'];
    if (!tiposValidos.includes(tipoNormalizado)) {
      return NextResponse.json(
        { error: `Tipo de comprobante inválido. Use: ${tiposValidos.join(', ')}` }, 
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('ventas')
      .insert([{
        orden_id: body.orden_id,
        vendedor_id: body.vendedor_id || null,
        subtotal: body.subtotal || body.total,
        impuestos: body.impuestos || 0,
        total: body.total,
        metodo_pago: body.metodo_pago,
        tipo_comprobante: tipoNormalizado,
        numero_comprobante: body.numero_comprobante?.trim() || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creando venta:', error);
      if (error.code === '23503') { // Foreign key violation
        return NextResponse.json({ error: 'La orden especificada no existe' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error en POST /api/admin/ventas:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Actualizar información de la venta (ej. número de comprobante)
export async function PATCH(req: Request) {
  const supabase = await createClient();
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: 'ID de venta requerido' }, { status: 400 });

    // Limpiar datos
    if (updates.numero_comprobante) updates.numero_comprobante = updates.numero_comprobante.trim();
    
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('ventas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 });
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error en PATCH /api/admin/ventas:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Anular registro de venta (Uso administrativo restringido)
export async function DELETE(req: Request) {
  const supabase = await createClient();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    const { error } = await supabase.from('ventas').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Registro de caja eliminado correctamente' });
  } catch (error: any) {
    console.error('Error en DELETE /api/admin/ventas:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}