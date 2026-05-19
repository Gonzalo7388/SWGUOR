'use client';

import { Clock3, CheckCircle2, Truck, AlertCircle } from 'lucide-react';
import type { DespachoFlat } from '@/lib/services/despachos.service';
import { formatFecha } from '@/lib/helpers/despachos-helpers';

interface EtaWidgetProps {
  despacho: DespachoFlat;
}

export default function EtaWidget({ despacho }: EtaWidgetProps) {
  const { estado, ultimo_estado, fecha_entrega } = despacho;

  // Mensaje según estado
  const config: Record<string, { icon: React.ReactNode; mensaje: string; color: string }> = {
    pendiente: {
      icon: <Clock3 className="w-4 h-4 text-[#8A7676]" />,
      mensaje: 'Pendiente de preparación — en almacén.',
      color: 'bg-[#F5EBEB] border-[#E7D7D7]',
    },
    preparando: {
      icon: <Clock3 className="w-4 h-4 text-[#B8962D]" />,
      mensaje: 'En preparación — próximamente en ruta.',
      color: 'bg-[#FDF6E3] border-[#D4AF37]/30',
    },
    en_ruta: {
      icon: <Truck className="w-4 h-4 text-[#4A3737]" />,
      mensaje: `En camino — entrega estimada ${formatFecha(fecha_entrega)}.`,
      color: 'bg-[#FDF6E3] border-[#D4AF37]/30',
    },
    entregado: {
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      mensaje: `Entregado el ${formatFecha(fecha_entrega)}.`,
      color: 'bg-emerald-50 border-emerald-100',
    },
    incidencia: {
      icon: <AlertCircle className="w-4 h-4 text-red-500" />,
      mensaje: 'Incidencia registrada — contacta a soporte.',
      color: 'bg-red-50 border-red-100',
    },
  };

  const current = config[estado] ?? config.pendiente;

  return (
    <div className={`flex flex-col gap-2 border rounded-xl px-4 py-3 ${current.color}`}>
      <div className="flex items-center gap-2">
        {current.icon}
        <p className="text-xs text-[#6D5A5A]">{current.mensaje}</p>
      </div>

      {/* Última nota de seguimiento */}
      {ultimo_estado?.notas && (
        <p className="text-[11px] text-[#9A8080] italic pl-6">
          "{ultimo_estado.notas}"
        </p>
      )}
    </div>
  );
}