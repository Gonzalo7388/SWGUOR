import { obtenerProductos as obtenerProductosHelper, crearProducto, actualizarProducto, eliminarProducto, calcularMargen } from '@/lib/helpers/products-helpers';
import { NextResponse } from 'next/server';

// GET: Obtener todos los productos con filtros
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    const filtros = {
      categoria_id: searchParams.get('categoria_id') ? parseInt(searchParams.get('categoria_id')!) : undefined,
      estado: searchParams.get('estado') as any,
      busqueda: searchParams.get('busqueda') || undefined
    };

    const { data, error } = await obtenerProductosHelper(filtros);

    if (error) {
      console.error('Error fetching productos:', error);
      throw new Error(error);
    }

    console.log(`Successfully fetched ${data?.length || 0} productos`);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Failed to fetch productos:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Crear un nuevo producto
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validación básica de campos obligatorios
    if (!body.nombre || !body.sku || !body.precio) {
      return NextResponse.json({ error: 'Faltan campos obligatorios: nombre, sku, precio' }, { status: 400 });
    }

    const { data, error } = await crearProducto({
      nombre: body.nombre,
      sku: body.sku,
      descripcion: body.descripcion,
      precio: body.precio,
      stock: body.stock || 0,
      stock_minimo: body.stock_minimo || 5,
      categoria_id: body.categoria_id,
      imagen: body.imagen_url || body.imagen,
      estado: 'activo'
    });

    if (error) throw new Error(error);

    // Calcular margen si se proporciona costo
    let margen = null;
    if (body.costo_unitario) {
      margen = calcularMargen(body.costo_unitario, body.precio);
    }

    console.log('Successfully created producto:', body.sku);
    return NextResponse.json({ ...data, margen }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create producto:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH/PUT: Para actualizaciones rápidas (como el stock)
export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID no proporcionado' }, { status: 400 });

    const body = await req.json();

    const { data, error } = await actualizarProducto(parseInt(id), body);

    if (error) throw new Error(error);
    
    console.log('Successfully updated producto:', id);
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Failed to update producto:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar un producto por ID
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    const { error } = await eliminarProducto(parseInt(id));

    if (error) throw new Error(error);

    console.log('Successfully deleted producto:', id);
    return NextResponse.json({ message: 'Eliminado correctamente' });
  } catch (error: any) {
    console.error('Failed to delete producto:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}