'use client';

import Image from 'next/image';
import Link from 'next/link';

const CATEGORIAS = [
  {
    id: 1,
    nombre: 'Vestidos',
    descripcion: 'Para cualquier ocasión',
    imagen: 'bg-gradient-to-br from-pink-300 to-pink-500',
    icono: '👗',
  },
  {
    id: 2,
    nombre: 'Blusas',
    descripcion: 'Elegancia y comodidad',
    imagen: 'bg-gradient-to-br from-purple-300 to-purple-500',
    icono: '👕',
  },
  {
    id: 3,
    nombre: 'Pantalones',
    descripcion: 'Estilo casual y formal',
    imagen: 'bg-gradient-to-br from-blue-300 to-blue-500',
    icono: '👖',
  },
  {
    id: 4,
    nombre: 'Faldas',
    descripcion: 'Diseños únicos',
    imagen: 'bg-gradient-to-br from-red-300 to-red-500',
    icono: '👗',
  },
  {
    id: 5,
    nombre: 'Buzos',
    descripcion: 'Confort garantizado',
    imagen: 'bg-gradient-to-br from-yellow-300 to-yellow-500',
    icono: '🧥',
  },
  {
    id: 6,
    nombre: 'Accesorios',
    descripcion: 'Complementa tu look',
    imagen: 'bg-gradient-to-br from-green-300 to-green-500',
    icono: '👜',
  },
];

export default function MuestraCategoria() {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Explora Nuestras Categorías
        </h2>
        <p className="text-gray-600 mb-8">Encuentra el estilo perfecto para ti</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIAS.map((categoria) => (
            <Link key={categoria.id} href={`#/categoria/${categoria.id}`}>
              <div className="group cursor-pointer">
                <div
                  className={`${categoria.imagen} rounded-lg h-40 md:h-48 flex items-center justify-center relative overflow-hidden transition-transform duration-300 group-hover:scale-105`}
                >
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="text-5xl md:text-6xl">{categoria.icono}</div>
                </div>
                <h3 className="font-bold text-gray-900 mt-3 group-hover:text-red-600 transition">
                  {categoria.nombre}
                </h3>
                <p className="text-xs md:text-sm text-gray-600">{categoria.descripcion}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
