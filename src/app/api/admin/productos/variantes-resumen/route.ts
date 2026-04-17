export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const producto_id = searchParams.get('producto_id');

    const data = producto_id
  ? await prisma.$queryRaw`
      SELECT * FROM v_variante_stock_resumen
      WHERE producto_id = ${BigInt(producto_id)}
      ORDER BY producto_nombre, color, talla
    `
  : await prisma.$queryRaw`
      SELECT * FROM v_variante_stock_resumen
      ORDER BY producto_nombre, color, talla
    `;

    return NextResponse.json(serializeBigInt(data));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}