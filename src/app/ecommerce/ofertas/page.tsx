'use client';

import Link from 'next/link';
import ProductCard from '@/components/ecommerce/productos/ProductCard';
import { useProductosEcommerce } from '@/lib/hooks/useProductosEcommerce';
import { motion, Variants } from 'framer-motion';
import { Sparkles, ArrowRight, Percent, Truck, Timer } from 'lucide-react';

// Variantes de animación optimizadas para rendimiento
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function PaginaOfertas() {
  const { productos, loading, error } = useProductosEcommerce({ limite: 50 });

  return (
    <div className="min-h-screen bg-[#FCFCFC] selection:bg-rose-100">
      {/* Hero Section Editorial */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-slate-900">
        {/* Imagen de fondo con overlay elegante */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80" 
            className="w-full h-full object-cover opacity-60 grayscale-[20%]"
            alt="Luxury Fashion Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-transparent to-slate-900/90"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <span className="inline-flex items-center gap-2 text-rose-400 text-[10px] uppercase tracking-[0.5em] font-black mb-6 bg-rose-500/10 px-4 py-2 rounded-full backdrop-blur-md border border-rose-500/20">
              <Sparkles size={12} /> Seasonal Sale
            </span>
            <h1 className="text-5xl md:text-8xl font-light text-white tracking-tighter mb-6">
              Ofertas de <span className="italic font-serif text-rose-200">Temporada</span>
            </h1>
            <p className="text-slate-300 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed mb-10">
              Piezas seleccionadas con la misma calidad excepcional, ahora con precios de privilegio. 
              Descubre la alta costura accesible de GUOR.
            </p>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[8px] uppercase tracking-[0.3em] text-white/40">Explorar</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/60 to-transparent"></div>
        </div>
      </section>

      {/* Trust & Benefits Bar - Estilo Minimalista */}
      <div className="border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <Percent size={20}/>, title: "Curated Selection", desc: "Hasta 50% de descuento" },
              { icon: <Truck size={20}/>, title: "Envío Prioritario", desc: "Gratis en compras sobre S/ 299" },
              { icon: <Timer size={20}/>, title: "Stock Exclusivo", desc: "Unidades limitadas por talla" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 group cursor-default">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-500 transition-colors duration-500">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">{item.title}</h4>
                  <p className="text-sm text-slate-400 font-light">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de Productos */}
      <main className="max-w-[1400px] mx-auto px-8 py-20">
        {loading ? (
          <LoadingGrid />
        ) : error ? (
          <ErrorState />
        ) : productos.length > 0 ? (
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-16"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {productos.map((producto) => (
              <motion.div key={producto.id} variants={itemVariants}>
                <ProductCard producto={producto} size="md" />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState />
        )}
      </main>

      {/* Footer CTA */}
      <section className="bg-slate-50 border-t border-slate-100 py-24 px-8 text-center">
        <h3 className="text-3xl font-light text-slate-900 mb-6">¿Buscas algo más específico?</h3>
        <Link 
          href="/ecommerce/categorias" 
          className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all duration-500 group"
        >
          Ver todas las colecciones
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>
    </div>
  );
}

// Subcomponentes para limpieza de código
function LoadingGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse space-y-4">
          <div className="aspect-[3/4] bg-slate-100 rounded-sm"></div>
          <div className="h-4 bg-slate-100 w-2/3 mx-auto"></div>
          <div className="h-3 bg-slate-50 w-full"></div>
        </div>
      ))}
    </div>
  );
}

function ErrorState() {
  return (
    <div className="text-center py-20 bg-rose-50/30 rounded-3xl border border-rose-100">
      <p className="text-rose-500 font-medium mb-6">No pudimos conectar con el servidor de ofertas.</p>
      <Link href="/ecommerce" className="text-xs font-black uppercase tracking-widest text-slate-900 hover:text-rose-500 transition-colors">
        Intentar de nuevo
      </Link>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-32 bg-white border border-dashed border-slate-200 rounded-3xl">
      <h3 className="text-2xl font-light text-slate-400 italic">Próximamente nuevas ofertas...</h3>
    </div>
  );
}