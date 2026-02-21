'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, User, Menu, Heart, X, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useCarrito } from '@/app/ecommerce/_contexts/CartContext';
import { useFavoritos } from '@/app/ecommerce/_contexts/FavoritosContext';
import { motion, AnimatePresence } from 'framer-motion';
import CategoriasDropdown from '@/components/ecommerce/layout/CategoriasDropdown';
import MobileMenu from '@/components/ecommerce/layout/MobileMenu';
import CartDrawer from '@/components/ecommerce/carrito/CartSummary';

export default function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { items } = useCarrito();
  const { favoritos } = useFavoritos();
  const cantidadOrdenes = items.length;

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/ecommerce/productos?search=${encodeURIComponent(searchQuery)}`;
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[100] bg-white px-4 md:px-8 pt-20"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-end mb-8">
                <button 
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={30} className="text-slate-900" />
                </button>
              </div>
              
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="¿Qué estás buscando hoy?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-3xl md:text-5xl font-light border-b-2 border-slate-900 pb-4 outline-none placeholder:text-slate-200"
                />
                <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2">
                  <ArrowRight size={40} className="text-slate-900" />
                </button>
              </form>

              <div className="mt-12">
                <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-400 mb-6">Sugerencias</h4>
                <div className="flex flex-wrap gap-3">
                  {['Blusas de seda', 'Vestidos de gala', 'Colección Verano', 'Nuevos ingresos'].map((term) => (
                    <button 
                      key={term}
                      onClick={() => {
                        setSearchQuery(term);
                        window.location.href = `/ecommerce/productos?search=${encodeURIComponent(term)}`;
                      }}
                      className="px-6 py-2 border border-slate-200 rounded-full text-sm hover:border-slate-900 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner superior */}
      <div className="bg-[#f02d65] text-white py-2 px-4 text-center">
        <p className="text-[11px] md:text-xs font-bold tracking-[0.2em] uppercase">
          Envíos gratis a partir de S/ 299
        </p>
      </div>

      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-white py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 md:h-24">
            
            {/* Logo */}
            <div className="flex-1 flex items-center">
              <button onClick={() => setMenuAbierto(true)} className="p-2 -ml-2 mr-4 md:hidden text-gray-800">
                <Menu size={26} />
              </button>
              <Link href="/ecommerce">
                <Image
                  src="/logo-guor.png"
                  alt="GUOR"
                  width={240}
                  height={48}
                  className="h-16 md:h-20 w-auto object-contain"
                  priority
                />
              </Link>
            </div>

            {/* Navegación */}
            <nav className="hidden md:flex items-center justify-center gap-10">
              <Link
                href="/ecommerce/new"
                className="text-sm font-black uppercase tracking-[0.15em] text-gray-800 hover:text-[#f02d65] transition-colors"
              >
                New
              </Link>
              <CategoriasDropdown />
              <Link
                href="/ecommerce/nosotros"
                className="text-sm font-black uppercase tracking-[0.15em] text-gray-800 hover:text-[#f02d65] transition-colors"
              >
                Nosotros
              </Link>
              <Link
                href="/ecommerce/ofertas"
                className="text-sm font-black uppercase tracking-[0.15em] text-[#f02d65] transition-colors"
              >
                Ofertas
              </Link>
            </nav>

            {/* Íconos */}
            <div className="flex-1 flex items-center justify-end gap-3 md:gap-5">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-700 hover:text-[#f02d65] transition-colors"
                aria-label="Buscar productos"
              >
                <Search size={24} strokeWidth={2.5} />
              </button>

              <Link href="/ecommerce/login" className="hidden sm:block p-2 text-gray-700 hover:text-[#f02d65] transition-colors">
                <User size={24} strokeWidth={2.5} />
              </Link>

              <Link href="/ecommerce/favoritos" className="relative p-2 text-gray-700 hover:text-[#f02d65] transition-colors">
                <Heart size={24} strokeWidth={2.5} />
                {favoritos.length > 0 && (
                  <span className="absolute top-1 right-0 bg-red-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {favoritos.length}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-700 hover:text-[#f02d65] transition-colors"
              >
                <ShoppingCart size={24} strokeWidth={2.5} />
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

      <MobileMenu isOpen={menuAbierto} onClose={() => setMenuAbierto(false)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}