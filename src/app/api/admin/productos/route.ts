export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';

// GET: Obtener todos los productos con filtros
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const categoria_id = searchParams.get('categoria_id');
    const estado = searchParams.get('estado');
    const busqueda = searchParams.get('busqueda');

    const where: Record<string, unknown> = {};

    if (categoria_id) where.categoria_id = BigInt(categoria_id);
    if (estado) where.estado = estado;
    if (busqueda) where.nombre = { contains: busqueda, mode: 'insensitive' };

    const productos = await prisma.productos.findMany({
      where,
      include: {
        categorias: {
          select: { id: true, nombre: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(serializeBigInt(productos));
  } catch (error: any) {
    console.error('Error en GET productos:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Crear un nuevo producto
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.nombre || !body.sku || body.precio == null) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios: nombre, sku, precio' },
        { status: 400 }
      );
    }

    const producto = await prisma.productos.create({
      data: {
        nombre: body.nombre,
        sku: body.sku,
        descripcion: body.descripcion ?? null,
        precio: body.precio,
        stock: body.stock ?? 0,
        categoria_id: body.categoria_id ? BigInt(body.categoria_id) : null,
        imagen: body.imagen ?? body.imagen_url ?? null,
        estado: 'activo',
        destacado: body.destacado ?? false,
        moq: body.moq ?? 400,
        ficha_tecnica: body.ficha_tecnica ?? null,
        updated_at: new Date(),
        created_at: new Date(),
      },
      include: {
        categorias: { select: { id: true, nombre: true } },
      },
    });

    const margen = body.costo_unitario
      ? calcularMargen(body.costo_unitario, body.precio)
      : null;

    return NextResponse.json(
      { ...serializeBigInt(producto), margen },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error en POST productos:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un producto con ese SKU' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Actualizar producto (o stock rápido)
export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID no proporcionado' }, { status: 400 });
    }

    const body = await req.json();

<<<<<<< HEAD
    // Stock rápido: sumar/restar sin conocer el total actual
    if (body.stock_delta !== undefined) {
      const delta = Number(body.stock_delta);
      const producto = await prisma.productos.update({
        where: { id: BigInt(id) },
        data: { stock: { increment: delta } },
        include: { categorias: { select: { id: true, nombre: true } } },
      });
      return NextResponse.json(serializeBigInt(producto));
    }
=======
    // Pasamos el cliente 'supabase' como primer argumento
    const { data, error } = await actualizarProducto(supabase, id, body);
>>>>>>> main

    // Actualización genérica de campos
    const data: Record<string, unknown> = {};

    if (body.nombre !== undefined) data.nombre = body.nombre;
    if (body.descripcion !== undefined) data.descripcion = body.descripcion;
    if (body.precio !== undefined) data.precio = body.precio;
    if (body.stock !== undefined) data.stock = body.stock;
    if (body.estado !== undefined) data.estado = body.estado;
    if (body.imagen !== undefined) data.imagen = body.imagen;
    if (body.destacado !== undefined) data.destacado = body.destacado;
    if (body.moq !== undefined) data.moq = body.moq;
    if (body.ficha_tecnica !== undefined) data.ficha_tecnica = body.ficha_tecnica;
    if (body.categoria_id !== undefined) {
      data.categoria_id = body.categoria_id ? BigInt(body.categoria_id) : null;
    }

    const producto = await prisma.productos.update({
      where: { id: BigInt(id) },
      data,
      include: { categorias: { select: { id: true, nombre: true } } },
    });

    return NextResponse.json(serializeBigInt(producto));
  } catch (error: any) {
    console.error('Error en PATCH productos:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar un producto
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

<<<<<<< HEAD
    await prisma.productos.delete({
      where: { id: BigInt(id) },
    });
=======
    // Pasamos el cliente 'supabase' como primer argumento
    const { error } = await eliminarProducto(supabase, id);

    if (error) throw error;
>>>>>>> main

    return NextResponse.json({ message: 'Producto eliminado correctamente' });
  } catch (error: any) {
    console.error('Error en DELETE productos:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ─── Utilitarios ───────────────────────────────────────────────────────────

function calcularMargen(costo: number, precio: number): number {
  if (!costo || !precio) return 0;
  return ((precio - costo) / precio) * 100;
}
