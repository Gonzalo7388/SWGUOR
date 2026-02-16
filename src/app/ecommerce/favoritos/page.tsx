'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useFavoritos } from '@/app/ecommerce/_contexts/FavoritosContext';
import { useCarrito } from '@/app/ecommerce/_contexts/CartContext';

// Components
import Toast from '@/components/ecommerce/favoritos/Toast';
import FavoritesHeader from '@/components/ecommerce/favoritos/FavoritesHeader';
import FavoritesEmptyState from '@/components/ecommerce/favoritos/FavoritesEmptyState';
import FavoriteCard, { type FavoritoItem } from '@/components/ecommerce/favoritos/FavoriteCard';

// ============================================================================
// TYPES
// ============================================================================

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PaginaFavoritos() {
  const { favoritos, removerFavorito } = useFavoritos();
  const { agregarAlCarrito } = useCarrito();
  const [toast, setToast] = useState<ToastState>({ 
    show: false, 
    message: '', 
    type: 'success' 
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRemoverFavorito = useCallback((id: string | number) => {
    try {
      // Type guard: Convert to number if needed
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      // Validation
      if (isNaN(numericId)) {
        console.error('[PaginaFavoritos] Invalid ID:', id);
        setToast({
          show: true,
          message: 'Error al eliminar producto',
          type: 'error',
        });
        return;
      }
      
      removerFavorito(numericId);
      setToast({
        show: true,
        message: 'Producto eliminado de favoritos',
        type: 'success',
      });
    } catch (error) {
      console.error('[PaginaFavoritos] Remove error:', error);
      setToast({
        show: true,
        message: 'Error al eliminar producto',
        type: 'error',
      });
    }
  }, [removerFavorito]);

  const handleAgregarAlCarrito = useCallback((favorito: FavoritoItem) => {
    try {
      agregarAlCarrito({
        id: favorito.id,
        nombre: favorito.nombre,
        precio: favorito.precio,
        cantidad: 1, // User adjusts in cart
        color: 'Por definir',
        talla: 'Por definir',
        imagen: favorito.imagen,
        sku: `PROD-${favorito.id}`,
      });
      
      setToast({
        show: true,
        message: 'Producto agregado al carrito',
        type: 'success',
      });
    } catch (error) {
      console.error('[PaginaFavoritos] Add to cart error:', error);
      setToast({
        show: true,
        message: 'Error al agregar al carrito',
        type: 'error',
      });
    }
  }, [agregarAlCarrito]);

  const handleCloseToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={handleCloseToast}
      />

      {/* Header */}
      <FavoritesHeader count={favoritos.length} />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {favoritos.length === 0 ? (
          <FavoritesEmptyState />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {favoritos.map((favorito) => (
              <FavoriteCard
                key={favorito.id}
                favorito={favorito}
                onRemove={handleRemoverFavorito}
                onAddToCart={handleAgregarAlCarrito}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}