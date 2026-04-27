import { model } from '@/lib/gemini';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Extrae información estructurada de un PDF usando visión de Gemini
 * Soporta extracción de:
 * - Cotizaciones de proveedor
 * - Fichas técnicas
 * - Medidas y especificaciones
 */

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
  producto_nombre?: string;
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

/**
 * Convierte un archivo a base64 para enviar a Gemini
 */
function fileToBase64(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  return fileBuffer.toString('base64');
}

/**
 * Extrae información de una cotización de proveedor desde PDF
 */
export async function extraerCotizacionProveedor(
  pdfPath: string
): Promise<ExtraccionCotizacionProveedor> {
  const base64Data = fileToBase64(pdfPath);

  const prompt = `
Analiza este PDF de cotización de proveedor y extrae la siguiente información en formato JSON:

{
  "numero_cotizacion": "número de la cotización si aparece",
  "fecha_cotizacion": "fecha en formato YYYY-MM-DD",
  "fecha_vencimiento": "fecha de vencimiento si aparece",
  "proveedor_nombre": "nombre del proveedor",
  "proveedor_ruc": "RUC o número de identificación si aparece",
  "proveedor_email": "correo electrónico",
  "proveedor_telefono": "número de teléfono",
  "moneda": "moneda usada (USD, PEN, EUR, etc)",
  "items": [
    {
      "descripcion": "descripción del producto/servicio",
      "cantidad": número,
      "precio_unitario": número,
      "subtotal": número
    }
  ],
  "total": número total de la cotización,
  "notas": "notas o condiciones especiales"
}

Sé preciso con los números. Si algo no aparece, omite ese campo. 
Responde SOLO el JSON sin explicaciones adicionales.
`;

  try {
    const response = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64Data,
        },
      },
      { text: prompt },
    ]);

    const content = response.response.text();
    // Limpiar markdown si viene envuelto en ```json```
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
    
    const parsed = JSON.parse(jsonStr) as ExtraccionCotizacionProveedor;
    return parsed;
  } catch (error: any) {
    console.error('Error al extraer cotización:', error);
    throw new Error(`Fallo al extraer información del PDF: ${error.message}`);
  }
}

/**
 * Extrae medidas y especificaciones de una ficha técnica en PDF
 */
export async function extraerFichaTecnica(
  pdfPath: string
): Promise<ExtraccionFichaTecnica> {
  const base64Data = fileToBase64(pdfPath);

  const prompt = `
Analiza este PDF de ficha técnica y extrae la información en formato JSON:

{
  "producto_nombre": "nombre del producto",
  "version": "versión de la ficha técnica si aparece",
  "descripcion": "descripción general del producto",
  "sam_total": número de minutos SAM si aparece (o null),
  "costo_estimado": costo estimado si aparece (o null),
  "medidas": [
    {
      "punto_medida": "nombre del punto (ej: largo, ancho)",
      "talla": "talla aplicable (XS, S, M, L, 28, 30, etc)",
      "valor_cm": número en centímetros,
      "tolerancia": número de tolerancia en cm si aparece
    }
  ],
  "materiales": [
    {
      "nombre": "nombre del material",
      "composicion": "composición (algodón 100%, poliéster, etc)",
      "porcentaje": número porcentaje si aparece
    }
  ]
}

Extrae todas las medidas que encuentres en tablas.
Si hay múltiples tallas, crea un registro por talla.
Responde SOLO el JSON sin explicaciones adicionales.
`;

  try {
    const response = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64Data,
        },
      },
      { text: prompt },
    ]);

    const content = response.response.text();
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
    
    const parsed = JSON.parse(jsonStr) as ExtraccionFichaTecnica;
    return parsed;
  } catch (error: any) {
    console.error('Error al extraer ficha técnica:', error);
    throw new Error(`Fallo al extraer información de ficha técnica: ${error.message}`);
  }
}

/**
 * Método genérico para extraer información con prompt personalizado
 */
export async function extraerConPromptCustom(
  pdfPath: string,
  tipoExtracion: 'cotizacion' | 'ficha_tecnica' | 'medidas' | 'custom',
  promptCustom?: string
): Promise<any> {
  const base64Data = fileToBase64(pdfPath);

  let prompt = promptCustom || '';

  if (!promptCustom) {
    const prompts: Record<string, string> = {
      cotizacion: `Extrae datos de cotización: número, fecha, proveedor, items con cantidades y precios. Retorna JSON.`,
      ficha_tecnica: `Extrae datos de ficha técnica: producto, versión, medidas, materiales. Retorna JSON.`,
      medidas: `Extrae tabla de medidas con puntos, tallas y valores en cm. Retorna JSON.`,
    };
    prompt = prompts[tipoExtracion] || 'Extrae toda la información relevante en formato JSON.';
  }

  try {
    const response = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64Data,
        },
      },
      { text: prompt },
    ]);

    const content = response.response.text();
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
    
    return JSON.parse(jsonStr);
  } catch (error: any) {
    console.error('Error en extracción personalizada:', error);
    throw new Error(`Fallo en extracción: ${error.message}`);
  }
}
