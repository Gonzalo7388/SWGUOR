import Link from "next/link";
import { ArrowRight } from "lucide-react";

const BenefitsCTA = () => {
  return (
    <section className="px-6 pt-16 pb-52">
      <div className="max-w-7xl mx-auto">

        <div
          className="rounded-[3rem] p-16 text-center mb-10"
          style={{
            background: "#fbddd3",
            border: "1px solid #e4c28a",
          }}
        >

          <p
            className="text-[11px] uppercase tracking-[0.35em] font-black mb-6"
            style={{ color: "#b5854b" }}
          >
            Alianza Estratégica
          </p>

          <h2
            className="text-6xl leading-tight font-black italic mb-8"
            style={{ color: "#231e1d" }}
          >
            Más que proveedores,
            <br />
            somos aliados estratégicos.
          </h2>

          <p
            className="max-w-3xl mx-auto text-xl leading-relaxed mb-12"
            style={{ color: "rgba(35,30,29,0.72)" }}
          >
            Accede a beneficios exclusivos, producción premium
            y atención especializada para potenciar tu marca.
          </p>

          <Link
            href="/registro-cliente"
            className="inline-flex items-center gap-3 px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.15em] transition-all duration-300 hover:-translate-y-1"
            style={{
              background: "#231e1d",
              color: "#fff4e2",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#b5854b";
              e.currentTarget.style.color = "#231e1d";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#231e1d";
              e.currentTarget.style.color = "#fff4e2";
            }}
          >
            Iniciar Alianza B2B

            <ArrowRight size={18} />
          </Link>

        </div>
      </div>
    </section>
  );
};

export default BenefitsCTA;