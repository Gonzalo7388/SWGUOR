import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type EstadoDespacho =
  | 'pendiente'
  | 'preparando'
  | 'en_ruta'
  | 'entregado'
  | 'incidencia';

export type TipoIncidenciaCliente =
  | 'defecto_confeccion'
  | 'pedido_equivocado'
  | 'talla_incorrecta'
  | 'cantidad_incorrecta'
  | 'dano_en_transporte'
  | 'empaque_defectuoso'
  | 'otro';

export type SeveridadIncidencia = 'baja' | 'media' | 'alta' | 'critica';

export interface DespachoTracking {
  id:                 number;
  despacho_id:        number;
  origen_label:       string | null;
  origen_lat:         number | null;
  origen_lng:         number | null;
  destino_label:      string | null;
  destino_lat:        number | null;
  destino_lng:        number | null;
  pos_actual_lat:     number | null;
  pos_actual_lng:     number | null;
  pos_actualizada_at: string | null;
  distancia_km:       number | null;
  tiempo_min:         number | null;
  transportista:      string | null;
  guia:               string | null;
  total_items:        number | null;
}

export interface Despacho {
  id:                number;
  pedido_id:         number;
  estado:            EstadoDespacho;
  direccion_entrega: string;
  fecha_despacho:    string;
  fecha_entrega_est: string | null;
  created_at:        string;
  updated_at:        string;
  pedidos: {
    id:         number;
    cliente_id: number | null;
  } | null;
  despachos_tracking: DespachoTracking | null;
}

// Vista aplanada para los componentes (join ya resuelto)
export interface DespachoFlat {
  id:                number;
  codigo:            string;          // "DES-0001"
  pedido_id:         number;
  pedido_codigo:     string | null;
  estado:            EstadoDespacho;
  fecha_entrega_est: string | null;
  origen_label:      string;
  origen_lat:        number | null;
  origen_lng:        number | null;
  destino_label:     string;
  destino_lat:       number | null;
  destino_lng:       number | null;
  pos_actual_lat:    number | null;
  pos_actual_lng:    number | null;
  distancia_km:      number | null;
  tiempo_min:        number | null;
  transportista:     string | null;
  guia:              string | null;
  total_items:       number | null;
}

export interface CreateIncidenciaPayload {
  pedido_id:     number;
  tipo:          TipoIncidenciaCliente;
  severidad:     SeveridadIncidencia;
  descripcion:   string;
  evidencia_url: string[];
}

export interface UpdatePosicionPayload {
  despacho_id:    number;
  pos_actual_lat: number;
  pos_actual_lng: number;
  distancia_km?:  number;
  tiempo_min?:    number;
}

// ─── Select base ──────────────────────────────────────────────────────────────

const DESPACHO_SELECT = `
  id,
  pedido_id,
  estado,
  direccion_entrega,
  fecha_despacho,
  fecha_entrega,
  created_at,
  updated_at,
  pedidos (
    id,
    cliente_id
  ),
  despachos_tracking (
    id,
    despacho_id,
    origen_label,
    origen_lat,
    origen_lng,
    destino_label,
    destino_lat,
    destino_lng,
    pos_actual_lat,
    pos_actual_lng,
    pos_actualizada_at,
    distancia_km,
    tiempo_min,
    transportista,
    guia,
    total_items
  )
` as const;

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getDespachoActivos(): Promise<Despacho[]> {
  const { data, error } = await supabase
    .from('despachos')
    .select(DESPACHO_SELECT)
    .not('estado', 'eq', 'entregado')
    .order('id', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Despacho[];
}

export async function getDespachoById(id: number): Promise<Despacho | null> {
  const { data, error } = await supabase
    .from('despachos')
    .select(DESPACHO_SELECT)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  return data as unknown as Despacho;
}

// ─── Incidencias ──────────────────────────────────────────────────────────────

export async function uploadEvidencia(pedidoId: number, file: File): Promise<string> {
  const ext  = file.name.split('.').pop();
  const path = `incidencias/${pedidoId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('evidencias')
    .upload(path, file, { upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from('evidencias').getPublicUrl(path);
  return data.publicUrl;
}

export async function createIncidenciaCliente(
  payload: CreateIncidenciaPayload,
): Promise<void> {
  const { error } = await supabase.from('incidencias_cliente').insert({
    pedido:        payload.pedido_id,
    tipo:          payload.tipo,
    descripcion:   payload.descripcion,
    evidencia_url: payload.evidencia_url,
    estado:        'abierta',
  });

  if (error) throw new Error(error.message);
}

// ─── Tracking GPS ─────────────────────────────────────────────────────────────

export async function updatePosicionTracking(
  input: UpdatePosicionPayload,
): Promise<void> {
  const { error } = await supabase
    .from('despachos_tracking')
    .update({
      pos_actual_lat:     input.pos_actual_lat,
      pos_actual_lng:     input.pos_actual_lng,
      distancia_km:       input.distancia_km,
      tiempo_min:         input.tiempo_min,
      pos_actualizada_at: new Date().toISOString(),
    })
    .eq('despacho_id', input.despacho_id);

  if (error) throw new Error(error.message);
}

export function subscribeToTracking(
  despachoId: number,
  onUpdate: (tracking: DespachoTracking) => void,
) {
  const channel = supabase
    .channel(`tracking-${despachoId}`)
    .on(
      'postgres_changes',
      {
        event:  'UPDATE',
        schema: 'public',
        table:  'despachos_tracking',
        filter: `despacho_id=eq.${despachoId}`,
      },
      (payload) => onUpdate(payload.new as DespachoTracking),
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}