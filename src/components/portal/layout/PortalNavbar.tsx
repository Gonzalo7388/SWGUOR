'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, User, Menu, X, LogOut, UserCircle, ShoppingCart } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropDown';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { usePortal } from '@/lib/hooks/usePortal'; // Consumiendo tu hook con el nuevo Contexto
import { CartDrawer } from './CartDrawer';

export function Navbar({ empresa = 'Cargando...' }: { empresa?: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false); // Estado local para abrir/cerrar el Drawer
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // ── INTEGRACIÓN CON EL NUEVO PORTAL CONTEXT ──
  const {
    itemsCarrito,      // Leemos el arreglo de ítems del carrito corporativo
    limpiarCarrito,    // Métodos para limpiar estados al hacer logout
    limpiarBorrador,
    unreadCount        // Contador nativo de notificaciones del contexto
  } = usePortal();

  // Cálculo del total de líneas basándonos en la estructura real del nuevo contexto
  const totalLineas = itemsCarrito?.length || 0;

  // Optimización de cierre automático con click-outside (Pointer Events Pasivos)
  useEffect(() => {
    function handleClickOutside(event: PointerEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('pointerdown', handleClickOutside, { passive: true });
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();

    // Limpiamos de manera segura los reducers y sessionStorages B2B
    limpiarCarrito();
    limpiarBorrador();

    router.replace('/');
  };

  const handleNavigation = useCallback((path: string) => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
    router.push(path);
  }, [router]);

  // Evitar fallos de Hydration y formatear ID corporativo usando el año corriente (2026)
  const socioId = empresa && empresa !== 'Cargando...'
    ? empresa.substring(0, 3).toUpperCase()
    : 'GUR';

  return (
    <>
      <header
        className="h-16 border-b border-guor-line bg-white sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between shadow-sm"
        role="banner"
      >
        {/* Sección Izquierda: Buscador de Catálogo Corporativo */}
        <div className="flex items-center flex-1 min-w-0">
          <div className="relative w-full max-w-sm group hidden sm:block">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-guor-soft/50 group-focus-within:text-guor-600 transition-colors"
              size={16}
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Buscar por SKU, producto o categoría técnica..."
              aria-label="Buscar productos en el catálogo"
              className="w-full bg-guor-bg border border-guor-line rounded-full py-1.5 pl-9 pr-4 text-xs text-guor-ink placeholder:text-guor-soft/40 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all"
            />
          </div>
        </div>

        {/* Sección Derecha: Acciones B2B */}
        <div className="hidden sm:flex items-center gap-4">

          {/* Botón Mi Pedido / Desplegable Lateral */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={isCartOpen}
            className="p-2 relative text-guor-soft/60 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-200 flex items-center gap-1.5 group"
            title="Ver resumen del pedido actual"
          >
            <ShoppingCart size={19} className="group-hover:scale-105 transition-transform" aria-hidden="true" />

            <span className="text-xs font-semibold hidden md:inline text-slate-600 group-hover:text-amber-700 select-none">
              Mi Pedido
            </span>

            {totalLineas > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-amber-600 text-white font-black text-[9px] h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-sm border border-white transition-all">
                {totalLineas}
              </span>
            )}
          </button>

          {/* Dropdown de Notificaciones (usa internamente el contexto) */}
          <NotificationDropdown />

          {/* Menú de Perfil e Identificador Único */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={isProfileMenuOpen}
              className="flex items-center gap-3 pl-3 border-l border-guor-line text-left focus:outline-none group"
            >
              <div className="text-right">
                <p className="text-xs font-black text-slate-800 leading-none truncate max-w-[180px] group-hover:text-amber-600 transition-colors">
                  {empresa}
                </p>
                <p className="text-[9px] text-amber-600 font-bold mt-1 tracking-wider uppercase">
                  Socio Corporativo
                </p>
              </div>
              <div
                className="w-9 h-9 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 shrink-0 group-hover:bg-amber-50 group-hover:text-amber-600 group-hover:border-amber-200 transition-all"
                role="img"
                aria-label="Menú de cuenta"
              >
                <User size={16} aria-hidden="true" />
              </div>
            </button>

            {/* Opciones del Perfil Corporativo */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150" role="menu">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400">ID de Cuenta</p>
                  <p className="text-xs font-mono text-slate-600 truncate">Socio #{socioId}-2026</p>
                </div>
                <button
                  onClick={() => handleNavigation('/portal/perfil')}
                  role="menuitem"
                  className="w-full px-4 py-2.5 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                >
                  <UserCircle size={15} className="text-slate-400" />
                  Configuración de Cuenta
                </button>
                <button
                  onClick={handleLogout}
                  role="menuitem"
                  className="w-full px-4 py-2.5 text-left text-xs text-red-600 hover:bg-red-50 border-t border-slate-100 flex items-center gap-2 transition-colors font-semibold"
                >
                  <LogOut size={15} />
                  Cerrar Sesión Corporativa
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Vista Móvil Adaptada */}
        <div className="flex sm:hidden items-center gap-1">
          <button
            onClick={() => setIsCartOpen(true)}
            className="p-2 relative text-guor-soft/60"
            aria-label="Ver líneas de mi pedido móvil"
          >
            <ShoppingCart size={19} />
            {totalLineas > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-amber-600 text-white font-bold text-[8px] h-3.5 min-w-[14px] px-0.5 rounded-full flex items-center justify-center">
                {totalLineas}
              </span>
            )}
          </button>

          <NotificationDropdown />

          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Abrir menú de navegación"
            className="p-1.5 text-guor-soft/60 hover:bg-guor-50 rounded-md"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menú Desplegable Móvil */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 right-0 left-0 bg-white border-b border-guor-line shadow-md sm:hidden z-40 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="p-4 space-y-3">
              <div className="border-t border-guor-line pt-2 space-y-1">
                <button
                  onClick={() => handleNavigation('/portal/perfil')}
                  className="w-full flex items-center gap-3 p-2 hover:bg-guor-50 rounded-lg text-xs text-guor-ink"
                >
                  <UserCircle size={16} className="text-amber-600" />
                  Mi Perfil Corporativo
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-2 hover:bg-red-50 rounded-lg text-xs text-red-600 font-semibold"
                >
                  <LogOut size={16} />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Componente Lateral del Carrito Coexistente */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}