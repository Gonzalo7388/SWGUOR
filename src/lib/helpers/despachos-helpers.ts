import type { Despacho, DespachoFlat, DespachoTracking } from '@/lib/services/despachosServices';

// ─── Formateo de fechas ───────────────────────────────────────────────────────
export function formatFecha(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-PE', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  });
}

export function formatFechaHora(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-PE', {
    day:    'numeric',
    month:  'short',
    hour:   '2-digit',
    minute: '2-digit',
  });
}

// ─── Código visual del despacho ──────────────────────────────────────────────
// Genera "DES-0042" a partir del id numérico
export function generarCodigoDespacho(id: number): string {
  return `DES-${String(id).padStart(4, '0')}`;
}

// ─── Aplanar Despacho + DespachoTracking → DespachoFlat ──────────────────────
// Centraliza el mapeo para que ningún componente lo repita
export function aplanarDespacho(despacho: Despacho): DespachoFlat {
  const t: DespachoTracking | null = despacho.despachos_tracking;

  return {
    id:               despacho.id,
    codigo:           generarCodigoDespacho(despacho.id),
    pedido_id:        despacho.pedido_id,
    pedido_codigo:    despacho.pedidos
                        ? `ORD-${String(despacho.pedidos.id).padStart(4, '0')}`
                        : null,
    estado:           despacho.estado,
    fecha_entrega_est: despacho.fecha_entrega_est,

    // Tracking — con fallbacks seguros
    origen_label:   t?.origen_label   ?? 'Almacén GUOR',
    origen_lat:     t?.origen_lat     ?? null,
    origen_lng:     t?.origen_lng     ?? null,
    destino_label:  t?.destino_label  ?? despacho.direccion_entrega,
    destino_lat:    t?.destino_lat    ?? null,
    destino_lng:    t?.destino_lng    ?? null,
    pos_actual_lat: t?.pos_actual_lat ?? null,
    pos_actual_lng: t?.pos_actual_lng ?? null,
    distancia_km:   t?.distancia_km   ?? null,
    tiempo_min:     t?.tiempo_min     ?? null,
    transportista:  t?.transportista  ?? null,
    guia:           t?.guia           ?? null,
    total_items:    t?.total_items    ?? null,
  };
}

// ─── Helpers de métricas ──────────────────────────────────────────────────────
export function formatDistancia(km: number | null): string {
  if (km == null) return '—';
  return km >= 1 ? `${km.toFixed(1)} km` : `${Math.round(km * 1000)} m`;
}

export function formatTiempo(min: number | null): string {
  if (min == null) return '—';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

// ─── Hay coordenadas válidas para mostrar el mapa ────────────────────────────
export function tieneCoordenadasCompletas(d: DespachoFlat): boolean {
  return (
    d.origen_lat  != null && d.origen_lng  != null &&
    d.destino_lat != null && d.destino_lng != null
  );
}

// ─── Porcentaje de progreso del despacho ─────────────────────────────────────
export function calcularPorcentajeRuta(d: DespachoFlat): number {
  if (!tieneCoordenadasCompletas(d)) return 0;
  if (d.estado === 'entregado') return 100;
  if (d.estado === 'pendiente' || d.estado === 'preparando') return 0;

  // Si no hay posición actual, estimamos por estado
  if (d.pos_actual_lat == null || d.pos_actual_lng == null) {
    return d.estado === 'en_ruta' ? 30 : 0;
  }

  // Distancia euclídea simple como aproximación
  const totalLat  = Math.abs(d.destino_lat! - d.origen_lat!);
  const totalLng  = Math.abs(d.destino_lng! - d.origen_lng!);
  const recorLat  = Math.abs(d.pos_actual_lat - d.origen_lat!);
  const recorLng  = Math.abs(d.pos_actual_lng - d.origen_lng!);

  const total   = Math.sqrt(totalLat ** 2 + totalLng ** 2);
  const recorr  = Math.sqrt(recorLat ** 2 + recorLng ** 2);

  if (total === 0) return 100;
  return Math.min(100, Math.round((recorr / total) * 100));
}