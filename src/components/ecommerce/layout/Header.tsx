'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, User, Menu, Heart, X, ArrowRight, LogOut, AlertCircle, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { useCarrito } from '@/app/ecommerce/_contexts/CartContext';
import { useFavoritos } from '@/app/ecommerce/_contexts/FavoritosContext';
import { useEcommerce } from '@/app/ecommerce/_contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import CategoriasDropdown from '@/components/ecommerce/layout/CategoriasDropdown';
import MobileMenu from '@/components/ecommerce/layout/MobileMenu';
import CartDrawer from '@/components/ecommerce/carrito/CartSummary';

export default function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const { items } = useCarrito();
  const { favoritos } = useFavoritos();
  const { user, signOut, signInWithEmail, registerWithEmail, signInWithGoogle } = useEcommerce();
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

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/ecommerce/productos?search=${encodeURIComponent(searchQuery)}`;
      setIsSearchOpen(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    setAuthSuccess('');
    const safeEmail = authEmail.trim().toLowerCase();

    if (!safeEmail) {
      setAuthError('Ingresa tu correo Gmail para continuar con Google.');
      return;
    }

    setAuthLoading(true);
    try {
      const { error } = await signInWithGoogle(safeEmail);

      if (error) {
        setAuthError(error);
        return;
      }

      setIsProfileOpen(false);
      window.location.href = '/ecommerce/perfil';
    } catch {
      setAuthError('No fue posible iniciar con Google.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!authEmail || !authPassword) {
      setAuthError('Completa correo y contrasena.');
      return;
    }

    if (authMode === 'register' && authPassword !== authConfirmPassword) {
      setAuthError('Las contrasenas no coinciden.');
      return;
    }

    setAuthLoading(true);

    try {
      if (authMode === 'login') {
        const { error } = await signInWithEmail(authEmail, authPassword);

        if (error) {
          setAuthError(error);
          return;
        }

        setIsProfileOpen(false);
        window.location.href = '/ecommerce/perfil';
        return;
      }

      const { error } = await registerWithEmail(authEmail, authPassword);

      if (error) {
        setAuthError(error);
        return;
      }

      setAuthSuccess('Cuenta creada y sesion iniciada.');
      setAuthPassword('');
      setAuthConfirmPassword('');
      setIsProfileOpen(false);
      window.location.href = '/ecommerce/perfil';
    } catch {
      setAuthError('Ocurrio un error. Intenta nuevamente.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setIsProfileOpen(false);
    window.location.href = '/ecommerce';
  };

  const userDisplayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Mi cuenta';

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

              <div className="relative hidden sm:block" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className={`p-2 transition-colors ${isProfileOpen ? 'text-[#f02d65]' : 'text-gray-700 hover:text-[#f02d65]'}`}
                  aria-label="Abrir panel de usuario"
                >
                  <User size={24} strokeWidth={2.5} />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-12 w-72 rounded-2xl border border-[#E7D7D7] bg-white p-4 shadow-xl"
                    >
                      {user ? (
                        <div className="space-y-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-[#8A7676]">Sesion activa</p>
                          <div>
                            <p className="text-sm font-semibold text-[#4A3737] truncate">{userDisplayName}</p>
                            <p className="text-xs text-[#8A7676] truncate">{user.email}</p>
                          </div>
                          <Link
                            href="/ecommerce/perfil"
                            onClick={() => setIsProfileOpen(false)}
                            className="block w-full text-center rounded-full border border-[#D4AF37]/40 px-4 py-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#4A3737] hover:border-[#D4AF37]"
                          >
                            Ver mi perfil
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center justify-center gap-2 rounded-full bg-[#f7f2f2] px-4 py-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#4A3737] hover:bg-[#F5EBEB]"
                          >
                            <LogOut size={14} /> Cerrar sesion
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-[#8A7676]">Acceso rapido</p>
                          <div className="flex rounded-full bg-[#F5EBEB] p-1">
                            <button
                              type="button"
                              onClick={() => {
                                setAuthMode('login');
                                setAuthError('');
                                setAuthSuccess('');
                              }}
                              className={`flex-1 rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] font-semibold ${authMode === 'login' ? 'bg-white text-[#4A3737]' : 'text-[#8A7676]'}`}
                            >
                              Ingresar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAuthMode('register');
                                setAuthError('');
                                setAuthSuccess('');
                              }}
                              className={`flex-1 rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] font-semibold ${authMode === 'register' ? 'bg-white text-[#4A3737]' : 'text-[#8A7676]'}`}
                            >
                              Crear
                            </button>
                          </div>

                          <form className="space-y-2" onSubmit={handleEmailAuth}>
                            <input
                              type="email"
                              value={authEmail}
                              onChange={(e) => setAuthEmail(e.target.value)}
                              placeholder="correo@gmail.com"
                              className="w-full rounded-xl border border-[#E7D7D7] px-3 py-2 text-xs text-[#4A3737] placeholder:text-[#AA9A9A] focus:outline-none focus:border-[#D4AF37]"
                            />
                            <input
                              type="password"
                              value={authPassword}
                              onChange={(e) => setAuthPassword(e.target.value)}
                              placeholder="Contrasena"
                              className="w-full rounded-xl border border-[#E7D7D7] px-3 py-2 text-xs text-[#4A3737] placeholder:text-[#AA9A9A] focus:outline-none focus:border-[#D4AF37]"
                            />

                            {authMode === 'register' && (
                              <input
                                type="password"
                                value={authConfirmPassword}
                                onChange={(e) => setAuthConfirmPassword(e.target.value)}
                                placeholder="Confirmar contrasena"
                                className="w-full rounded-xl border border-[#E7D7D7] px-3 py-2 text-xs text-[#4A3737] placeholder:text-[#AA9A9A] focus:outline-none focus:border-[#D4AF37]"
                              />
                            )}

                            {authError && (
                              <p className="flex items-start gap-1.5 text-[11px] text-red-600">
                                <AlertCircle size={12} className="mt-0.5 shrink-0" /> {authError}
                              </p>
                            )}

                            {authSuccess && (
                              <p className="flex items-start gap-1.5 text-[11px] text-emerald-600">
                                <CheckCircle2 size={12} className="mt-0.5 shrink-0" /> {authSuccess}
                              </p>
                            )}

                            <button
                              type="submit"
                              disabled={authLoading}
                              className="w-full rounded-full bg-[#D4AF37] px-4 py-2 text-[11px] uppercase tracking-[0.18em] font-semibold text-white hover:bg-[#B8962D] disabled:opacity-70"
                            >
                              {authLoading ? 'Procesando...' : authMode === 'login' ? 'Ingresar con correo' : 'Crear cuenta'}
                            </button>
                          </form>

                          <button
                            onClick={handleGoogleLogin}
                            disabled={authLoading}
                            className="w-full rounded-full border border-[#E7D7D7] px-4 py-2 text-[11px] uppercase tracking-[0.18em] font-semibold text-[#4A3737] hover:border-[#D4AF37] disabled:opacity-70"
                          >
                            {authLoading ? 'Conectando...' : 'Continuar con Google'}
                          </button>

                          <Link
                            href="/ecommerce/login"
                            onClick={() => setIsProfileOpen(false)}
                            className="block text-center text-[11px] text-[#8A7676] hover:text-[#4A3737] underline underline-offset-2"
                          >
                            Abrir login compacto
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

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