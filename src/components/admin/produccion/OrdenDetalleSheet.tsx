"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import OrdenTimeline from "./OrdenTimeline";
import { 
  Factory, 
  Package,    
  ClipboardX,
  CheckCircle2
} from "lucide-react";
import { useOrdenesProduccion } from "@/lib/hooks/useOrdenProduccion";
import { ETAPA_PRODUCCION, ETAPA_LABELS } from "@/lib/schemas/ordenes-produccion";

interface OrdenDetalleSheetProps {
  orden: any;
  open: boolean;
  onClose: () => void;
}

export default function OrdenDetalleSheet({ orden, open, onClose }: OrdenDetalleSheetProps) {
  const { registrarEtapa } = useOrdenesProduccion();

  if (!orden) return null;

  const etapaActual = orden.seguimiento_produccion?.[0]?.etapa || "pendiente";

  const handleCambiarEtapa = (nuevaEtapa: string) => {
    registrarEtapa({
      orden_id: orden.id.toString(),
      etapa: nuevaEtapa,
      observaciones: `Cambio de etapa a ${ETAPA_LABELS[nuevaEtapa as keyof typeof ETAPA_LABELS]}`
    });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[500px] overflow-y-auto bg-white">
        <SheetHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-rose-600 border-rose-100 bg-rose-50">
              #{orden.id}
            </Badge>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Orden de Producción
            </span>
          </div>
          <SheetTitle className="text-2xl font-black text-slate-900">
            {orden.productos?.nombre}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-8 space-y-8 pb-10">
          {/* Tarjetas de Información Rápida */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Factory size={14} />
                <span className="text-[10px] font-bold uppercase">Taller</span>
              </div>
              <p className="text-sm font-bold text-slate-700">{orden.talleres?.nombre}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Package size={14} />
                <span className="text-[10px] font-bold uppercase">Cantidad</span>
              </div>
              <p className="text-sm font-bold text-slate-700">{orden.cantidad_solicitada} Unidades</p>
            </div>
          </div>

          {/* Acciones de Etapa */}
          <section className="space-y-4">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
              <RefreshCw size={14} className="text-rose-500" />
              Actualizar Estado de Producción
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {ETAPA_PRODUCCION.map((etapa) => {
                const isCurrent = etapaActual === etapa;
                return (
                  <Button
                    key={etapa}
                    variant={isCurrent ? "default" : "outline"}
                    size="sm"
                    disabled={isCurrent}
                    onClick={() => handleCambiarEtapa(etapa)}
                    className={`justify-start h-10 rounded-xl transition-all ${
                      isCurrent 
                      ? "bg-slate-900 shadow-lg shadow-slate-200" 
                      : "hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                    }`}
                  >
                    {isCurrent && <CheckCircle2 size={14} className="mr-2" />}
                    {ETAPA_LABELS[etapa]}
                  </Button>
                );
              })}
            </div>
          </section>

          <Separator className="bg-slate-100" />

          {/* Línea de Tiempo (Seguimiento) */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest">
                Historial de Seguimiento
                </h4>
                <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold">
                {orden.seguimiento_produccion?.length || 0} ESTADOS
                </span>
            </div>
            
            <OrdenTimeline events={orden.seguimiento_produccion} />
            </section>

          {/* Detalles Técnicos */}
          <section className="bg-rose-50/50 rounded-2xl p-5 border border-rose-100/50 space-y-4">
            <h4 className="text-xs font-black uppercase text-rose-900/40 tracking-widest">
              Notas de la Orden
            </h4>
            <div className="flex gap-3">
              <ClipboardX className="text-rose-200 shrink-0" size={20} />
              <p className="text-sm text-slate-600 italic">
                {orden.notas || "No se adjuntaron notas adicionales para esta orden de producción."}
              </p>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Icono pequeño para el título de secciones
function RefreshCw({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}