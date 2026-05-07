'use client';

import { useState } from 'react';
import { Package, MapPin, Calendar, Truck, Navigation, FileText, AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { DespachoFlat } from '@/lib/services/despachosServices';
import BadgeEstado    from './BadgeEstado';
import EtaWidget     from './EtaWidget';
import ModalIncidencia from './ModalIncidencia';
import { formatFecha } from '@/lib/helpers/despachos-helpers';

// Leaflet no es compatible con SSR → carga dinámica
const MapaRuta = dynamic(() => import('./MapaRuta'), { ssr: false });

interface CardDespachoProps {
  despacho: DespachoFlat;
}

export default function CardDespacho({ despacho }: CardDespachoProps) {
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <>
      {modalAbierto && (
        <ModalIncidencia
          despacho={despacho}
          onClose={() => setModalAbierto(false)}
        />
      )}

      <article className="bg-white border border-[#E7D7D7] rounded-2xl shadow-[0_4px_20px_rgba(74,55,55,0.06)] overflow-hidden">

        {/* ── Header ── */}
        <div className="px-6 py-5 border-b border-[#F0E4E4]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#F5EBEB] border border-[#E7D7D7]">
                <Package className="w-5 h-5 text-[#B8962D]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="font-bold text-[#3A2A2A] text-base">{despacho.codigo}</h2>
                  <BadgeEstado estado={despacho.estado} />
                </div>
                <p className="text-xs text-[#8A7676]">
                  Vinculado a{' '}
                  <span className="font-semibold text-[#B8962D]">
                    {despacho.pedido_codigo ?? '—'}
                  </span>
                  {despacho.total_items != null && ` · ${despacho.total_items} unidades`}
                </p>
              </div>
            </div>

            <div className="flex gap-5 text-right">
              <div>
                <div className="flex items-center justify-end gap-1 text-[10px] text-[#9A8080] uppercase tracking-wider mb-0.5">
                  <Calendar className="w-3 h-3" /> Entrega est.
                </div>
                <p className="text-sm font-bold text-[#4A3737]">
                  {formatFecha(despacho.fecha_entrega_est)}
                </p>
              </div>
              <div>
                <div className="flex items-center justify-end gap-1 text-[10px] text-[#9A8080] uppercase tracking-wider mb-0.5">
                  <Truck className="w-3 h-3" /> Transportista
                </div>
                <p className="text-sm font-bold text-[#4A3737]">
                  {despacho.transportista ?? '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Ruta + Mapa ── */}
        <div className="px-6 pt-5 pb-2">
          <div className="flex items-center gap-3 mb-4 text-sm">
            <div className="flex items-center gap-1.5 text-[#6D5A5A]">
              <div className="w-2.5 h-2.5 rounded-full bg-[#4A3737] border-2 border-[#D4AF37] flex-shrink-0" />
              <span className="font-medium">{despacho.origen_label}</span>
            </div>
            <div className="flex-1 border-t border-dashed border-[#D4AF37]/40" />
            <div className="flex items-center gap-1.5 text-[#6D5A5A]">
              <MapPin className="w-3.5 h-3.5 text-[#B8962D] flex-shrink-0" />
              <span className="font-medium text-xs">{despacho.destino_label}</span>
            </div>
          </div>

          <MapaRuta despacho={despacho} />

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Navigation className="w-4 h-4 text-[#B8962D]" />
              <p className="text-xs font-semibold uppercase tracking-widest text-[#6D5A5A]">
                Estimado de llegada
              </p>
            </div>
            <EtaWidget despacho={despacho} />
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 mt-2 bg-[#FAF5F5] border-t border-[#F0E4E4] flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-[#8A7676] italic">
            * Tiempos estimados sujetos a condiciones logísticas.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalAbierto(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-[#A32D2D] hover:text-[#7A1F1F] transition-colors uppercase tracking-wider"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Reportar incidencia
            </button>
            {despacho.guia && (
              <>
                <span className="text-[#E7D7D7]">|</span>
                <button className="flex items-center gap-1.5 text-xs font-bold text-[#B8962D] hover:text-[#996B1E] transition-colors uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5" />
                  Ver guía {despacho.guia}
                </button>
              </>
            )}
          </div>
        </div>
      </article>
    </>
  );
}