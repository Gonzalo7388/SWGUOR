export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { CotizacionesService } from '@/lib/services/cotizaciones.service';

export async function GET() {
  try {
    const data = await CotizacionesService.listarClientes();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}