'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useCategoriasEcommerce } from '@/lib/hooks/useCategoriasEcommerce';
import { getSupabaseImageUrl } from '@/lib/utils/supabase-image-utils';

const ICONOS_CATEGORIA = {
  'Vestidos': '👗',
  'Blusas': '👕',
  'Pantalones': '👖',
  'Faldas': '👗',
  'Buzos': '🧥',
  'Accesorios': '👜',
  'Camisetas': '👕',
  'Chaquetas': '🧥',
  'Suéteres': '🧶',
  'Polos': '👕',
  'Jeans': '👖',
  'Casacas': '🧥',
  'Prendas Deportivas': '🏃',
  'Conjuntos': '👕',
  'Avíos': '🧵',
  'Hilos': '🧵',
};

const COLORES_CATEGORIA = [
  'bg-gradient-to-br from-pink-300 to-pink-500',
  'bg-gradient-to-br from-purple-300 to-purple-500',
  'bg-gradient-to-br from-blue-300 to-blue-500',
  'bg-gradient-to-br from-red-300 to-red-500',
  'bg-gradient-to-br from-yellow-300 to-yellow-500',
  'bg-gradient-to-br from-green-300 to-green-500',
  'bg-gradient-to-br from-indigo-300 to-indigo-500',
  'bg-gradient-to-br from-orange-300 to-orange-500',
  'bg-gradient-to-br from-cyan-300 to-cyan-500',
  'bg-gradient-to-br from-teal-300 to-teal-500',
];

export default function MuestraCategoria() {
  const { categorias, loading, error } = useCategoriasEcommerce();

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Explora Nuestras Categorías
          </h2>
          <p className="text-gray-600 mb-8">Encuentra el estilo perfecto para ti</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-40 md:h-48 mb-3"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-200 h-3 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-red-600">Error cargando categorías: {error}</p>
        </div>
      </section>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <section className="py-16 md:py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Explora Nuestras Categorías
          </h2>
          <p className="text-gray-600">Encuentra el estilo perfecto para ti</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {categorias.map((categoria, index) => {
            const icono = ICONOS_CATEGORIA[categoria.nombre as keyof typeof ICONOS_CATEGORIA] || '📦';
            const colorGradient = COLORES_CATEGORIA[index % COLORES_CATEGORIA.length];

            return (
              <motion.div
                key={categoria.id}
                variants={childVariants}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Link href={`/ecommerce/productos?categoria=${categoria.id}`}>
                  <div className="cursor-pointer h-full flex flex-col">
                    {/* Tarjeta de Imagen */}
                    <div
                      className={`${colorGradient} rounded-2xl h-40 md:h-48 flex items-center justify-center relative overflow-hidden transition-all duration-300 group-hover:shadow-2xl mb-4`}
                    >
                      {categoria.imagen ? (
                        <img
                          src={getSupabaseImageUrl(categoria.imagen, 'categorias') || categoria.imagen}
                          alt={categoria.nombre}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <motion.div
                          initial={{ scale: 1 }}
                          whileHover={{ scale: 1.2 }}
                          className="text-5xl md:text-6xl"
                        >
                          {icono}
                        </motion.div>
                      )}
                      
                      {/* Overlay Gradiente */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Badge */}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Ver más
                      </div>
                    </div>

                    {/* Información */}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-sm md:text-base group-hover:text-red-600 transition duration-300 line-clamp-2">
                        {categoria.nombre}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mt-1">
                        {categoria.descripcion}
                      </p>
                    </div>

                    {/* Botón */}
                    <motion.button
                      whileHover={{ x: 4 }}
                      className="mt-4 w-full py-2.5 px-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold text-xs md:text-sm transition-all duration-300 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 group/btn"
                    >
                      <span>Productos</span>
                      <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </motion.button>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
