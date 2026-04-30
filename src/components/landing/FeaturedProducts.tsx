"use client";

import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { getCurrentSeason } from "@/config/seasonalThemes";

const FeaturedProducts = () => {
  const season = getCurrentSeason();

  return (
    <section id="catalogo" className="py-24" style={{ background: "#fff4e2" }}>
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-16">
          <span
            className="inline-block px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4"
            style={{ background: "#fbddd3", color: "#b5854b", border: "1px solid #e4c28a" }}
          >
            Catálogo Destacado
          </span>

          <h2 className="text-4xl font-black italic" style={{ color: "#231e1d" }}>
            Nuestras Mejores Prendas
          </h2>

          <p className="mt-4 text-sm" style={{ color: "rgba(35,30,29,0.6)" }}>
            Selección exclusiva de nuestros productos más vendidos.
          </p>
        </div>

        {/* GRID PRODUCTOS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[800px]">

          <ProductCard
            className="md:col-span-2 md:row-span-2"
            title="Abrigo de Gala 'Hilo de Oro'"
            category="Alta Costura"
            price="S/ 289.00"
            tag="Diseño de Autor"
            imageSrc="https://modelitosfeten.com/wp-content/uploads/2025/05/AA4A6122-Mejorado-NR-scaled.jpg"
          />

          <ProductCard
            className="md:col-span-2 md:row-span-1"
            title="Blusa de Seda Pima"
            category="Esenciales"
            price="S/ 120.00"
            imageSrc="https://www.banaty.pe/cdn/shop/files/02CS.BANATY26454.png?v=1760588487"
          />

          <ProductCard
            className="md:col-span-1 md:row-span-1"
            title="Conjunto Urbano"
            category="Casual"
            price="S/ 180.00"
            imageSrc="https://image.made-in-china.com/202f0j00upFkbYSqhRrB/Boys-Winter-Urban-Style-Outfit-Set-for-European-and-American-Streets.webp"
          />

          <ProductCard
            className="md:col-span-1 md:row-span-1"
            title="Accesorio 'G' Gold"
            category="Complementos"
            price="S/ 65.00"
            imageSrc="https://i.pinimg.com/736x/4c/f4/b7/4cf4b7b5918a3d2229ec227e0d389257.jpg"
          />
        </div>

      </div>
    </section>
  );
};

export default FeaturedProducts;