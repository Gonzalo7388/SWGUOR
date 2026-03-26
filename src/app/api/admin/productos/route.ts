import { createClient } from '@/lib/supabase/server';
import { 
  obtenerProductos as obtenerProductosHelper, 
  crearProducto, 
  actualizarProducto, 
  eliminarProducto, 
  calcularMargen 
} from '@/lib/helpers/productos-helpers';
import { NextResponse } from 'next/server';

// GET: Obtener todos los productos con filtros
export async function GET(req: Request) {
  try {
    const supabase = await createClient(); // Cliente de servidor
    const { searchParams } = new URL(req.url);
    
    const filtros = {
      categoria_id: searchParams.get('categoria_id') ? parseInt(searchParams.get('categoria_id')!) : undefined,
      estado: searchParams.get('estado') as any,
      busqueda: searchParams.get('busqueda') || undefined
    };

    const { data, error } = await obtenerProductosHelper(supabase, filtros);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error en GET productos:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Crear un nuevo producto
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    
    if (!body.nombre || !body.sku || !body.precio) {
      return NextResponse.json({ error: 'Faltan campos obligatorios: nombre, sku, precio' }, { status: 400 });
    }

    // Pasamos el cliente 'supabase' como primer argumento
    const { data, error } = await crearProducto(supabase, {
      nombre: body.nombre,
      sku: body.sku,
      descripcion: body.descripcion,
      precio: body.precio,
      stock: body.stock || 0,
      categoria_id: body.categoria_id,
      imagen: body.imagen_url || body.imagen,
      estado: 'activo',
      updated_at: new Date().toISOString()
    });

    if (error) throw error;

    let margen = body.costo_unitario ? calcularMargen(body.costo_unitario, body.precio) : null;

    return NextResponse.json({ ...data, margen }, { status: 201 });
  } catch (error: any) {
    console.error('Error en POST productos:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Actualizar producto (o stock rápido)
export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID no proporcionado' }, { status: 400 });

    const body = await req.json();

    // Pasamos el cliente 'supabase' como primer argumento
    const { data, error } = await actualizarProducto(supabase, parseInt(id), body);

    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error en PATCH productos:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar un producto
export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    // Pasamos el cliente 'supabase' como primer argumento
    const { error } = await eliminarProducto(supabase, parseInt(id));

    if (error) throw error;

    return NextResponse.json({ message: 'Producto eliminado correctamente' });
  } catch (error: any) {
    console.error('Error en DELETE productos:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}