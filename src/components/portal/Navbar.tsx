'use client';

import { useState } from 'react';
import { Bell, Search, User, Menu, X } from 'lucide-react';

export function Navbar({ empresa = "Cargando..." }: { empresa?: string }) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header 
      className="h-16 border-b border-slate-200 bg-white sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between shadow-sm"
      role="banner"
    >
      {/* Search Bar */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="relative w-full max-w-md group hidden sm:block">
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" 
            size={18}
            aria-hidden="true"
          />
          <input 
            type="search"
            placeholder="Buscar cotizaciones o productos..." 
            aria-label="Buscar cotizaciones o productos"
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Desktop Actions */}
      <div className="hidden sm:flex items-center gap-6">
        <button 
          className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Ver notificaciones"
          title="Notificaciones"
        >
          <Bell size={20} aria-hidden="true" />
          <span 
            className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"
            aria-hidden="true"
          ></span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-none">{empresa}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-1">Socio Corporativo</p>
          </div>
          <div 
            className="w-10 h-10 bg-blue-100 border border-blue-200 rounded-full flex items-center justify-center text-blue-600"
            role="img"
            aria-label="Perfil de usuario"
          >
            <User size={20} aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="sm:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={isMobileMenuOpen}
      >
        {isMobileMenuOpen ? (
          <X size={24} aria-hidden="true" />
        ) : (
          <Menu size={24} aria-hidden="true" />
        )}
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 right-0 left-0 bg-white border-b border-slate-200 shadow-lg sm:hidden">
          <div className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
              <input 
                type="search"
                placeholder="Buscar..." 
                aria-label="Buscar cotizaciones o productos en móvil"
                className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            
            <button className="w-full flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <Bell size={20} aria-hidden="true" />
              <span>Notificaciones</span>
            </button>
            
            <div className="flex items-center gap-3 p-3 border-t border-slate-100">
              <div className="w-10 h-10 bg-blue-100 border border-blue-200 rounded-full flex items-center justify-center text-blue-600">
                <User size={20} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{empresa}</p>
                <p className="text-xs text-slate-500">Socio Corporativo</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}