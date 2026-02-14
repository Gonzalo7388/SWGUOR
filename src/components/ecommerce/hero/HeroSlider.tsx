'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const DIAPOSITIVAS = [
  {
    id: 1,
    titulo: 'Primavera Radiante',
    subtitulo: 'Nueva Colección',
    descripcion: 'Descubre la frescura de nuestra nueva línea. Diseños que celebran tu autenticidad.',
    imagen: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
    color: 'from-primary-600/90 to-primary-800/70',
    acento: 'primary',
    enlace: '/ecommerce/productos',
  },
  {
    id: 2,
    titulo: 'Elegancia Atemporal',
    subtitulo: 'Edición Especial',
    descripcion: 'Piezas exclusivas que definen tu estilo único. Lujo en cada detalle.',
    imagen: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop',
    color: 'from-accent-600/90 to-accent-800/70',
    acento: 'accent',
    enlace: '/ecommerce/productos',
  },
  {
    id: 3,
    titulo: 'Sofisticación Moderna',
    subtitulo: 'Tendencias 2026',
    descripcion: 'Estilo contemporáneo para la mujer segura de sí misma. Tu mejor versión.',
    imagen: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop',
    color: 'from-primary-700/90 via-primary-600/80 to-accent-700/70',
    acento: 'primary',
    enlace: '/ecommerce/productos',
  },
];

export default function CarruselHeroi() {
  const [actual, setActual] = useState(0);
  const [direccion, setDireccion] = useState(0);

  useEffect(() => {
    const temporizador = setInterval(() => {
      siguiente();
    }, 7000);
    return () => clearInterval(temporizador);
  }, [actual]);

  const siguiente = () => {
    setDireccion(1);
    setActual((prev) => (prev + 1) % DIAPOSITIVAS.length);
  };
  
  const anterior = () => {
    setDireccion(-1);
    setActual((prev) => (prev - 1 + DIAPOSITIVAS.length) % DIAPOSITIVAS.length);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <section className="relative w-full h-screen overflow-hidden bg-gray-950">
      <AnimatePresence initial={false} custom={direccion} mode="wait">
        <motion.div
          key={actual}
          custom={direccion}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.5 },
            scale: { duration: 0.5 },
          }}
          className="absolute inset-0"
        >
          {/* Imagen de fondo con efecto parallax */}
          <motion.div
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 7, ease: "linear" }}
            className="absolute inset-0"
          >
            <img
              src={DIAPOSITIVAS[actual].imagen}
              alt={DIAPOSITIVAS[actual].titulo}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Overlay con gradiente sofisticado */}
          <div className={`absolute inset-0 bg-gradient-to-br ${DIAPOSITIVAS[actual].color}`} />
          
          {/* Overlay adicional para mejor contraste en texto */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Contenido */}
          <div className="relative h-full flex items-center">
            <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
              <div className="max-w-2xl">
                {/* Subtítulo animado */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="mb-6"
                >
                  <div className="inline-flex items-center gap-3">
                    <div className={`h-px w-12 ${DIAPOSITIVAS[actual].acento === 'primary' ? 'bg-primary-300' : 'bg-accent-300'}`} />
                    <span className={`text-sm font-semibold uppercase tracking-[0.3em] ${DIAPOSITIVAS[actual].acento === 'primary' ? 'text-primary-200' : 'text-accent-200'}`}>
                      {DIAPOSITIVAS[actual].subtitulo}
                    </span>
                  </div>
                </motion.div>

                {/* Título principal */}
                <motion.h1
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.7 }}
                  className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-[1.1] tracking-tight"
                >
                  {DIAPOSITIVAS[actual].titulo}
                </motion.h1>

                {/* Descripción */}
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="text-lg md:text-xl text-gray-100 mb-10 leading-relaxed max-w-xl font-light"
                >
                  {DIAPOSITIVAS[actual].descripcion}
                </motion.p>

                {/* Botón CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  <Link href={DIAPOSITIVAS[actual].enlace}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`group relative px-10 py-5 overflow-hidden ${
                        DIAPOSITIVAS[actual].acento === 'primary' 
                          ? 'bg-primary-600 hover:bg-primary-700' 
                          : 'bg-accent-600 hover:bg-accent-700'
                      } text-white rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl`}
                    >
                      <span className="relative z-10 text-sm font-bold uppercase tracking-widest flex items-center gap-3">
                        Explorar Colección
                        <motion.span
                          initial={{ x: 0 }}
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          →
                        </motion.span>
                      </span>
                    </motion.button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controles de navegación elegantes */}
      <div className="absolute bottom-12 right-8 md:right-12 flex gap-3 z-30">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={anterior}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-gray-900 transition-all duration-300 shadow-lg"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={siguiente}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-gray-900 transition-all duration-300 shadow-lg"
        >
          <ChevronRight size={24} strokeWidth={2.5} />
        </motion.button>
      </div>

      {/* Indicadores de diapositiva modernos */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-30">
        {DIAPOSITIVAS.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDireccion(index > actual ? 1 : -1);
              setActual(index);
            }}
            className="group relative"
          >
            <div
              className={`h-1 rounded-full transition-all duration-500 ${
                index === actual
                  ? 'w-12 bg-white'
                  : 'w-8 bg-white/40 hover:bg-white/60'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Barra de progreso sutil */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/10 z-20">
        <motion.div
          key={actual}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 7, ease: 'linear' }}
          className={`h-full ${
            DIAPOSITIVAS[actual].acento === 'primary' ? 'bg-primary-400' : 'bg-accent-400'
          }`}
        />
      </div>

      {/* Número de slide (detalle elegante) */}
      <div className="absolute top-12 right-8 md:right-12 z-30">
        <div className="flex items-center gap-2 text-white/60 font-light">
          <span className="text-3xl font-bold text-white">
            {String(actual + 1).padStart(2, '0')}
          </span>
          <span className="text-xl">/</span>
          <span className="text-xl">
            {String(DIAPOSITIVAS.length).padStart(2, '0')}
          </span>
        </div>
      </div>
    </section>
  );
}