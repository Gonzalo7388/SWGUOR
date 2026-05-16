import { getSupabaseBrowserClient } from "@/lib/supabase";

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

// ── Tipos nuevos basados en despachos_grupos ──────────────────────────────────

export interface SeguimientoDespacho {
  id: number;
  grupo_despacho_id: number;
  status: EstadoDespacho;
  notas: string | null;
  creado_por: string | null;
  created_at: string;
  updated_at: string;
}

export interface DespachoGrupoPedido {
  id: number;
  grupo_despacho_id: number;
  despacho_id: number;
  pedido_id: number;
  created_at: string;
}

export interface DespachoGrupo {
  id: number;
  direccion_entrega: string;
  direccion_entrega_original: string | null;
  estado: EstadoDespacho;
  fecha_despacho: string;
  fecha_entrega: string | null;
  created_at: string;
  updated_at: string;
  despachos_grupo_pedidos: DespachoGrupoPedido[];
  seguimiento_despachos: SeguimientoDespacho[];
}

// Vista aplanada para los componentes
export interface DespachoFlat {
  id: number;
  codigo: string;           // "DES-0001"
  estado: EstadoDespacho;
  direccion_entrega: string;
  fecha_despacho: string;
  fecha_entrega: string | null;
  pedido_ids: number[];
  ultimo_estado: SeguimientoDespacho | null;
}

export interface CreateIncidenciaPayload {
  pedido_id: number;
  tipo: TipoIncidenciaCliente;
  severidad: SeveridadIncidencia;
  descripcion: string;
  evidencia_url: string[];
}

// ─── Select base ──────────────────────────────────────────────────────────────

const DESPACHO_GRUPO_SELECT = `
  id,
  direccion_entrega,
  direccion_entrega_original,
  estado,
  fecha_despacho,
  fecha_entrega,
  created_at,
  updated_at,
  despachos_grupo_pedidos (
    id,
    grupo_despacho_id,
    despacho_id,
    pedido_id,
    created_at
  ),
  seguimiento_despachos (
    id,
    grupo_despacho_id,
    status,
    notas,
    creado_por,
    created_at,
    updated_at
  )
` as const;

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getDespachoActivos(clienteId?: number): Promise<DespachoGrupo[]> {
  const supabase = getSupabaseBrowserClient();

  let query = supabase
    .from('despachos_grupos')
    .select(DESPACHO_GRUPO_SELECT)
    .not('estado', 'eq', 'entregado')
    .order('id', { ascending: false });

  // Si hay clienteId filtramos a través de la join table
  if (clienteId) {
    // Primero obtenemos los grupo_despacho_id que pertenecen al cliente
    const { data: grupos, error: gErr } = await supabase
      .from('despachos_grupo_pedidos')
      .select('grupo_despacho_id, pedidos!inner(cliente_id)')
      .eq('pedidos.cliente_id', clienteId);

    if (gErr) throw new Error(gErr.message);

    const ids = [...new Set((grupos ?? []).map((g: any) => g.grupo_despacho_id))];
    if (ids.length === 0) return [];

    query = supabase
      .from('despachos_grupos')
      .select(DESPACHO_GRUPO_SELECT)
      .in('id', ids)
      .not('estado', 'eq', 'entregado')
      .order('id', { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as DespachoGrupo[];
}

export async function getDespachoById(id: number): Promise<DespachoGrupo | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('despachos_grupos')
    .select(DESPACHO_GRUPO_SELECT)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  return data as unknown as DespachoGrupo;
}

// ─── Realtime ─────────────────────────────────────────────────────────────────

export function subscribeToGrupo(
  grupoId: number,
  onUpdate: (seguimiento: SeguimientoDespacho) => void,
) {
  const supabase = getSupabaseBrowserClient();
  const channel = supabase
    .channel(`seguimiento-despacho-${grupoId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'seguimiento_despachos',
        filter: `grupo_despacho_id=eq.${grupoId}`,
      },
      (payload) => onUpdate(payload.new as SeguimientoDespacho),
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

// ─── Incidencias ──────────────────────────────────────────────────────────────

export async function uploadEvidencia(pedidoId: number, file: File): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  const ext = file.name.split('.').pop();
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
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from('incidencias_cliente').insert({
    pedido_id: payload.pedido_id,
    tipo: payload.tipo,
    descripcion: payload.descripcion,
    evidencia_url: payload.evidencia_url,
    estado: 'abierta',
  });

  if (error) throw new Error(error.message);
}