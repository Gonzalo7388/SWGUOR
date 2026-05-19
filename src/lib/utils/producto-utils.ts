export function generateSKU(nombre: string, categoriaNombre: string, id: string | number): string {
  const categoryMap: Record<string, string> = {
    'Blusas': 'BLU',
    'Casacas': 'CAS',
    'Pantalones': 'PAN',
    'Poleras': 'PLE',
    'Polos': 'POL',
    'Suéteres': 'SUE',
    'Vestidos': 'VES',
  };

  const catPart = categoryMap[categoriaNombre] ||
    categoriaNombre.trim().substring(0, 3).toUpperCase();

  const cleanNombre = nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase();

  const prodPart = cleanNombre.substring(0, 4).padEnd(4, 'X');

  const idStr = id.toString();
  const idPart = idStr.includes('-')
    ? idStr.split('-').pop()?.substring(0, 4).toUpperCase() || '0000'
    : idStr.padStart(3, '0');

  return `${catPart}-${prodPart}-${idPart}`;
}

export function generateVariantSKU(skuBase: string, color: string, talla: string): string {
  const colorPart = color
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .substring(0, 3)
    .padEnd(3, 'X');

  const tallaPart = talla.trim().toUpperCase().replace(/\s+/g, '');

  return `${skuBase}-${colorPart}-${tallaPart}`;
}