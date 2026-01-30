'use client';

import { Heart } from 'lucide-react';
import { useState } from 'react';

const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: 'Vestido Floral Premium',
    price: 89.99,
    oldPrice: 129.99,
    image: 'bg-gradient-to-br from-pink-200 to-pink-300',
    rating: 4.5,
    reviews: 128,
    badge: 'Bestseller',
    color: 'Rosa',
  },
  {
    id: 2,
    name: 'Blusa Elegante de Seda',
    price: 64.99,
    oldPrice: 94.99,
    image: 'bg-gradient-to-br from-purple-200 to-purple-300',
    rating: 4.8,
    reviews: 95,
    badge: 'Nuevo',
    color: 'Púrpura',
  },
  {
    id: 3,
    name: 'Pantalón Ajustado Negro',
    price: 74.99,
    oldPrice: 99.99,
    image: 'bg-gradient-to-br from-gray-300 to-gray-400',
    rating: 4.6,
    reviews: 76,
    badge: 'Oferta',
    color: 'Negro',
  },
  {
    id: 4,
    name: 'Falda Plisada Gris',
    price: 59.99,
    oldPrice: 84.99,
    image: 'bg-gradient-to-br from-gray-200 to-gray-300',
    rating: 4.7,
    reviews: 62,
    badge: 'Top Ventas',
    color: 'Gris',
  },
  {
    id: 5,
    name: 'Buzo Cozy Beige',
    price: 54.99,
    oldPrice: 79.99,
    image: 'bg-gradient-to-br from-yellow-100 to-yellow-200',
    rating: 4.9,
    reviews: 110,
    badge: 'Bestseller',
    color: 'Beige',
  },
  {
    id: 6,
    name: 'Vestido Noche Dorado',
    price: 119.99,
    oldPrice: 169.99,
    image: 'bg-gradient-to-br from-yellow-300 to-yellow-400',
    rating: 4.8,
    reviews: 84,
    badge: 'Premium',
    color: 'Dorado',
  },
  {
    id: 7,
    name: 'Blusa Deportiva Rosa',
    price: 44.99,
    oldPrice: 64.99,
    image: 'bg-gradient-to-br from-red-200 to-pink-200',
    rating: 4.7,
    reviews: 98,
    badge: 'Oferta Flash',
    color: 'Rosa',
  },
  {
    id: 8,
    name: 'Pantalón Wide Leg Azul',
    price: 69.99,
    oldPrice: 99.99,
    image: 'bg-gradient-to-br from-blue-200 to-blue-300',
    rating: 4.6,
    reviews: 71,
    badge: 'Trending',
    color: 'Azul',
  },
];

function ProductCard({ product }: { product: typeof FEATURED_PRODUCTS[0] }) {
  const [isFavorite, setIsFavorite] = useState(false);

  const discount = Math.round(
    ((product.oldPrice - product.price) / product.oldPrice) * 100
  );

  return (
    <div className="group">
      <div className="relative rounded-lg overflow-hidden mb-3">
        {/* Product Image */}
        <div
          className={`${product.image} aspect-square flex items-center justify-center relative overflow-hidden transition-all duration-300 group-hover:shadow-xl`}
        >
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            {discount > 0 && (
              <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                -{discount}%
              </span>
            )}
            <span className="bg-black/70 text-white px-2 py-1 rounded text-xs font-bold">
              {product.badge}
            </span>
          </div>

          {/* Favorite Button */}
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="absolute top-3 right-3 bg-white p-2 rounded-full hover:bg-gray-100 transition shadow-md"
          >
            <Heart
              size={20}
              className={isFavorite ? 'fill-red-600 text-red-600' : 'text-gray-600'}
            />
          </button>

          {/* Quick Actions */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button className="bg-white text-gray-900 px-6 py-2 rounded-lg font-bold hover:bg-red-600 hover:text-white transition">
              Ver Más
            </button>
            <button className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition">
              Agregar al Carrito
            </button>
          </div>
        </div>

        {/* Product Info */}
        <h3 className="font-bold text-gray-900 text-sm md:text-base group-hover:text-red-600 transition">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mb-2">{product.color}</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-lg ${
                  i < Math.floor(product.rating) ? '⭐' : '☆'
                }`}
              >
              </span>
            ))}
          </div>
          <span className="text-xs text-gray-600">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg md:text-xl font-bold text-red-600">
            ${product.price}
          </span>
          {product.oldPrice > product.price && (
            <span className="text-sm line-through text-gray-400">
              ${product.oldPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FeaturedProducts() {
  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Productos Destacados
            </h2>
            <p className="text-gray-600">Lo más vendido de nuestra colección</p>
          </div>
          <a href="#" className="text-red-600 font-bold hover:text-red-700 text-sm md:text-base">
            Ver Todo →
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 md:gap-6">
          {FEATURED_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
