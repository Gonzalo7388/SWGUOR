'use client';

import Image from 'next/image';
import Link from 'next/link';
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
      <section className="py-12 md:py-16">
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
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-red-600">Error cargando categorías: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Explora Nuestras Categorías
        </h2>
        <p className="text-gray-600 mb-8">Encuentra el estilo perfecto para ti</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categorias.map((categoria, index) => {
            const icono = ICONOS_CATEGORIA[categoria.nombre as keyof typeof ICONOS_CATEGORIA] || '📦';
            const colorGradient = COLORES_CATEGORIA[index % COLORES_CATEGORIA.length];

            return (
              <Link key={categoria.id} href={`/ecommerce/categorias/${categoria.id}`}>
                <div className="group cursor-pointer">
                  <div
                    className={`${colorGradient} rounded-lg h-40 md:h-48 flex items-center justify-center relative overflow-hidden transition-transform duration-300 group-hover:scale-105`}
                  >
                    {categoria.imagen ? (
                      <img
                        src={getSupabaseImageUrl(categoria.imagen, 'categorias') || categoria.imagen}
                        alt={categoria.nombre}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="text-5xl md:text-6xl">{icono}</div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <h3 className="font-bold text-gray-900 mt-3 group-hover:text-red-600 transition">
                    {categoria.nombre}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">{categoria.descripcion}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
