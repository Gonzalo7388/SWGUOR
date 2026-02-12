'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ChevronDown, Instagram, Facebook, Twitter, User, Loader2 } from 'lucide-react';
import { CategoriasService } from '@/lib/services/categoriasService';

interface Categoria {
  id: number;
  nombre: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [productosSubmenuAbierto, setProductosSubmenuAbierto] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      const data = await CategoriasService.getCategorias();
      setCategorias(data);
    } catch (err) {
      console.error('[MOBILE] Error loading categorias:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = () => {
    setProductosSubmenuAbierto(false);
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-60 md:hidden ${isOpen ? 'visible' : 'invisible'}`}>
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onClose} 
      />
      
      <div className={`absolute top-0 left-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-500 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <Image src="/logo-guor.png" alt="GUOR" width={200} height={40} className="h-11 w-auto" />
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={24} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <ul className="space-y-1">
              <li>
                <Link 
                  href="/ecommerce/new" 
                  onClick={handleLinkClick} 
                  className="block px-4 py-3.5 text-base font-bold text-gray-900 uppercase hover:text-[#f02d65]"
                >
                  New In
                </Link>
              </li>
              
              <li>
                <button 
                  onClick={() => setProductosSubmenuAbierto(!productosSubmenuAbierto)} 
                  className="w-full flex items-center justify-between px-4 py-3.5 text-base font-bold text-gray-900 uppercase"
                >
                  Productos
                  <ChevronDown 
                    size={18} 
                    className={`transition-transform ${productosSubmenuAbierto ? 'rotate-180' : ''}`} 
                  />
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ${productosSubmenuAbierto ? 'max-h-125' : 'max-h-0'}`}>
                  <div className="pl-4 py-2 space-y-1 bg-gray-50/50 rounded-xl mt-1">
                    {loading ? (
                      <div className="p-4 flex justify-center">
                        <Loader2 className="animate-spin text-rose-500" />
                      </div>
                    ) : (
                      <>
                        {categorias.map((cat) => (
                          <Link 
                            key={cat.id} 
                            href={`/ecommerce/categorias/${cat.id}`} 
                            onClick={handleLinkClick} 
                            className="block px-4 py-3 text-sm font-semibold text-gray-600 hover:text-rose-600 border-l-2 border-transparent hover:border-rose-500"
                          >
                            {cat.nombre}
                          </Link>
                        ))}
                        <Link 
                          href="/ecommerce/productos" 
                          onClick={handleLinkClick} 
                          className="block px-4 py-3 text-sm font-bold text-rose-600 uppercase"
                        >
                          Ver todo →
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </li>

              <li>
                <Link 
                  href="/ecommerce/nosotros" 
                  onClick={handleLinkClick} 
                  className="block px-4 py-3.5 text-base font-bold text-gray-900 uppercase hover:text-[#f02d65]"
                >
                  Nosotros
                </Link>
              </li>
              
              <li>
                <Link 
                  href="/ecommerce/ofertas" 
                  onClick={handleLinkClick} 
                  className="block px-4 py-3.5 text-base font-black text-rose-600 uppercase"
                >
                  Ofertas %
                </Link>
              </li>
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t p-6 space-y-6 bg-gray-50">
            <Link 
              href="/ecommerce/login" 
              onClick={handleLinkClick} 
              className="flex items-center justify-center gap-2 w-full py-4 bg-gray-900 text-white rounded-xl text-sm font-bold uppercase"
            >
              <User size={18} />
              Mi Cuenta
            </Link>
            <div className="flex justify-center gap-8">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full shadow-sm hover:text-rose-500">
                <Instagram size={20} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full shadow-sm hover:text-rose-500">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full shadow-sm hover:text-rose-500">
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}