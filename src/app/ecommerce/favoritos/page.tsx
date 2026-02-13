'use client';

import Link from 'next/link';
import { useFavoritos } from '@/app/ecommerce/_contexts/FavoritosContext';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, ShoppingCart } from 'lucide-react';
import { useCarrito } from '@/app/ecommerce/_contexts/CartContext';
import Image from 'next/image';
import { getSupabaseImageUrl } from '@/lib/utils/supabase-image-utils';

export default function PaginaFavoritos() {
  const { favoritos, removerFavorito } = useFavoritos();
  const { agregarAlCarrito } = useCarrito();

  const handleAgregarAlCarrito = (favorito: any) => {
    agregarAlCarrito({
      id: favorito.id,
      nombre: favorito.nombre,
      precio: favorito.precio,
      cantidad: 400,
      color: 'Sin especificar',
      talla: 'Sin especificar',
      imagen: favorito.imagen,
      sku: `FAV-${favorito.id}`,
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border-b-2 border-amber-200 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Heart className="text-red-600" size={32} fill="currentColor" />
              <h1 className="text-4xl md:text-5xl font-black text-gray-900">Mis Favoritos</h1>
            </div>
            <p className="text-gray-700 text-lg">
              {favoritos.length} producto{favoritos.length !== 1 ? 's' : ''} guardado{favoritos.length !== 1 ? 's' : ''}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {favoritos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-white border-2 border-amber-200 rounded-2xl p-12">
              <Heart className="mx-auto text-gray-300 mb-4" size={64} />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">No tienes favoritos aún</h2>
              <p className="text-gray-600 mb-8 text-lg">
                Explora nuestros productos y agrega los que más te gusten a favoritos
              </p>
              <Link
                href="/ecommerce"
                className="inline-flex items-center gap-2 px-8 py-3 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition"
              >
                <ShoppingCart size={20} />
                Explorar Productos
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {favoritos.map((favorito) => (
              <motion.div
                key={favorito.id}
                variants={itemVariants}
                className="bg-white rounded-2xl border-2 border-amber-200 overflow-hidden hover:shadow-lg transition group"
              >
                {/* Imagen */}
                <div className="relative h-64 w-full bg-gray-100 overflow-hidden">
                  {favorito.imagen ? (
                    <>
                      <Image
                        src={getSupabaseImageUrl(favorito.imagen) || '/placeholder.png'}
                        alt={favorito.nombre}
                        fill
                        className="object-cover group-hover:scale-110 transition duration-300"
                      />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Sin imagen
                    </div>
                  )}
                  <button
                    onClick={() => removerFavorito(favorito.id)}
                    className="absolute top-3 right-3 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow-lg"
                  >
                    <Heart size={18} fill="currentColor" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-lg">
                    {favorito.nombre}
                  </h3>
                  <p className="text-3xl font-black text-amber-600 mb-4">
                    S/ {favorito.precio.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>

                  <div className="flex gap-2">
                    <Link
                      href={`/ecommerce/productos/${favorito.id}`}
                      className="flex-1 text-center px-4 py-2 border-2 border-amber-600 text-amber-600 rounded-lg font-bold hover:bg-amber-50 transition"
                    >
                      Ver Detalles
                    </Link>
                    <button
                      onClick={() => handleAgregarAlCarrito(favorito)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition"
                    >
                      <ShoppingCart size={18} />
                      Agregar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
