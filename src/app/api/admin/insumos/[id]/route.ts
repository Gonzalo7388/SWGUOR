export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { requireServerRole } from '@/lib/auth/server';
import type { RolUsuario } from '@/lib/constants/roles';
import { InsumosService } from '@/lib/services/insumos.service';
import { InventarioService } from '@/lib/services/inventario.service';
import { auditoriaService } from '@/lib/services/auditoria.service';
import type { CategoriaInsumo, TipoInsumo, UnidadMedida } from '@prisma/client';

const INSUMOS_ROLES: RolUsuario[] = ['administrador', 'gerente', 'almacenero'];

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const auth = await requireServerRole(INSUMOS_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    if (!/^\d+$/.test(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const insumo = await InsumosService.obtenerDetalle(id);
    if (!insumo) {
      return NextResponse.json({ error: 'Insumo no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: insumo });
  } catch (error) {
    console.error('[GET /insumos/:id]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request, { params }: Params) {
  const auth = await requireServerRole(INSUMOS_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    if (!/^\d+$/.test(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await req.json() as Record<string, unknown>;
    const insumo = await InventarioService.actualizar(id, {
      nombre: typeof body.nombre === 'string' ? body.nombre : undefined,
      tipo: body.tipo as TipoInsumo | undefined,
      categoria_insumo: body.categoria_insumo as CategoriaInsumo | undefined,
      unidad_medida: body.unidad_medida as UnidadMedida | undefined,
      stock_minimo: typeof body.stock_minimo === 'number' ? body.stock_minimo : undefined,
      stock_maximo: body.stock_maximo === null ? null : typeof body.stock_maximo === 'number' ? body.stock_maximo : undefined,
      precio_unitario: body.precio_unitario === null ? null : typeof body.precio_unitario === 'number' ? body.precio_unitario : undefined,
      proveedor_id: body.proveedor_id === null ? undefined : typeof body.proveedor_id === 'string' ? body.proveedor_id : undefined,
      ubicacion_almacen: body.ubicacion_almacen === null ? undefined : typeof body.ubicacion_almacen === 'string' ? body.ubicacion_almacen : undefined,
      alerta_bajo_stock: typeof body.alerta_bajo_stock === 'boolean' ? body.alerta_bajo_stock : undefined,
    });

    await auditoriaService.registrar({
      usuario_id: BigInt(auth.user.id),
      accion: 'editar',
      tabla: 'insumo',
      registro_id: BigInt(id),
      datos_despues: insumo,
    });

    return NextResponse.json({ success: true, data: insumo });
  } catch (error) {
    console.error('[PATCH /insumos/:id]', error);
    const msg = error instanceof Error ? error.message : 'Error interno';
    if (msg.includes('no encontrado')) {
      return NextResponse.json({ error: 'Insumo no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
