export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const data = await prisma.$queryRaw`
      SELECT * FROM v_producto_stock_resumen
      ORDER BY producto_nombre ASC
    `;
    return NextResponse.json(serializeBigInt(data));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}