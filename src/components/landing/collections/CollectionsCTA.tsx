import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CollectionsCTA = () => {
  return (
    <section className="px-6 pt-10 pb-44">
      <div className="max-w-7xl mx-auto">

        <div
          className="rounded-[3rem] p-16 md:p-24 text-center"
          style={{
            background: "#fbddd3",
            border: "1px solid #e4c28a",
          }}
        >

          <p
            className="text-[11px] uppercase tracking-[0.35em] font-black mb-6"
            style={{ color: "#b5854b" }}
          >
            Nueva Colección
          </p>

          <h2
            className="text-5xl md:text-7xl leading-tight font-black italic mb-10"
            style={{ color: "#231e1d" }}
          >
            Inicia tu próxima
            <br />

            colección con GUOR.
          </h2>

          <p
            className="max-w-3xl mx-auto text-lg md:text-2xl leading-relaxed mb-12"
            style={{ color: "rgba(35,30,29,0.72)" }}
          >
            Creamos prendas premium enfocadas en moda moderna,
            calidad estratégica y producción eficiente.
          </p>

          <Link
            href="/registro-cliente"
            className="inline-flex items-center gap-3 px-9 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.15em] transition-all duration-300 hover:-translate-y-1"
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
            Explorar Alianza

            <ArrowRight size={18} />
          </Link>

        </div>
      </div>
    </section>
  );
};

export default CollectionsCTA;