export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { MaterialesService } from '@/lib/services/material.service';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { operacion, cantidad, motivo } = body;

    if (!operacion || cantidad === undefined) {
      return NextResponse.json(
        { error: 'operacion y cantidad requeridos' },
        { status: 400 }
      );
    }

    const data = await MaterialesService.ajustarStock(id, { operacion, cantidad, motivo });
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}