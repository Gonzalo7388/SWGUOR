'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, User, Menu, X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CATEGORIES = [
  { id: 1, name: 'Vestidos', href: '#' },
  { id: 2, name: 'Blusas', href: '#' },
  { id: 3, name: 'Pantalones', href: '#' },
  { id: 4, name: 'Faldas', href: '#' },
  { id: 5, name: 'Accesorios', href: '#' },
  { id: 6, name: 'Buzos', href: '#' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gray-100 text-gray-700 text-sm py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>📦 Envío gratis en compras mayores a $50.000</div>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-gray-900">Rastrear orden</Link>
            <Link href="#" className="hover:text-gray-900">Soporte</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between gap-8">
            {/* Logo */}
            <Link href="/ecommerce" className="flex-shrink-0">
              <div className="text-2xl font-bold text-gray-900">
                <span className="text-red-600">SWGUOR</span>
              </div>
              <p className="text-xs text-gray-600">Ropa para Mujeres</p>
            </Link>

            {/* Search Bar */}
            <div className="flex-grow max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                />
                <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-6">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <Heart size={24} className="text-gray-700" />
              </button>
              <Link href="/ecommerce/login" className="p-2 hover:bg-gray-100 rounded-lg transition">
                <User size={24} className="text-gray-700" />
              </Link>
              <Link href="/ecommerce/carrito" className="relative p-2 hover:bg-gray-100 rounded-lg transition">
                <ShoppingCart size={24} className="text-gray-700" />
                <span className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  0
                </span>
              </Link>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between">
            <Link href="/ecommerce">
              <div className="text-xl font-bold text-gray-900">
                <span className="text-red-600">SWGUOR</span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <button onClick={() => setSearchOpen(!searchOpen)}>
                <Search size={24} />
              </button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          {searchOpen && (
            <div className="md:hidden mt-4">
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Navigation Categories */}
        <nav className="border-t border-gray-200 hidden md:block">
          <div className="max-w-7xl mx-auto px-4">
            <ul className="flex justify-start gap-8 py-3">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={cat.href}
                    className="text-gray-700 hover:text-red-600 transition font-medium text-sm"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden border-t border-gray-200">
            <div className="px-4 py-4">
              <ul className="space-y-4">
                {CATEGORIES.map((cat) => (
                  <li key={cat.id}>
                    <Link href={cat.href} className="text-gray-700 hover:text-red-600 block">
                      {cat.name}
                    </Link>
                  </li>
                ))}
                <hr className="my-4" />
                <li>
                  <Link href="/ecommerce/carrito" className="text-gray-700 hover:text-red-600 flex items-center gap-2">
                    <ShoppingCart size={20} /> Carrito
                  </Link>
                </li>
                <li>
                  <Link href="/ecommerce/login" className="text-gray-700 hover:text-red-600 flex items-center gap-2">
                    <User size={20} /> Mi Cuenta
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
