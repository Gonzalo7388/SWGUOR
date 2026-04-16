"use client";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { 
  FileText, 
  Droplets, 
  Scissors, 
  Globe,
  Thermometer,
  CheckCircle2,
  X,
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TechSheetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  producto: any;
}

export default function TechSheetDialog({
  isOpen,
  onClose,
  producto,
}: TechSheetDialogProps) {
  const ficha = producto?.ficha_tecnica || {};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none bg-white rounded-2xl shadow-2xl">
        <div className="flex flex-col md:flex-row">
          
          {/* Panel Lateral Izquierdo (Estilo CreateUsuario) */}
          <div className="md:w-1/3 bg-slate-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Círculo decorativo de fondo */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tighter leading-none mb-2">
                Ficha<br />Técnica
              </h2>
              <div className="h-1 w-12 bg-emerald-500 mb-4" />
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                Especificaciones maestras y control de calidad de mercadería.
              </p>
            </div>

            <div className="relative z-10 mt-8 space-y-4">
               <div className="flex items-center gap-3 text-emerald-400">
                  <Info size={14} />
                  <span className="text-[9px] font-black uppercase tracking-tight">Datos Verificados</span>
               </div>
            </div>
          </div>

          {/* Panel de Contenido Principal */}
          <div className="flex-1 p-8 relative">
            {/* Botón Cerrar (X) */}
            <button 
              onClick={onClose}
              className="absolute right-6 top-6 text-slate-300 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="space-y-8">
              {/* Info Cabecera Producto */}
              <div>
                <Badge variant="outline" className="mb-2 border-emerald-100 text-emerald-700 bg-emerald-50/50 font-black text-[9px] uppercase tracking-widest">
                  SKU: {producto?.sku || "SIN SKU"}
                </Badge>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-tight uppercase">
                  {producto?.nombre || "Producto sin nombre"}
                </h3>
              </div>

              {/* Grid de Especificaciones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* MATERIAL */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Scissors size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Composición</span>
                  </div>
                  <p className="text-sm font-bold text-slate-700">
                    {ficha.material || "No especificado"}
                  </p>
                </div>

                {/* ORIGEN */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Globe size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Origen</span>
                  </div>
                  <p className="text-sm font-bold text-slate-700">
                    {ficha.origen || "Importado"}
                  </p>
                </div>

                {/* TEMPORADA */}
                <div className="sm:col-span-2 p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Thermometer size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Temporada / Colección</span>
                  </div>
                  <p className="text-sm font-bold text-slate-700 italic">
                    {ficha.temporada || "Standard / Permanente"}
                  </p>
                </div>

                {/* CUIDADOS */}
                <div className="sm:col-span-2 space-y-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Droplets size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Instrucciones de Cuidado</span>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50/30 border border-emerald-100/50 text-slate-600 text-sm leading-relaxed font-medium">
                    {ficha.cuidado || "Lavar con colores similares. No usar blanqueador."}
                  </div>
                </div>
              </div>

              {/* Mensaje de validación inferior */}
              <div className="flex items-start gap-3 pt-4">
                <CheckCircle2 className="text-emerald-500 shrink-0" size={16} />
                <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed tracking-tight">
                  Información técnica certificada para Modas y Estilos GUOR. 
                  Este documento es de uso interno para control de inventario.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}