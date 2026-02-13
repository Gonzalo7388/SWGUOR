'use client';

import Link from 'next/link';
import ProductCard from '@/components/ecommerce/productos/ProductCard';
import { useProductosEcommerce } from '@/lib/hooks/useProductosEcommerce';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Calendar } from 'lucide-react';

export default function PaginaNuevos() {
  const { productos, loading, error } = useProductosEcommerce({ limite: 50 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-16 md:py-20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-0"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-0"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="text-yellow-300" size={32} />
              <h1 className="text-4xl md:text-5xl font-bold">Colección NEW</h1>
            </div>
            <p className="text-blue-100 text-lg md:text-xl mb-6">
              Descubre lo último en moda. Productos recién llegados a nuestro catálogo
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link
                href="/ecommerce/categorias"
                className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                ← Explorar Categorías
              </Link>
              <Link
                href="/ecommerce"
                className="px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-950 transition"
              >
                Ir a Inicio
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition"
            variants={itemVariants}
          >
            <div className="text-3xl font-bold text-blue-600 mb-2">🆕</div>
            <p className="text-gray-600">Productos Nuevos</p>
          </motion.div>
          <motion.div 
            className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition"
            variants={itemVariants}
          >
            <div className="flex items-center justify-center gap-2 text-3xl font-bold text-green-600 mb-2">
              <TrendingUp size={24} />
              {productos.length}
            </div>
            <p className="text-gray-600">Productos Disponibles</p>
          </motion.div>
          <motion.div 
            className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition"
            variants={itemVariants}
          >
            <div className="flex items-center justify-center gap-2 text-3xl font-bold text-purple-600 mb-2">
              <Calendar size={24} />
              📅
            </div>
            <p className="text-gray-600">Actualizado Hoy</p>
          </motion.div>
        </motion.div>

        {/* Productos */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-48 mb-3"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-200 h-3 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg mb-4">Error cargando productos: {error}</p>
            <Link
              href="/ecommerce"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Volver al inicio
            </Link>
          </div>
        ) : productos.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              ✨ Lo Último en Llegar
            </h2>
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {productos.map((producto, idx) => (
                <motion.div key={producto.id} variants={itemVariants}>
                  <ProductCard
                    producto={producto}
                    size="md"
                  />
                </motion.div>
              ))}
            </motion.div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              No hay productos nuevos en este momento
            </p>
            <Link
              href="/ecommerce"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Explorar productos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
