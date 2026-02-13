'use client';

import Link from 'next/link';
import ProductCard from '@/components/ecommerce/productos/ProductCard';
import { useProductosEcommerce } from '@/lib/hooks/useProductosEcommerce';
import { motion } from 'framer-motion';
import { Zap, Gift, Clock, ArrowRight } from 'lucide-react';

export default function PaginaOfertas() {
  const { productos, loading, error } = useProductosEcommerce({ limite: 50 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50">
      {/* Header Premium */}
      <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border-b-2 border-amber-200 py-16 md:py-20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-40 h-40 bg-red-200 rounded-full mix-blend-multiply filter blur-2xl opacity-20 -z-0"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-amber-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 -z-0"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Zap className="text-amber-600" size={32} />
              <h1 className="text-4xl md:text-5xl font-black text-gray-900">Ofertas Especiales</h1>
            </div>
            <p className="text-gray-700 text-lg md:text-xl mb-6 max-w-2xl">
              Descuentos increíbles en productos seleccionados. ¡No te lo pierdas!
            </p>
            <div className="flex items-center gap-2 text-red-600 font-semibold">
              <Gift size={20} />
              <span>Promoción válida por tiempo limitado</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Info Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="bg-white border-2 border-amber-200 rounded-2xl p-8 text-center hover:shadow-lg transition-all duration-300"
            variants={itemVariants}
          >
            <div className="text-4xl font-bold text-red-600 mb-3">50%</div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Descuentos</h3>
            <p className="text-gray-600">En productos seleccionados</p>
          </motion.div>
          
          <motion.div 
            className="bg-white border-2 border-amber-200 rounded-2xl p-8 text-center hover:shadow-lg transition-all duration-300"
            variants={itemVariants}
          >
            <div className="text-4xl font-bold text-amber-600 mb-3">🎁</div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Envío Gratis</h3>
            <p className="text-gray-600">En compras mayores a S/ 299</p>
          </motion.div>
          
          <motion.div 
            className="bg-white border-2 border-amber-200 rounded-2xl p-8 text-center hover:shadow-lg transition-all duration-300"
            variants={itemVariants}
          >
            <Clock className="mx-auto text-amber-600 mb-3" size={40} />
            <h3 className="text-xl font-bold text-gray-900 mb-1">Tiempo Limitado</h3>
            <p className="text-gray-600">Hasta agotar stock</p>
          </motion.div>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl h-48 mb-3"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-200 h-3 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-red-200">
            <p className="text-red-600 text-lg mb-6">Error cargando ofertas</p>
            <Link
              href="/ecommerce"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition"
            >
              <ArrowRight size={18} />
              Volver al inicio
            </Link>
          </div>
        ) : productos.length > 0 ? (
          <>
            <div className="bg-gradient-to-r from-red-50 to-amber-50 border-2 border-red-200 rounded-2xl p-8 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="text-red-600" size={28} />
                <h2 className="text-3xl font-black text-gray-900">
                  Productos en Oferta
                </h2>
              </div>
              <p className="text-gray-700 text-lg">
                Aprovecha estos increíbles precios antes de que se agote el stock
              </p>
            </div>
            
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {productos.map((producto) => (
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
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-amber-200">
            <p className="text-gray-600 text-lg mb-6">
              No hay ofertas disponibles en este momento
            </p>
            <Link
              href="/ecommerce"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition"
            >
              <ArrowRight size={18} />
              Explorar todos los productos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
