'use client';

import Link from 'next/link';
import ProductCard from '@/components/ecommerce/productos/ProductCard';
import { useProductosEcommerce } from '@/lib/hooks/useProductosEcommerce';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

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

// ─── Página ───────────────────────────────────────────────────────────────────

export default function PaginaNuevos() {
  // nuevo=true → solo productos de los últimos 30 días, ordenados por created_at DESC
  const { productos, loading, error } = useProductosEcommerce({
    limite: 50,
    nuevo: true,
    dias: 30,
  });

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── Banner Hero — Nueva Colección ── */}
      <section className="relative overflow-hidden" style={{ minHeight: '100vh' }}>

        {/* Imagen de fondo */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1800&q=80&auto=format&fit=crop"
            alt="Nueva Colección"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </div>

        {/* Contenido */}
        <div
          className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 flex flex-col justify-center items-center text-center py-32"
          style={{ minHeight: '100vh' }}
        >
          <div className="max-w-4xl w-full">

            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-[11px] font-black uppercase tracking-[0.5em] text-[#f02d65] mb-8 flex items-center justify-center gap-3"
            >
              <span className="inline-block w-10 h-px bg-[#f02d65]" />
              Nueva Colección · 2026
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              className="text-white font-black uppercase leading-[0.88] tracking-tight mb-6"
              style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)', fontStyle: 'italic' }}
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

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="text-white/70 text-base md:text-lg leading-relaxed mb-10 max-w-xl mx-auto"
            >
              Diseños exclusivos para mayoristas. Las tendencias más recientes
              en moda femenina, directo a tu inventario.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="flex flex-wrap gap-4 items-center justify-center"
            >
              <Link
                href="#catalogo"
                className="group flex items-center gap-3 bg-[#f02d65] text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 shadow-lg shadow-[#f02d65]/30"
              >
                Ver colección
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/ecommerce/productos"
                className="flex items-center gap-2 border border-white/30 text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:border-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              >
                Catálogo completo
              </Link>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="flex gap-5 mt-12 justify-center"
          >
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-8 py-5">
              <span className="text-4xl font-black text-white leading-none">
                {loading ? '—' : productos.length}
                <span className="text-[#f02d65]">+</span>
              </span>
              <div className="text-left border-l border-white/20 pl-4">
                <p className="text-white font-bold text-sm leading-tight">Productos</p>
                <p className="text-white/50 text-[10px] uppercase tracking-widest mt-0.5">nuevos</p>
              </div>
            </div>

            <div className="w-px bg-white/15 self-stretch" />

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-8 py-5">
              <span className="text-4xl font-black text-white leading-none">
                100<span className="text-[#f02d65]">%</span>
              </span>
              <div className="text-left border-l border-white/20 pl-4">
                <p className="text-white font-bold text-sm leading-tight">Calidad</p>
                <p className="text-white/50 text-[10px] uppercase tracking-widest mt-0.5">garantizada</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Separador editorial ── */}
      <div className="border-b border-gray-200 overflow-hidden">
        <div className="flex whitespace-nowrap py-4 animate-[marquee_20s_linear_infinite]">
          {Array(8).fill(null).map((_, i) => (
            <span key={i} className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-900/10 px-8">
              Nueva Colección · Modas y Estilos GUOR · Mayorista ·&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ── Catálogo ── */}
      <section id="catalogo" className="max-w-7xl mx-auto px-6 lg:px-8 py-20">

        {/* Header de sección */}
        <div className="flex items-center justify-between mb-12 pb-8 border-b border-gray-100">
          <div className="flex items-center gap-6">
            <div className="w-0.5 h-14 bg-[#f02d65] rounded-full" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.5em] text-gray-400 mb-1">
                Últimos 30 días
              </p>
              <h2 className="text-2xl md:text-3xl font-light text-gray-900 tracking-wide leading-snug">
                Lo último en llegar{' '}
                <span className="font-semibold text-[#f02d65]">·</span>
              </h2>
            </div>
          </div>
          <Link
            href="/ecommerce/productos"
            className="group hidden md:flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-gray-400 hover:text-[#f02d65] transition-colors duration-200"
          >
            Ver catálogo
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Estados */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array(12).fill(null).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-24 border border-gray-200 rounded-3xl">
            <p className="text-gray-400 mb-6 text-lg">Error cargando productos</p>
            <Link
              href="/ecommerce"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#f02d65] text-white rounded-full font-black text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all"
            >
              Volver al inicio <ArrowRight size={16} />
            </Link>
          </div>
        ) : productos.length > 0 ? (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
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
        ) : (
          <div className="text-center py-24 border border-gray-200 rounded-3xl">
            <p className="text-gray-400 mb-6 text-lg">No hay productos nuevos en este momento</p>
            <Link
              href="/ecommerce"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#f02d65] text-white rounded-full font-black text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all"
            >
              Volver al inicio <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {!loading && productos.length > 0 && (
          <div className="mt-16 flex justify-center">
            <Link
              href="/ecommerce/productos"
              className="group flex items-center gap-3 border border-white/20 rounded-full px-10 py-4 text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 hover:border-[#f02d65] hover:text-gray-900 transition-all duration-300"
            >
              Ver catálogo completo
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </section>

      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-\\[marquee_20s_linear_infinite\\] {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}