'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Search, User, Menu, X, ShoppingCart, UserCircle, LogOut } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { usePortalCart } from '@/components/portal/cart/PortalCartLayout';
import { NotificationDropdown } from './NotificationDropDown';
import { getSupabaseBrowserClient } from '@/lib/supabase';

export function Navbar({ empresa = 'Cargando...' }: { empresa?: string }) {
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((s: any) => s.items.length);
  const { openCart } = usePortalCart();

  useEffect(() => setMounted(true), []);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Cerrar el menú si se hace click afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace('/');
  };

  return (
    <header
      className="h-16 border-b border-guor-line bg-white sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between shadow-sm"
      role="banner"
    >
      {/* Sección Izquierda: Buscador Compacto */}
      <div className="flex items-center flex-1 min-w-0">
        <div className="relative w-full max-w-sm group hidden sm:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-guor-soft/50 group-focus-within:text-guor-600 transition-colors"
            size={16}
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Buscar cotizaciones o productos..."
            aria-label="Buscar cotizaciones o productos"
            className="w-full bg-guor-bg border border-guor-line rounded-full py-1.5 pl-9 pr-4 text-xs text-guor-ink placeholder:text-guor-soft/40 focus:outline-none focus:ring-2 focus:ring-guor-200 focus:border-guor-400 transition-all"
          />
        </div>
      </div>

      {/* Sección Derecha: Acciones — Escritorio */}
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

        {/* Contenedor del Perfil con Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            className="flex items-center gap-3 pl-3 border-l border-guor-line text-left focus:outline-none group"
          >
            <div className="text-right">
              <p className="text-xs font-bold text-guor-ink leading-none truncate max-w-[180px] group-hover:text-guor-600 transition-colors">
                {empresa}
              </p>
              <p className="text-[9px] text-guor-600 font-bold mt-0.5 tracking-wider uppercase">
                Socio Corporativo
              </p>
            </div>
            <div
              className="w-9 h-9 bg-guor-50 border border-guor-200 rounded-full flex items-center justify-center text-guor-600 shrink-0 group-hover:bg-guor-100 transition-all"
              role="img"
              aria-label="Perfil de usuario"
            >
              <User size={18} aria-hidden="true" />
            </div>
          </button>

          {/* Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-guor-line rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  router.push('/portal/perfil'); // Ajusta la ruta a tu necesidad
                }}
                className="w-full px-4 py-2 text-left text-xs text-guor-ink hover:bg-guor-50 flex items-center gap-2 transition-colors"
              >
                <UserCircle size={16} className="text-guor-600" />
                Mi Perfil
              </button>
              <hr className="border-guor-line my-1" />
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Botón Menú Hamburguesa — Móvil */}
      <div className="flex sm:hidden items-center gap-2">
        <NotificationDropdown />
        <button
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="p-1.5 text-guor-soft/60 hover:text-guor-600 hover:bg-guor-50 rounded-md transition-colors"
          aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Menú Desplegable — Móvil */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 right-0 left-0 bg-white border-b border-guor-line shadow-md sm:hidden animate-in fade-in duration-150 z-40">
          <div className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-guor-soft/50" size={16} />
              <input
                type="search"
                placeholder="Buscar..."
                className="w-full bg-guor-bg border border-guor-line rounded-full py-1.5 pl-9 pr-4 text-xs text-guor-ink"
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