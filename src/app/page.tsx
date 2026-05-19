"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Testimonials from "@/components/landing/Testimonials";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-guor-cream">
      <Navbar />

      {/* HERO */}
      <main className="flex-1 flex items-center px-6 pt-32 pb-24">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* IZQUIERDA */}
          <div>

            {/* BADGE */}
            <span className="inline-block px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.35em] mb-8 bg-guor-peach text-guor-brown border border-guor-gold">
              Corporación Textil Peruana
            </span>

            {/* TITULO */}
            <h1 className="text-7xl leading-[0.95] font-black italic mb-8 text-guor-dark">
              Excelencia Textil
              <br />

              <span className="not-italic block mt-3 text-guor-gold">
                GUOR Style
              </span>
            </h1>

            {/* TEXTO */}
            <p className="text-2xl leading-relaxed max-w-2xl mb-10 text-guor-dark/75">
              Aliado estratégico en{" "}
              <span className="font-bold text-guor-dark">
                diseño y confección mayorista
              </span>
              , fusionamos excelencia textil, producción premium y logística
              inteligente para potenciar marcas y negocios textiles.

              <br />
              <br />

              Obtén un{" "}
              <span className="font-bold text-guor-brown">
                20% de descuento
              </span>{" "}
              en tu primera orden corporativa.
            </p>

            {/* CTA */}
            <div className="flex flex-col items-start gap-6">

              {/* BOTON */}
              <Link
                href="/registro-cliente"
                className="inline-flex items-center gap-3 px-9 py-5 rounded-2xl font-black text-base shadow-xl transition-all duration-300 bg-guor-dark text-guor-cream border-2 border-guor-dark hover:bg-guor-brown hover:border-guor-brown hover:text-guor-dark hover:-translate-y-1"
              >
                Iniciar Alianza B2B
                <ArrowRight size={20} />
              </Link>

              {/* PROMOCION */}
              <div className="px-6 py-5 rounded-2xl max-w-xl bg-guor-peach border border-guor-gold">
                <p className="text-base font-bold leading-relaxed text-guor-dark">
                  Accede a descuentos exclusivos, producción premium y
                  atención estratégica para potenciar tu negocio textil.
                </p>
              </div>
            </div>
          </div>

          {/* DERECHA */}
          <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-2 border-guor-gold min-h-[700px]">

            {/* IMAGEN */}
            <Image
              src="/fotohome.jpg"
              alt="Moda con Identidad"
              fill
              className="object-cover object-center"
              priority
            />

            {/* OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-t from-guor-dark/90 to-guor-dark/35" />

            {/* CONTENIDO */}
            <div className="relative z-10 flex flex-col justify-between h-full p-10">

              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.35em] mb-6 text-guor-cream">
                  Excelencia Operativa
                </p>

                <h2 className="text-6xl font-black italic leading-tight mb-8 text-guor-cream">
                  Moda con
                  <br />

                  <span className="text-guor-gold">
                    identidad
                  </span>
                </h2>

                <p className="text-xl leading-relaxed max-w-lg text-guor-cream/90">
                  Producción textil premium con enfoque estratégico,
                  calidad garantizada y procesos eficientes para potenciar
                  marcas modernas.
                </p>
              </div>

              {/* STATS */}
              <div className="flex gap-5">

                <div className="backdrop-blur-md rounded-3xl px-8 py-6 bg-guor-cream/10 border border-guor-cream/25">
                  <h3 className="text-5xl font-black text-guor-cream">
                    +6
                  </h3>

                  <p className="text-sm font-bold uppercase mt-2 text-guor-gold">
                    Años
                  </p>
                </div>

                <div className="backdrop-blur-md rounded-3xl px-8 py-6 bg-guor-cream/10 border border-guor-cream/25">
                  <h3 className="text-4xl font-black text-guor-cream">
                    B2B
                  </h3>

                  <p className="text-sm font-bold uppercase mt-2 text-guor-gold">
                    Enfoque
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* PRENDAS DESTACADAS */}
      <section className="px-6 py-24 bg-white">
        <div className="max-w-7xl mx-auto">

          {/* TITULO */}
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black italic text-guor-dark">
              Prendas destacadas
            </h2>

            <p className="mt-4 text-lg text-guor-dark/60">
              Selección exclusiva basada en la preferencia de nuestros clientes
            </p>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">

            {[1,2,3,4,5].map((item) => (
              <div
                key={item}
                className="group rounded-3xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl bg-guor-cream border border-guor-gold"
              >

                {/* IMAGEN */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={`/conjunto${item}.png`}
                    alt={`Producto ${item}`}
                    fill
                    className="object-cover group-hover:scale-110 transition duration-500"
                  />
                </div>

                {/* NOMBRE */}
                <div className="p-5 text-center">
                  <h3 className="font-bold text-lg text-guor-dark">
                    Prenda {item}
                  </h3>
                </div>

              </div>
            ))}

          </div>
        </div>
      </section>
      
      {/* TESTIMONIOS */}
      <Testimonials />

      <Footer />
    </div>
  );
}