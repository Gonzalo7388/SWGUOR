"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const QuestionsCTA = () => {
  return (
    <section className="px-6 pt-24 pb-44">
      <div className="max-w-7xl mx-auto">

        <div
          className="rounded-[3rem] p-16 md:p-24 text-center"
          style={{
            background: "#1a1410",
            border: "1px solid rgba(196,163,90,0.25)",
            boxShadow: "0 12px 48px -12px rgba(26,20,16,0.30)",
          }}
        >

          <p
            className="text-[11px] uppercase tracking-[0.35em] font-black mb-6"
            style={{ color: "#c4a35a" }}
          >
            Atención Personalizada
          </p>

          <h2
            className="text-5xl md:text-7xl leading-tight font-black italic mb-8"
            style={{ color: "#fdf9f3" }}
          >
            ¿Necesitas ayuda
            <br />
            estratégica?
          </h2>

          <div className="w-12 h-px mx-auto mb-8" style={{ background: "rgba(196,163,90,0.40)" }} />

          <p
            className="max-w-3xl mx-auto text-lg md:text-2xl leading-relaxed mb-12"
            style={{ color: "rgba(253,249,243,0.68)" }}
          >
            Nuestro equipo está listo para ayudarte
            con tu próxima producción premium.
          </p>

          <Link
            href="https://wa.me/51908801912"
            target="_blank"
            className="inline-flex items-center gap-3 px-9 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.15em] transition-all duration-300 hover:-translate-y-1"
            style={{ background: "#c4a35a", color: "#1a1410" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#d4b472";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#c4a35a";
            }}
          >
            Hablar con asesor
            <ArrowRight size={18} />
          </Link>

        </div>
      </div>
    </section>
  );
};

export default QuestionsCTA;