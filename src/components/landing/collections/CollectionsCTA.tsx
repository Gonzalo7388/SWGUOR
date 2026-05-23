import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CollectionsCTA = () => {
  return (
    <section className="px-6 pt-10 pb-44">
      <div className="max-w-7xl mx-auto">

        <div
          className="rounded-[3rem] p-16 md:p-24 text-center"
          style={{
            background: "#f5efe4",
            border: "1.5px solid #e8d5a8",
            boxShadow: "0 4px 24px -6px rgba(26,20,16,0.08)",
          }}
        >

          <p
            className="text-[11px] uppercase tracking-[0.35em] font-black mb-6"
            style={{ color: "#8a6d3b" }}
          >
            Nueva Colección
          </p>

          <h2
            className="text-5xl md:text-7xl leading-tight font-black italic mb-6"
            style={{ color: "#1a1410" }}
          >
            Inicia tu próxima
            <br />
            colección con GUOR.
          </h2>

          <div className="w-12 h-px mx-auto mb-8" style={{ background: "#c4a35a" }} />

          <p
            className="max-w-3xl mx-auto text-lg md:text-2xl leading-relaxed mb-12"
            style={{ color: "rgba(26,20,16,0.62)" }}
          >
            Creamos prendas premium enfocadas en moda moderna,
            calidad estratégica y producción eficiente.
          </p>

          <Link
            href="/registro-cliente"
            className="inline-flex items-center gap-3 px-9 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.15em] transition-all duration-300 hover:-translate-y-1"
            style={{ background: "#1a1410", color: "#fdf9f3" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#c4a35a";
              e.currentTarget.style.color = "#1a1410";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#1a1410";
              e.currentTarget.style.color = "#fdf9f3";
            }}
          >
            Explorar Alianza
            <ArrowRight size={18} />
          </Link>

        </div>
      </div>
    </section>
  );
};

export default CollectionsCTA;