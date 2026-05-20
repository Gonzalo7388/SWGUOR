/** Buckets y rutas de Supabase Storage (sin modificar schema Prisma) */

export const STORAGE_BUCKET_DOCUMENTOS =
  process.env.SUPABASE_STORAGE_BUCKET_DOCUMENTOS ?? 'documentos';

export const STORAGE_PATH_ORDENES_COMPRA = 'ordenes-compra' as const;

export function ordenCompraPdfStoragePath(ordenId: string | number): string {
  return `${STORAGE_PATH_ORDENES_COMPRA}/${ordenId}/orden.pdf`;
}
