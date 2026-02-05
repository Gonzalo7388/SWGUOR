'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useCarrito } from '@/app/ecommerce/_contexts/CartContext';

interface ProductCardProps {
  producto: {
    id: string | number;
    nombre: string;
    precio: number;
    precio_original?: number;
    imagen?: string;
    descripcion?: string;
    categoria_id?: string | number;
    [key: string]: any;
  };
  size?: 'sm' | 'md' | 'lg';
}

export default function ProductCard({ producto, size = 'md' }: ProductCardProps) {
  const { agregarAlCarrito } = useCarrito();
  const [agregado, setAgregado] = useState(false);

  const precio = typeof producto.precio === 'string' 
    ? parseFloat(producto.precio) 
    : (producto.precio || 0);
  const precioOriginal = typeof producto.precio_original === 'string'
    ? parseFloat(producto.precio_original)
    : (producto.precio_original || precio);
  const descuento = precioOriginal > precio 
    ? Math.round(((precioOriginal - precio) / precioOriginal) * 100)
    : 0;

  const handleAgregar = () => {
    agregarAlCarrito(producto);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  const sizeClasses = {
    sm: 'h-32 md:h-40',
    md: 'h-48 md:h-64',
    lg: 'h-72 md:h-96',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Imagen */}
      <div className={`relative ${sizeClasses[size]} overflow-hidden rounded-lg bg-gray-200 mb-3 group`}>
        {producto.imagen ? (
          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            Sin imagen
          </div>
        )}

        {/* Descuento Badge */}
        {descuento > 0 && (
          <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
            -{descuento}%
          </div>
        )}

        {/* Botón Agregar al Carrito */}
        <button
          onClick={handleAgregar}
          className={`absolute bottom-2 right-2 rounded-full p-2 transition shadow-lg transform hover:scale-110 ${
            agregado
              ? 'bg-green-600 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title="Agregar al carrito"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Información */}
      <div className="flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-1">
          {producto.nombre}
        </h3>

        {producto.descripcion && (
          <p className="text-xs text-gray-600 line-clamp-1 mb-2">
            {producto.descripcion}
          </p>
        )}

        {/* Precios */}
        <div className="mt-auto flex items-center gap-2">
          <span className="text-lg font-bold text-red-600">
            ${precio.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
          </span>
          {precioOriginal > precio && (
            <span className="text-xs line-through text-gray-400">
              ${precioOriginal.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
