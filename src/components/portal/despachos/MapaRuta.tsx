'use client';

import { MapPin, Building2 } from 'lucide-react';
import type { DespachoFlat } from '@/lib/services/despachos.service';

interface MapaRutaProps {
  despacho: DespachoFlat;
}

export default function MapaRuta({ despacho }: MapaRutaProps) {
  return (
    <div className="rounded-xl border border-[#E7D7D7] bg-[#FAF5F5] px-5 py-4 flex items-center gap-4">
      <div className="flex flex-col items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-[#4A3737] border-2 border-[#D4AF37]" />
        <div className="w-px flex-1 min-h-[28px] border-l-2 border-dashed border-[#D4AF37]/50" />
        <MapPin className="w-4 h-4 text-[#B8962D]" />
      </div>
      <div className="flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-[#6D5A5A]" />
          <span className="text-xs font-semibold text-[#4A3737]">Almacén GUOR</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-[#B8962D]" />
          <span className="text-xs font-semibold text-[#4A3737]">
            {despacho.direccion_entrega}
          </span>
        </div>
      </div>
    </div>
  );
}