'use client';

import { Plus, Check, Heart, ShoppingBag } from 'lucide-react'; 
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useCarrito } from '@/app/ecommerce/_contexts/CartContext';
import { useFavoritos } from '@/app/ecommerce/_contexts/FavoritosContext';
import { getSupabaseImageUrl } from '@/lib/utils/supabase-image-utils';

const MAPA_COLORES: Record<string, string> = {
  'Negro': '#000000',
  'Blanco': '#ffffff',
  'Gris': '#9ca3af',
  'Beige': '#f5f5dc',
  'Marrón Pastel': '#b08d57',
  'Azul Jean': '#5dadec',
  'Azul Marino': '#000080',
  'Rosa Pastel': '#ffdae0',
  'Morado Claro': '#d8b4fe',
  'Multicolor': 'linear-gradient(to right, red, blue, green)',
  'Único': '#e5e7eb'
};

interface ProductCardProps {
  producto: {
    id: string | number;
    nombre: string;
    precio: number;
    precio_original?: number;
    imagen?: string;
    descripcion?: string;
    categoria_id?: string | number;
    variantes?: any[];
    [key: string]: any;
  };
  size?: 'sm' | 'md' | 'lg';
}

export default function ProductCard({ producto, size = 'md' }: ProductCardProps) {
  const { agregarAlCarrito, setIsCartOpen } = useCarrito();
  const { esFavorito, toggleFavorito } = useFavoritos();
  const [agregado, setAgregado] = useState(false);
  const [esEnFavoritos, setEsEnFavoritos] = useState(false);

  const coloresDisponibles = useMemo(() => {
    if (!producto.variantes) return [];
    return Array.from(new Set(producto.variantes.map(v => v.color)));
  }, [producto.variantes]);

  const tallasDisponibles = useMemo(() => {
    if (!producto.variantes) return [];
    return Array.from(new Set(producto.variantes.map(v => v.talla)))
                .filter(t => t !== 'Único');
  }, [producto.variantes]);

  useEffect(() => {
    const idNumerico = typeof producto.id === 'string' ? parseInt(producto.id) : producto.id;
    setEsEnFavoritos(esFavorito(idNumerico));
  }, [producto.id, esFavorito]);

  const precio = typeof producto.precio === 'string' ? parseFloat(producto.precio) : (producto.precio || 0);
  const precioOriginal = typeof producto.precio_original === 'string' ? parseFloat(producto.precio_original) : (producto.precio_original || precio);
  const descuento = precioOriginal > precio ? Math.round(((precioOriginal - precio) / precioOriginal) * 100) : 0;

  // HANDLER COMPRA DIRECTA
  const handleCompraDirecta = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Si el producto tiene variantes, lo ideal es que pase por la vista detallada
    // Pero si quieres añadirlo por defecto (ej: primera talla/color disponible):
    const tieneVariantes = tallasDisponibles.length > 0 || coloresDisponibles.length > 0;

    if (tieneVariantes) {
      // Opción A: Abrir el modal de selección que hicimos antes (Vista Rápida)
      // Opción B: Forzar la redirección para que elija bien
      window.location.href = `/ecommerce/productos/${producto.id}`;
      return;
    }

    // Si no tiene variantes, añadimos directo
    agregarAlCarrito({
      ...producto,
      cantidad: 400, // Mínimo B2B definido previamente
      color: 'Único',
      talla: 'Única'
    });

    setAgregado(true);
    setIsCartOpen(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  const handleToggleFavorito = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const idNumerico = typeof producto.id === 'string' ? parseInt(producto.id) : producto.id;
    toggleFavorito({
      id: idNumerico,
      nombre: producto.nombre,
      precio: precio,
      imagen: producto.imagen,
    });
  };

  const sizeClasses = {
    sm: 'aspect-[3/4] h-40',
    md: 'aspect-[3/4] h-56 md:h-64',
    lg: 'aspect-[3/4] h-72 md:h-80',
  };

  return (
    <Link href={`/ecommerce/productos/${producto.id}`}>
      <div className="flex flex-col h-full group bg-white cursor-pointer relative">
        <div className={`relative ${sizeClasses[size]} overflow-hidden rounded-3xl bg-gray-50 mb-3`}>
          {producto.imagen ? (
            <img
              src={getSupabaseImageUrl(producto.imagen) || producto.imagen}
              alt={producto.nombre}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 uppercase tracking-widest bg-gray-100">
              Sin imagen
            </div>
          )}

          {/* Badge Descuento */}
          {descuento > 0 && (
            <div className="absolute top-4 left-4 bg-rose-500 text-white px-3 py-1 rounded-full text-[10px] font-black z-10">
              -{descuento}%
            </div>
          )}

          {/* Botón Favoritos */}
          <button
            onClick={handleToggleFavorito}
            className={`absolute top-4 right-4 rounded-full p-2.5 transition-all duration-300 z-10 shadow-sm ${
              esEnFavoritos ? 'bg-white text-rose-500' : 'bg-white/80 text-gray-900 hover:bg-white'
            }`}
          >
            <Heart size={16} fill={esEnFavoritos ? 'currentColor' : 'none'} />
          </button>

          {/* BOTÓN AGREGAR AL CARRITO (Overlay) */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hidden md:block">
            <button
              onClick={handleCompraDirecta}
              className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xl transition-all ${
                agregado 
                  ? 'bg-green-500 text-white' 
                  : 'bg-black text-white hover:bg-rose-600'
              }`}
            >
              {agregado ? (
                <><Check size={16} /> ¡Añadido!</>
              ) : (
                <><Plus size={16} /> Añadir al Pedido</>
              )}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col px-1">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className="font-bold text-gray-900 text-[14px] leading-tight line-clamp-1 group-hover:text-rose-600 transition-colors">
                {producto.nombre}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[15px] font-black text-gray-900">
                  S/ {precio.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </span>
                {descuento > 0 && (
                   <span className="text-[11px] text-gray-400 line-through">
                     S/ {precioOriginal.toFixed(2)}
                   </span>
                )}
              </div>
            </div>
            
            {/* Botón móvil rápido (Ya que el overlay no funciona bien en touch) */}
            <button 
              onClick={handleCompraDirecta}
              className="md:hidden p-2 bg-gray-900 text-white rounded-xl"
            >
              <ShoppingBag size={16} />
            </button>
          </div>

          {/* Detalles minimalistas */}
          <div className="flex items-center gap-3 mt-3">
             {coloresDisponibles.length > 0 && (
                <div className="flex -space-x-1">
                  {coloresDisponibles.slice(0, 3).map((col, idx) => (
                    <div 
                      key={idx} 
                      className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                      style={{ background: MAPA_COLORES[col] || '#ccc' }}
                    />
                  ))}
                  {coloresDisponibles.length > 3 && (
                    <span className="text-[9px] font-bold text-gray-400 ml-2">+{coloresDisponibles.length - 3}</span>
                  )}
                </div>
             )}
             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter italic">
               {tallasDisponibles.join(' · ') || 'Talla Única'}
             </span>
          </div>
        </div>
      </div>
    </Link>
  );
}