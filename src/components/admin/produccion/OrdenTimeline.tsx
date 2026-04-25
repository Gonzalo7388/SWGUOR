"use client";

import { CheckCircle2, Clock, AlertCircle, MapPin } from "lucide-react";
import { ETAPA_LABELS } from "@/lib/schemas/ordenes-produccion";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TimelineEvent {
  id: string;
  etapa: string;
  observaciones: string | null;
  created_at: string;
  activo: boolean;
}

export default function OrdenTimeline({ events }: { events: TimelineEvent[] }) {
  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-400 bg-slate-50 rounded-2xl border border-dashed">
        <AlertCircle size={24} className="mb-2 opacity-20" />
        <p className="text-xs font-medium">No hay historial de seguimiento</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:left-[17px] before:h-full before:w-[2px] before:bg-slate-100">
      {events.map((event, idx) => {
        const isLatest = idx === 0;
        const Icon = isLatest ? Clock : CheckCircle2;

        return (
          <div key={event.id} className="relative pl-12 group">
            {/* Indicador visual (Círculo) */}
            <div className={`absolute left-0 top-0 w-9 h-9 rounded-full border-4 border-white flex items-center justify-center z-10 transition-transform group-hover:scale-110 shadow-sm ${
              isLatest 
                ? "bg-rose-600 text-white ring-4 ring-rose-50" 
                : "bg-emerald-100 text-emerald-600"
            }`}>
              <Icon size={16} />
            </div>

            {/* Contenido del Evento */}
            <div className={`p-4 rounded-2xl border transition-all ${
              isLatest 
                ? "bg-white border-rose-100 shadow-md shadow-rose-50" 
                : "bg-slate-50/50 border-transparent opacity-80"
            }`}>
              <div className="flex justify-between items-start mb-1">
                <h5 className={`text-sm font-black uppercase tracking-tight ${
                  isLatest ? "text-rose-600" : "text-slate-700"
                }`}>
                  {ETAPA_LABELS[event.etapa as keyof typeof ETAPA_LABELS] || event.etapa}
                </h5>
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-white px-2 py-0.5 rounded border">
                  {format(new Date(event.created_at), "HH:mm", { locale: es })}
                </span>
              </div>
              
              <p className="text-xs text-slate-600 leading-relaxed">
                {event.observaciones || "Inicio de etapa sin observaciones adicionales."}
              </p>

              <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <MapPin size={10} />
                {format(new Date(event.created_at), "EEEE, d 'de' MMMM", { locale: es })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}