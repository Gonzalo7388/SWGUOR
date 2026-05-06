"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col overflow-x-hidden"
      style={{ background: "#fff4e2" }}
    >
      <Navbar />

      {/* HERO */}
      <main className="flex-1 flex items-center px-6 pt-32 pb-24">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* IZQUIERDA */}
          <div>

            {/* BADGE */}
            <span
              className="inline-block px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.35em] mb-8"
              style={{
                background: "#fbddd3",
                color: "#b5854b",
                border: "1px solid #e4c28a",
              }}
            >
              Corporación Textil Peruana
            </span>

            {/* TITULO */}
            <h1
              className="text-7xl leading-[0.95] font-black italic mb-8"
              style={{ color: "#231e1d" }}
            >
              Excelencia Textil
              <br />

              <span
                className="not-italic block mt-3"
                style={{ color: "#e4c28a" }}
              >
                GUOR Style
              </span>
            </h1>

            {/* TEXTO */}
            <p
              className="text-2xl leading-relaxed max-w-2xl mb-10"
              style={{ color: "rgba(35,30,29,0.75)" }}
            >
              Aliado estratégico en{" "}
              <span
                className="font-bold"
                style={{ color: "#231e1d" }}
              >
                diseño y confección mayorista
              </span>
              , fusionamos excelencia textil, producción premium y logística
              inteligente para potenciar marcas y negocios textiles.

              <br />
              <br />

              Obtén un{" "}
              <span
                className="font-bold"
                style={{ color: "#b5854b" }}
              >
                20% de descuento
              </span>{" "}
              en tu primera orden corporativa.
            </p>

            {/* CTA */}
            <div className="flex flex-col items-start gap-6">

              {/* BOTON */}
              <Link
                href="/registro-cliente"
                className="inline-flex items-center gap-3 px-9 py-5 rounded-2xl font-black text-base shadow-xl transition-all duration-300"
                style={{
                  background: "#231e1d",
                  color: "#fff4e2",
                  border: "2px solid #231e1d",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;

                  el.style.background = "#b5854b";
                  el.style.borderColor = "#b5854b";
                  el.style.color = "#231e1d";
                  el.style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;

                  el.style.background = "#231e1d";
                  el.style.borderColor = "#231e1d";
                  el.style.color = "#fff4e2";
                  el.style.transform = "translateY(0px)";
                }}
              >
                Iniciar Alianza B2B
                <ArrowRight size={20} />
              </Link>

              {/* PROMOCION */}
              <div
                className="px-6 py-5 rounded-2xl max-w-xl"
                style={{
                  background: "#fbddd3",
                  border: "1px solid #e4c28a",
                }}
              >
                <p
                  className="text-base font-bold leading-relaxed"
                  style={{ color: "#231e1d" }}
                >
                  Accede a descuentos exclusivos, producción premium y
                  atención estratégica para potenciar tu negocio textil.
                </p>
              </div>
            </div>
          </div>

          {/* DERECHA */}
          <div
            className="relative rounded-[3rem] overflow-hidden shadow-2xl"
            style={{
              border: "2px solid #e4c28a",
              minHeight: "700px",
            }}
          >

            {/* IMAGEN */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url('/fotohome.jpg')",
              }}
            />

            {/* OVERLAY */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(35,30,29,0.88), rgba(35,30,29,0.35))",
              }}
            />

            {/* CONTENIDO */}
            <div className="relative z-10 flex flex-col justify-between h-full p-10">

              <div>
                <p
                  className="text-[11px] font-black uppercase tracking-[0.35em] mb-6"
                  style={{ color: "#fff4e2" }}
                >
                  Excelencia Operativa
                </p>

                <h2
                  className="text-6xl font-black italic leading-tight mb-8"
                  style={{ color: "#fff4e2" }}
                >
                  Moda con
                  <br />

                  <span style={{ color: "#e4c28a" }}>
                    identidad
                  </span>
                </h2>

                <p
                  className="text-xl leading-relaxed max-w-lg"
                  style={{ color: "rgba(255,244,226,0.9)" }}
                >
                  Producción textil premium con enfoque estratégico,
                  calidad garantizada y procesos eficientes para potenciar
                  marcas modernas.
                </p>
              </div>

              {/* STATS */}
              <div className="flex gap-5">

                <div
                  className="backdrop-blur-md rounded-3xl px-8 py-6"
                  style={{
                    background: "rgba(255,244,226,0.12)",
                    border: "1px solid rgba(255,244,226,0.25)",
                  }}
                >
                  <h3
                    className="text-5xl font-black"
                    style={{ color: "#fff4e2" }}
                  >
                    +6
                  </h3>

                  <p
                    className="text-sm font-bold uppercase mt-2"
                    style={{ color: "#e4c28a" }}
                  >
                    Años
                  </p>
                </div>

                <div
                  className="backdrop-blur-md rounded-3xl px-8 py-6"
                  style={{
                    background: "rgba(255,244,226,0.12)",
                    border: "1px solid rgba(255,244,226,0.25)",
                  }}
                >
                  <h3
                    className="text-4xl font-black"
                    style={{ color: "#fff4e2" }}
                  >
                    B2B
                  </h3>

                  <p
                    className="text-sm font-bold uppercase mt-2"
                    style={{ color: "#e4c28a" }}
                  >
                    Enfoque
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>
{/* 🔥 PRENDAS DESTACADAS */}
<section className="px-6 py-24" style={{ background: "#fff" }}>
  <div className="max-w-7xl mx-auto">

    {/* TITULO */}
    <div className="text-center mb-16">
      <h2
        className="text-5xl font-black italic"
        style={{ color: "#231e1d" }}
      >
        Prendas destacadas
      </h2>

      <p
        className="mt-4 text-lg"
        style={{ color: "rgba(35,30,29,0.6)" }}
      >
        Selección exclusiva basada en la preferencia de nuestros clientes
      </p>
    </div>

    {/* GRID */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">

      {[1,2,3,4,5].map((item) => (
        <div
          key={item}
          className="group rounded-3xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl"
          style={{
            background: "#fff4e2",
            border: "1px solid #e4c28a",
          }}
        >

          {/* IMAGEN */}
          <div className="relative h-64 overflow-hidden">
            <img
              src={`/conjunto${item}.png`}
              alt={`Producto ${item}`}
              className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
            />
          </div>

          {/* NOMBRE */}
          <div className="p-5 text-center">
            <h3
              className="font-bold text-lg"
              style={{ color: "#231e1d" }}
            >
              Prenda {item}
            </h3>
          </div>

        </div>
      ))}

    </div>
  </div>
</section>
      <Footer />
    </div>
  );
}