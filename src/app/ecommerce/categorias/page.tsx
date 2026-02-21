'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Package2 } from 'lucide-react';
import { useCategoriasEcommerce } from '@/lib/hooks/useCategoriasEcommerce';
import { getSupabaseImageUrl } from '@/lib/utils/supabase-image-utils';

// Imagen por defecto con estilo minimalista para GUOR
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, eease: [0.22, 1, 0.36, 1] as const }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

export default function CategoriasPage() {
  const { categorias, loading } = useCategoriasEcommerce();

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-white">
      <div className="h-px bg-gray-100"></div>

      {/* Breadcrumb refinado */}
      <div className="bg-slate-50/50">
        <div className="max-w-[1400px] mx-auto px-8 py-4">
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
            <Link href="/ecommerce" className="hover:text-rose-500 transition-colors">Inicio</Link>
            <ChevronRight size={10} />
            <span className="text-slate-900">Categorías</span>
          </nav>
        </div>
      </div>

      {/* Header con estilo Editorial */}
      <motion.header 
        className="max-w-[1400px] mx-auto px-8 pt-16 pb-12 text-center"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <span className="text-[10px] uppercase tracking-[0.4em] text-rose-500 font-black mb-4 block">
          Modas y Estilos GUOR
        </span>
        <h1 className="text-4xl md:text-6xl font-light text-slate-900 tracking-tight mb-6">
          Nuestras <span className="italic font-serif">Colecciones</span>
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
          Descubre la excelencia en confección mayorista. Desde básicos esenciales hasta 
          piezas de tendencia, cada categoría refleja nuestro compromiso con la calidad.
        </p>
      </motion.header>

      <main className="max-w-[1400px] mx-auto px-8 pb-32">
        {categorias.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12"
          >
            {categorias.map((categoria: any) => {
              // Lógica de imagen: Prioriza Supabase, luego el campo imagen plano, luego default
              const imageUrl = getSupabaseImageUrl(categoria.imagen) || DEFAULT_IMAGE;

              return (
                <motion.article key={categoria.id} variants={fadeInUp} className="group">
                  <Link href={`/ecommerce/categorias/${categoria.id}`} className="block">
                    {/* Contenedor de Imagen con Aspect Ratio de Catálogo */}
                    <div className="relative aspect-[3/4] mb-6 overflow-hidden bg-slate-100 rounded-sm">
                      <img
                        src={imageUrl}
                        alt={categoria.nombre}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        loading="lazy"
                      />
                      {/* Badge de cantidad o nuevo si lo tuvieras en la tabla */}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full">
                         <span className="text-[9px] font-black uppercase tracking-tighter text-slate-900">
                           Explorar
                         </span>
                      </div>
                    </div>

                    {/* Info de Categoría */}
                    <div className="space-y-3 px-1">
                      <div className="flex justify-between items-start">
                        <h2 className="text-xl font-medium text-slate-900 group-hover:text-rose-600 transition-colors duration-300">
                          {categoria.nombre}
                        </h2>
                        <ArrowRight size={18} className="text-slate-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
                      </div>
                      
                      {categoria.descripcion && (
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 font-light italic">
                          {categoria.descripcion}
                        </p>
                      )}
                      
                      <div className="pt-2 flex items-center gap-4">
                        <div className="h-px flex-1 bg-slate-100 group-hover:bg-rose-100 transition-colors"></div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 group-hover:text-rose-400">
                          Ver más
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              );
            })}
          </motion.div>
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
}

// Subcomponente de estado vacío para limpieza de código
function EmptyState() {
  return (
    <div className="text-center py-40 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
      <Package2 size={48} className="mx-auto text-slate-200 mb-6" />
      <h3 className="text-xl font-light text-slate-900 mb-2">Colecciones en preparación</h3>
      <p className="text-sm text-slate-400">Vuelve pronto para descubrir nuestras novedades.</p>
    </div>
  );
}

// Skeleton refinado
function LoadingSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto px-8 py-20 grid grid-cols-1 md:grid-cols-4 gap-8">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse space-y-4">
          <div className="aspect-[3/4] bg-slate-100 rounded-sm"></div>
          <div className="h-4 bg-slate-100 w-2/3"></div>
          <div className="h-3 bg-slate-50 w-full"></div>
        </div>
      ))}
    </div>
  );
}