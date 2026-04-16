export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: { id: string };
}

// GET: Obtener un producto específico con todo su detalle
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const producto = await prisma.productos.findUnique({
      where: { id: BigInt(params.id) },
      include: {
        categorias: true,
        variantes_producto: true,
          ficha_tecnica_rel: true,
        },
    });

    if (!producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json(serializeBigInt(producto));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Actualizar información del producto
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const idLimpio = params.id.split(':')[0];
    const id = BigInt(idLimpio);
    const body = await req.json();

    // 1. Lógica para actualización de stock
    if (body.stock_delta !== undefined) {
      const actualizado = await prisma.productos.update({
        where: { id },
        data: { stock: { increment: Number(body.stock_delta) } },
      });
      return NextResponse.json(serializeBigInt(actualizado));
    }

    // 2. Lógica específica para el botón de cambio de ESTADO ( UX rápida )
    if (body.estado !== undefined) {
      const actualizado = await prisma.productos.update({
        where: { id },
        data: { estado: body.estado },
      });
      return NextResponse.json(serializeBigInt(actualizado));
    }

    // 3. Actualización genérica
    const { categoria_id, fichas_tecnicas_id, ...rest } = body;
    
    const data: any = { ...rest };
    // Manejo seguro de BigInt para IDs
    if (categoria_id) data.categoria_id = BigInt(String(categoria_id).split(':')[0]);
    if (fichas_tecnicas_id) data.fichas_tecnicas_id = BigInt(String(fichas_tecnicas_id).split(':')[0]);
    
    data.updated_at = new Date();

    const producto = await prisma.productos.update({
      where: { id },
      data,
    });

    return NextResponse.json(serializeBigInt(producto));
  } catch (error: any) {
    console.error('Error en PATCH producto:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar un producto
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const id = BigInt(params.id);

    // Nota: Las variantes se borrarán automáticamente si en SQL definiste ON DELETE CASCADE
    await prisma.productos.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Producto eliminado correctamente' });
  } catch (error: any) {
    console.error('Error en DELETE producto:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}