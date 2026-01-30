'use client';

import Image from 'next/image';
import Link from 'next/link';

const CATEGORIES = [
  {
    id: 1,
    name: 'Vestidos',
    description: 'Para cualquier ocasión',
    image: 'bg-gradient-to-br from-pink-300 to-pink-500',
    icon: '👗',
  },
  {
    id: 2,
    name: 'Blusas',
    description: 'Elegancia y comodidad',
    image: 'bg-gradient-to-br from-purple-300 to-purple-500',
    icon: '👕',
  },
  {
    id: 3,
    name: 'Pantalones',
    description: 'Estilo casual y formal',
    image: 'bg-gradient-to-br from-blue-300 to-blue-500',
    icon: '👖',
  },
  {
    id: 4,
    name: 'Faldas',
    description: 'Diseños únicos',
    image: 'bg-gradient-to-br from-red-300 to-red-500',
    icon: '👗',
  },
  {
    id: 5,
    name: 'Buzos',
    description: 'Confort garantizado',
    image: 'bg-gradient-to-br from-yellow-300 to-yellow-500',
    icon: '🧥',
  },
  {
    id: 6,
    name: 'Accesorios',
    description: 'Complementa tu look',
    image: 'bg-gradient-to-br from-green-300 to-green-500',
    icon: '👜',
  },
];

export default function CategoryShowcase() {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Explora Nuestras Categorías
        </h2>
        <p className="text-gray-600 mb-8">Encuentra el estilo perfecto para ti</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((category) => (
            <Link key={category.id} href={`#/categoria/${category.id}`}>
              <div className="group cursor-pointer">
                <div
                  className={`${category.image} rounded-lg h-40 md:h-48 flex items-center justify-center relative overflow-hidden transition-transform duration-300 group-hover:scale-105`}
                >
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="text-5xl md:text-6xl">{category.icon}</div>
                </div>
                <h3 className="font-bold text-gray-900 mt-3 group-hover:text-red-600 transition">
                  {category.name}
                </h3>
                <p className="text-xs md:text-sm text-gray-600">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
