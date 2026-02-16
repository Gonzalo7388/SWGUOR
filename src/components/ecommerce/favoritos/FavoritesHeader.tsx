'use client';

import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface FavoritesHeaderProps {
  count: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function FavoritesHeader({ count }: FavoritesHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Heart className="text-red-600" size={28} fill="currentColor" />
            <h1 className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight">
              Mis Favoritos
            </h1>
          </div>
          <p className="text-sm text-gray-600">
            {count} {count === 1 ? 'producto guardado' : 'productos guardados'}
          </p>
        </motion.div>
      </div>
    </div>
  );
}