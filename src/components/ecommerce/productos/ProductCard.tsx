'use client';

import { Plus, Check, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCarrito } from '@/app/ecommerce/_contexts/CartContext';
import { useFavoritos } from '@/app/ecommerce/_contexts/FavoritosContext';
import { getSupabaseImageUrl } from '@/lib/utils/supabase-image-utils';

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
  const { esFavorito, toggleFavorito } = useFavoritos();
  const [agregado, setAgregado] = useState(false);
  const [esEnFavoritos, setEsEnFavoritos] = useState(false);

  // Sincronizar estado de favorito
  useEffect(() => {
    const idNumerico = typeof producto.id === 'string' ? parseInt(producto.id) : producto.id;
    setEsEnFavoritos(esFavorito(idNumerico));
  }, [producto.id, esFavorito]);

  const precio = typeof producto.precio === 'string' 
    ? parseFloat(producto.precio) 
    : (producto.precio || 0);
  const precioOriginal = typeof producto.precio_original === 'string'
    ? parseFloat(producto.precio_original)
    : (producto.precio_original || precio);
  const descuento = precioOriginal > precio 
    ? Math.round(((precioOriginal - precio) / precioOriginal) * 100)
    : 0;

  const handleAgregar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    agregarAlCarrito(producto);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  const handleToggleFavorito = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const idNumerico = typeof producto.id === 'string' ? parseInt(producto.id) : producto.id;
    toggleFavorito({
      id: idNumerico,
      nombre: producto.nombre,
      precio: typeof producto.precio === 'string' ? parseFloat(producto.precio) : producto.precio,
      imagen: producto.imagen,
    });
    setEsEnFavoritos(!esEnFavoritos);
  };

  // TAMAÑOS OPTIMIZADOS: Menos altura para mostrar más contenido
  const sizeClasses = {
    sm: 'aspect-[3/4] h-40', // Muy compacto
    md: 'aspect-[3/4] h-56 md:h-64', // Estándar de moda
    lg: 'aspect-[3/4] h-72 md:h-80', // Destacado
  };

  return (
    <Link href={`/ecommerce/productos/${producto.id}`}>
      <div className="flex flex-col h-full group bg-white cursor-pointer">
        {/* Contenedor de Imagen */}
        <div className={`relative ${sizeClasses[size]} overflow-hidden rounded-xl bg-gray-50 mb-3`}>
          {producto.imagen ? (
            <img
              src={getSupabaseImageUrl(producto.imagen) || producto.imagen}
              alt={producto.nombre}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-image.png';
                (e.target as HTMLImageElement).style.filter = 'grayscale(100%)';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 uppercase tracking-widest bg-gray-50">
              Sin imagen
            </div>
          )}

          {/* Badge de Descuento (Estilizado) */}
          {descuento > 0 && (
            <div className="absolute top-2 left-2 bg-[#f02d65] text-white px-2 py-0.5 rounded-md text-[10px] font-black uppercase shadow-sm">
              -{descuento}%
            </div>
          )}

          {/* Botón de Favorito */}
          <button
            onClick={handleToggleFavorito}
            className={`absolute top-2 right-2 rounded-full p-2.5 transition-all duration-300 shadow-md ${
              esEnFavoritos
                ? 'bg-red-500 text-white scale-110'
                : 'bg-white text-gray-400 hover:text-red-500 hover:scale-110'
            }`}
          >
            <Heart size={16} strokeWidth={2} fill={esEnFavoritos ? 'currentColor' : 'none'} />
          </button>

          {/* Botón Flotante (Aparece al hacer hover o siempre visible en móvil) */}
          <button
            onClick={handleAgregar}
            className={`absolute bottom-3 right-3 rounded-full p-2.5 transition-all duration-300 shadow-xl ${
              agregado
                ? 'bg-green-500 text-white scale-110'
                : 'bg-white text-gray-900 hover:bg-[#f02d65] hover:text-white translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 lg:translate-y-0 lg:opacity-100 md:translate-y-2 md:opacity-0'
            }`}
          >
            {agregado ? <Check size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
          </button>
        </div>

        {/* Información del Producto */}
        <div className="flex flex-col px-1">
          <h3 className="font-bold text-gray-800 text-[13px] leading-tight line-clamp-1 mb-0.5 group-hover:text-[#f02d65] transition-colors">
            {producto.nombre}
          </h3>

          {/* Precio simplificado */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-gray-900">
              S/ {precio.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
            {precioOriginal > precio && (
              <span className="text-[11px] line-through text-gray-400">
                S/ {precioOriginal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}