'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Search, User, Menu, X, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { usePortalCart } from '@/components/portal/cart/PortalCartLayout';

export function Navbar({ empresa = 'Cargando...' }: { empresa?: string }) {
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((s) => s.items.length);
  const { openCart } = usePortalCart();

  useEffect(() => setMounted(true), []);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header
      className="h-16 border-b border-[#e4c28a]/20 bg-[#fff4e2] sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between shadow-sm"
      role="banner"
    >
      {/* Buscador */}
      <div className="flex items-center flex-1 min-w-0">
        <div className="relative w-full max-w-md group hidden sm:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5854b]/50 group-focus-within:text-[#b5854b] transition-colors"
            size={18}
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Buscar cotizaciones o productos..."
            aria-label="Buscar cotizaciones o productos"
            className="w-full bg-white/70 border border-[#e4c28a]/40 rounded-full py-2 pl-10 pr-4 text-sm text-[#231e1d] placeholder:text-[#b5854b]/40 focus:outline-none focus:ring-2 focus:ring-[#b5854b]/20 focus:border-[#b5854b] transition-all"
          />
        </div>
      </div>

      {/* Acciones — desktop */}
      <div className="hidden sm:flex items-center gap-4">
        <button
          type="button"
          onClick={openCart}
          className="relative p-2 text-[#b5854b]/60 hover:text-[#b5854b] hover:bg-[#e4c28a]/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#b5854b]/30"
          aria-label={`Carrito de compras${mounted && itemCount ? `, ${itemCount} productos` : ''}`}
          title="Carrito de compras"
        >
          <ShoppingCart size={20} aria-hidden="true" />
          {mounted && itemCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#b5854b] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </button>

        <button
          className="relative p-2 text-[#b5854b]/60 hover:text-[#b5854b] hover:bg-[#e4c28a]/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#b5854b]/30"
          aria-label="Ver notificaciones"
          title="Notificaciones"
        >
          <Bell size={20} aria-hidden="true" />
          <span
            className="absolute top-2 right-2 w-2 h-2 bg-[#b5854b] rounded-full border-2 border-[#fff4e2]"
            aria-hidden="true"
          />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-[#e4c28a]/40">
          <div className="text-right">
            <p className="text-xs font-bold text-[#231e1d] leading-none">{empresa}</p>
            <p className="text-[10px] text-[#b5854b] font-medium mt-0.5 tracking-wide">
              Socio Corporativo
            </p>
          </div>
          <div
            className="w-9 h-9 bg-[#e4c28a]/30 border border-[#e4c28a]/60 rounded-full flex items-center justify-center text-[#b5854b]"
            role="img"
            aria-label="Perfil de usuario"
          >
            <User size={18} aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Botón menú — móvil */}
      <button
        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        className="sm:hidden p-2 text-[#b5854b]/60 hover:text-[#b5854b] hover:bg-[#e4c28a]/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#b5854b]/30"
        aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={isMobileMenuOpen}
      >
        {isMobileMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
      </button>

      {/* Menú desplegable — móvil */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 right-0 left-0 bg-[#fff4e2] border-b border-[#e4c28a]/30 shadow-lg sm:hidden">
          <div className="p-4 space-y-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5854b]/50"
                size={18}
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Buscar..."
                aria-label="Buscar en móvil"
                className="w-full bg-white/70 border border-[#e4c28a]/40 rounded-full py-2 pl-10 pr-4 text-sm text-[#231e1d] placeholder:text-[#b5854b]/40 focus:outline-none focus:ring-2 focus:ring-[#b5854b]/20 focus:border-[#b5854b]"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                openCart();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 text-[#b5854b]/70 hover:text-[#b5854b] hover:bg-[#e4c28a]/20 rounded-lg transition-colors"
            >
              <ShoppingCart size={18} aria-hidden="true" />
              <span className="text-sm font-medium">
                Carrito de compras
                {mounted && itemCount > 0 ? ` (${itemCount})` : ''}
              </span>
            </button>

            <button className="w-full flex items-center gap-3 p-3 text-[#b5854b]/70 hover:text-[#b5854b] hover:bg-[#e4c28a]/20 rounded-lg transition-colors">
              <Bell size={18} aria-hidden="true" />
              <span className="text-sm font-medium">Notificaciones</span>
            </button>

            <div className="flex items-center gap-3 p-3 border-t border-[#e4c28a]/30">
              <div className="w-9 h-9 bg-[#e4c28a]/30 border border-[#e4c28a]/60 rounded-full flex items-center justify-center text-[#b5854b]">
                <User size={18} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#231e1d]">{empresa}</p>
                <p className="text-[10px] text-[#b5854b] tracking-wide">Socio Corporativo</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}