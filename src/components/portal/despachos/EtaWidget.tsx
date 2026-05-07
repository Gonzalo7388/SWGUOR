import { Clock3 } from 'lucide-react';
import type { DespachoFlat } from '@/lib/services/despachosServices';
import { formatDistancia, formatTiempo } from '@/lib/helpers/despachos-helpers';

interface EtaWidgetProps {
  despacho: DespachoFlat;
}

export default function EtaWidget({ despacho }: EtaWidgetProps) {
  if (despacho.estado === 'pendiente' || despacho.estado === 'preparando') {
    return (
      <div className="flex items-center gap-2 bg-[#F5EBEB] border border-[#E7D7D7] rounded-xl px-4 py-3">
        <Clock3 className="w-4 h-4 text-[#8A7676]" />
        <p className="text-xs text-[#6D5A5A]">
          {despacho.estado === 'pendiente'
            ? 'Pendiente de preparación — en almacén.'
            : 'Pendiente de despacho — aún en preparación.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-[#FDF6E3] border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-center">
        <p className="text-[10px] uppercase tracking-widest text-[#9A8080] mb-1">
          Distancia
        </p>
        <p className="text-2xl font-bold text-[#4A3737]">
          {formatDistancia(despacho.distancia_km)}
        </p>
      </div>
      <div className="bg-[#FDF6E3] border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-center">
        <p className="text-[10px] uppercase tracking-widest text-[#9A8080] mb-1">
          Tiempo est.
        </p>
        <p className="text-2xl font-bold text-[#4A3737]">
          {formatTiempo(despacho.tiempo_min)}
        </p>
      </div>
    </div>
  );
}