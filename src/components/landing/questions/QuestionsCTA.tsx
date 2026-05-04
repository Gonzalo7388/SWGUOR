import Link from "next/link";
import { ArrowRight } from "lucide-react";

const QuestionsCTA = () => {
  return (
    <section className="px-6 pt-24 pb-44">
      <div className="max-w-7xl mx-auto">

        <div
          className="rounded-[3rem] p-16 md:p-24 text-center"
          style={{
            background: "#231e1d",
            border: "1px solid #b5854b",
          }}
        >

          <p
            className="text-[11px] uppercase tracking-[0.35em] font-black mb-6"
            style={{ color: "#e4c28a" }}
          >
            Atención Personalizada
          </p>

          <h2
            className="text-5xl md:text-7xl leading-tight font-black italic mb-10"
            style={{ color: "#fff4e2" }}
          >
            ¿Necesitas ayuda
            <br />

            estratégica?
          </h2>

          <p
            className="max-w-3xl mx-auto text-lg md:text-2xl leading-relaxed mb-12"
            style={{ color: "rgba(255,244,226,0.75)" }}
          >
            Nuestro equipo está listo para ayudarte
            con tu próxima producción premium.
          </p>

          <Link
            href="https://wa.me/51908801912"
            target="_blank"
            className="inline-flex items-center gap-3 px-9 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.15em] transition-all duration-300 hover:-translate-y-1"
            style={{
              background: "#fff4e2",
              color: "#231e1d",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#b5854b";
              e.currentTarget.style.color = "#231e1d";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff4e2";
              e.currentTarget.style.color = "#231e1d";
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