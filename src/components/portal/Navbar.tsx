'use client';

import { Bell, Search, User } from 'lucide-react';

export function Navbar({ empresa = "Cargando..." }: { empresa?: string }) {
  return (
    <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-40 px-8 flex items-center justify-between shadow-sm">
      {/* Breadcrumbs / Search Bar */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Buscar cotizaciones o productos..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-none">{empresa}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-1">Socio Corporativo</p>
          </div>
          <div className="w-10 h-10 bg-blue-100 border border-blue-200 rounded-full flex items-center justify-center text-blue-600">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}