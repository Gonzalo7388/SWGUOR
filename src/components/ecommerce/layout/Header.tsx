'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, User, Menu, Heart } from 'lucide-react';
import Image from 'next/image';
import { useCarrito } from '@/app/ecommerce/_contexts/CartContext';
import { useFavoritos } from '@/app/ecommerce/_contexts/FavoritosContext';
import CategoriasDropdown from '@/components/ecommerce/layout/CategoriasDropdown';
import MobileMenu from '@/components/ecommerce/layout/MobileMenu';
import CartDrawer from '@/components/ecommerce/carrito/CartSummary'; // Importamos el Drawer

export default function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false); // Estado para el Drawer
  const [scrolled, setScrolled] = useState(false);
  
  // Extraemos 'items' para contar las líneas de pedido
  const { items } = useCarrito();
  const { favoritos } = useFavoritos();

  // Contador por orden/línea de producto (no por unidades)
  const cantidadOrdenes = items.length;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (menuAbierto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [menuAbierto]);

  return (
    <>
      {/* Banner */}
      <div className="bg-[#f02d65] text-white py-2 px-4 text-center">
        <p className="text-[11px] md:text-xs font-bold tracking-[0.2em] uppercase">
          Envíos gratis a partir de S/ 299
        </p>
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 md:h-24">
            
            {/* Logo */}
            <div className="flex-1 flex items-center">
              <button 
                onClick={() => setMenuAbierto(true)}
                className="p-2 -ml-2 mr-4 md:hidden text-gray-800 hover:text-[#f02d65]"
                aria-label="Abrir menú"
              >
                <Menu size={24} />
              </button>
              <Link href="/ecommerce">
                <Image 
                  src="/logo-guor.png" 
                  alt="GUOR" 
                  width={200} 
                  height={40} 
                  className="h-20 md:h-15 w-auto object-contain"
                  priority
                />
              </Link>
            </div>

            {/* Navegación Desktop */}
            <nav className="hidden md:flex items-center justify-center gap-10">
              <Link href="/ecommerce/new" className="text-[13px] font-bold uppercase tracking-widest text-gray-800 hover:text-[#f02d65] transition-colors">
                New
              </Link>
              <CategoriasDropdown />
              <Link href="/ecommerce/nosotros" className="text-[13px] font-bold uppercase tracking-widest text-gray-800 hover:text-[#f02d65] transition-colors">
                Nosotros
              </Link>
              <Link href="/ecommerce/ofertas" className="text-[13px] font-bold uppercase tracking-widest text-gray-800 hover:text-[#f02d65] transition-colors">
                Ofertas
              </Link>
            </nav>

            {/* Iconos */}
            <div className="flex-1 flex items-center justify-end gap-3 md:gap-5">
              <button className="p-2 text-gray-700 hover:text-[#f02d65] transition-colors">
                <Search size={20} strokeWidth={2.5} />
              </button>
              <Link href="/ecommerce/login" className="hidden sm:block p-2 text-gray-700 hover:text-[#f02d65] transition-colors">
                <User size={20} strokeWidth={2.5} />
              </Link>
              <Link href="/ecommerce/favoritos" className="hidden sm:block relative p-2 text-gray-700 hover:text-[#f02d65] transition-colors">
                <Heart size={20} strokeWidth={2.5} />
                {favoritos.length > 0 && (
                  <span className="absolute top-1 right-0 bg-red-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {favoritos.length}
                  </span>
                )}
              </Link>

              {/* Icono Carrito que abre el Drawer */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-700 hover:text-[#f02d65] transition-colors"
              >
                <ShoppingCart size={20} strokeWidth={2.5} />
                {cantidadOrdenes > 0 && (
                  <span className="absolute top-1 right-0 bg-[#f02d65] text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                    {cantidadOrdenes}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menú Móvil */}
      <MobileMenu 
        isOpen={menuAbierto} 
        onClose={() => setMenuAbierto(false)} 
      />

      {/* Drawer del Carrito */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </>
  );
}