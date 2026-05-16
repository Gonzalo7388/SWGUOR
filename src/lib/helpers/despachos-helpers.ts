import type { DespachoGrupo, DespachoFlat, SeguimientoDespacho } from '@/lib/services/despachos.service';

// ─── Formateo de fechas ───────────────────────────────────────────────────────
export function formatFecha(fecha: string | null | undefined): string {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function formatFechaHora(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-PE', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Código visual del despacho ──────────────────────────────────────────────
export function generarCodigoDespacho(id: number): string {
  return `DES-${String(id).padStart(4, '0')}`;
}

// ─── Aplanar DespachoGrupo → DespachoFlat ────────────────────────────────────
export function aplanarDespacho(grupo: DespachoGrupo): DespachoFlat {
  // Ordenar seguimientos por fecha desc y tomar el más reciente
  const seguimientos = [...(grupo.seguimiento_despachos ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return {
    id: grupo.id,
    codigo: `DES-${String(grupo.id).padStart(4, '0')}`,
    estado: grupo.estado,
    direccion_entrega: grupo.direccion_entrega,
    fecha_despacho: grupo.fecha_despacho,
    fecha_entrega: grupo.fecha_entrega,
    pedido_ids: grupo.despachos_grupo_pedidos.map(dgp => dgp.pedido_id),
    ultimo_estado: seguimientos[0] ?? null,
  };
}

// ─── Porcentaje de progreso del despacho ─────────────────────────────────────
const ORDEN_ESTADOS: Record<string, number> = {
  pendiente: 0,
  preparando: 25,
  en_ruta: 60,
  incidencia: 60,  // mismo nivel que en_ruta, bloqueado
  entregado: 100,
};

export function calcularPorcentajeRuta(estado: DespachoFlat['estado']): number {
  return ORDEN_ESTADOS[estado] ?? 0;
}

// ─── Label legible del estado ─────────────────────────────────────────────────
const ESTADO_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  preparando: 'Preparando',
  en_ruta: 'En ruta',
  incidencia: 'Incidencia',
  entregado: 'Entregado',
};

export function labelEstado(estado: string): string {
  return ESTADO_LABELS[estado] ?? estado;
}

// ─── Último seguimiento formateado ───────────────────────────────────────────
export function textoUltimoEstado(ultimo: SeguimientoDespacho | null): string {
  if (!ultimo) return 'Sin actualizaciones';
  const fecha = formatFechaHora(ultimo.created_at);
  return ultimo.notas ? `${fecha} — ${ultimo.notas}` : fecha;
}