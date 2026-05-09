"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Receipt,
  Printer,
  Calendar,
  Hash,
  User,
  CreditCard,
  Package,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Clock,
  ExternalLink,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ViewPedidoDialog({ isOpen, pedido, onClose }: any) {
  const [detalles, setDetalles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && pedido?.id) {
      const loadDetalles = async () => {
        setLoading(true);
        try {
          const supabase = getSupabaseBrowserClient();
          const { data, error } = await supabase
            .from("pedido_items" as any) // Corregido a pedido_items según el esquema actual
            .select("*, productos(nombre, sku)")
            .eq("pedido_id", pedido.id);
          if (error) throw error;
          setDetalles(data || []);
        } catch (error) {
          console.error("Error:", error);
        } finally {
          setLoading(false);
        }
      };
      loadDetalles();
    }
  }, [isOpen, pedido]);

  if (!pedido) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-slate-50/50 backdrop-blur-3xl border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] p-0 overflow-hidden rounded-[48px] animate-in slide-in-from-bottom-4 duration-500">

        {/* HEADER PREMIUM: Oscuro y Tecnológico */}
        <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-600/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-sky-600/10 rounded-full -ml-16 -mb-16 blur-2xl" />

          <div className="flex justify-between items-start relative z-10">
            <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
              <Receipt className="w-7 h-7 text-pink-400" />
            </div>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/5 hover:bg-white/20 text-white rounded-2xl h-12 w-12 border border-white/5 transition-all active:scale-95"
                onClick={() => window.print()}
              >
                <Printer className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="mt-10 space-y-2 relative z-10">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-4xl font-black tracking-tighter uppercase">
                Comprobante
              </DialogTitle>
              <div className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-pink-500/30">
                Digital ID
              </div>
            </div>
            <DialogDescription className="text-slate-500 font-bold text-[11px] uppercase tracking-[0.3em] flex items-center gap-2">
              <Hash className="w-3.5 h-3.5 text-pink-500/50" /> Operación: {String(pedido.id).padStart(8, '0')}
            </DialogDescription>
          </div>
        </div>

        {/* CUERPO DEL DOCUMENTO: Estilo Limpio y Estructurado */}
        <div className="p-10 -mt-6 relative z-20">
          <div className="bg-white rounded-[40px] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] border border-slate-100/50 overflow-hidden">

            {/* Metadatos de Cabecera */}
            <div className="p-6 border-b border-dashed border-slate-100 grid grid-cols-2 gap-6 bg-slate-50/50">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" /> Fecha Registro
                </p>
                <p className="text-sm font-black text-slate-700">
                  {new Date(pedido.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="space-y-2 text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 justify-end">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Estado Actual
                </p>
                <span className={cn(
                  "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border",
                  pedido.estado === 'entregado' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                )}>
                  {pedido.estado || 'Procesando'}
                </span>
              </div>
            </div>

            {/* Perfil del Cliente */}
            <div className="p-8 flex items-center justify-between border-b border-slate-50 group cursor-default">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-50 to-white rounded-[20px] flex items-center justify-center border border-pink-100 shadow-sm group-hover:scale-105 transition-transform">
                  <User className="w-7 h-7 text-pink-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Titular de Cuenta</p>
                  <p className="text-lg font-black text-slate-800 leading-tight">{pedido.clientes?.razon_social || "Venta de Mostrador"}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-50">
                <ExternalLink className="w-4 h-4 text-slate-300" />
              </Button>
            </div>

            {/* Desglose de Artículos */}
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Package className="w-4 h-4" /> Detalle de Pedido
                </p>
                <span className="text-[10px] font-black text-slate-300">{detalles.length} Ítems</span>
              </div>

              <div className="space-y-5 max-h-[30vh] overflow-y-auto pr-3 custom-scrollbar">
                {loading ? (
                  <div className="flex flex-col items-center py-10 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando Base de Datos...</p>
                  </div>
                ) : detalles.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 font-bold uppercase text-[10px]">No hay detalles disponibles</div>
                ) : detalles.map((item) => (
                  <div key={item.id} className="flex justify-between items-center group">
                    <div className="flex gap-4">
                      <div className="text-[11px] font-black bg-slate-900 text-white w-7 h-7 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        {item.cantidad}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 group-hover:text-pink-600 transition-colors">
                          {item.productos?.nombre}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">SKU: {item.productos?.sku || 'N/A'}</p>
                          <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">S/ {Number(item.precio_unitario || 0).toFixed(2)} c/u</p>
                        </div>
                      </div>
                    </div>
                    <p className="font-black text-slate-900 text-lg tracking-tighter">
                      S/ {(Number(item.precio_unitario || 0) * item.cantidad).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* PIE DE PÁGINA: Totalización Liquidación */}
            <div className="p-8 bg-slate-950 text-white border-t border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
              <div className="flex justify-between items-end relative z-10">
                <div className="space-y-1">
                  <p className="text-[11px] font-black text-pink-500 uppercase tracking-[0.3em]">Total Final</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" /> Incluye IGV (18%)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-5xl font-black tracking-tighter text-white">
                    <span className="text-xl text-pink-500 mr-2">S/</span>
                    {Number(pedido.total || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botón de Cierre con Estilo de Retroceso */}
          <button
            onClick={onClose}
            className="w-full mt-10 py-5 rounded-[24px] bg-slate-100 hover:bg-slate-200 text-slate-500 font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 border border-transparent hover:border-slate-300 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Listado
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}