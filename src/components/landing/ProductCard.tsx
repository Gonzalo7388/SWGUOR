"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Star } from "lucide-react";

interface ProductProps {
  title: string;
  category: string;
  price: string;
  imageSrc: string; // <-- 1. Agregamos esta propiedad
  tag?: string;
  className?: string;
}

const ProductCard = ({ title, category, price, imageSrc, tag, className }: ProductProps) => {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className={`relative group overflow-hidden rounded-[2.5rem] bg-white border border-stone-100 shadow-sm ${className}`}
    >
      {/* 2. AQUÍ PONEMOS LA IMAGEN REAL */}
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src={imageSrc} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
      </div>
      
      {/* Overlay de Degradado (Importante para que el texto blanco sea legible) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Badge de Temporada */}
      {tag && (
        <div className="absolute top-6 left-6 z-10 px-4 py-1.5 bg-white/40 backdrop-blur-md border border-white/40 rounded-full">
          <span className="text-[9px] font-black uppercase tracking-widest text-stone-900 flex items-center gap-2">
            <Star size={10} className="fill-stone-900" /> {tag}
          </span>
        </div>
      )}

      {/* Información del Producto (Ahora siempre visible o con hover) */}
      <div className="absolute bottom-0 inset-x-0 p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 z-20">
        <div className="flex justify-between items-end">
          <div className="text-white drop-shadow-md">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-90 mb-1">{category}</p>
            <h3 className="text-xl font-black tracking-tighter leading-none">{title}</h3>
            <p className="mt-3 text-lg font-serif italic">{price}</p>
          </div>
          <button className="p-4 bg-[#D4AF37] text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 shadow-xl shadow-black/20">
            <ShoppingBag size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;