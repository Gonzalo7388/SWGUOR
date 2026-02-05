'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCategoriasEcommerce } from '@/lib/hooks/useCategoriasEcommerce';

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
  'from-pink-400 to-pink-600',
  'from-purple-400 to-purple-600',
  'from-blue-400 to-blue-600',
  'from-red-400 to-red-600',
  'from-yellow-400 to-yellow-600',
  'from-green-400 to-green-600',
  'from-indigo-400 to-indigo-600',
  'from-orange-400 to-orange-600',
  'from-cyan-400 to-cyan-600',
  'from-teal-400 to-teal-600',
];

export default function CategoriasPage() {
  const { categorias, loading } = useCategoriasEcommerce();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Nuestras Categorías</h1>
            <p className="text-red-100 text-lg">Cargando categorías...</p>
          </div>
        </div>

        {/* Loading Grid */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 rounded-xl h-64 mb-4"></div>
                <div className="bg-gray-200 h-6 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Explora Nuestras Categorías</h1>
          <p className="text-red-100 text-lg md:text-xl mb-6">
            Encuentra la categoría que buscas y descubre nuestros mejores productos
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link
              href="/ecommerce"
              className="px-6 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              ← Volver al Inicio
            </Link>
            <Link
              href="/ecommerce/promociones"
              className="px-6 py-3 bg-red-900 text-white rounded-lg font-semibold hover:bg-red-950 transition"
            >
              🎁 Ver Ofertas
            </Link>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-16">
          {categorias.length > 0 ? (
            <>
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {categorias.length} Categoría{categorias.length !== 1 ? 's' : ''} Disponible{categorias.length !== 1 ? 's' : ''}
                </h2>
                <div className="h-1 w-20 bg-gradient-to-r from-red-600 to-red-400 rounded"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categorias.map((categoria: any, index: number) => {
                  const icono = ICONOS_CATEGORIA[categoria.nombre as keyof typeof ICONOS_CATEGORIA] || '📦';
                  const colorGradient = COLORES_CATEGORIA[index % COLORES_CATEGORIA.length];

                  return (
                    <Link
                      key={categoria.id}
                      href={`/ecommerce/categorias/${categoria.id}`}
                    >
                      <div className="group cursor-pointer h-full">
                        {/* Card */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                          {/* Imagen */}
                          <div
                            className={`bg-gradient-to-br ${colorGradient} h-48 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300`}
                          >
                            {categoria.imagen ? (
                              <img
                                src={categoria.imagen}
                                alt={categoria.nombre}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-6xl md:text-7xl">{icono}</div>
                            )}
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                              <span className="text-white text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                Ver Productos →
                              </span>
                            </div>
                          </div>

                          {/* Contenido */}
                          <div className="p-6 flex-grow flex flex-col">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition">
                              {categoria.nombre}
                            </h3>
                            {categoria.descripcion && (
                              <p className="text-gray-600 text-sm mb-4 flex-grow">
                                {categoria.descripcion}
                              </p>
                            )}
                            <div className="pt-4 border-t border-gray-200">
                              <button className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-2.5 rounded-lg font-semibold hover:shadow-lg transition duration-300">
                                Explorar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg mb-6">No hay categorías disponibles</p>
              <Link
                href="/ecommerce"
                className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Volver al Inicio
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
