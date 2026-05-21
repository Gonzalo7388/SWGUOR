"use client";

import { Check, Zap } from "lucide-react";
import { ETAPA_LABELS } from "@/lib/schemas/ordenes-produccion";

interface OrdenStepperProps {
  etapas: readonly string[];
  etapaActual: string;
}

// Colores únicos por etapa
const ETAPA_COLORS: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  diseno: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", icon: "bg-teal-500" },
  patronaje: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200", icon: "bg-cyan-500" },
  corte: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", icon: "bg-indigo-500" },
  confeccion: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: "bg-amber-500" },
  remallado: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: "bg-orange-500" },
  bordado_estampado: { bg: "bg-fuchsia-50", text: "text-fuchsia-700", border: "border-fuchsia-200", icon: "bg-fuchsia-500" },
  control_calidad: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", icon: "bg-rose-500" },
  acabado: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", icon: "bg-violet-500" },
  listo_entrega: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "bg-emerald-500" },
};

export default function OrdenStepper({ etapas, etapaActual }: OrdenStepperProps) {
  const indexActual = etapas.indexOf(etapaActual);

  return (
    <div className="w-full space-y-8">
      {/* Stepper Visual */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between w-full">
          {etapas.map((etapa, idx) => {
            const isCompletado = idx < indexActual;
            const isActual = idx === indexActual;
            const isPendiente = idx > indexActual;
            const colors = ETAPA_COLORS[etapa] || ETAPA_COLORS.diseno;

            return (
              <div key={etapa} className="flex items-center flex-1 last:flex-none gap-2">
                {/* Nodo de la etapa */}
                <div className="flex flex-col items-center relative min-w-fit">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isCompletado
                        ? `${colors.icon} border-emerald-500 text-white shadow-lg`
                        : isActual
                          ? `${colors.bg} ${colors.border} ${colors.text} border-2 ring-4 ring-offset-2 ring-slate-300 font-bold shadow-md`
                          : `bg-white border-slate-200 text-slate-400`
                    }`}
                  >
                    {isCompletado ? (
                      <Check size={22} className="stroke-[3]" />
                    ) : (
                      <span className="text-sm font-black">{idx + 1}</span>
                    )}
                  </div>

                  <span
                    className={`mt-3 text-xs font-bold uppercase tracking-wider text-center block max-w-[100px] leading-tight ${
                      isActual ? "text-slate-900 font-black" : isCompletado ? "text-slate-700" : "text-slate-400"
                    }`}
                  >
                    {ETAPA_LABELS[etapa as keyof typeof ETAPA_LABELS] || etapa}
                  </span>
                </div>

                {/* Línea conectora entre nodos */}
                {idx < etapas.length - 1 && (
                  <div className="flex-1 h-1 mx-1 bg-slate-200 rounded-full relative">
                    {isCompletado && (
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Indicador de progreso */}
        <div className="mt-6 flex items-center justify-between text-xs">
          <p className="text-slate-600 font-semibold">
            Progreso: <span className="text-slate-900">{indexActual + 1} de {etapas.length} etapas</span>
          </p>
          <div className="w-24 bg-slate-200 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-rose-500 to-pink-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${((indexActual + 1) / etapas.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card de etapa actual */}
      <div
        className={`p-6 rounded-2xl border-2 ${
          ETAPA_COLORS[etapaActual]?.bg || ETAPA_COLORS.diseno.bg
        } ${ETAPA_COLORS[etapaActual]?.border || ETAPA_COLORS.diseno.border}`}
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className={`p-2 rounded-lg ${ETAPA_COLORS[etapaActual]?.icon || ETAPA_COLORS.diseno.icon}`}
          >
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Etapa Actual</p>
            <p className={`text-lg font-black ${ETAPA_COLORS[etapaActual]?.text || ETAPA_COLORS.diseno.text}`}>
              {ETAPA_LABELS[etapaActual as keyof typeof ETAPA_LABELS] || etapaActual}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}