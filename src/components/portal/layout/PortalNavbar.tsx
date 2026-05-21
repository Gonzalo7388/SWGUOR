'use client';

import { useState } from 'react';
import { Search, User, Menu, X } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropDown';

export function Navbar({ empresa = 'Cargando...' }: { empresa?: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header
      className="h-14 border-b border-[#e4c28a]/20 bg-[#fff4e2] sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between shadow-sm"
      role="banner"
    >
      {/* Sección Izquierda: Buscador Compacto */}
      <div className="flex items-center flex-1 min-w-0">
        <div className="relative w-full max-w-sm group hidden sm:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5854b]/50 group-focus-within:text-[#b5854b] transition-colors"
            size={16}
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Buscar cotizaciones o productos..."
            aria-label="Buscar cotizaciones o productos"
            className="w-full bg-white/70 border border-[#e4c28a]/40 rounded-full py-1.5 pl-9 pr-4 text-xs text-[#231e1d] placeholder:text-[#b5854b]/40 focus:outline-none focus:ring-2 focus:ring-[#b5854b]/10 focus:border-[#b5854b] transition-all"
          />
        </div>
      </div>

      {/* Sección Derecha: Acciones — Escritorio */}
      <div className="hidden sm:flex items-center gap-4">
        {/* Inserción del Dropdown en Tiempo Real */}
        <NotificationDropdown />

        <div className="flex items-center gap-3 pl-3 border-l border-[#e4c28a]/40">
          <div className="text-right">
            <p className="text-xs font-bold text-[#231e1d] leading-none truncate max-w-[180px]">{empresa}</p>
            <p className="text-[9px] text-[#b5854b] font-bold mt-0.5 tracking-wider uppercase">
              Socio Corporativo
            </p>
          </div>
          <div
            className="w-8 h-8 bg-[#e4c28a]/20 border border-[#e4c28a]/40 rounded-full flex items-center justify-center text-[#b5854b] shrink-0"
            role="img"
            aria-label="Perfil de usuario"
          >
            <User size={16} aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Botón Menú Hamburguesa — Móvil */}
      <div className="flex sm:hidden items-center gap-2">
        <NotificationDropdown />
        <button
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="p-1.5 text-[#b5854b]/60 hover:text-[#b5854b] hover:bg-[#e4c28a]/20 rounded-md transition-colors"
          aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Menú Desplegable — Móvil */}
      {isMobileMenuOpen && (
        <div className="absolute top-14 right-0 left-0 bg-[#fff4e2] border-b border-[#e4c28a]/30 shadow-md sm:hidden animate-in fade-in duration-150">
          <div className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5854b]/50" size={16} />
              <input
                type="search"
                placeholder="Buscar..."
                className="w-full bg-white/70 border border-[#e4c28a]/40 rounded-full py-1.5 pl-9 pr-4 text-xs text-[#231e1d]"
              />
            </div>

            <div className="flex items-center gap-3 p-2.5 border-t border-[#e4c28a]/20">
              <div className="w-8 h-8 bg-[#e4c28a]/20 border border-[#e4c28a]/40 rounded-full flex items-center justify-center text-[#b5854b]">
                <User size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#231e1d]">{empresa}</p>
                <p className="text-[9px] text-[#b5854b] tracking-wider font-bold uppercase">Socio Corporativo</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}