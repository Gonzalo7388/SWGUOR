export const runtime = 'nodejs';
import { NextResponse }      from 'next/server';
import { ProductosService }  from '@/lib/services/productos-services';
import { requireServerRole } from '@/lib/auth/server';
import type { RolUsuario }  from '@/lib/constants/roles';

const PRODUCTOS_ROLES: RolUsuario[] = ['administrador', 'gerente', 'disenador'];

// GET /api/admin/productos
export async function GET(req: Request) {
  const auth = await requireServerRole(PRODUCTOS_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const { searchParams } = new URL(req.url);
    const data = await ProductosService.listar({
      categoriaId: searchParams.get('categoria_id') ?? undefined,
      estado:      searchParams.get('estado')       ?? undefined,
      busqueda:    searchParams.get('busqueda')     ?? undefined,
      color:       searchParams.get('color')        ?? undefined,
      talla:       searchParams.get('talla')        ?? undefined,
    });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[GET /productos]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/productos
export async function POST(req: Request) {
  const auth = await requireServerRole(PRODUCTOS_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const producto = await ProductosService.crear(body);
    return NextResponse.json(producto, { status: 201 });
  } catch (error: any) {
    console.error('[POST /productos]', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un producto con ese SKU' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


// ── productos/[id]/route.ts ───────────────────────────────────────────────────
// GET /api/admin/productos/[id]
export async function GET_ID(id: string) {
  const auth = await requireServerRole(PRODUCTOS_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const producto = await ProductosService.obtenerPorId(id);
  if (!producto) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
  return NextResponse.json(producto);
}

// PATCH /api/admin/productos/[id]
export async function PATCH_ID(id: string, body: any) {
  const auth = await requireServerRole(PRODUCTOS_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (body.estado !== undefined && Object.keys(body).length === 1) {
    return NextResponse.json(await ProductosService.toggleEstado(id, body.estado));
  }
  return NextResponse.json(await ProductosService.actualizar(id, body));
}

// DELETE /api/admin/productos/[id]
export async function DELETE_ID(id: string) {
  const auth = await requireServerRole(PRODUCTOS_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  await ProductosService.eliminar(id);
  return NextResponse.json({ message: 'Producto eliminado correctamente' });
}