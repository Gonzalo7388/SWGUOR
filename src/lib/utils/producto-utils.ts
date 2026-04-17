/**
 * Genera el SKU base para un producto
 * Formato: CAT-PROD-ID (Ejemplo: BLU-BVBA-070)
 */
export function generateSKU(nombre: string, categoriaNombre: string, id: string | number): string {
  // 1. Diccionario de prefijos
  const categoryMap: Record<string, string> = {
    'Blusas': 'BLU',
    'Vestidos': 'VES',
    'Suéteres': 'SUE',
    'Pantalones': 'PAN',
    'Palazos': 'PAN',
    'Polos': 'POL',
    'Poleras': 'PLE',
    'Faldas': 'FAL',
    'Conjuntos': 'CON'
  };

  // 2. Prefijo de categoría
  const catPart = categoryMap[categoriaNombre] || 
                  categoriaNombre.trim().substring(0, 3).toUpperCase();

  // 3. Limpiar nombre: quitar tildes y caracteres no alfabéticos
  const cleanNombre = nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/[^a-zA-Z]/g, "")      
    .toUpperCase();

  // 4. Primeras 4 letras del producto
  const prodPart = cleanNombre.substring(0, 4).padEnd(4, 'X');

  // 5. Manejar el ID
  let idPart: string;
  const idStr = id.toString();

  if (idStr.includes('-')) {
    idPart = idStr.split('-').pop()?.substring(0, 4).toUpperCase() || '0000';
  } else {
    idPart = idStr.padStart(3, '0');
  }

  return `${catPart}-${prodPart}-${idPart}`;
}

/**
 * Genera el SKU específico para una variante de producto
 * Formato: SKUBASE-COLOR-TALLA (Ejemplo: BLU-BVBA-070-CRE-S)
 */
export function generateVariantSKU(skuBase: string, color: string, talla: string): string {
  // Limpiar y formatear Color (Tomamos las 3 primeras letras significativas)
  const colorPart = color
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .substring(0, 3)
    .padEnd(3, 'X');

  // Limpiar y formatear Talla (Eliminamos espacios y caracteres raros)
  const tallaPart = talla
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');

  return `${skuBase}-${colorPart}-${tallaPart}`;
}