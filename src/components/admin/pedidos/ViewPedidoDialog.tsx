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
  CheckCircle2
} from "lucide-react";

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
            .from("detalles_orden" as any)
            .select("*, productos(nombre, sku)")
            .eq("orden_id", pedido.id);
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
      <DialogContent className="max-w-[400px] bg-[#f8fafc] border-none shadow-2xl p-0 overflow-hidden rounded-[35px]">
        
        {/* HEADER: Gradiente y Estado */}
        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-600/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          
          <div className="flex justify-between items-start relative z-10">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
              <Receipt className="w-6 h-6 text-pink-400" />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-white/10 hover:bg-white/20 text-white rounded-xl h-10 w-10" 
                onClick={() => window.print()}
              >
                <Printer className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="mt-6 space-y-1 relative z-10">
            <DialogTitle className="text-3xl font-black tracking-tighter">
              Ticket de Venta
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
              <Hash className="w-3 h-3 text-pink-500" /> Folio: {pedido.id?.toString().slice(-8).toUpperCase()}
            </DialogDescription>
          </div>
        </div>

        {/* CUERPO DEL TICKET */}
        <div className="p-6 -mt-4 relative z-20">
          <div className="bg-white rounded-[28px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            
            {/* Detalles de la Transacción */}
            <div className="p-5 border-b border-dashed border-slate-100 grid grid-cols-2 gap-4 bg-slate-50/50">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Fecha
                </p>
                <p className="text-xs font-bold text-slate-700">
                  {new Date(pedido.fecha_pedido).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 justify-end">
                  <CheckCircle2 className="w-3 h-3" /> Estado
                </p>
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase">
                  {pedido.estado || 'Completado'}
                </span>
              </div>
            </div>

            {/* Info Cliente */}
            <div className="p-5 flex items-center gap-4 border-b border-slate-50">
              <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cliente</p>
                <p className="text-sm font-black text-slate-800">{pedido.clientes?.razon_social || "Venta Directa"}</p>
              </div>
            </div>

            {/* Lista de Prendas */}
            <div className="p-5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Package className="w-3 h-3" /> Resumen de Artículos
              </p>
              
              <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                  <div className="py-4 text-center animate-pulse text-slate-300 font-bold text-xs uppercase">Sincronizando...</div>
                ) : detalles.map((item) => (
                  <div key={item.id} className="flex justify-between items-start group">
                    <div className="flex gap-3">
                      <div className="text-[10px] font-black bg-slate-900 text-white w-5 h-5 rounded-md flex items-center justify-center mt-0.5">
                        {item.cantidad}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-pink-600 transition-colors">
                          {item.productos?.nombre}
                        </p>
                        <p className="text-[9px] text-slate-400 font-medium">SKU: {item.productos?.sku || 'N/A'}</p>
                      </div>
                    </div>
                    <p className="text-xs font-black text-slate-900">
                      S/ {(item.precio_unitario * item.cantidad).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* TOTAL FINAL */}
            <div className="p-6 bg-[#fff0f6] border-t border-pink-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-pink-400 uppercase tracking-[0.2em]">Total Final</p>
                  <p className="text-[9px] text-pink-400 font-bold">IGV (18%) Incluido</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-pink-600">S/</span>
                  <span className="text-4xl font-black text-slate-900 tracking-tighter">
                    {pedido.total?.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Botón de cierre */}
          <Button 
            onClick={onClose} 
            className="w-full mt-6 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 font-bold h-14 rounded-[20px] transition-all border border-slate-100 shadow-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Cerrar Detalle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}