"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { ArrowRight, Star, Shield, Truck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Testimonials from "@/components/landing/Testimonials";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ background: "#fdf9f3" }}>
      <Navbar />

      {/* ─── HERO ─── */}
      <main className="flex-1 flex items-center px-6 pt-28 pb-16">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* IZQUIERDA */}
          <div>
            {/* BADGE */}
            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6"
              style={{ background: "#ede8e0", color: "#8a6d3b", border: "1px solid #e8d5a8" }}
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#8a6d3b" }} />
              Corporación Textil Peruana
            </span>

            {/* TITULO */}
            <h1 className="text-5xl lg:text-6xl leading-[1] font-black mb-6" style={{ color: "#1a1410" }}>
              Excelencia Textil
              <br />
              <span className="italic block mt-2" style={{ color: "#c4a35a" }}>
                Modas y Estilos GUOR
              </span>
            </h1>

            {/* DIVISOR */}
            <div className="w-16 h-px mb-6" style={{ background: "#c4a35a" }} />

            {/* TEXTO */}
            <p className="text-base leading-relaxed max-w-lg mb-3" style={{ color: "rgba(26,20,16,0.68)" }}>
              Aliado estratégico en{" "}
              <span className="font-bold" style={{ color: "#1a1410" }}>diseño y confección mayorista</span>.
              Producción premium y logística inteligente para potenciar tu negocio textil.
            </p>

            {/* DESCUENTO */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-8"
              style={{ background: "#f5efe4", border: "1px solid #e8d5a8" }}
            >
              <Star size={13} style={{ color: "#8a6d3b", fill: "#8a6d3b" }} />
              <p className="text-sm font-bold" style={{ color: "#1a1410" }}>
                20% de descuento en tu primera orden corporativa
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <Link
                href="/registro-cliente"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-xl font-black text-sm transition-all duration-300 hover:-translate-y-0.5"
                style={{ background: "#1a1410", color: "#fdf9f3", border: "2px solid #1a1410", boxShadow: "0 4px 20px -4px rgba(26,20,16,0.25)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#c4a35a";
                  e.currentTarget.style.borderColor = "#c4a35a";
                  e.currentTarget.style.color = "#1a1410";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#1a1410";
                  e.currentTarget.style.borderColor = "#1a1410";
                  e.currentTarget.style.color = "#fdf9f3";
                }}
              >
                Iniciar Alianza B2B
                <ArrowRight size={16} />
              </Link>

              <Link
                href="/login-cliente"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-xl font-black text-sm transition-all duration-300"
                style={{ background: "transparent", border: "1.5px solid #e8d5a8", color: "#1a1410" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f5efe4";
                  e.currentTarget.style.borderColor = "#c4a35a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "#e8d5a8";
                }}
              >
                Portal Socios
              </Link>
            </div>

            {/* MINI STATS */}
            <div className="flex gap-8 mt-10 pt-8" style={{ borderTop: "1px solid rgba(196,163,90,0.30)" }}>
              <div>
                <p className="text-2xl font-black" style={{ color: "#1a1410" }}>+6</p>
                <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: "#8a6d3b" }}>Años</p>
              </div>
              <div className="w-px" style={{ background: "rgba(196,163,90,0.30)" }} />
              <div>
                <p className="text-2xl font-black" style={{ color: "#1a1410" }}>B2B</p>
                <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: "#8a6d3b" }}>Enfoque</p>
              </div>
              <div className="w-px" style={{ background: "rgba(196,163,90,0.30)" }} />
              <div>
                <p className="text-2xl font-black" style={{ color: "#1a1410" }}>100%</p>
                <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: "#8a6d3b" }}>Premium</p>
              </div>
            </div>
          </div>

          {/* DERECHA — IMAGEN */}
          <div
            className="relative rounded-[2rem] overflow-hidden shadow-xl min-h-[500px]"
            style={{ border: "1.5px solid #e8d5a8", boxShadow: "0 20px 60px -12px rgba(26,20,16,0.16)" }}
          >
            <Image
              src="/fotohome.jpg"
              alt="Moda con Identidad"
              fill
              className="object-cover object-center"
              priority
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(26,20,16,0.85), rgba(26,20,16,0.20))" }}
            />

            {/* CONTENIDO OVERLAY */}
            <div className="relative z-10 flex flex-col justify-between h-full p-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4" style={{ color: "rgba(253,249,243,0.65)" }}>
                  Excelencia Operativa
                </p>
                <h2 className="text-4xl font-black italic leading-tight" style={{ color: "#fdf9f3" }}>
                  Moda con
                  <br />
                  <span style={{ color: "#c4a35a" }}>identidad</span>
                </h2>
              </div>

              <p className="text-sm leading-relaxed max-w-sm" style={{ color: "rgba(253,249,243,0.78)" }}>
                Producción textil premium con enfoque estratégico y calidad garantizada.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ─── BENEFICIOS ─── */}
      <section
        className="px-6 py-12"
        style={{ background: "#1a1410", borderTop: "1px solid rgba(196,163,90,0.15)" }}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: Shield, title: "Calidad Garantizada", desc: "Materiales premium con control de calidad en cada etapa." },
            { icon: Truck, title: "Logística Eficiente", desc: "Entrega puntual y seguimiento en tiempo real de tus pedidos." },
            { icon: Star, title: "Soporte Estratégico", desc: "Asesoría personalizada para potenciar tu negocio textil." },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-4 p-6 rounded-2xl"
              style={{ background: "rgba(253,249,243,0.04)", border: "1px solid rgba(196,163,90,0.18)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(196,163,90,0.12)" }}
              >
                <Icon size={18} style={{ color: "#c4a35a" }} />
              </div>
              <div>
                <h3 className="font-black text-sm mb-1" style={{ color: "#fdf9f3" }}>{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(253,249,243,0.50)" }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PRENDAS DESTACADAS ─── */}
      <section className="px-6 py-16" style={{ background: "#fdf9f3" }}>
        <div className="max-w-6xl mx-auto">

          {/* TITULO */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: "#8a6d3b" }}>
                Colección
              </p>
              <h2 className="text-4xl font-black italic" style={{ color: "#1a1410" }}>
                Prendas destacadas
              </h2>
              <div className="w-10 h-px mt-3" style={{ background: "#c4a35a" }} />
            </div>
            <p className="text-sm hidden md:block" style={{ color: "rgba(26,20,16,0.45)" }}>
              Selección exclusiva de nuestros clientes
            </p>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="group rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  background: "#f5efe4",
                  border: "1px solid #e8d5a8",
                  boxShadow: "0 1px 4px -1px rgba(26,20,16,0.06)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 24px -6px rgba(26,20,16,0.14)";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "#c4a35a";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px -1px rgba(26,20,16,0.06)";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "#e8d5a8";
                }}
              >
                {/* IMAGEN */}
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={`/conjunto${item}.png`}
                    alt={`Producto ${item}`}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>

                {/* NOMBRE */}
                <div className="px-4 py-3 text-center">
                  <h3 className="font-bold text-sm" style={{ color: "#1a1410" }}>Prenda {item}</h3>
                  <p className="text-[10px] font-semibold mt-0.5 uppercase tracking-wider" style={{ color: "#8a6d3b" }}>
                    Colección 2026
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* VER MÁS */}
          <div className="text-center mt-10">
            <Link
              href="/colecciones"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300"
              style={{ border: "1.5px solid #1a1410", color: "#1a1410", background: "transparent" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#1a1410";
                e.currentTarget.style.color = "#fdf9f3";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#1a1410";
              }}
            >
              Ver colección completa <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIOS ─── */}
      <Testimonials />

      <Footer />
    </div>
  );
}