export const runtime = 'nodejs';

import { NextResponse }       from 'next/server';
import { InventarioService }  from '@/lib/services/inventario-services';

// GET /api/admin/inventario
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const insumos = await InventarioService.listar({
      categoria_insumo: searchParams.get('categoria_insumo') ?? undefined,
      tipo:             searchParams.get('tipo')             ?? undefined,
      busqueda:         searchParams.get('busqueda')         ?? undefined,
      bajo_stock:       searchParams.get('bajo_stock') === 'true',
      sort:             (searchParams.get('sort') as 'asc' | 'desc') ?? undefined,
    });

    return NextResponse.json({
      insumos,
      proveedores: [],
    });
  } catch (error: any) {
    console.error('[GET /inventario]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/inventario
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.nombre) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }
    if (!body.tipo) {
      return NextResponse.json({ error: 'El tipo es obligatorio' }, { status: 400 });
    }

    const insumo = await InventarioService.crear(body);
    return NextResponse.json(insumo, { status: 201 });
  } catch (error: any) {
    console.error('[POST /inventario]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/inventario?id=xxx
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    await InventarioService.eliminar(id);
    return NextResponse.json({ message: 'Insumo eliminado correctamente' });
  } catch (error: any) {
    console.error('[DELETE /inventario]', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Insumo no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}