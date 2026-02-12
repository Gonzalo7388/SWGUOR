'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const DIAPOSITIVAS = [
  {
    id: 1,
    titulo: 'Colección de Verano 2026',
    subtitulo: 'LA ELEGANCIA DEL SOL',
    descripcion: 'Descubre texturas ligeras y cortes atemporales diseñados para la mujer moderna.',
    imagen: '/ofertas/sale-50-pink.jpg',
    llamada: 'Explorar Colección',
    enlace: '/ecommerce/productos',
  },
  {
    id: 2,
    titulo: 'Promoción Flash',
    subtitulo: 'EDICIÓN LIMITADA',
    descripcion: 'Aprovecha un 50% de descuento exclusivo en nuestra selección de vestidos de gala.',
    imagen: '/ofertas/flash-sale.jpg',
    llamada: 'Ver Ofertas',
    enlace: '/ecommerce/productos',
  },
  {
    id: 3,
    titulo: 'Esencia Guor',
    subtitulo: 'DISEÑOS ÚNICOS',
    descripcion: 'Cada pieza cuenta una historia. Encuentra la tuya en nuestra nueva curaduría.',
    imagen: '/ofertas/shopping-bags.jpg',
    llamada: 'Descubrir más',
    enlace: '/ecommerce/productos',
  },
];

export default function CarruselHeroi() {
  const [actual, setActual] = useState(0);

  useEffect(() => {
    const temporizador = setInterval(() => {
      siguiente();
    }, 6000);
    return () => clearInterval(temporizador);
  }, [actual]);

  const siguiente = () => setActual((prev) => (prev + 1) % DIAPOSITIVAS.length);
  const anterior = () => setActual((prev) => (prev - 1 + DIAPOSITIVAS.length) % DIAPOSITIVAS.length);

  return (
    <div className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden bg-[#F5EBEB]">
      <AnimatePresence mode="wait">
        <motion.div
          key={actual}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="relative w-full h-full"
        >
          {/* Imagen de Fondo con Zoom sutil */}
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 6 }}
            src={DIAPOSITIVAS[actual].imagen}
            alt={DIAPOSITIVAS[actual].titulo}
            className="w-full h-full object-cover"
          />

          {/* Overlay Gradiente */}
          <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/20 to-transparent" />

          {/* Contenido Editorial */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
              <div className="max-w-xl text-white">
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-block text-[#D4AF37] text-xs md:text-sm font-bold uppercase tracking-[0.4em] mb-4"
                >
                  {DIAPOSITIVAS[actual].subtitulo}
                </motion.span>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-4xl md:text-7xl font-serif leading-tight mb-6"
                >
                  {DIAPOSITIVAS[actual].titulo}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-gray-200 text-sm md:text-lg mb-8 font-light max-w-md leading-relaxed"
                >
                  {DIAPOSITIVAS[actual].descripcion}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <Link href={DIAPOSITIVAS[actual].enlace}>
                    <button className="group relative px-8 py-4 overflow-hidden border border-[#D4AF37] text-white transition-all duration-300 hover:text-black flex items-center gap-3">
                      <span className="absolute inset-0 bg-[#D4AF37] translate-y-full transition-transform duration-300 group-hover:translate-y-0" />
                      <span className="relative z-10 text-xs font-bold uppercase tracking-widest">
                        {DIAPOSITIVAS[actual].llamada}
                      </span>
                      <ArrowRight size={16} className="relative z-10 transition-transform group-hover:translate-x-1" />
                    </button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navegación Minimalista */}
      <div className="absolute bottom-10 right-10 flex gap-4 z-20">
        <button
          onClick={anterior}
          className="w-12 h-12 flex items-center justify-center rounded-full border border-white/30 text-white hover:bg-white hover:text-black transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={siguiente}
          className="w-12 h-12 flex items-center justify-center rounded-full border border-white/30 text-white hover:bg-white hover:text-black transition-all"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Indicador de barra de progreso */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-20">
        <motion.div
          key={actual}
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 6, ease: "linear" }}
          className="h-full bg-[#D4AF37]"
        />
      </div>
    </div>
  );
}