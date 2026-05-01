"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Star } from "lucide-react";

interface ProductProps {
  title: string;
  category: string;
  price: string;
  imageSrc: string;
  tag?: string;
  className?: string;
}

const ProductCard = ({ title, category, price, imageSrc, tag, className }: ProductProps) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className={`relative group overflow-hidden rounded-[2rem] shadow-md ${className}`}
      style={{ background: "#fff4e2", border: "1px solid #e4c28a" }}
    >
      {/* IMAGEN */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
      </div>

      {/* OVERLAY */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500"
        style={{ background: "linear-gradient(to top, rgba(35,30,29,0.85), rgba(35,30,29,0.2), transparent)" }}
      />

      {/* TAG */}
      {tag && (
        <div
          className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full backdrop-blur-sm"
          style={{ background: "rgba(255,244,226,0.85)", border: "1px solid #e4c28a" }}
        >
          <span className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1" style={{ color: "#b5854b" }}>
            <Star size={10} /> {tag}
          </span>
        </div>
      )}

      {/* INFO */}
      <div className="absolute bottom-0 inset-x-0 p-6 translate-y-4 group-hover:translate-y-0 transition duration-500 z-20">
        <div className="flex justify-between items-end">

          <div style={{ color: "#fff4e2" }}>
            <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,244,226,0.8)" }}>
              {category}
            </p>

            <h3 className="text-lg font-bold leading-tight">
              {title}
            </h3>

            <p className="mt-2 text-sm italic" style={{ color: "#e4c28a" }}>
              {price}
            </p>
          </div>

          {/* BOTON */}
          <button
            className="p-3 rounded-xl opacity-0 group-hover:opacity-100 transition duration-500 translate-y-4 group-hover:translate-y-0"
            style={{ background: "#e4c28a", color: "#231e1d" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#b5854b"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#e4c28a"}
          >
            <ShoppingBag size={18} />
          </button>

        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;