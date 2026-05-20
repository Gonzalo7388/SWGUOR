/** Modelo por defecto para extracción de documentos */
export const GEMINI_MODEL_FLASH = 'gemini-1.5-flash';

/** Límite orientativo de la capa gratuita (~15 RPM) — procesar PDFs en serie */
export const GEMINI_EXTRACT_DELAY_MS = 4500;

/** Máximo de PDFs por lote de extracción en el formulario */
export const MAX_PDF_EXTRACCION_LOTE = 10;

/** Tamaño máximo por PDF (bytes) */
export const MAX_PDF_EXTRACCION_BYTES = 10 * 1024 * 1024;
