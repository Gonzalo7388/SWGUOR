'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Package2 } from 'lucide-react';
import { useCategoriasEcommerce } from '@/lib/hooks/useCategoriasEcommerce';

// Imágenes profesionales de moda femenina de Unsplash
const CATEGORY_IMAGES: Record<string, string> = {
  // Vestidos
  'Vestidos': 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&h=700&fit=crop&q=80',
  
  // Blusas
  'Blusas': 'https://images.unsplash.com/photo-1564257577-47b4934089b8?w=500&h=700&fit=crop&q=80',
  'Blusas y Camisas': 'https://images.unsplash.com/photo-1564257577-47b4934089b8?w=500&h=700&fit=crop&q=80',
  
  // Pantalones
  'Pantalones': 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500&h=700&fit=crop&q=80',
  'Pantalones y Jeans': 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&h=700&fit=crop&q=80',
  
  // Faldas
  'Faldas': 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=500&h=700&fit=crop&q=80',
  
  // Buzos y Casacas
  'Buzos': 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=700&fit=crop&q=80',
  'Casacas': 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500&h=700&fit=crop&q=80',
  'Casacas y Chaquetas': 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500&h=700&fit=crop&q=80',
  
  // Suéteres
  'Suéteres': 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=500&h=700&fit=crop&q=80',
  
  // Polos
  'Polos': 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&h=700&fit=crop&q=80',
  'Polos y Poleras': 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&h=700&fit=crop&q=80',
};

// Imagen por defecto con modelo femenina
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&h=700&fit=crop&q=80';

// Animaciones sutiles y profesionales
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

// Loading state
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-px bg-gray-200"></div>
      
      <div className="max-w-[1400px] mx-auto px-8 py-32">
        <div className="space-y-4 mb-20 animate-pulse">
          <div className="h-3 bg-gray-200 rounded w-32"></div>
          <div className="h-16 bg-gray-200 rounded w-96"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4 animate-pulse">
              <div className="aspect-[4/5] bg-gray-100 rounded"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CategoriasPage() {
  const { categorias, loading } = useCategoriasEcommerce();

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Línea superior sutil */}
      <div className="h-px bg-gray-200"></div>

      {/* Breadcrumb */}
      <div className="border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-8 py-6">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/ecommerce" className="hover:text-gray-900 transition-colors">
              Inicio
            </Link>
            <ChevronRight size={14} strokeWidth={2} />
            <span className="text-gray-900 font-medium">Categorías</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <motion.header 
        className="max-w-[1400px] mx-auto px-8 pt-8 pb-4"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
      <div className="text-center">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-medium mb-3">
            Categorías
          </p>
          
          <h1 className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight mb-4">
              Todas las <span className="italic">Colecciones</span>
            </h1>

           <p className="text-sm text-gray-500 max-w-xl mx-auto font-light">
            Explora nuestra selección curada de prendas diseñadas para cada ocasión.
          </p>
        </div>
      </div>
      </motion.header>

      {/* Grid de Categorías */}
      <main className="max-w-[1400px] mx-auto px-8 pb-32">
        {categorias.length > 0 ? (
          <>
            {/* Contador */}
            <div className="mb-12 pb-8 border-b border-gray-100">
              <p className="text-sm text-gray-500">
                {categorias.length} {categorias.length === 1 ? 'categoría' : 'categorías'}
              </p>
            </div>

            {/* Grid */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16"
            >
              {categorias.map((categoria: any, index: number) => (
                <motion.article
                  key={categoria.id}
                  variants={fadeInUp}
                  className="group"
                >
                  <Link href={`/ecommerce/categorias/${categoria.id}`}>
                    {/* Imagen */}
                    <div className="relative aspect-[4/5] bg-gray-50 mb-6 overflow-hidden">
                      {categoria.imagen ? (
                        <img
                          src={categoria.imagen}
                          alt={categoria.nombre}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <img
                          src={CATEGORY_IMAGES[categoria.nombre] || DEFAULT_IMAGE}
                          alt={`${categoria.nombre} - Moda Femenina`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_IMAGE;
                          }}
                        />
                      )}
                      
                      {/* Overlay sutil en hover */}
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                    </div>

                    {/* Contenido */}
                    <div className="space-y-4">
                      <h2 className="text-2xl font-light text-gray-900 group-hover:text-primary-600 transition-colors">
                        {categoria.nombre}
                      </h2>

                      {categoria.descripcion && (
                        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 font-light">
                          {categoria.descripcion}
                        </p>
                      )}

                      {/* Botón Explorar Estilo Boutique */}
                      <div className="pt-2">
                        <div className="inline-flex items-center justify-between w-full px-5 py-2.5 border border-gray-200 group-hover:border-primary-400 group-hover:bg-primary-50/30 transition-all duration-500 rounded-full group/btn">
                          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-900 group-hover/btn:text-primary-700 transition-colors">
                            Explorar Colección
                          </span>
                          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-50 group-hover/btn:bg-primary-500 group-hover/btn:text-white transition-all duration-300">
                            <ArrowRight size={12} strokeWidth={3} className="group-hover/btn:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </motion.div>
          </>
        ) : (
          // Estado vacío
          <div className="text-center py-32">
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Package2 size={32} className="text-gray-400" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-light text-gray-900">
                No hay categorías disponibles
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Estamos trabajando en traerte nuevas colecciones.
              </p>
              <Link href="/ecommerce">
                <button className="text-sm text-gray-900 hover:text-gray-600 transition-colors mt-4">
                  Volver al inicio →
                </button>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footerspacer */}
      <div className="h-px bg-gray-200"></div>
    </div>
  );
}