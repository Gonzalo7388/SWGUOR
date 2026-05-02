export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('pdf') as File | null;

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Se requiere un archivo PDF válido' }, { status: 400 });
    }

    // ── 1. Subir PDF a Supabase Storage ────────────────────────
    const supabase = await createClient();
    const fileName = `cotizaciones-proveedor/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documentos')
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadError) {
      console.error('[UPLOAD ERROR]', uploadError);
      return NextResponse.json({ error: 'Error al subir el PDF a Storage' }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from('documentos')
      .getPublicUrl(fileName);

    // ── 2. Enviar PDF a Gemini para extracción ─────────────────
    const base64Pdf = buffer.toString('base64');

    const geminiPayload = {
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: 'application/pdf',
                data: base64Pdf,
              },
            },
            {
              text: `Analiza este documento PDF de cotización de proveedor y extrae los datos en formato JSON.
                                
                    Responde ÚNICAMENTE con un JSON válido con esta estructura exacta, sin texto adicional ni markdown:
                    {
                    "proveedor_nombre": "nombre del proveedor o empresa",
                    "proveedor_ruc": "RUC o número de identificación fiscal si aparece",
                    "proveedor_email": "email del proveedor si aparece",
                    "proveedor_telefono": "teléfono si aparece",
                    "fecha_cotizacion": "fecha en formato YYYY-MM-DD o null",
                    "fecha_vencimiento": "fecha de vencimiento/validez en formato YYYY-MM-DD o null",
                    "numero_cotizacion": "número o código de cotización si aparece",
                    "moneda": "PEN o USD u otra moneda detectada",
                    "notas": "observaciones o condiciones generales si aparecen",
                    "total_estimado": número total como float o 0,
                    "items": [
                        {
                        "descripcion": "nombre o descripción del producto/material/insumo",
                        "cantidad": número como float,
                        "unidad": "unidad de medida (metros, kg, unidades, etc.)",
                        "precio_unitario": número como float,
                        "subtotal": número como float,
                        "tipo": "material o insumo según el contexto del producto"
                        }
                    ]
                    }

                    Si algún campo no está disponible en el documento, usa null para strings y 0 para números.
                    Los items deben incluir TODOS los productos/materiales/insumos listados en la cotización.`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        topK: 1,
        topP: 1,
        maxOutputTokens: 4096,
      },
    };

    const geminiRes = await fetch(
      `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiPayload),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      console.error('[GEMINI ERROR]', err);
      return NextResponse.json(
        { error: 'Error al procesar el PDF con Gemini', pdf_url: publicUrl },
        { status: 500 }
      );
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    // ── 3. Parsear respuesta de Gemini ─────────────────────────
    let extracted: any = {};
    try {
      // Limpiar posibles bloques de markdown
      const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      extracted = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('[PARSE ERROR]', parseErr, rawText);
      return NextResponse.json(
        { error: 'No se pudo interpretar la respuesta de Gemini', pdf_url: publicUrl, raw: rawText },
        { status: 422 }
      );
    }

    // ── 4. Responder con datos extraídos + URL del PDF ─────────
    return NextResponse.json({
      success: true,
      pdf_url: publicUrl,
      data:    extracted,
    });

  } catch (error: any) {
    console.error('[EXTRAER_COTIZACION ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}