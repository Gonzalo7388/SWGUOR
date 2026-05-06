import { Clock3 } from "lucide-react";

const TimelineCard = () => {
  return (
    <section className="px-6 pb-24">
      <div className="max-w-7xl mx-auto">

        <div
          className="rounded-[3rem] p-16 grid lg:grid-cols-2 gap-16 items-center"
          style={{
            background: "#fff4e2",
            border: "2px solid #e4c28a",
          }}
        >

          {/* IZQUIERDA */}
         <div
            className="relative rounded-[2rem] overflow-hidden"
            style={{
            minHeight: "500px",
            border: "1px solid #e4c28a",
            backgroundImage: "url('/fotoAbout2.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
    }}
        >

  {/* OVERLAY */}
  <div
    className="absolute inset-0"
    style={{
      background:
        "linear-gradient(to top, rgba(35,30,29,0.75), rgba(35,30,29,0.15))",
    }}
  />

  {/* CONTENIDO */}
  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10">

    <Clock3 size={70} color="#fff4e2" />

    <h2
      className="text-6xl font-black italic mt-8"
      style={{ color: "#fff4e2" }}
    >
      6 Años
    </h2>

    <p
      className="uppercase tracking-[0.35em] text-sm font-bold mt-4"
      style={{ color: "#e4c28a" }}
    >
      Desde 2020
    </p>

  </div>
</div>

          {/* DERECHA */}
          <div>

            <p
              className="text-[11px] font-black uppercase tracking-[0.35em] mb-5"
              style={{ color: "#b5854b" }}
            >
              Quiénes Somos
            </p>

            <h2
              className="text-6xl font-black italic leading-tight mb-8"
              style={{ color: "#231e1d" }}
            >
              Aliados Estratégicos
              <br />

              <span style={{ color: "#e4c28a" }}>
                de la Moda Mayorista
              </span>
            </h2>

            <p
              className="text-xl leading-relaxed"
              style={{ color: "rgba(35,30,29,0.72)" }}
            >
              Modas y Estilos GUOR S.A.C. nace con el propósito de
              elevar la confección textil mediante procesos eficientes,
              atención estratégica y estándares premium.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TimelineCard;