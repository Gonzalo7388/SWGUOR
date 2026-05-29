import { getSupabaseBrowserClient } from "@/lib/supabase";

const supabase = getSupabaseBrowserClient();

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type EstadoPedido =
  | 'pendiente'
  | 'en_produccion'
  | 'listo_para_despacho'
  | 'entregado'
  | 'cancelado'
  | 'pagado';

export interface SeguimientoPedido {
  id: number;
  pedido_id: number;
  status: EstadoPedido;
  notas: string | null;
  created_at: string;
  updated_at: string;
  creado_por: string | null;
  usuarios?: {
    nombre_completo: string | null;
  } | null;
}

export interface Pedido {
  id: number;
  estado: EstadoPedido;
  created_at: string;
  fecha_entrega_est: string | null;    // fecha_entrega en tabla
  total_unidades: number;
  notas_cliente: string | null;
  clientes: {
    razon_social: string | null;
    nombre_comercial: string | null;
    email: string | null;
  } | null;
  seguimiento_pedido: SeguimientoPedido[];
}

// Vista lista para la UI
export interface PedidoConSeguimiento {
  id: number;
  codigo: string;
  estado: EstadoPedido;
  cliente: string;
  email: string | null;
  created_at: string;
  fecha_entrega_est: string | null;
  total_unidades: number;
  notas_cliente: string | null;
  historial: SeguimientoPedido[];
  ultimaActualizacion: string | null;
}

// ─── Select base ──────────────────────────────────────────────────────────────

const PEDIDO_SELECT = `
  id,
  estado,
  created_at,
  total_unidades,
  notas_cliente,
  clientes (
    razon_social,
    nombre_comercial,
    email
  ),
  seguimiento_pedido (
    id,
    pedido_id,
    status,
    notas,
    created_at,
    updated_at,
    creado_por
  )
` as const;

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getPedidosActivos(clienteId?: number): Promise<PedidoConSeguimiento[]> {
  const supabase = getSupabaseBrowserClient();
  let query = supabase
    .from('pedidos')
    .select(PEDIDO_SELECT)
    .not('estado', 'in', '("entregado","cancelado")');

  if (clienteId) {
    query = query.eq('cliente_id', clienteId);
  }

  const { data, error } = await query.order('id', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapearPedido);
}

export async function getPedidoById(
  id: number,
): Promise<PedidoConSeguimiento | null> {
  const { data, error } = await supabase
    .from('pedidos')
    .select(PEDIDO_SELECT)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  return mapearPedido(data);
}

// ─── Realtime ─────────────────────────────────────────────────────────────────

export function subscribeSeguimiento(
  pedidoId: number,
  onInsert: (row: SeguimientoPedido) => void,
) {
  const supabase = getSupabaseBrowserClient();
  const channel = supabase
    .channel(`seguimiento-${pedidoId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'seguimiento_pedido',
        filter: `pedido_id=eq.${pedidoId}`,
      },
      (payload) => onInsert(payload.new as SeguimientoPedido),
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

// ─── Mapper interno ───────────────────────────────────────────────────────────

interface PedidoRaw {
  id: number;
  estado: EstadoPedido | null;
  created_at: string | null;
  fecha_entrega?: string | null;
  total_unidades: number | null;
  notas_cliente: string | null;
  clientes: {
    razon_social: string | null;
    nombre_comercial: string | null;
    email: string | null;
  } | null;
  seguimiento_pedido: SeguimientoPedido[];
}

function mapearPedido(raw: PedidoRaw): PedidoConSeguimiento {
  const historial: SeguimientoPedido[] = (raw.seguimiento_pedido ?? []).sort(
    (a: SeguimientoPedido, b: SeguimientoPedido) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const ultima = historial.at(-1)?.created_at ?? raw.created_at;

  return {
    id: raw.id,
    codigo: `ORD-${String(raw.id).padStart(4, '0')}`,
    estado: raw.estado ?? 'pendiente',
    cliente:
      raw.clientes?.nombre_comercial ??
      raw.clientes?.razon_social ??
      'Cliente',
    email: raw.clientes?.email ?? null,
    created_at: raw.created_at ?? new Date().toISOString(),
    fecha_entrega_est: raw.fecha_entrega ?? null,
    total_unidades: raw.total_unidades ?? 0,
    notas_cliente: raw.notas_cliente ?? null,
    historial,
    ultimaActualizacion: ultima,
  };
}