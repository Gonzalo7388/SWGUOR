'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useCategoriasEcommerce } from '@/lib/hooks/useCategoriasEcommerce';

// Imágenes con modelos femeninas - Alta calidad de Unsplash
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

interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
}

// Loading Skeleton
function CategorySkeleton() {
  return (
    <div className="flex-none w-72 md:w-80">
      <div className="animate-pulse">
        <div className="bg-gray-200 rounded-2xl h-96 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );
}

// Category Card
function CategoryCard({ categoria }: { categoria: Categoria }) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = CATEGORY_IMAGES[categoria.nombre] || DEFAULT_IMAGE;

  return (
    <Link href={`/ecommerce/categorias/${categoria.id}`}>
      <div className="group relative overflow-hidden rounded-2xl h-96 cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-300">
        
        {/* Background Image */}
        <img 
          src={imageError ? DEFAULT_IMAGE : imageUrl}
          alt={`${categoria.nombre} - Moda Femenina`}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={() => setImageError(true)}
          loading="lazy"
        />

        {/* Gradient Overlay - Más oscuro para mejor contraste */}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-black/20"></div>

        {/* Top Badge - Opcional */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-xs font-bold text-gray-900">Ver colección</span>
        </div>

        {/* Content */}
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          <div className="transform transition-all duration-300 group-hover:translate-y-0 translate-y-2">
            {/* Decorative Line */}
            <div className="w-12 h-1 bg-white rounded-full mb-4 transform origin-left transition-transform duration-500 group-hover:scale-x-150"></div>
            
            {/* Category Name */}
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">
              {categoria.nombre}
            </h3>
            
            {/* Description */}
            {categoria.descripcion && (
              <p className="text-sm text-white/95 mb-4 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow">
                {categoria.descripcion}
              </p>
            )}
            
            {/* CTA */}
            <div className="flex items-center gap-2 text-white font-semibold text-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
              <span>Explorar colección</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Hover Border Effect */}
        <div className="absolute inset-0 border-4 border-white/0 group-hover:border-white/30 transition-colors duration-300 rounded-2xl pointer-events-none"></div>
      </div>
    </Link>
  );
}

// Navigation Button
interface NavButtonProps {
  direction: 'left' | 'right';
  onClick: () => void;
  disabled?: boolean;
}

function NavButton({ direction, onClick, disabled }: NavButtonProps) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`absolute ${direction === 'left' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-0 disabled:pointer-events-none ${
        !disabled && 'hover:bg-gray-50'
      }`}
      aria-label={direction === 'left' ? 'Anterior' : 'Siguiente'}
    >
      <Icon size={24} className="text-gray-900" strokeWidth={2.5} />
    </button>
  );
}

// Main Component
export default function CategoryShowcase() {
  const { categorias, loading, error } = useCategoriasEcommerce();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position
  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScroll();
    container.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [categorias]);

  // Scroll functions
  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 336;
    const targetScroll = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });
  };

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-white border-t border-gray-100">
        <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="h-12 bg-gray-200 rounded w-80 mb-3 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
          <div className="flex gap-6 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || categorias.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-linear-to-b from-white to-gray-50">
      <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
       <div className="mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Subtítulo */}
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xs md:text-sm uppercase tracking-[0.3em] text-gray-500 font-medium mb-4"
            >
              Colección
            </motion.p>

            {/* Título Principal */}
            <h2 className="relative inline-block">
              <span className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 tracking-tight leading-tight">
                Descubre tu{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 font-serif italic">Estilo</span>
                  {/* Línea decorativa debajo */}
                  <span className="absolute bottom-2 left-0 right-0 h-3 bg-linear-to-r from-rose-200/60 via-pink-200/60 to-rose-200/60 -z-10"></span>
                </span>
              </span>
              <br />
              <span className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-400 tracking-tight">
                por Categoría
              </span>
            </h2>

            {/* Descripción */}
            <p className="mt-6 text-base md:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto font-light">
              Explora nuestra colección de moda femenina y encuentra las piezas perfectas para ti
            </p>

            {/* Línea decorativa */}
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="w-16 h-px bg-linear-to-r from-transparent to-gray-300"></div>
              <div className="w-2 h-2 rounded-full bg-rose-400"></div>
              <div className="w-16 h-px bg-linear-to-l from-transparent to-gray-300"></div>
            </div>
          </motion.div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <NavButton 
            direction="left" 
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
          />
          <NavButton 
            direction="right" 
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
          />

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {categorias.map((categoria) => (
              <div key={categoria.id} className="flex-none w-72 md:w-80">
                <CategoryCard categoria={categoria} />
              </div>
            ))}
          </div>

          {/* Scroll Progress Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: Math.min(Math.ceil(categorias.length / 4), 8) }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === 0 ? 'w-8 bg-rose-600' : 'w-1.5 bg-gray-300'
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Ver Todas CTA */}
        {categorias.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Link 
              href="/ecommerce/categorias"
              className="group inline-flex items-center gap-3 px-10 py-4 bg-white border-2 border-gray-900 text-gray-900 rounded-full font-medium text-sm uppercase tracking-wider hover:bg-gray-900 hover:text-white transition-all duration-300"
            >
              <span>Ver todas las categorías</span>
              <ArrowRight 
                size={18} 
                strokeWidth={2.5}
                className="group-hover:translate-x-1 transition-transform" 
              />
            </Link>
          </motion.div>
        )}
      </div>

      {/* CSS para ocultar scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}