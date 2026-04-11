import { NextResponse } from 'next/server';
import { calcularTotalesCotizacion } from '@/lib/logic/cotizaciones-logic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cliente_id, items } = body;

    if (!cliente_id || !items || !items.length) {
      return NextResponse.json({ error: 'datos_incompletos' }, { status: 400 });
    }

    const resultado = await calcularTotalesCotizacion(items);

    // Serialización optimizada para BigInt
    return new NextResponse(
      JSON.stringify(
        { success: true, data: resultado, mensaje: "Cotización generada" },
        (key, value) => (typeof value === 'bigint' ? value.toString() : value)
      ),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('ERROR_API_COTIZACION:', error);
    return NextResponse.json({ 
      error: 'error_interno', 
      detalle: error.message 
    }, { status: 500 });
  }
}