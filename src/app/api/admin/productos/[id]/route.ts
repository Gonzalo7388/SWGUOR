export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse, NextRequest } from 'next/server';

// Definimos la interfaz donde params es una Promesa
interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET: Obtener un producto específico
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    // Resolvemos la promesa de los parámetros
    const { id } = await context.params;
    
    const producto = await prisma.productos.findUnique({
      where: { id: BigInt(id) },
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
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const idLimpio = rawId.split(':')[0];
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

    // 2. Lógica específica para cambio de ESTADO
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
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const id = BigInt(rawId);

    await prisma.productos.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Producto eliminado correctamente' });
  } catch (error: any) {
    console.error('Error en DELETE producto:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}