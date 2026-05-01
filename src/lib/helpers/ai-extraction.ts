import { model } from '@/lib/gemini';
import * as fs from 'fs';
import * as path from 'path';

export interface ExtraccionCotizacionProveedor {
  numero_cotizacion?: string;
  fecha_cotizacion?: string;
  fecha_vencimiento?: string;
  proveedor_nombre?: string;
  proveedor_ruc?: string;
  proveedor_email?: string;
  proveedor_telefono?: string;
  moneda?: string;
  items: Array<{
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }>;
  total?: number;
  notas?: string;
}

export interface ExtraccionFichaTecnica {
  version?: string;
  descripcion?: string;
  sam_total?: number;
  costo_estimado?: number;
  medidas: Array<{
    punto_medida: string;
    talla: string;
    valor_cm: number;
    tolerancia?: number;
  }>;
  materiales?: Array<{
    nombre: string;
    composicion: string;
    porcentaje?: number;
  }>;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function fileToBase64(filePath: string): string {
  return fs.readFileSync(filePath).toString('base64');
}

function getMimeType(filePath: string): 'image/png' | 'image/jpeg' | 'image/webp' {
  const ext = path.extname(filePath).toLowerCase();
  const map: Record<string, 'image/png' | 'image/jpeg' | 'image/webp'> = {
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
  };
  return map[ext] ?? 'image/png';
}

function parseJSON<T>(raw: string): T {
  // Intenta múltiples patrones para extraer JSON
  const patterns = [
    /```json\n?([\s\S]*?)\n?```/, // JSON dentro de bloque de código
    /```\n?([\s\S]*?)\n?```/,      // Bloque de código sin lenguaje especificado
    /\{[\s\S]*\}/,                   // JSON puro
  ];

  let jsonStr = raw.trim();
  
  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (match) {
      jsonStr = match[1] ?? match[0];
      break;
    }
  }

  // Si aún no parece JSON válido, trata de limpiar
  jsonStr = jsonStr.trim();
  
  if (!jsonStr.startsWith('{')) {
    // Si comienza con algo que no es {, busca la primera {
    const firstBrace = jsonStr.indexOf('{');
    if (firstBrace !== -1) {
      jsonStr = jsonStr.substring(firstBrace);
    }
  }

  try {
    return JSON.parse(jsonStr) as T;
  } catch (error) {
    console.error('❌ Error parseando JSON. Raw response:', raw);
    console.error('❌ Extracted string:', jsonStr);
    throw new Error(`JSON inválido de Gemini: ${error instanceof Error ? error.message : 'desconocido'}`);
  }
}

// ─── extracción desde imagen geometral ───────────────────────────────────────

/**
 * Extrae medidas, materiales, SAM y costo estimado
 * a partir de la imagen geometral de la prenda.
 * Los colores y tallas se obtienen directamente de la tabla productos.
 */
export async function extraerFichaTecnica(
  imagePath: string
): Promise<ExtraccionFichaTecnica> {
  const base64Data = fileToBase64(imagePath);
  const mimeType   = getMimeType(imagePath);

  const prompt = `
Eres un experto en fichas técnicas de confección textil.
Analiza esta imagen geometral de una prenda y extrae en JSON:

{
  "medidas": [
    {
      "punto_medida": "nombre del punto visible en la imagen (ej: Length HPS to Hem, Chest Width, Neck Drop, Shoulder Width, Armhole Drop)",
      "talla": "talla si aparece en la imagen, si no coloca 'M' como base",
      "valor_cm": número estimado en cm según proporciones visibles o 0 si no se puede determinar,
      "tolerancia": número o null
    }
  ],
  "materiales": [
    {
      "nombre": "nombre del material si aparece en la imagen",
      "composicion": "composición si aparece",
      "porcentaje": número o null
    }
  ],
  "sam_total": número si aparece en la imagen o null,
  "costo_estimado": número si aparece en la imagen o null,
  "descripcion": "descripción breve de la prenda basada en lo que ves en la imagen"
}

Extrae TODOS los puntos de medida visibles con sus etiquetas.
Si no hay tabla de medidas explícita, infiere los puntos desde las flechas y etiquetas de la imagen.
Responde SOLO el JSON sin explicaciones adicionales.
`;

  try {
    const response = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
      { text: prompt },
    ]);

    const content = response.response.text();
    console.log('📤 Respuesta de Gemini (primeros 500 chars):', content.substring(0, 500));
    
    return parseJSON<ExtraccionFichaTecnica>(content);
  } catch (error: any) {
    console.error('❌ Error al extraer ficha técnica desde imagen:', error.message);
    throw new Error(`Fallo al extraer información de la imagen geometral: ${error.message}`);
  }
}

// ─── extracción de cotización (sin cambios, sigue usando PDF) ─────────────────

export async function extraerCotizacionProveedor(
  pdfPath: string
): Promise<ExtraccionCotizacionProveedor> {
  const base64Data = fileToBase64(pdfPath);

  const prompt = `
Analiza este PDF de cotización de proveedor y extrae la siguiente información en formato JSON:
{
  "numero_cotizacion": "número si aparece",
  "fecha_cotizacion": "fecha en formato YYYY-MM-DD",
  "fecha_vencimiento": "fecha de vencimiento si aparece",
  "proveedor_nombre": "nombre del proveedor",
  "proveedor_ruc": "RUC si aparece",
  "proveedor_email": "correo electrónico",
  "proveedor_telefono": "número de teléfono",
  "moneda": "moneda usada (USD, PEN, EUR, etc)",
  "items": [
    {
      "descripcion": "descripción",
      "cantidad": número,
      "precio_unitario": número,
      "subtotal": número
    }
  ],
  "total": número,
  "notas": "notas o condiciones especiales"
}
Responde SOLO el JSON sin explicaciones adicionales.
`;

  try {
    const response = await model.generateContent([
      { inlineData: { mimeType: 'application/pdf', data: base64Data } },
      { text: prompt },
    ]);

    const content = response.response.text();
    return parseJSON<ExtraccionCotizacionProveedor>(content);
  } catch (error: any) {
    console.error('Error al extraer cotización:', error);
    throw new Error(`Fallo al extraer información del PDF: ${error.message}`);
  }
}

// ─── extracción genérica ──────────────────────────────────────────────────────

export async function extraerConPromptCustom(
  filePath: string,
  tipoExtraccion: 'cotizacion' | 'ficha_tecnica' | 'medidas' | 'custom',
  promptCustom?: string
): Promise<any> {
  const base64Data = fileToBase64(filePath);
  const ext        = path.extname(filePath).toLowerCase();
  const isImage    = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);

  const mimeType = isImage
    ? getMimeType(filePath)
    : 'application/pdf';

  const prompts: Record<string, string> = {
    cotizacion:    'Extrae datos de cotización: número, fecha, proveedor, items. Retorna JSON.',
    ficha_tecnica: 'Extrae medidas, materiales, SAM y costo estimado. Retorna JSON.',
    medidas:       'Extrae tabla de medidas con puntos, tallas y valores en cm. Retorna JSON.',
  };

  const prompt = promptCustom ?? prompts[tipoExtraccion] ?? 'Extrae toda la información relevante en JSON.';

  try {
    const response = await model.generateContent([
      { inlineData: { mimeType, data: base64Data } },
      { text: prompt },
    ]);

    const content = response.response.text();
    return parseJSON<any>(content);
  } catch (error: any) {
    console.error('Error en extracción personalizada:', error);
    throw new Error(`Fallo en extracción: ${error.message}`);
  }
}