import { useState } from "react";
import { Send, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CustomerNotes({ clienteId }: { clienteId: string }) {
  const [nota, setNota] = useState("");

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
        <StickyNote size={14} className="text-slate-400" />
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-600">Notas de Seguimiento</h3>
      </div>
      <div className="p-4 space-y-4">
        {/* Input de nueva nota */}
        <div className="relative">
          <textarea 
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Escribe una observación interna..."
            className="w-full h-24 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
          />
          <Button 
            size="sm" 
            className="absolute bottom-3 right-3 h-7 px-3 text-[10px] bg-blue-600 hover:bg-blue-700"
            onClick={() => { console.log("Nota guardada", nota); setNota(""); }}
          >
            <Send size={12} className="mr-1.5" /> Guardar Nota
          </Button>
        </div>

        {/* Lista de notas previas */}
        <div className="space-y-3 mt-4">
          <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
            <p className="text-xs text-slate-700 leading-relaxed">
              "El cliente solicitó que las cajas tengan doble rotulado para su almacén central."
            </p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-[9px] font-bold text-amber-600 uppercase">Admin - 15 Mayo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}