'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart } from 'lucide-react';
import { getSupabaseImageUrl } from '@/lib/utils/supabase-image-utils';

// ============================================================================
// TYPES
// ============================================================================

export interface FavoritoItem {
  id: string | number;
  nombre: string;
  precio: number;
  imagen?: string;
  stock?: number;
  categoria?: string;
}

interface FavoriteCardProps {
  favorito: FavoritoItem;
  onRemove: (id: string | number) => void;
  onAddToCart: (item: FavoritoItem) => void;
}

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// ============================================================================
// UTILITIES
// ============================================================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(amount);
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function FavoriteCard({ 
  favorito, 
  onRemove, 
  onAddToCart 
}: FavoriteCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRemoving(true);
    
    setTimeout(() => {
      onRemove(favorito.id);
    }, 300);
  }, [favorito.id, onRemove]);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(favorito);
  }, [favorito, onAddToCart]);

  return (
    <motion.div
      variants={itemVariants}
      animate={isRemoving ? { opacity: 0, scale: 0.9 } : {}}
      transition={{ duration: 0.3 }}
      className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <Link href={`/ecommerce/productos/${favorito.id}`}>
        <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
          {favorito.imagen ? (
            <Image
              src={getSupabaseImageUrl(favorito.imagen) || '/placeholder.png'}
              alt={favorito.nombre}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              Sin imagen
            </div>
          )}
          
          {/* Remove button */}
          <button
            onClick={handleRemove}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors group/btn"
            aria-label="Eliminar de favoritos"
          >
            <Heart 
              size={16} 
              className="text-red-600 group-hover/btn:scale-110 transition-transform" 
              fill="currentColor" 
            />
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={`/ecommerce/productos/${favorito.id}`}>
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-primary-700 transition-colors">
            {favorito.nombre}
          </h3>
        </Link>
        
        <p className="text-xl font-semibold text-gray-900 mb-4">
          {formatCurrency(favorito.precio)}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/ecommerce/productos/${favorito.id}`}
            className="flex-1 text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Ver detalles
          </Link>
          <button
            onClick={handleAddToCart}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            aria-label="Agregar al carrito"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}