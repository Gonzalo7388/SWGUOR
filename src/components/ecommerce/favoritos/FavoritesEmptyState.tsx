'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

// ============================================================================
// COMPONENT
// ============================================================================

export default function FavoritesEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Heart className="w-10 h-10 text-gray-300" />
      </div>
      
      <h2 className="text-2xl font-medium text-gray-900 mb-2">
        No tienes favoritos
      </h2>
      
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Explora nuestra colección y guarda los productos que más te gusten
      </p>
      
      <Link
        href="/ecommerce/productos"
        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        Explorar productos
      </Link>
    </motion.div>
  );
}