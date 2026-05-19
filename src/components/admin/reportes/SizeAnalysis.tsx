'use client';

import { Layers, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface SizeAnalysisProps {
  data: any[];
}

export default function SizeAnalysis({ data }: SizeAnalysisProps) {
  return (
    <Card className="border-none bg-slate-900 text-white shadow-2xl rounded-[3rem] p-10 flex flex-col min-h-[620px] justify-between relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[80px] -mr-16 -mt-16 rounded-full" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-2xl font-black tracking-tight uppercase">Análisis de Tallas</h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Demanda operativa actual</p>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl border border-white/5">
            <Layers className="text-indigo-400" size={24} />
          </div>
        </div>

        <div className="space-y-8">
          {data.length > 0 ? data.slice(0, 6).map((item: any) => (
            <div key={item.name} className="group">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 group-hover:text-white transition-colors">
                <span>Talla {item.name}</span>
                <span className="text-white bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded-md">{item.value} und.</span>
              </div>
              <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(79,70,229,0.3)]" 
                  style={{ width: `${Math.min(Math.max((item.value / 100) * 100, 5), 100)}%` }}
                />
              </div>
            </div>
          )) : (
            <div className="py-20 text-center opacity-40">
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Sin registros</p>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 mt-12">
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] py-8 font-black text-lg transition-all group border-none shadow-xl shadow-indigo-900/40">
          Panel de Inventario
          <ChevronRight size={22} className="ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
        <p className="text-center text-[9px] text-slate-500 font-black uppercase mt-6 tracking-[0.3em] animate-pulse">Sincronización en tiempo real</p>
      </div>
    </Card>
  );
}
