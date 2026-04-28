"use client";

import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { getCurrentSeason } from "@/config/seasonalThemes";

const FeaturedProducts = () => {
  const season = getCurrentSeason();

  return (
    <section id="catalogo" className="py-32 max-w-7xl mx-auto px-6">
      {/* ... (Cabecera igual que antes) ... */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[800px]">
        {/* 1. PRODUCTO PRINCIPAL */}
        <ProductCard 
          className="md:col-span-2 md:row-span-2"
          title="Abrigo de Gala 'Hilo de Oro'"
          category="Alta Costura"
          price="S/ 289.00"
          tag="Diseño de Autor"
          imageSrc="https://modelitosfeten.com/wp-content/uploads/2025/05/AA4A6122-Mejorado-NR-scaled.jpg" // <--- PEGA TU LINK AQUÍ
        />

        {/* 2. PRODUCTO SECUNDARIO (Arriba Derecha) */}
        <ProductCard 
          className="md:col-span-2 md:row-span-1"
          title="Blusa de Seda Pima"
          category="Esenciales"
          price="S/ 120.00"
          imageSrc="https://www.banaty.pe/cdn/shop/files/02CS.BANATY26454.png?v=1760588487" // <--- PEGA TU LINK AQUÍ
        />

        {/* 3. PRODUCTO TERCERO (Abajo) */}
        <ProductCard 
          className="md:col-span-1 md:row-span-1"
          title="Conjunto Urbano"
          category="Casual"
          price="S/ 180.00"
          imageSrc="https://image.made-in-china.com/202f0j00upFkbYSqhRrB/Boys-Winter-Urban-Style-Outfit-Set-for-European-and-American-Streets.webp" // <--- PEGA TU LINK AQUÍ
        />

        {/* 4. PRODUCTO CUARTO (Abajo) */}
        <ProductCard 
          className="md:col-span-1 md:row-span-1"
          title="Accesorio 'G' Gold"
          category="Complementos"
          price="S/ 65.00"
          imageSrc="https://i.pinimg.com/736x/4c/f4/b7/4cf4b7b5918a3d2229ec227e0d389257.jpg" // <--- PEGA TU LINK AQUÍ
        />
      </div>
    </section>
  );
};

export default FeaturedProducts;