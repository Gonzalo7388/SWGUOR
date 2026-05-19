export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { InventarioService } from '@/lib/services/inventario.service';
import { requireServerRole } from '@/lib/auth/server';
import { auditoriaService } from '@/lib/services/auditoria.service';
import type {
  CategoriaInsumo,
  TipoInsumo,
  Rol,
} from '@prisma/client';

// Tipado correcto: array de valores del enum Rol de Prisma
const INVENTARIO_ROLES: Rol[] = ['administrador', 'gerente', 'almacenero'];

// Valores válidos del enum para validar en runtime lo que llega por query string
const CATEGORIAS_VALIDAS = new Set<CategoriaInsumo>([
  'tela', 'avios', 'empaque', 'hilo', 'etiquetas', 'forro', 'otro', 'accesorios',
]);
const TIPOS_VALIDOS = new Set<TipoInsumo>([
  'tela', 'hilo', 'avio', 'boton', 'cierre', 'empaque', 'otro',
  'etiqueta', 'cinta', 'elastico', 'forro', 'accesorio',
]);

// ── GET /api/admin/inventario ─────────────────────────────────────────────

export async function GET(req: Request) {
  const auth = await requireServerRole(INVENTARIO_ROLES);
  if (!auth.success)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { searchParams } = new URL(req.url);

    // Validar enums antes de pasarlos al service — evita errores de DB en runtime
    const rawCategoria = searchParams.get('categoria_insumo');
    const rawTipo = searchParams.get('tipo');
    const rawSort = searchParams.get('sort');

    if (rawCategoria && !CATEGORIAS_VALIDAS.has(rawCategoria as CategoriaInsumo)) {
      return NextResponse.json(
        { error: `categoria_insumo inválida: ${rawCategoria}` },
        { status: 400 }
      );
    }
    if (rawTipo && !TIPOS_VALIDOS.has(rawTipo as TipoInsumo)) {
      return NextResponse.json(
        { error: `tipo inválido: ${rawTipo}` },
        { status: 400 }
      );
    }
    if (rawSort && rawSort !== 'asc' && rawSort !== 'desc') {
      return NextResponse.json(
        { error: 'sort debe ser "asc" o "desc"' },
        { status: 400 }
      );
    }

    const insumos = await InventarioService.listar({
      categoria_insumo: rawCategoria ? (rawCategoria as CategoriaInsumo) : undefined,
      tipo: rawTipo ? (rawTipo as TipoInsumo) : undefined,
      busqueda: searchParams.get('busqueda') ?? undefined,
      bajo_stock: searchParams.get('bajo_stock') === 'true',
      sort: rawSort ? (rawSort as 'asc' | 'desc') : undefined,
    });

    return NextResponse.json({ insumos, proveedores: [] });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    console.error('[GET /inventario]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── POST /api/admin/inventario ────────────────────────────────────────────

export async function POST(req: Request) {
  const auth = await requireServerRole(INVENTARIO_ROLES);
  if (!auth.success)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body: unknown = await req.json();

    // Validar que body sea un objeto antes de acceder a sus propiedades
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
    }

    const data = body as Record<string, unknown>;

    if (!data.nombre || typeof data.nombre !== 'string') {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }
    if (!data.tipo || !TIPOS_VALIDOS.has(data.tipo as TipoInsumo)) {
      return NextResponse.json(
        { error: 'El tipo es obligatorio y debe ser un valor válido' },
        { status: 400 }
      );
    }

    // El service está tipado — TypeScript verifica la forma de CrearInsumoData
    const insumo = await InventarioService.crear({
      nombre: data.nombre,
      tipo: data.tipo as TipoInsumo,
      categoria_insumo: data.categoria_insumo as CategoriaInsumo | undefined,
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

    return NextResponse.json(insumo, { status: 201 });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    console.error('[POST /inventario]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── DELETE /api/admin/inventario?id=xxx ───────────────────────────────────

export async function DELETE(req: Request) {
  const auth = await requireServerRole(INVENTARIO_ROLES);
  if (!auth.success)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    // Validar que sea un número entero antes de convertir a BigInt
    if (!/^\d+$/.test(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    await InventarioService.eliminar(id);

    await auditoriaService.registrar({
      usuario_id: BigInt(auth.user.id),
      accion: 'eliminar',
      tabla: 'insumo',
      registro_id: BigInt(id),
    });

    return NextResponse.json({ message: 'Insumo eliminado correctamente' });

  } catch (error) {
    console.error('[DELETE /inventario]', error);

    // Prisma P2025: registro no encontrado
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Insumo no encontrado' }, { status: 404 });
    }

    const message = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}