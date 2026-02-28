'use client';

import Link from 'next/link';
import ProductCard from '@/components/ecommerce/productos/ProductCard';
import { useProductosEcommerce } from '@/lib/hooks/useProductosEcommerce';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Sparkles, TrendingUp } from 'lucide-react';

// ─── Variantes de animación ───────────────────────────────────────────────────

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE, delay: i * 0.07 },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-100 rounded-2xl aspect-[3/4] mb-3" />
      <div className="bg-gray-100 h-3 rounded-full w-3/4 mb-2" />
      <div className="bg-gray-100 h-3 rounded-full w-1/3" />
    </div>
  );
}

// ─── Página unificada ─────────────────────────────────────────────────────────

export default function PaginaNuevos() {
  const { productos, loading, error } = useProductosEcommerce({
    limite: 50,
    nuevo: true,
    dias: 30,
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] md:bg-white text-white md:text-gray-900">

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden"
        style={{ minHeight: '100svh' }}
      >
        {/* Imagen de fondo */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1800&q=80&auto=format&fit=crop"
            alt="Nueva Colección"
            className="w-full h-full object-cover object-top"
          />

          {/* 
            Mobile:  gradiente fuerte desde abajo (texto en la parte inferior)
            Desktop: gradiente lateral izquierdo + leve desde abajo
          */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-[#0a0a0a]/20 md:bg-gradient-to-r md:from-black/80 md:via-black/45 md:to-black/10"/>
          
          {/* Gradiente inferior extra solo desktop */}
          <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </div>

        {/* ── Contenido hero ── */}
        <div
          className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 lg:px-8 flex flex-col justify-end pb-10 md:justify-center md:items-center md:text-center md:py-32" style={{ minHeight: '100svh' }}>
          
          {/* Badge */}
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.5em] text-[#f02d65] mb-6 md:mb-8 flex items-center gap-3 justify-start md:justify-center">
            <Sparkles size={10} className="md:hidden" />
            <span className="hidden md:inline-block w-10 h-px bg-[#f02d65]" />
            Nueva Colección · 2026
          </motion.p>

          {/* Título */}
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="font-black uppercase tracking-tight text-white"
            style={{
              fontSize: 'clamp(3.2rem, 12vw, 8rem)',
              fontStyle: 'italic',
              lineHeight: 0.88,
            }}
          >
            New
            <br />
            <span className="text-[#f02d65]">Collection</span>
            <br />
            <span
              className="text-transparent"
              style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.35)' }}
            >
              Femenina
            </span>
          </motion.h1>

          {/* Descripción */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-white/70 text-sm md:text-lg leading-relaxed mt-4 mb-0 max-w-[280px] md:max-w-xl md:mx-auto">
            Diseños exclusivos para mayoristas. Las tendencias más recientes
            en moda femenina, directo a tu inventario.
          </motion.p>

          {/* Botones CTA
              Mobile:  apilados verticalmente, full-width, bordes redondeados 2xl
              Desktop: en fila, auto-width, bordes redondeados full
          */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center md:justify-center mt-7 md:mt-10 w-full md:w-auto">
            <Link
              href="#catalogo"
              className="group flex items-center justify-center gap-3 bg-[#f02d65] text-white px-8 py-4 rounded-2xl md:rounded-full font-black text-sm uppercase tracking-widest hover:bg-white hover:text-black active:scale-95 transition-all duration-300 shadow-lg shadow-[#f02d65]/30">
              Ver colección
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/ecommerce/productos"
              className="flex items-center justify-center gap-2 border border-white/30 text-white px-8 py-4 rounded-2xl md:rounded-full font-black text-sm uppercase tracking-widest hover:border-white hover:bg-white/10 active:scale-95  transition-all duration-300 backdrop-blur-sm">
              Catálogo completo
            </Link>
          </motion.div>

          {/* Stats
              Mobile:  2 pills compactos en fila, al fondo del hero
              Desktop: igual pero más grandes, centrados
          */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="flex gap-3 mt-6 md:mt-12 md:justify-center"
          >
            {/* Stat 1 */}
            <div className="flex items-center gap-3 md:gap-4 bg-white/8 md:bg-white/10 backdrop-blur-md border border-white/10 md:border-white/15 rounded-2xl px-4 md:px-8 py-3 md:py-5 flex-1 md:flex-none">
              <TrendingUp size={18} className="text-[#f02d65] shrink-0 md:hidden" />
              <div>
                <span className="text-2xl md:text-4xl font-black text-white leading-none block">
                  {loading ? '—' : productos.length}
                  <span className="text-[#f02d65]">+</span>
                </span>
                <div className="text-left md:border-l md:border-white/20 md:pl-4 md:mt-0 mt-0.5">
                  <p className="text-white font-bold text-xs md:text-sm leading-tight hidden md:block">Productos</p>
                  <p className="text-white/50 text-[9px] uppercase tracking-widest">nuevos</p>
                </div>
              </div>
            </div>

            <div className="hidden md:block w-px bg-white/15 self-stretch" />

            {/* Stat 2 */}
            <div className="flex items-center gap-3 md:gap-4 bg-white/8 md:bg-white/10 backdrop-blur-md border border-white/10 md:border-white/15 rounded-2xl px-4 md:px-8 py-3 md:py-5 flex-1 md:flex-none">
              <Sparkles size={18} className="text-[#f02d65] shrink-0 md:hidden" />
              <div>
                <span className="text-2xl md:text-4xl font-black text-white leading-none block">
                  100<span className="text-[#f02d65]">%</span>
                </span>
                <div className="text-left md:border-l md:border-white/20 md:pl-4">
                  <p className="text-white font-bold text-xs md:text-sm leading-tight hidden md:block">Calidad</p>
                  <p className="text-white/50 text-[9px] uppercase tracking-widest mt-0.5">garantizada</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Indicador de scroll (solo mobile) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent mx-auto"
          />
        </motion.div>
      </section>

      {/* ── SEPARADOR / MARQUEE ── */}
      <div className="border-y border-white/5 md:border-gray-200 overflow-hidden bg-[#0d0d0d] md:bg-white">
        <div className="flex whitespace-nowrap py-3 md:py-4" style={{ animation: 'marquee 20s linear infinite' }}>
          {Array(8).fill(null).map((_, i) => (
            <span key={i}
              className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] text-white/10 md:text-gray-900/10 px-6 md:px-8"
            >
              Nueva Colección · Modas y Estilos GUOR · Mayorista ·&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* CATÁLOGO
          Mobile:  sección blanca que "flota" sobre el hero oscuro (rounded-t-3xl)
          Desktop: fondo blanco normal, sin border-radius
       */}
      <section
        id="catalogo"
        className="bg-white rounded-t-[2rem] md:rounded-none px-4 md:px-8 lg:px-8 pt-8 md:pt-0 pb-20 max-w-full md:max-w-7xl md:mx-auto md:py-20" style={{ marginTop: '-1.5rem' }}
        >

        {/* Header sección */}
        <div className="flex items-center justify-between mb-6 md:mb-12 md:pb-8 md:border-b md:border-gray-100">
          <div className="flex items-center gap-3 md:gap-6">
            {/* Barra decorativa solo desktop */}
            <div className="hidden md:block w-0.5 h-14 bg-[#f02d65] rounded-full" />
            <div>
              <p className="text-[9px] md:text-[10px] font-semibold uppercase tracking-[0.5em] text-gray-400 mb-1">
                Últimos 30 días
              </p>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold md:font-light text-gray-900 tracking-wide leading-snug">
                Lo último en llegar{' '}
                <span className="font-semibold text-[#f02d65]">·</span>
              </h2>
            </div>
          </div>

          {/* "Ver todo" — pill en mobile, link en desktop */}
          <Link
            href="/ecommerce/productos"
            className="flex items-center gap-1 md:gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#f02d65] md:text-gray-400 border border-[#f02d65]/30 md:border-none px-3 py-2 md:p-0 rounded-full md:rounded-none hover:text-[#f02d65] active:scale-95 md:active:scale-100 transition-all"
            >
            Ver todo
            <ArrowRight size={10} className="md:hidden" />
            <ArrowUpRight size={14} className="hidden md:block" />
          </Link>
        </div>

        {/* Estados: loading / error / vacío / productos */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {Array(12).fill(null).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-20 md:py-24 border border-gray-200 rounded-3xl">
            <p className="text-gray-400 mb-6 text-base md:text-lg">Error cargando productos</p>
            <Link
              href="/ecommerce"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#f02d65] text-white rounded-full font-black text-sm uppercase tracking-widest"
            >
              Volver al inicio <ArrowRight size={16} />
            </Link>
          </div>
        ) : productos.length > 0 ? (
          <>
            {/* 
              Mobile:  primer producto destacado (full-width), luego grid 2 col
              Desktop: grid uniforme 3-4 columnas con stagger animation
            */}

            {/* Tarjeta destacada — solo mobile */}
            <motion.div
              className="md:hidden mb-3"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <ProductCard producto={productos[0]} size="lg" />
            </motion.div>

            {/* Grid desktop: todos los productos */}
            <motion.div
              className="hidden md:grid grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
              variants={stagger}
              initial="hidden"
              animate="visible"
            >
              {productos.map((producto, i) => (
                <motion.div key={producto.id} variants={fadeUp} custom={i % 8}>
                  <ProductCard producto={producto} size="md" />
                </motion.div>
              ))}
            </motion.div>

            {/* Grid mobile: resto de productos (sin el primero que ya se mostró grande) */}
            <div className="md:hidden grid grid-cols-2 gap-3">
              {productos.slice(1).map((producto, i) => (
                <motion.div
                  key={producto.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: (i % 6) * 0.07 }}
                >
                  <ProductCard producto={producto} size="sm" />
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 md:py-24 border border-gray-200 rounded-3xl">
            <p className="text-gray-400 mb-6 text-base md:text-lg">
              No hay productos nuevos en este momento
            </p>
            <Link
              href="/ecommerce"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#f02d65] text-white rounded-full font-black text-sm uppercase tracking-widest"
            >
              Volver al inicio <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* CTA final */}
        {!loading && productos.length > 0 && (
          <div className="mt-10 md:mt-16 flex justify-center">
            <Link
              href="/ecommerce/productos"
              className="group flex items-center gap-2 md:gap-3 border border-gray-200 md:border-white/20 rounded-full px-8 md:px-10 py-4 text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 hover:border-[#f02d65] hover:text-gray-900 active:scale-95 transition-all duration-300"
            >
              Ver catálogo completo
              <ArrowRight size={12} md-size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </section>

      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}