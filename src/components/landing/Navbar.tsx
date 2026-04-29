"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { UserCircle2, ShieldCheck, Menu, X, ChevronDown } from "lucide-react";
import Link from "next/link";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { scrollY } = useScroll();
  
  // Efecto visual: el navbar se vuelve más denso al hacer scroll
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255, 253, 251, 0)", "rgba(255, 253, 251, 0.8)"]
  );
  const borderOpacity = useTransform(scrollY, [0, 100], [0, 1]);

  return (
    <motion.nav
      style={{ backgroundColor }}
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center text-[#D4AF37] font-black">
            G
          </div>
          <span className="text-xl font-black tracking-tighter text-stone-900 uppercase italic">
            Guor<span className="text-[#D4AF37] not-italic">Style</span>
          </span>
        </Link>

        {/* LINKS CENTRALES (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          {["Nosotros", "Catálogo", "Preguntas"].map((item) => (
            <Link 
              key={item} 
              href={`#${item.toLowerCase()}`}
              className="text-[11px] font-black uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>

        {/* ACCESOS DUALES (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Acceso Administrativo - Sobrio */}
          <Link 
            href="/login-admin" 
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-all border border-transparent hover:border-stone-200 rounded-xl"
          >
            <ShieldCheck size={14} /> GUOR Corporativo
          </Link>

          {/* Portal Socios/Cliente - Llamativo */}
          <Link 
            href="/login-cliente" 
            className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-[#D4AF37]/20 hover:bg-black hover:shadow-none transition-all"
          >
            <UserCircle2 size={16} /> Portal Socios
          </Link>
        </div>

        {/* MENU MÓVIL (Botón) */}
        <button className="md:hidden text-stone-900" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* CORTINA MÓVIL */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-20 inset-x-0 bg-white border-b border-stone-100 p-6 flex flex-col gap-6 shadow-xl"
        >
          <Link href="/login-cliente" className="w-full py-4 bg-[#D4AF37] text-white text-center rounded-2xl font-black uppercase text-xs">
            Portal Socios
          </Link>
          <Link href="/login-admin" className="w-full py-4 bg-stone-100 text-stone-900 text-center rounded-2xl font-black uppercase text-xs">
            GUOR Corporativo
          </Link>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;