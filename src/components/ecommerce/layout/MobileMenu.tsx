'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ChevronRight, Instagram, Facebook, MessageCircle, User, Loader2, Tag, ArrowRight } from 'lucide-react';
import { CategoriasService } from '@/lib/services/categoriasService';
import { useEcommerce } from '@/app/ecommerce/_contexts/AuthContext';

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
  const { user } = useEcommerce();

  const userDisplayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Mi Cuenta';

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
    <div className={`fixed inset-0 z-[9999] md:hidden ${isOpen ? 'visible' : 'invisible'}`}>

      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`absolute top-0 left-0 h-full w-[88%] max-w-[340px] bg-white shadow-2xl flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* ── Header ── */}
        <div className="relative flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <Image src="/logo-guor.png" alt="GUOR" width={200} height={40} className="h-9 w-auto" />
          <button
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 overflow-y-auto py-4">

          {/* NEW IN */}
          <Link
            href="/ecommerce/new"
            onClick={handleLinkClick}
            className="group block mx-3 px-4 py-3.5 rounded-2xl hover:bg-[#f02d65]/5 active:bg-[#f02d65]/10 transition-colors"
          >
            <span className="text-[13px] font-black uppercase tracking-widest text-gray-900 group-hover:text-[#f02d65] transition-colors">
              New In
            </span>
          </Link>

          {/* Divider */}
          <div className="mx-5 my-3 border-t border-gray-100" />

          {/* PRODUCTOS con submenu */}
          <div className="mx-3">
            <button
              onClick={() => setProductosSubmenuAbierto(!productosSubmenuAbierto)}
              className="group w-full flex items-center justify-between px-4 py-3.5 rounded-2xl hover:bg-[#f02d65]/5 active:bg-[#f02d65]/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`flex items-center justify-center w-8 h-8 rounded-xl transition-colors ${productosSubmenuAbierto ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <Tag size={14} />
                </span>
                <span className="text-[13px] font-black uppercase tracking-widest text-gray-900 group-hover:text-[#f02d65] transition-colors">
                  Productos
                </span>
              </div>
              <ChevronRight
                size={16}
                strokeWidth={2.5}
                className={`text-gray-400 group-hover:text-[#f02d65] transition-transform duration-300 ${productosSubmenuAbierto ? 'rotate-90' : ''}`}
              />
            </button>

            {/* Submenu categorías */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${productosSubmenuAbierto ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="mt-1 mb-2 ml-4 pl-3 border-l-2 border-gray-100 space-y-0.5 py-1">
                {loading ? (
                  <div className="py-6 flex justify-center">
                    <Loader2 size={20} className="animate-spin text-[#f02d65]" />
                  </div>
                ) : (
                  <>
                    {categorias.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/ecommerce/categorias/${cat.id}`}
                        onClick={handleLinkClick}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                        {cat.nombre}
                      </Link>
                    ))}
                    <Link
                      href="/ecommerce/productos"
                      onClick={handleLinkClick}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest text-[#f02d65] hover:bg-[#f02d65]/5 transition-colors mt-1"
                    >
                      Ver todo el catálogo
                      <ArrowRight size={12} />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* NOSOTROS */}
          <div className="mx-3 mt-0.5">
            <Link
              href="/ecommerce/nosotros"
              onClick={handleLinkClick}
              className="group flex items-center justify-between px-4 py-3.5 rounded-2xl hover:bg-[#f02d65]/5 active:bg-[#f02d65]/10 transition-colors"
            >
              <span className="text-[13px] font-black uppercase tracking-widest text-gray-900 group-hover:text-[#f02d65] transition-colors">
                Nosotros
              </span>
              <ChevronRight size={16} strokeWidth={2.5} className="text-gray-300 group-hover:text-[#f02d65] transition-colors" />
            </Link>
          </div>

          {/* OFERTAS */}
          <div className="mx-3 mt-2">
            <Link
              href="/ecommerce/ofertas"
              onClick={handleLinkClick}
              className="group block px-4 py-3.5 rounded-2xl hover:bg-[#f02d65]/5 active:bg-[#f02d65]/10 transition-colors"
            >
              <span className="text-[13px] font-black uppercase tracking-widest text-gray-900 group-hover:text-[#f02d65] transition-colors">
                Ofertas
              </span>
            </Link>
          </div>
        </nav>

        {/* ── Footer ── */}
        <div className="border-t border-gray-100 px-5 py-5 space-y-4">
          <Link
            href={user ? '/ecommerce/perfil' : '/ecommerce/login'}
            onClick={handleLinkClick}
            className={`flex items-center justify-center gap-2.5 w-full py-3.5 bg-gray-900 text-white rounded-2xl text-[12px] font-black active:scale-[0.98] transition-transform ${user ? 'normal-case tracking-wide' : 'uppercase tracking-widest'}`}
          >
            <User size={15} />
            {userDisplayName}
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Síguenos</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div className="flex justify-center gap-3">
            {[
              { href: 'https://www.instagram.com/giobrand.pe?igsh=MTZzZHNkMXc3cDZo', Icon: Instagram, label: 'Instagram' },
              { href: 'https://www.facebook.com/share/18WiHhpZ1i/', Icon: Facebook, label: 'Facebook' },
              { href: 'https://wa.me/51908801912', Icon: MessageCircle, label: 'WhatsApp' },
            ].map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 text-gray-500 hover:text-[#f02d65] hover:border-[#f02d65]/30 active:scale-95 transition-all"
              >
                <Icon size={17} />
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}