export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { InventarioService } from '@/lib/services/inventario.service';
import { requireServerRole } from '@/lib/auth/server';
import { auditoriaService } from '@/lib/services/auditoria.service';
import {
  obtenerItemsConStockBajo,
  obtenerStockProducto,
  obtenerStockInsumo,
  obtenerStockMaterial,
  registrarMovimiento,
  listarMovimientos,
} from '@/lib/services';
import type { TipoInsumo, Rol } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// ── Constantes ────────────────────────────────────────────────────────────────

const INVENTARIO_ROLES: Rol[] = ['administrador', 'gerente', 'almacenero'];

const TIPOS_VALIDOS = new Set<TipoInsumo>([
  'materia_prima', 'avio', 'empaque', 'suministro',
]);

// ── Helpers ───────────────────────────────────────────────────────────────────

function toNum(val: string | null): number | undefined {
  if (!val || isNaN(Number(val))) return undefined;
  return Number(val);
}

function isPrismaNotFound(err: unknown): boolean {
  return (
    typeof err === 'object' && err !== null &&
    'code' in err && (err as { code: string }).code === 'P2025'
  );
}

// Valida que el categoria_id exista en la tabla categoria_insumo
async function validarCategoriaId(id: number): Promise<boolean> {
  const cat = await prisma.categoria_insumo.findUnique({ where: { id } });
  return cat !== null;
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const auth = await requireServerRole(INVENTARIO_ROLES);
  if (!auth.success)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { searchParams } = new URL(req.url);
    const resource = searchParams.get('resource') ?? 'insumos';

    // ── Stock ──────────────────────────────────────────────────────────────
    if (resource === 'stock') {
      const action = searchParams.get('action');

      if (action === 'bajo-stock') {
        const almacenId = toNum(searchParams.get('almacenId'));
        const items = await obtenerItemsConStockBajo(almacenId);
        return NextResponse.json({ success: true, data: items });
      }

      const itemId = searchParams.get('id');
      if (!itemId || isNaN(Number(itemId)))
        return NextResponse.json({ error: 'ID de ítem inválido' }, { status: 400 });

      const tipo = searchParams.get('tipo');
      let stock;

      if (tipo === 'producto') stock = await obtenerStockProducto(Number(itemId));
      else if (tipo === 'insumo') stock = await obtenerStockInsumo(Number(itemId));
      else if (tipo === 'material') stock = await obtenerStockMaterial(Number(itemId));
      else return NextResponse.json(
        { error: 'Tipo de ítem inválido (producto | insumo | material)' },
        { status: 400 }
      );

      return NextResponse.json({ success: true, data: stock });
    }

    // ── Insumos ────────────────────────────────────────────────────────────
    const rawCategoriaId = searchParams.get('categoria_id');
    const rawTipo = searchParams.get('tipo');
    const rawSort = searchParams.get('sort');

    // Validar categoria_id contra la tabla real
    if (rawCategoriaId) {
      if (isNaN(Number(rawCategoriaId)))
        return NextResponse.json({ error: 'categoria_id debe ser un número' }, { status: 400 });

      const existe = await validarCategoriaId(Number(rawCategoriaId));
      if (!existe)
        return NextResponse.json({ error: `categoria_id ${rawCategoriaId} no existe` }, { status: 400 });
    }

    if (rawTipo && !TIPOS_VALIDOS.has(rawTipo as TipoInsumo))
      return NextResponse.json({ error: `tipo inválido: ${rawTipo}` }, { status: 400 });

    if (rawSort && rawSort !== 'asc' && rawSort !== 'desc')
      return NextResponse.json({ error: 'sort debe ser "asc" o "desc"' }, { status: 400 });

    const insumos = await InventarioService.listar({
      categoria_id: rawCategoriaId ? Number(rawCategoriaId) : undefined,
      tipo: rawTipo ? (rawTipo as TipoInsumo) : undefined,
      busqueda: searchParams.get('busqueda') ?? undefined,
      bajo_stock: searchParams.get('bajo_stock') === 'true',
      sort: rawSort ? (rawSort as 'asc' | 'desc') : undefined,
    });

    // Devolver también las categorías disponibles para el frontend
    const categorias = await prisma.categoria_insumo.findMany({
      where: { activo: true },
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' },
    });

    return NextResponse.json({ success: true, data: { insumos, categorias, proveedores: [] } });

  } catch (error) {
    console.error('[GET /inventario]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const auth = await requireServerRole(INVENTARIO_ROLES);
  if (!auth.success)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const resource = new URL(req.url).searchParams.get('resource') ?? 'insumos';
    const body = await req.json();

    // ── Movimiento ─────────────────────────────────────────────────────────
    if (resource === 'movimiento') {
      const { tipo, ...datos } = body as Record<string, any>;

      const tiposMovimiento = ['entrada', 'salida', 'ajuste'] as const;
      if (!tiposMovimiento.includes(tipo))
        return NextResponse.json(
          { error: 'tipo debe ser: entrada | salida | ajuste' },
          { status: 400 }
        );

      const defaults: Record<string, string> = {
        entrada: 'ORDEN_COMPRA',
        salida: 'ORDEN_PRODUCCION',
        ajuste: 'AJUSTE_MANUAL',
      };

      const movimiento = await registrarMovimiento({
        tipoMovimiento: tipo,
        referenciaId: datos.referenciaId ? Number(datos.referenciaId) : 0,
        cantidad: Number(datos.cantidad),
        motivo: datos.motivo ?? '',
        productoId: datos.productoId ? Number(datos.productoId) : undefined,
        insumoId: datos.insumoId ? Number(datos.insumoId) : undefined,
        materialId: datos.materialId ? Number(datos.materialId) : undefined,
        usuarioId: datos.usuarioId ? Number(datos.usuarioId) : undefined,
        almacenId: datos.almacenId ? Number(datos.almacenId) : undefined,
        referenciaType: datos.tipoReferencia ?? defaults[tipo],
        ...(tipo === 'entrada' && { costoUnitario: datos.costoUnitario ? Number(datos.costoUnitario) : undefined }),
        ...(tipo === 'ajuste' && { cantidad: Number(datos.cantidadNueva ?? datos.cantidad ?? 0) }),
      } as any);

      return NextResponse.json(
        { success: true, data: movimiento, message: 'Movimiento registrado exitosamente' },
        { status: 201 }
      );
    }

    // ── Insumo ─────────────────────────────────────────────────────────────
    if (typeof body !== 'object' || body === null)
      return NextResponse.json({ error: 'Body inválido' }, { status: 400 });

    const data = body as Record<string, unknown>;

    if (!data.nombre || typeof data.nombre !== 'string')
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });

    if (!data.tipo || !TIPOS_VALIDOS.has(data.tipo as TipoInsumo))
      return NextResponse.json(
        { error: 'El tipo es obligatorio y debe ser un valor válido' },
        { status: 400 }
      );

    // Validar que categoria_id exista en la tabla
    if (!data.categoria_id || isNaN(Number(data.categoria_id)))
      return NextResponse.json({ error: 'categoria_id es obligatorio' }, { status: 400 });

    const categoriaExiste = await validarCategoriaId(Number(data.categoria_id));
    if (!categoriaExiste)
      return NextResponse.json({ error: 'La categoría indicada no existe' }, { status: 400 });

    const insumo = await InventarioService.crear({
      nombre: data.nombre,
      tipo: data.tipo as TipoInsumo,
      categoria_id: Number(data.categoria_id),
      unidad_medida: data.unidad_medida as any,
      stock_actual: typeof data.stock_actual === 'number' ? data.stock_actual : undefined,
      stock_minimo: typeof data.stock_minimo === 'number' ? data.stock_minimo : undefined,
      stock_maximo: typeof data.stock_maximo === 'number' ? data.stock_maximo : undefined,
      precio_unitario: typeof data.precio_unitario === 'number' ? data.precio_unitario : undefined,
      proveedor_id: typeof data.proveedor_id === 'string' ? data.proveedor_id : undefined,
      ubicacion_almacen: typeof data.ubicacion_almacen === 'string' ? data.ubicacion_almacen : undefined,
      alerta_bajo_stock: typeof data.alerta_bajo_stock === 'boolean' ? data.alerta_bajo_stock : undefined,
    });

    await auditoriaService.registrar({
      usuario_id: BigInt(auth.user.id),
      accion: 'crear',
      tabla: 'insumo',
      registro_id: BigInt(insumo.id),
      datos_despues: insumo,
    });

    return NextResponse.json({ success: true, data: insumo }, { status: 201 });

  } catch (error) {
    console.error('[POST /inventario]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}

// ── PUT ───────────────────────────────────────────────────────────────────────

export async function PUT(req: NextRequest) {
  const auth = await requireServerRole(INVENTARIO_ROLES);
  if (!auth.success)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await req.json() as Record<string, any>;

    const movimientos = await listarMovimientos({
      tipo_movimiento: body.tipoMovimiento,
      referencia_tipo: body.referenciaType,
      almacen_id: body.almacenId,
      desde: body.fechaInicio ? new Date(body.fechaInicio) : undefined,
      hasta: body.fechaFin ? new Date(body.fechaFin) : undefined,
      limite: body.limit ?? 50,
      producto_id: body.productoId,
    });

    return NextResponse.json({ success: true, data: movimientos, total: movimientos.length });

  } catch (error) {
    console.error('[PUT /inventario]', error);
    return NextResponse.json({ error: 'Error al filtrar movimientos' }, { status: 500 });
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const auth = await requireServerRole(INVENTARIO_ROLES);
  if (!auth.success)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    if (!/^\d+$/.test(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    await InventarioService.eliminar(id);

    await auditoriaService.registrar({
      usuario_id: BigInt(auth.user.id),
      accion: 'eliminar',
      tabla: 'insumo',
      registro_id: BigInt(id),
    });

    return NextResponse.json({ success: true, message: 'Insumo eliminado correctamente' });

  } catch (error) {
    console.error('[DELETE /inventario]', error);
    if (isPrismaNotFound(error))
      return NextResponse.json({ error: 'Insumo no encontrado' }, { status: 404 });

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}