'use client';

import { useState } from 'react';
import { Package, MapPin, Calendar, AlertTriangle } from 'lucide-react';
import type { DespachoFlat } from '@/lib/services/despachos.service';
import BadgeEstado from './BadgeEstado';
import EtaWidget from './EtaWidget';
import ModalIncidencia from './ModalIncidencia';
import MapaRuta from './MapaRuta';
import { formatFecha } from '@/lib/helpers/despachos-helpers';

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
                  {despacho.pedido_ids.length === 1
                    ? <>Pedido <span className="font-semibold text-[#B8962D]">#{despacho.pedido_ids[0]}</span></>
                    : <>{despacho.pedido_ids.length} pedidos agrupados</>
                  }
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-end gap-1 text-[10px] text-[#9A8080] uppercase tracking-wider mb-0.5">
                <Calendar className="w-3 h-3" /> Entrega est.
              </div>
              <p className="text-sm font-bold text-[#4A3737]">
                {formatFecha(despacho.fecha_entrega)}
              </p>
            </div>
          </div>
        </div>

        {/* ── Destino + Mapa ── */}
        <div className="px-6 pt-5 pb-2">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-[#B8962D] flex-shrink-0" />
            <span className="text-xs font-medium text-[#6D5A5A]">
              {despacho.direccion_entrega}
            </span>
          </div>

          <MapaRuta despacho={despacho} />

          <div className="mt-4">
            <EtaWidget despacho={despacho} />
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 mt-2 bg-[#FAF5F5] border-t border-[#F0E4E4] flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-[#8A7676] italic">
            * Tiempos estimados sujetos a condiciones logísticas.
          </p>
          <button
            onClick={() => setModalAbierto(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#A32D2D] hover:text-[#7A1F1F] transition-colors uppercase tracking-wider"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Reportar incidencia
          </button>
        </div>
      </article>
    </>
  );
}