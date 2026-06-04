import * as fs from 'fs';
import { getGeminiJsonModel } from '@/lib/gemini';
import { resolveGeminiModelId } from '@/lib/helpers/gemini-models.helper';
import {
  cotizacionExtraccionIaSchema,
  type CotizacionExtraccionIA,
} from '@/lib/schemas/cotizacion-extraccion-ia';

const SYSTEM_PROMPT = `Eres un extractor de datos para un ERP textil (Perú).
Analiza el PDF de cotización de proveedor y devuelve ÚNICAMENTE un JSON válido con esta estructura exacta:

{
  "proveedor": {
    "ruc": "11 dígitos si aparece, sino null",
    "razon_social": "razón social o nombre comercial",
    "email": "correo o null",
    "telefono": "teléfono o null",
    "contacto": "persona de contacto o null"
  },
  "cotizacion": {
    "numero_externo": "número/código de cotización del proveedor",
    "fecha_solicitud": "YYYY-MM-DD fecha del documento",
    "fecha_vencimiento": "YYYY-MM-DD validez/vencimiento de la cotización o null",
    "fecha_prometida": "YYYY-MM-DD fecha de entrega prometida explícita (fecha entrega, entrega estimada, etc.) o null",
    "fecha_entrega": "YYYY-MM-DD alias de fecha de entrega si aparece con otro nombre, o null",
    "plazo_entrega_dias": "entero: días de plazo de entrega si dice 'entrega en X días' y no hay fecha exacta, sino null",
    "moneda": "PEN | USD | EUR (normalizar)",
    "precios_incluyen_igv": true si el PDF indica que los precios incluyen IGV (ej. "inc. IGV", "precios con IGV"); false si indica "sin IGV", "+ IGV", "valor neto", "afecto" con base y IGV aparte; null si no se puede determinar,
    "sujeto_igv": true si la cotización aplica IGV 18%; false si dice "exonerado", "inafecto", "no afecto a IGV"; null si no claro,
    "documento_exonerado_igv": true solo si TODO el documento es exonerado/inafecto; si no, false o null,
    "total_estimado": número,
    "notas": "condiciones u observaciones generales o null"
  },
  "items": [
    {
      "descripcion": "texto del producto/servicio",
      "cantidad": número,
      "unidad": "unidades | metros | kg | etc.",
      "precio_unitario": número,
      "subtotal": número,
      "tipo_item": "insumo | material",
      "precio_incluye_igv": true|false|null solo si el ítem indica explícitamente si su precio incluye IGV; si no, null,
      "sujeto_igv": true|false|null solo si el ítem indica explícitamente si aplica IGV; si no, null
    }
  ]
}

Reglas:
- Mapea campos al esquema anterior; no inventes claves extra.
- Incluye TODOS los ítems tabulados del PDF.
- Si un campo no existe: null en strings, 0 en números.
- moneda solo PEN, USD o EUR.
- tipo_item: "material" si es tela/hilo/tela; si no, "insumo".
- Fechas siempre YYYY-MM-DD o null.
- fecha_prometida/fecha_entrega: solo si el PDF indica entrega con fecha concreta.
- plazo_entrega_dias: solo si indica plazo relativo (ej. "15 días", "30 días hábiles"); no inventes el número.
- IGV Perú 18%: detecta si precios son brutos (con IGV) o netos (sin IGV) a nivel documento; usa flags por ítem solo si el PDF lo distingue línea a línea.`;

function parseGeminiJson(raw: string): unknown {
  const cleaned = raw
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/g, '')
    .trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('La respuesta de Gemini no contiene JSON');
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

/** Compatibilidad con extracciones legacy (campos planos) */
function normalizarLegacy(raw: Record<string, unknown>): CotizacionExtraccionIA {
  const items = Array.isArray(raw.items)
    ? raw.items
    : [];

  return cotizacionExtraccionIaSchema.parse({
    proveedor: {
      ruc: raw.proveedor_ruc ?? raw.ruc,
      razon_social: raw.proveedor_nombre ?? raw.razon_social,
      email: raw.proveedor_email ?? raw.email,
      telefono: raw.proveedor_telefono ?? raw.telefono,
      contacto: raw.contacto,
    },
    cotizacion: {
      numero_externo: raw.numero_externo ?? raw.numero_cotizacion,
      fecha_solicitud: raw.fecha_solicitud ?? raw.fecha_cotizacion,
      fecha_vencimiento: raw.fecha_vencimiento,
      fecha_prometida: raw.fecha_prometida ?? raw.fecha_entrega_prometida,
      fecha_entrega: raw.fecha_entrega,
      plazo_entrega_dias: raw.plazo_entrega_dias ?? raw.dias_entrega,
      moneda: raw.moneda,
      precios_incluyen_igv: raw.precios_incluyen_igv ?? raw.precios_con_igv,
      sujeto_igv: raw.sujeto_igv ?? raw.aplica_igv,
      documento_exonerado_igv: raw.documento_exonerado_igv ?? raw.exonerado_igv,
      total_estimado: raw.total_estimado ?? raw.total,
      notas: raw.notas,
    },
    items,
  });
}

function normalizarAnidado(raw: Record<string, unknown>): CotizacionExtraccionIA {
  if (raw.proveedor || raw.cotizacion) {
    return cotizacionExtraccionIaSchema.parse(raw);
  }
  return normalizarLegacy(raw);
}

/**
 * Extrae datos de cotización desde un buffer PDF (CUS_44).
 */
export async function extraerCotizacionProveedorDesdeBuffer(
  pdfBuffer: Buffer,
): Promise<CotizacionExtraccionIA> {
  const base64Data = pdfBuffer.toString('base64');
  const modelId = await resolveGeminiModelId({
    purpose: 'extract-cotizacion-pdf',
  });
  const jsonModel = getGeminiJsonModel(modelId);

  const response = await jsonModel.generateContent([
    { text: SYSTEM_PROMPT },
    {
      text: 'Extrae la cotización del PDF según el esquema indicado. Responde solo con el JSON.',
    },
    {
      inlineData: {
        mimeType: 'application/pdf',
        data: base64Data,
      },
    },
  ]);

  const content = response.response.text();
  const parsed = parseGeminiJson(content) as Record<string, unknown>;
  return normalizarAnidado(parsed);
}

export async function extraerCotizacionProveedorDesdeArchivo(
  pdfPath: string,
): Promise<CotizacionExtraccionIA> {
  const buffer = fs.readFileSync(pdfPath);
  return extraerCotizacionProveedorDesdeBuffer(buffer);
}
