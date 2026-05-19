"use client";

import { Check } from "lucide-react";
import { ETAPA_LABELS } from "@/lib/schemas/ordenes-produccion";

interface OrdenStepperProps {
  etapas: readonly string[];
  etapaActual: string;
}

export default function OrdenStepper({ etapas, etapaActual }: OrdenStepperProps) {
  const indexActual = etapas.indexOf(etapaActual);

  return (
    <div className="w-full bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between w-full">
        {etapas.map((etapa, idx) => {
          const isCompletado = idx < indexActual;
          const isActual = idx === indexActual;
          const isPendiente = idx > indexActual;

          return (
            <div key={etapa} className="flex items-center flex-1 last:flex-none">
              {/* Nodo de la etapa */}
              <div className="flex flex-col items-center relative min-w-[80px]">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompletado
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : isActual
                      ? "bg-rose-50 border-rose-600 text-rose-600 ring-4 ring-rose-50 font-bold"
                      : "bg-white border-slate-200 text-slate-400"
                    }`}
                >
                  {isCompletado ? (
                    <Check size={18} className="stroke-[3]" />
                  ) : (
                    <span className="text-sm font-mono">{idx + 1}</span>
                  )}
                </div>

                <span
                  className={`mt-3 text-xs font-bold uppercase tracking-wider text-center block max-w-[120px] ${isActual ? "text-slate-900 font-black" : "text-slate-400"
                    }`}
                >
                  {ETAPA_LABELS[etapa as keyof typeof ETAPA_LABELS] || etapa}
                </span>
              </div>

              {/* Línea conectora entre nodos */}
              {idx < etapas.length - 1 && (
                <div className="flex-1 h-[2px] mx-2 bg-slate-100 relative -top-4">
                  <div
                    className={`absolute inset-0 bg-emerald-500 transition-all duration-500`}
                    style={{
                      width: isCompletado ? "100%" : isActual ? "0%" : "0%",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}