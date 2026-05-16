export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { ProductosService } from '@/lib/services/productos.service';
import { requireServerRole } from '@/lib/auth/server';
import type { RolUsuario } from '@/lib/constants/roles';

import { auditoriaService } from '@/lib/services/auditoria.service';

const PRODUCTOS_ROLES: RolUsuario[] = ['administrador', 'gerente', 'disenador'];

export async function GET(req: Request) {
  const auth = await requireServerRole(PRODUCTOS_ROLES);
  if (!auth.success) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { searchParams } = new URL(req.url);
    const data = await ProductosService.listar({
      categoriaId: searchParams.get('categoria_id') ?? undefined,
      estado: searchParams.get('estado') ?? undefined,
      busqueda: searchParams.get('busqueda') ?? undefined,
      color: searchParams.get('color') ?? undefined,
      talla: searchParams.get('talla') ?? undefined,
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireServerRole(PRODUCTOS_ROLES);
  if (!auth.success) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await req.json();
    const producto = await ProductosService.crear(body);
    if (!producto) {
      return NextResponse.json({ error: 'Error al crear el producto' }, { status: 500 });
    }

    await auditoriaService.registrar({
      usuario_id: BigInt(auth.user.id),
      accion: 'CREAR',
      tabla: 'productos',
      registro_id: BigInt(producto.id),
      datos_despues: producto,
    });

    return NextResponse.json(producto, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un producto con ese SKU' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}