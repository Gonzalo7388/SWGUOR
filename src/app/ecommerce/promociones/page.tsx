'use client';

import Link from 'next/link';
import ProductCard from '@/components/ecommerce/productos/ProductCard';
import { useProductosEcommerce } from '@/lib/hooks/useProductosEcommerce';
import { useCarrito } from '@/app/ecommerce/_contexts/CartContext';
import { motion } from 'framer-motion';
import { Zap, TrendingDown, Gift, AlertCircle } from 'lucide-react';

export default function PromocionesPag() {
  const { productos: todosLosProductos, loading, error } = useProductosEcommerce({ limite: 50 });
  const { obtenerCantidadTotal } = useCarrito();
  
  // Seleccionar los primeros 7 productos como ofertas especiales
  const productosEnOferta = todosLosProductos.slice(0, 7);
  const cantidadEnCarrito = obtenerCantidadTotal();

  // Calcular descuento basado en cantidad
  let descuentoAplicable = 0;
  let mensajeDescuento = '';

  if (cantidadEnCarrito > 15) {
    descuentoAplicable = 20;
    mensajeDescuento = '¡Descuento del 20% aplicado! 🎉';
  } else if (cantidadEnCarrito > 10) {
    descuentoAplicable = 10;
    mensajeDescuento = '¡Descuento del 10% aplicado! 🎁';
  } else if (cantidadEnCarrito > 5) {
    mensajeDescuento = `Agrega ${10 - cantidadEnCarrito} productos más para obtener 10% de descuento 📦`;
  }

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
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* Header */}
      <div className="bg-linear-to-r from-red-600 via-red-700 to-red-800 text-white py-16 md:py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-0"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-0"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Zap className="text-yellow-300" size={32} />
              <h1 className="text-4xl md:text-5xl font-bold">🎁 Nuestras Ofertas Especiales</h1>
            </div>
            <p className="text-red-100 text-lg md:text-xl mb-6">
              Descubre nuestros productos con los mejores precios del mercado
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link
                href="/ecommerce/categorias"
                className="px-6 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                ← Explorar Categorías
              </Link>
              <Link
                href="/ecommerce"
                className="px-6 py-3 bg-red-900 text-white rounded-lg font-semibold hover:bg-red-950 transition"
              >
                Ir a Inicio
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Sistema de Descuentos */}
        <motion.section 
          className="mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Sistema de Descuentos Mayoristas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <motion.div 
              variants={itemVariants}
              className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <Gift size={24} className="text-blue-600" />
                <h3 className="font-bold text-gray-900">Compra 10+ productos</h3>
              </div>
              <p className="text-lg font-bold text-blue-600">10% Descuento</p>
              <p className="text-gray-600 text-sm">En toda tu compra</p>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown size={24} className="text-purple-600" />
                <h3 className="font-bold text-gray-900">Compra 15+ productos</h3>
              </div>
              <p className="text-lg font-bold text-purple-600">20% Descuento</p>
              <p className="text-gray-600 text-sm">En toda tu compra</p>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className={`border-2 rounded-lg p-6 ${
                descuentoAplicable > 0
                  ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300'
                  : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={24} className={descuentoAplicable > 0 ? 'text-green-600' : 'text-gray-600'} />
                <h3 className="font-bold text-gray-900">Tu Carrito</h3>
              </div>
              <p className={`text-lg font-bold ${descuentoAplicable > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                {cantidadEnCarrito} productos
              </p>
              <p className={`text-sm ${descuentoAplicable > 0 ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
                {descuentoAplicable > 0 ? `${descuentoAplicable}% descuento` : 'Agrega más productos'}
              </p>
            </motion.div>
          </div>

          {/* Mensaje de Descuento Dinámico */}
          {mensajeDescuento && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-lg border-l-4 mb-8 flex items-center gap-3 ${
                descuentoAplicable > 0
                  ? 'bg-green-50 border-green-500 text-green-800'
                  : 'bg-blue-50 border-blue-500 text-blue-800'
              }`}
            >
              <span className="text-2xl">{descuentoAplicable > 0 ? '✅' : 'ℹ️'}</span>
              <span className="font-semibold">{mensajeDescuento}</span>
            </motion.div>
          )}
        </motion.section>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition"
          >
            <div className="text-3xl font-bold text-red-600 mb-2">20%</div>
            <p className="text-gray-600">Descuento Máximo</p>
          </motion.div>
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition"
          >
            <div className="text-3xl font-bold text-red-600 mb-2">7</div>
            <p className="text-gray-600">Productos en Oferta</p>
          </motion.div>
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition col-span-2 md:col-span-1"
          >
            <div className="text-3xl font-bold text-red-600 mb-2">📦</div>
            <p className="text-gray-600">Envío Gratis +$299</p>
          </motion.div>
        </motion.div>

        {/* Productos en Oferta */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-48 mb-3"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-200 h-3 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg mb-4">Error cargando ofertas: {error}</p>
            <Link
              href="/ecommerce"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Volver al inicio
            </Link>
          </div>
        ) : productosEnOferta.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">⚡ Productos Destacados en Oferta</h2>
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {productosEnOferta.map((producto, idx) => (
                <motion.div key={producto.id} variants={itemVariants} className="relative">
                  {/* Badge de Oferta */}
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                    OFERTA
                  </div>
                  <ProductCard
                    producto={producto}
                    size="md"
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-center"
            >
              <p className="text-gray-600 mb-4">
                ¿Quieres ver más productos? Explora todas nuestras categorías
              </p>
              <Link
                href="/ecommerce/productos"
                className="inline-block px-8 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition"
              >
                Ver Todos los Productos
              </Link>
            </motion.div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              No hay productos en oferta en este momento
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
