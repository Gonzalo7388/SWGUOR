import type { ApiResponse, Medida } from '@/lib/schemas/fichas-tecnicas';

const FICHA_API  = '/api/admin/fichas-tecnicas';
const MEDIDA_API = '/api/admin/ficha-medidas';

export async function fetchFichaPorProducto(producto_id: string): Promise<any | null> {
  const res = await fetch(`${FICHA_API}?producto_id=${producto_id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar ficha');
  const result = await res.json();
  return result.data ?? null;
}

export async function createFichaTecnica(data: {
  producto_id:           string | number;
  version?:              string;
  descripcion_detallada?: string;
  sam_total?:            number;
  costo_estimado?:       number;
  ficha_url?:            string;
  imagen_geometral?:     string;
}): Promise<ApiResponse> {
  const res = await fetch(FICHA_API, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  });
  return res.json();
}

export async function updateFichaTecnica(
  id: string,
  data: Partial<{
    version:               string;
    descripcion_detallada: string;
    sam_total:             number;
    costo_estimado:        number;
    ficha_url:             string;
    imagen_geometral:      string;
    estado:                string;
  }>
): Promise<ApiResponse> {
  const res = await fetch(FICHA_API, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ id, ...data }),
  });
  return res.json();
}

export async function fetchMedidas(ficha_id: string): Promise<any[]> {
  const res = await fetch(`${MEDIDA_API}?ficha_id=${ficha_id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar medidas');
  const result = await res.json();
  return result.data ?? [];
}

export async function saveMedidas(
  ficha_id: string,
  medidas:  Omit<Medida, 'id'>[]
): Promise<ApiResponse> {
  const res = await fetch(MEDIDA_API, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ ficha_id, medidas }),
  });
  return res.json();
}

export async function deleteMedida(id: string): Promise<ApiResponse> {
  const res = await fetch(`${MEDIDA_API}?id=${id}`, { method: 'DELETE' });
  return res.json();
}