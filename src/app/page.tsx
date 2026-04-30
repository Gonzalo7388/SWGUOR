"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import FAQSection from "@/components/landing/FAQSection";
import AboutSection from "@/components/landing/AboutSection";
import FeaturedProducts from "@/components/landing/FeaturedProducts";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#fff4e2" }}>
      <Navbar />
      <main>
        {/* HERO */}
        <section className="pt-40 pb-20 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* IZQUIERDA */}
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}>

              {/* BADGE */}
              <span
                className="inline-block px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6"
                style={{ background: "#fbddd3", color: "#b5854b", border: "1px solid #e4c28a" }}
              >
                Corporación Textil Peruana
              </span>

              {/* TITULO */}
              <h1 className="text-6xl font-black italic leading-tight mb-6" style={{ color: "#231e1d" }}>
                Excelencia Textil <br />
                <span className="not-italic" style={{ color: "#e4c28a" }}>
                  GUOR Style
                </span>
              </h1>

              {/* TEXTO */}
              <p className="text-lg mb-10 max-w-md" style={{ color: "rgba(35,30,29,0.75)" }}>
                Aliado estratégico en{" "}
                <span className="font-bold" style={{ color: "#231e1d" }}>diseño y confección mayorista</span>
                , fusionamos excelencia textil y artesanía con logística inteligente.
                <br /><br />
                Obtén un{" "}
                <span className="font-bold" style={{ color: "#b5854b" }}>20% de descuento</span>{" "}
                en tu primera orden.
              </p>

              {/* BOTON */}
              <Link
                href="/registro-cliente"
                className="inline-flex px-6 py-3 rounded-xl font-bold text-sm items-center gap-2"
                style={{ background: "#231e1d", color: "#fff4e2", border: "2px solid #231e1d", transition: "all 0.3s" }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "#e4c28a";
                  el.style.borderColor = "#e4c28a";
                  el.style.color = "#231e1d";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "#231e1d";
                  el.style.borderColor = "#231e1d";
                  el.style.color = "#fff4e2";
                }}
              >
                Iniciar Alianza B2B <ArrowRight size={16} />
              </Link>
            </motion.div>

            {/* DERECHA → TARJETA */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square rounded-[3rem] shadow-xl flex flex-col items-center justify-center p-12 text-center"
              style={{ background: "#fff4e2", border: "2px solid #e4c28a" }}
            >
              <h2 className="text-2xl font-black uppercase italic" style={{ color: "#231e1d" }}>
                Excelencia Operativa
              </h2>
              <div className="w-12 mx-auto my-4" style={{ height: "2px", background: "#e4c28a" }} />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#b5854b" }}>
                Procesos Eficientes
              </p>
            </motion.div>

          </div>
        </section>

        <AboutSection />
        <FeaturedProducts />
        <FAQSection />
      </main>

      {/* FOOTER */}
      <footer className="py-16 text-center" style={{ borderTop: "1px solid #e4c28a", background: "#fff4e2" }}>
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: "rgba(35,30,29,0.6)" }}>
            © 2026 GUOR S.A.C.
          </p>
          <div className="w-10 mx-auto mt-6" style={{ height: "1px", background: "#e4c28a" }} />
          <p className="text-[10px] mt-4" style={{ color: "rgba(35,30,29,0.4)" }}>
            Lima, Perú — Excelencia en cada puntada
          </p>
        </div>
      </footer>
    </div>
  );
}