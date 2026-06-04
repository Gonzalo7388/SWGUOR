export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { requireServerRole } from '@/lib/auth/server';
import type { RolUsuario } from '@/lib/constants/roles';
import { MaterialesService } from '@/lib/services/material.service';
import { auditoriaService } from '@/lib/services/auditoria.service';

const MATERIALES_ROLES: RolUsuario[] = [
  'administrador',
  'gerente',
  'almacenero',
  'disenador',
  'cortador',
];

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const auth = await requireServerRole(MATERIALES_ROLES);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    if (!/^\d+$/.test(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const material = await MaterialesService.obtenerDetalleCompras(id);
    if (!material) {
      return NextResponse.json({ error: 'Material no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: material });
  } catch (error) {
    console.error('[GET /materiales/:id]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request, { params }: Params) {
  const auth = await requireServerRole(['administrador', 'gerente', 'almacenero', 'disenador', 'cortador']);
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    if (!/^\d+$/.test(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await req.json() as Record<string, unknown>;
    const material = await MaterialesService.actualizar(id, {
      nombre: typeof body.nombre === 'string' ? body.nombre : undefined,
      tipo: typeof body.tipo === 'string' ? body.tipo : undefined,
      descripcion: body.descripcion === null ? undefined : typeof body.descripcion === 'string' ? body.descripcion : undefined,
      composicion: body.composicion === null ? undefined : typeof body.composicion === 'string' ? body.composicion : undefined,
      gramaje: typeof body.gramaje === 'number' ? body.gramaje : undefined,
      ancho_total: typeof body.ancho_total === 'number' ? body.ancho_total : undefined,
      ancho_util: typeof body.ancho_util === 'number' ? body.ancho_util : undefined,
      color: body.color === null ? undefined : typeof body.color === 'string' ? body.color : undefined,
      codigo_color: body.codigo_color === null ? undefined : typeof body.codigo_color === 'string' ? body.codigo_color : undefined,
      unidad_medida: typeof body.unidad_medida === 'string' ? body.unidad_medida : undefined,
      stock_minimo: typeof body.stock_minimo === 'number' ? body.stock_minimo : undefined,
      precio_unitario: body.precio_unitario === null ? undefined : typeof body.precio_unitario === 'number' ? body.precio_unitario : undefined,
      proveedor_id: body.proveedor_id === null ? undefined : typeof body.proveedor_id === 'string' ? body.proveedor_id : undefined,
      ubicacion_almacen: body.ubicacion_almacen === null ? undefined : typeof body.ubicacion_almacen === 'string' ? body.ubicacion_almacen : undefined,
      alerta_bajo_stock: typeof body.alerta_bajo_stock === 'boolean' ? body.alerta_bajo_stock : undefined,
    });

    await auditoriaService.registrar({
      usuario_id: BigInt(auth.user.id),
      accion: 'editar',
      tabla: 'materiales',
      registro_id: BigInt(id),
      datos_despues: material,
    });

    return NextResponse.json({ success: true, data: material });
  } catch (error) {
    console.error('[PATCH /materiales/:id]', error);
    const msg = error instanceof Error ? error.message : 'Error interno';
    if (msg.includes('Record to update not found') || (error as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Material no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
