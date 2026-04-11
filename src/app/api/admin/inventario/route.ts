export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';

<<<<<<< HEAD
// GET: Obtener todos los insumos con filtros
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoria = searchParams.get('categoria_insumo');
    const bajoStock = searchParams.get('bajo_stock');

    const where: Record<string, unknown> = {};

    if (categoria) where.categoria_insumo = categoria;
    if (bajoStock === 'true') {
      where.stock_actual = { lte: prisma.insumo.fields.stock_minimo as unknown as number };
    }

    const insumos = await prisma.insumo.findMany({
      where,
      orderBy: { nombre: 'asc' },
    });

    // Filtrado manual para bajo_stock (Prisma no permite field refs en where directamente)
    const resultado = bajoStock === 'true'
      ? insumos.filter((i) => i.stock_actual <= i.stock_minimo)
      : insumos;

    return NextResponse.json(serializeBigInt(resultado));
=======
// GET: Obtener todos los insumos
export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    // Los helpers deben estar preparados para manejar el cliente de supabase
    const data = await obtenerInsumos(supabase); 
    return NextResponse.json(data);
>>>>>>> main
  } catch (error: any) {
    console.error('Error fetching insumos:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

<<<<<<< HEAD
// POST: Crear un nuevo insumo
=======
// POST: Crear nuevo insumo
>>>>>>> main
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.nombre) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

<<<<<<< HEAD
    const insumo = await prisma.insumo.create({
      data: {
        nombre: body.nombre,
        tipo: body.tipo,
        categoria_insumo: body.categoria_insumo ?? 'otro',
        unidad_medida: body.unidad_medida ?? 'unidades',
        stock_actual: body.stock_actual ?? 0,
        stock_minimo: body.stock_minimo ?? 10,
        stock_maximo: body.stock_maximo ?? null,
        precio_unitario: body.precio_unitario ?? null,
        proveedor_id: body.proveedor_id ? BigInt(body.proveedor_id) : null,
        ubicacion_almacen: body.ubicacion_almacen ?? null,
        alerta_bajo_stock: body.alerta_bajo_stock ?? true,
      },
=======
    const data = await crearInsumo(supabase, {
      nombre:          body.nombre,
      tipo:            body.tipo,
      unidad_medida:   body.unidad_medida,
      stock_actual:    body.stock_actual,
      stock_minimo:    body.stock_minimo ?? 0,
      precio_unitario: body.precio_unitario ?? null,
>>>>>>> main
    });

    return NextResponse.json(serializeBigInt(insumo), { status: 201 });
  } catch (error: any) {
    console.error('Error creating insumo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

<<<<<<< HEAD
// PATCH: Actualizar stock de un insumo con registro de movimiento contable
export async function PATCH(req: Request) {
=======
// DELETE: Eliminar un insumo
export async function DELETE(req: Request) {
>>>>>>> main
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

<<<<<<< HEAD
    const body = await req.json();
=======
    // ELIMINADO: parseInt(id) -> El ID ahora es un String (UUID)
    const { error } = await supabase
      .from('insumo') // Asegúrate de que la tabla sea 'insumo' (singular) según tu SQL
      .delete()
      .eq('id', id);
>>>>>>> main

    // ── Ajuste de stock con movimiento de inventario ──
    if (body.stock_actual !== undefined || body.stock_delta !== undefined) {
      const insumo = await prisma.insumo.findUnique({
        where: { id: BigInt(id) },
      });

      if (!insumo) {
        return NextResponse.json({ error: 'Insumo no encontrado' }, { status: 404 });
      }

      const stockAnterior = insumo.stock_actual;
      let nuevoStock: number;

      if (body.stock_delta !== undefined) {
        // Incremento/decremento relativo
        nuevoStock = stockAnterior + Number(body.stock_delta);
      } else {
        // Set absoluto
        nuevoStock = Number(body.stock_actual);
      }

      const tipoMovimiento = nuevoStock > stockAnterior ? 'entrada' : nuevoStock < stockAnterior ? 'salida' : 'ajuste';

      const insumoActualizado = await prisma.$transaction(async (tx) => {
        // 1. Actualizar el stock
        const actualizado = await tx.insumo.update({
          where: { id: BigInt(id) },
          data: {
            stock_actual: nuevoStock,
            ...(body.precio_unitario !== undefined && { precio_unitario: body.precio_unitario }),
          },
        });

        // 2. Registrar movimiento de inventario para auditoría
        await tx.movimientos_inventario.create({
          data: {
            insumo_id: BigInt(id),
            cantidad: Math.abs(nuevoStock - stockAnterior),
            motivo: body.motivo ?? 'Ajuste de stock manual',
            tipo_movimiento: tipoMovimiento,
            usuario_id: body.usuario_id ? BigInt(body.usuario_id) : null,
            costo_unitario: insumo.precio_unitario
              ? Number(insumo.precio_unitario)
              : null,
            stock_anterior: stockAnterior,
            stock_posterior: nuevoStock,
            referencia_tipo: body.referencia_tipo ?? 'AJUSTE',
            referencia_id: body.referencia_id ? BigInt(body.referencia_id) : null,
          },
        });

        return actualizado;
      });

      return NextResponse.json(serializeBigInt(insumoActualizado));
    }

    // ── Actualización genérica de campos ──
    const data: Record<string, unknown> = {};

    if (body.nombre !== undefined) data.nombre = body.nombre;
    if (body.tipo !== undefined) data.tipo = body.tipo;
    if (body.categoria_insumo !== undefined) data.categoria_insumo = body.categoria_insumo;
    if (body.unidad_medida !== undefined) data.unidad_medida = body.unidad_medida;
    if (body.stock_minimo !== undefined) data.stock_minimo = body.stock_minimo;
    if (body.stock_maximo !== undefined) data.stock_maximo = body.stock_maximo;
    if (body.precio_unitario !== undefined) data.precio_unitario = body.precio_unitario;
    if (body.proveedor !== undefined) data.proveedor = body.proveedor;
    if (body.ubicacion_almacen !== undefined) data.ubicacion_almacen = body.ubicacion_almacen;
    if (body.alerta_bajo_stock !== undefined) data.alerta_bajo_stock = body.alerta_bajo_stock;

    const insumo = await prisma.insumo.update({
      where: { id: BigInt(id) },
      data,
    });

    return NextResponse.json(serializeBigInt(insumo));
  } catch (error: any) {
    console.error('Error updating insumo:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Insumo no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar un insumo
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    await prisma.insumo.delete({
      where: { id: BigInt(id) },
    });

    return NextResponse.json({ message: 'Item de inventario eliminado' });
  } catch (error: any) {
    console.error('Error deleting insumo:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Insumo no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
<<<<<<< HEAD
=======

// PATCH: Actualizar stock
export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    const body = await req.json();

    // ELIMINADO: parseInt(id) -> Pasamos el ID como String directamente
    const { success, error } = await actualizarStockInsumo(supabase, id, body.stock_actual);

    if (error) throw new Error(error);
    if (!success) return NextResponse.json({ error: 'Error al actualizar stock' }, { status: 400 });

    const { data: updatedData, error: fetchError } = await supabase
      .from('insumo')
      .select()
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json(updatedData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
>>>>>>> main
