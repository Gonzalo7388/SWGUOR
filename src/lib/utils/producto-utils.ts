export function generateSKU(nombre: string, categoriaNombre: string, id: string | number): string {
  // 1. Diccionario de prefijos (Opcional pero recomendado para estética)
  const categoryMap: Record<string, string> = {
    'Blusas': 'BLU',
    'Vestidos': 'VES',
    'Suéteres': 'SUE',
    'Pantalones': 'PAN',
    'Palazos': 'PAN',
    'Polos': 'POL',
    'Poleras': 'PLE',
  };

  // 2. Obtener prefijo de categoría (Si no está en el mapa, toma las 3 primeras letras)
  const catPart = categoryMap[categoriaNombre] || 
                 categoriaNombre.trim().substring(0, 3).toUpperCase();

  // 3. Limpiar nombre del producto: quitar tildes, espacios y caracteres raros
  const cleanNombre = nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Quita tildes
    .replace(/[^a-zA-Z]/g, "")      // Quita todo lo que no sea letra
    .toUpperCase();

  // 4. Tomar las primeras 4 letras del producto limpio
  const prodPart = cleanNombre.substring(0, 4).padEnd(4, 'X');

  // 5. Manejar el ID (Si es numérico, rellenar con ceros; si es UUID, tomar el final)
  let idPart: string;
  const idStr = id.toString();

  if (idStr.includes('-')) {
    // Es un UUID
    idPart = idStr.split('-').pop()?.substring(0, 4).toUpperCase() || '0000';
  } else {
    // Es un Serial/Numérico: lo formateamos a 3 dígitos (ej: 1 -> 001)
    idPart = idStr.padStart(3, '0');
  }

  // Resultado: CAT-PROD-ID (Ejemplo: BLU-BSLV-001)
  return `${catPart}-${prodPart}-${idPart}`;
}