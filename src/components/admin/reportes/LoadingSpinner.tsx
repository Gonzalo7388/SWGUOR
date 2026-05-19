'use client';

import { Activity } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50/50 gap-6">
      <div className="relative">
        <div className="w-20 h-20 border-[6px] border-indigo-100 rounded-full" />
        <div className="absolute inset-0 m-auto w-20 h-20 border-[6px] border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <Activity className="absolute inset-0 m-auto text-indigo-600" size={32} />
      </div>
      <div className="text-center">
        <p className="text-sm font-black uppercase tracking-[0.4em] text-slate-900 animate-pulse">Intelligence Suite</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest">Compilando analíticas de producción...</p>
      </div>
    </div>
  );
}
