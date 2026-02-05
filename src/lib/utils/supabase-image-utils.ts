/**
 * Utilities para manejar imágenes desde Supabase Storage
 * Genera URLs públicas para acceder a las imágenes de productos
 */

/**
 * Obtiene la URL pública de una imagen en Supabase Storage
 * @param imagePath - Ruta del archivo en Supabase (ej: 'productos/imagen.jpg')
 * @param bucket - Nombre del bucket (default: 'productos')
 * @returns URL pública de la imagen
 */
export function getSupabaseImageUrl(imagePath: string | null | undefined, bucket: string = 'productos'): string | null {
  if (!imagePath) {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!supabaseUrl) {
    console.error('[SUPABASE] NEXT_PUBLIC_SUPABASE_URL no está configurado');
    return null;
  }

  // Si imagePath ya es una URL completa, devolverla tal cual
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Construir la URL pública de Supabase Storage
  // formato: https://<project-url>/storage/v1/object/public/<bucket>/<path>
  const imageUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${imagePath}`;
  return imageUrl;
}

/**
 * Valida si una URL de imagen es válida y accesible
 * @param imageUrl - URL de la imagen a validar
 * @returns Promise<boolean> - true si la imagen es válida
 */
export async function isImageUrlValid(imageUrl: string | null | undefined): Promise<boolean> {
  if (!imageUrl) {
    return false;
  }

  try {
    const response = await fetch(imageUrl, { method: 'HEAD', cache: 'no-store' });
    return response.ok;
  } catch (error) {
    console.error('[SUPABASE] Error validando imagen:', error);
    return false;
  }
}

/**
 * Obtiene la URL de una imagen con validación
 * @param imagePath - Ruta del archivo en Supabase
 * @param bucket - Nombre del bucket
 * @param fallbackUrl - URL alternativa si la imagen no existe
 * @returns URL de la imagen o URL alternativa
 */
export async function getSupabaseImageUrlWithFallback(
  imagePath: string | null | undefined,
  bucket: string = 'productos',
  fallbackUrl: string = '/placeholder-image.png'
): Promise<string> {
  const imageUrl = getSupabaseImageUrl(imagePath, bucket);
  
  if (!imageUrl) {
    return fallbackUrl;
  }

  // Intenta validar la imagen
  const isValid = await isImageUrlValid(imageUrl);
  
  if (isValid) {
    return imageUrl;
  }

  return fallbackUrl;
}

/**
 * Construye una URL de thumbail para imágenes en Supabase
 * Útil para optimizar imágenes grandes
 * @param imagePath - Ruta del archivo en Supabase
 * @param bucket - Nombre del bucket
 * @param width - Ancho del thumbnail (default: 300)
 * @param height - Alto del thumbnail (default: 300)
 * @returns URL de la imagen con parámetros de resize
 */
export function getSupabaseImageThumbnail(
  imagePath: string | null | undefined,
  bucket: string = 'productos',
  width: number = 300,
  height: number = 300
): string | null {
  const imageUrl = getSupabaseImageUrl(imagePath, bucket);
  
  if (!imageUrl) {
    return null;
  }

  // Supabase soporta parámetros de transformación
  // ?width=300&height=300&resize=cover
  return `${imageUrl}?width=${width}&height=${height}&resize=cover`;
}
