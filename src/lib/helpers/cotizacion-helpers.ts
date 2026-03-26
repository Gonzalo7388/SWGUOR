import { NextResponse } from 'next/server';
import { calcularTotalesCotizacion } from '@/lib/logic/cotizaciones-logic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cliente_id, items } = body;

    // 1. Verificación básica de entrada
    if (!cliente_id || !items || !items.length) {
      return NextResponse.json({ error: 'datos_incompletos' }, { status: 400 });
    }

    // 2. Delegamos TODA la complejidad a la función lógica que ya escribimos
    // Esta función ya calcula descuentos, precios y guarda en la DB
    const resultado = await calcularTotalesCotizacion(items);

    // 3. Serialización de BigInt para la respuesta JSON
    const respuestaSegura = JSON.parse(
      JSON.stringify(resultado, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );

    return NextResponse.json({ 
      success: true, 
      data: respuestaSegura, 
      mensaje: "Cotización generada exitosamente" 
    });

  } catch (error: any) {
    console.error('ERROR_API_COTIZACION:', error);
    
    // Manejo de errores específicos (como el MOQ si lanzas un throw en la lógica)
    return NextResponse.json({ 
      error: 'error_interno', 
      detalle: error.message 
    }, { status: 500 });
  }
}