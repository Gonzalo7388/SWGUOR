'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Twitter, Mail, Heart, MapPin, Phone, ArrowRight } from 'lucide-react';
import { useCategoriasEcommerce } from '@/lib/hooks/useCategoriasEcommerce';

export default function PiePagina() {
  const { categorias, loading } = useCategoriasEcommerce();
  const categoriasVisibles = categorias.slice(0, 6);

  // URLs de logotipos actualizadas y estables
  const LOGOS_PAGO = [
    { name: 'Visa', url: '/logo-financieros/visa-logo-png_seeklogo-198364-removebg-preview.png' },
    { name: 'Mastercard', url: '/logo-financieros/Mastercard-logo.png' },
    { name: 'BBVA', url: '/logo-financieros/bbva-logo-png_seeklogo-352321-removebg-preview.png' },
    { name: 'Interbank', url: '/logo-financieros/interbank-logo-png_seeklogo-196999-removebg-preview.png' },
    { name: 'Scotiabank', url: '/logo-financieros/scotiabank-logo-png_seeklogo-123807-removebg-preview.png' },
  ];

  return (
    <footer className="bg-[#F5EBEB] text-gray-700 mt-20 border-t border-[#D4AF37]/20">
      {/* Sección Newsletter */}
      <div className="relative overflow-hidden border-b border-[#D4AF37]/10 bg-[#EAD7D7]/30">
        <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center lg:text-left">
              <h3 className="text-2xl md:text-3xl font-serif text-[#4A3737] mb-2">
                Únete a la <span className="text-[#B8962D] italic">Experiencia GUOR</span>
              </h3>
              <p className="text-sm text-[#8A7676]">
                Suscríbete para recibir lanzamientos exclusivos y curaduría de moda mensual.
              </p>
            </div>
            <div className="w-full max-w-md">
              <div className="flex p-1 bg-white rounded-full border border-[#D4AF37]/30 focus-within:border-[#D4AF37] transition-all shadow-sm">
                <input
                  type="email"
                  placeholder="Tu email de estilo..."
                  className="grow bg-transparent px-5 py-2 text-sm text-[#4A3737] focus:outline-none placeholder:text-gray-400"
                />
                <button className="bg-[#D4AF37] hover:bg-[#b8962d] text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-md">
                  Unirme
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pie Principal */}
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Identidad de Marca */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-block group">
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 p-1 bg-linear-to-tr from-[#D4AF37] to-white rounded-full shadow-md transition-transform group-hover:rotate-12">
                  <div className="bg-white rounded-full w-full h-full flex items-center justify-center overflow-hidden p-1">
                    <Image
                      src="/logo.png"
                      alt="Modas y Estilos GUOR"
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                </div>
                <div>
                  <span className="block text-xl font-serif text-[#4A3737] tracking-widest uppercase leading-none">GUOR</span>
                  <span className="text-[10px] text-[#B8962D] uppercase tracking-[0.3em] font-medium">Modas & Estilos</span>
                </div>
              </div>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs italic font-light text-[#6D5A5A]">
              Redefiniendo la elegancia femenina a través de piezas de alta calidad y diseño atemporal.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter].map((Icon, idx) => (
                <Link key={idx} href="#" className="w-9 h-9 flex items-center justify-center rounded-full border border-[#D4AF37]/30 text-[#8A7676] hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all duration-300 bg-white/50">
                  <Icon size={16} />
                </Link>
              ))}
            </div>
          </div>

          {/* Categorías Dinámicas */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-[#4A3737] text-xs font-bold uppercase tracking-[0.2em] border-l-2 border-[#D4AF37] pl-3">Colecciones</h4>
            <ul className="space-y-3 text-[13px]">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <li key={i} className="h-4 w-20 bg-[#EAD7D7] animate-pulse rounded"></li>
                ))
              ) : (
                categoriasVisibles.map((cat) => (
                  <li key={cat.id}>
                    <Link href={`/ecommerce/productos?categoria=${cat.id}`} className="hover:text-[#D4AF37] transition-colors flex items-center group text-[#6D5A5A]">
                      <ArrowRight size={10} className="mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-[#D4AF37]" />
                      {cat.nombre}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Atención VIP */}
          <div className="lg:col-span-3 space-y-6">
            <h4 className="text-[#4A3737] text-xs font-bold uppercase tracking-[0.2em] border-l-2 border-[#D4AF37] pl-3">Atención VIP</h4>
            <ul className="space-y-3 text-[13px] text-[#6D5A5A]">
              {['Preguntas Frecuentes', 'Guía de Tallas', 'Seguimiento de Pedido', 'Políticas de Envío'].map((item) => (
                <li key={item}>
                  <Link href="#" className="hover:text-[#D4AF37] transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto Directo */}
          <div className="lg:col-span-3 space-y-6">
            <h4 className="text-[#4A3737] text-xs font-bold uppercase tracking-[0.2em] border-l-2 border-[#D4AF37] pl-3">Showroom</h4>
            <div className="space-y-4 text-[13px] text-[#6D5A5A]">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-[#D4AF37] shrink-0" />
                <p>Las Condes, Santiago, Chile <br /><span className="text-[11px] text-[#8A7676] font-light">Atención bajo reserva previa</span></p>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-[#D4AF37] shrink-0" />
                <p>+51 992 439 550</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-[#D4AF37] shrink-0" />
                <p>concierge@swguor.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Barra Inferior y Pagos */}
        <div className="border-t border-[#D4AF37]/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[11px] uppercase tracking-widest text-[#8A7676] font-light text-center md:text-left">
            &copy; 2026 <span className="text-[#4A3737] font-medium">SWGUOR</span>. Hecho con <Heart size={10} className="inline mx-1 text-[#D4AF37]" fill="currentColor" /> para el mundo.
          </p>
          
          {/* Métodos de Pago con Logos Mejorados */}
          <div className="flex items-center gap-6 flex-wrap justify-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {LOGOS_PAGO.map((logo) => (
              <img 
                key={logo.name}
                src={logo.url} 
                alt={logo.name} 
                className="h-5 md:h-6 w-auto object-contain max-w-20"
                onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ))}
          </div>
        </div>      
      </div>
    </footer>
  );
}