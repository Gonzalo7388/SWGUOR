'use client';

import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import type { DespachoFlat } from '@/lib/services/despachosServices';
import { tieneCoordenadasCompletas } from '@/lib/helpers/despachos-helpers';

interface MapaRutaProps {
  despacho: DespachoFlat;
}

// ─── Iconos SVG inline para Leaflet ──────────────────────────────────────────
function makeIconHtml(html: string, size: number) {
  return { html, size };
}

const ICON_ORIGEN = makeIconHtml(
  `<div style="width:32px;height:32px;border-radius:50%;background:#4A3737;border:3px solid #D4AF37;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.25);">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  </div>`,
  32,
);

const ICON_DESTINO = makeIconHtml(
  `<div style="width:36px;height:36px;border-radius:50%;background:#B8962D;border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(184,150,45,.5);">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  </div>`,
  36,
);

const ICON_CAMION = makeIconHtml(
  `<div style="width:40px;height:40px;border-radius:50%;background:#D4AF37;border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 12px rgba(212,175,55,.6);">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  </div>`,
  40,
);

export default function MapaRuta({ despacho }: MapaRutaProps) {
  const mapRef         = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel  = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const script   = document.createElement('script');
    script.src     = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload  = () => {
      if (!mapRef.current) return;

      const L = (window as Window & { L: typeof import('leaflet') }).L;
      const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false });
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      function makeIcon(cfg: { html: string; size: number }) {
        return L.divIcon({
          className:  '',
          html:       cfg.html,
          iconSize:   [cfg.size, cfg.size],
          iconAnchor: [cfg.size / 2, cfg.size / 2],
        });
      }

      if (!tieneCoordenadasCompletas(despacho)) {
        map.setView([-12.0464, -77.0428], 12);
        setCargado(true);
        return;
      }

      const origen  = L.latLng(despacho.origen_lat!,  despacho.origen_lng!);
      const destino = L.latLng(despacho.destino_lat!, despacho.destino_lng!);

      L.marker(origen,  { icon: makeIcon(ICON_ORIGEN)  })
        .addTo(map)
        .bindPopup(`<b>${despacho.origen_label}</b><br/>Punto de origen`);

      L.marker(destino, { icon: makeIcon(ICON_DESTINO) })
        .addTo(map)
        .bindPopup(`<b>Destino</b><br/>${despacho.destino_label}`);

      const hayPos =
        despacho.pos_actual_lat != null && despacho.pos_actual_lng != null;

      if (hayPos) {
        const pos = L.latLng(despacho.pos_actual_lat!, despacho.pos_actual_lng!);

        L.polyline([origen, pos],    { color: '#4A3737', weight: 4, opacity: 0.7 }).addTo(map);
        L.polyline([pos,   destino], { color: '#D4AF37', weight: 3, opacity: 0.6, dashArray: '8, 6' }).addTo(map);

        L.marker(pos, { icon: makeIcon(ICON_CAMION) })
          .addTo(map)
          .bindPopup(`<b>Transportista</b><br/>${despacho.transportista ?? ''}`);

        L.circle(pos, {
          radius: 300, color: '#D4AF37',
          fillColor: '#D4AF37', fillOpacity: 0.08, weight: 1,
        }).addTo(map);

        map.fitBounds(L.latLngBounds([origen, pos, destino]), { padding: [40, 40] });
      } else {
        L.polyline([origen, destino], {
          color: '#D4AF37', weight: 3, opacity: 0.5, dashArray: '10, 8',
        }).addTo(map);
        map.fitBounds(L.latLngBounds([origen, destino]), { padding: [60, 60] });
      }

      setCargado(true);
    };

    document.head.appendChild(script);

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [despacho]);

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-[#E7D7D7]"
      style={{ height: 320 }}
    >
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      {!cargado && (
        <div className="absolute inset-0 bg-[#FAF5F5] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-[#8A7676]">Cargando mapa…</p>
          </div>
        </div>
      )}
    </div>
  );
}