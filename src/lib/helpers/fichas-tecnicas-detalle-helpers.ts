const API = '/api/admin/fichas-tecnicas/detalle';

export async function fetchFichaDetalle(ficha_id: string): Promise<any[]> {
  const res = await fetch(`${API}?ficha_id=${ficha_id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar detalle de ficha');
  const result = await res.json();
  return result.data ?? [];
}

export async function saveFichaDetalle(
  ficha_id: string,
  items: {
    material_id?:           string | number;
    insumo_id?:             string | number;
    cantidad_consumo:       number;
    porcentaje_desperdicio?: number;
    observaciones?:         string;
  }[]
) {
  const res = await fetch(API, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ ficha_id, items }),
  });
  return res.json();
}

export async function deleteFichaDetalleItem(id: string) {
  const res = await fetch(`${API}?id=${id}`, { method: 'DELETE' });
  return res.json();
}