import Link from "next/link";
import { ArrowRight } from "lucide-react";

const BenefitsCTA = () => {
  return (
    <section className="px-6 pt-12 pb-24">
      <div className="max-w-6xl mx-auto">
        <div
          className="rounded-[2rem] p-10 md:p-14 text-center"
          style={{
            background: "#f5efe4",
            border: "1.5px solid #e8d5a8",
            boxShadow: "0 4px 24px -6px rgba(26,20,16,0.08)",
          }}
        >
          <p
            className="text-[10px] uppercase tracking-[0.35em] font-black mb-4"
            style={{ color: "#8a6d3b" }}
          >
            Alianza Estratégica
          </p>

          <h2
            className="text-4xl md:text-5xl leading-tight font-black italic mb-4"
            style={{ color: "#1a1410" }}
          >
            Más que proveedores,
            <br />
            somos aliados estratégicos.
          </h2>

          <div className="w-10 h-px mx-auto mb-6" style={{ background: "#c4a35a" }} />

          <p
            className="max-w-xl mx-auto text-base leading-relaxed mb-8"
            style={{ color: "rgba(26,20,16,0.62)" }}
          >
            Accede a beneficios exclusivos, producción premium
            y atención especializada para potenciar tu marca.
          </p>

          <Link
            href="/registro-cliente"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl font-black text-xs uppercase tracking-[0.15em] transition-all duration-300 hover:-translate-y-0.5"
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
            Iniciar Alianza B2B
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BenefitsCTA;