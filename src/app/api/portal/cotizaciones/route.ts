import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calcularTotalesCotizacion } from '@/lib/logic/cotizaciones-logic';
import { analizarCotizaciónConIA } from '@/lib/logic/asistente-logic';

export async function POST(req: Request) {
  try {
    // 1. Verificación de Autenticación mediante Supabase Server Client
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'no_auth' }, { status: 401 });
    }

    const body = await req.json();
    const { cliente_id, items } = body;

    // 2. Validación básica de entrada
    if (!cliente_id || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'datos_incompletos' }, { status: 400 });
    }

    // 3. Ejecutar Lógica de Negocio B2B (Calculadora de Escalas)
    // Pasamos los items al motor de reglas que definimos en lib/logic
    const resultadoCalculo = calcularTotalesCotizacion(items);

    // 4. Validación de Regla de Oro B2B: MOQ (Mínimo de Pedido)
    if (!resultadoCalculo.cumpleMOQ) {
      return NextResponse.json({ 
        error: 'error_negocio', 
        mensaje: `No se cumple el MOQ de 400 unidades. Cantidad actual: ${resultadoCalculo.cantidadTotal}`,
        detalle: resultadoCalculo 
      }, { status: 400 });
    }

    // 5. Análisis de IA con Gemini 1.5 Flash (CUS-07)
    // Enviamos el resultado del cálculo para que la IA dé consejos estratégicos
    let consejoIA = null;
    try {
      // Analizamos no solo el total, sino también el nivel de descuento alcanzado
      consejoIA = await analizarCotizaciónConIA(resultadoCalculo);
    } catch (iaError) {
      console.error('Error en análisis de IA:', iaError);
      consejoIA = { 
        analisis: "Análisis estratégico temporalmente no disponible.",
        sugerencia: "Consulte con su asesor comercial asignado." 
      };
    }

    // 6. Serialización Segura y Respuesta
    // Manejamos posibles BigInt de la base de datos y retornamos el éxito
    const respuestaB2B = {
      success: true,
      timestamp: new Date().toISOString(),
      cliente_id,
      resumen: {
        ...resultadoCalculo,
        moneda: 'PEN',
      },
      asistente: consejoIA
    };

    // Usamos JSON.stringify con replacer para evitar errores de BigInt
    return new NextResponse(
      JSON.stringify(respuestaB2B, (key, value) => 
        typeof value === 'bigint' ? value.toString() : value
      ), 
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('ERROR_POST_COTIZACION_B2B:', error);

    return NextResponse.json({ 
      error: 'error_interno', 
      detalle: error.message || 'Error desconocido en el servidor'
    }, { status: 500 });
  }
}