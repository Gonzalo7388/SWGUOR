"use client";

import { motion } from "framer-motion";
import { getCurrentSeason } from "@/config/seasonalThemes";
import Navbar from "@/components/landing/Navbar";
import FAQSection from "@/components/landing/FAQSection";
import AboutSection from "@/components/landing/AboutSection";
import FeaturedProducts from "@/components/landing/FeaturedProducts";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const season = getCurrentSeason();

return (
    <div className="relative min-h-screen bg-[#FFFDFB]">
      <Navbar />

      <main className="relative">
        {/* ✅ ENVOLTORIO PARA LAS DOS PRIMERAS SECCIONES (Hero + Nosotros) */}
        <div className="relative">
          {/* FONDO DE CUADRITOS: Ahora dentro del contenedor específico */}
          <div
            className="absolute inset-0 z-0 opacity-[0.15] pointer-events-none" 
            style={{
              backgroundImage: `url('https://www.transparenttextures.com/patterns/cubes.png')`,
              backgroundRepeat: 'repeat'
            }}
          />

          {/* 3. HERO SECTION */}
          <section className="relative z-10 pt-40 pb-20 px-6 overflow-hidden">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="z-10"
              >
                <span className="inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] bg-[#D4AF37]/10 text-[#D4AF37] mb-6">
                  Corporación Textil Peruana
                </span>

                <h1 className="text-7xl font-black text-stone-900 leading-[1.2] tracking-tighter mb-6 italic">
                  {season.title} <br />
                  <span className={`
                    relative inline-block not-italic 
                    bg-clip-text text-transparent 
                    bg-gradient-to-r ${season.gradient}
                    py-4 pr-12 -my-4 -mr-12
                    filter drop-shadow-[0_2px_12px_rgba(212,175,55,0.25)]
                  `}>
                    GUOR Style
                  </span>
                </h1>

                <p className="text-lg text-stone-500 mb-10 max-w-md font-medium">
                Aliado estratégico en <span className="text-black font-black">diseño y confección mayorista</span>, fusionamos excelencia textil y artesanía con una gestión logística inteligente para las marcas más prestigiosas de Gamarra y el país.
                Únete hoy a nuestro ecosistema y obtén un <span className="text-black font-black">20% de descuento</span> en tu primera orden de producción.
              </p>

                <div className="flex flex-wrap gap-4">
                  <Link href="/registro-cliente" className="px-8 py-4 bg-stone-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-[#D4AF37] transition-all shadow-xl">
                    Iniciar Alianza B2B <ArrowRight size={18} />
                  </Link>
                </div>
              </motion.div>

              {/* IMAGEN PREVIA */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative h-[550px] bg-white/30 backdrop-blur-md rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${season.gradient} opacity-10`} />
                <div className="flex items-center justify-center h-full text-stone-300 font-bold uppercase tracking-tighter text-4xl opacity-40 text-center px-12">
                  Excelencia Operativa
                </div>
              </motion.div>
            </div>
          </section>

          {/* 4. SECCIÓN NOSOTROS (Aprovecha el fondo de cuadritos del contenedor padre) */}
          <AboutSection />
        </div>

        {/* 5. SECCIÓN DE CATÁLOGO (Ya no tiene cuadritos) */}
        <FeaturedProducts />

        {/* 6. SECCIÓN DE PREGUNTAS FRECUENTES */}
        <FAQSection />
      </main>

      <footer className="relative z-20 py-16 border-t border-stone-200 text-center bg-stone-100/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[10px] font-black text-stone-600 uppercase tracking-[0.4em] leading-relaxed">
            © 2026 <span className="text-stone-900">Modas y Estilos GUOR S.A.C.</span> —
            <span className="text-[#D4AF37] ml-2">Referente Textil Nacional</span>
          </p>
          <div className="w-12 h-[1px] bg-[#D4AF37]/40 mx-auto mt-6" />
          <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mt-4">
            Lima, Perú — Excelencia en cada puntada
          </p>
        </div>
      </footer>
    </div>
  );
}