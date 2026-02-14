'use client';

import { useProductosEcommerce } from '@/lib/hooks/useProductosEcommerce';
import ProductCard from '@/components/ecommerce/productos/ProductCard';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function ProductosDestacados() {
  const { productos, loading, error } = useProductosEcommerce({ limite: 8 });

  // Skeleton Loader Elegante
  if (loading) {
    return (
      <section className="py-20 bg-primary-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-10 w-64 bg-primary-100 animate-pulse rounded-lg mb-12" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-3/4 bg-primary-100 animate-pulse rounded-2xl" />
                <div className="h-4 bg-primary-100 w-3/4 rounded" />
                <div className="h-4 bg-primary-100 w-1/2 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center text-accent-700 bg-accent-50">
        <p className="font-medium">Error al evocar la colección: {error}</p>
      </div>
    );
  }

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Cabecera de Sección */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-2"
          >
            <span className="text-primary-500 text-xs font-bold uppercase tracking-[0.3em]">
              Selección Exclusiva
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900 tracking-tight">
              Productos Destacados
            </h2>
            <div className="w-20 h-1 bg-accent-200 rounded-full" />
          </motion.div>

          <motion.a 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            href="/ecommerce/productos" 
            className="group flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors font-medium tracking-wide"
          >
            Explorar toda la colección
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </div>

        {/* Grid de Productos */}
        {productos.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12"
          >
            {productos.map((producto) => (
              <div key={producto.id} className="group">
                <ProductCard producto={producto} size="md" />
              </div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-primary-100 rounded-3xl">
            <p className="text-primary-400 font-serif italic text-xl">Nuevas piezas llegarán pronto...</p>
          </div>
        )}
      </div>
    </section>
  );
}