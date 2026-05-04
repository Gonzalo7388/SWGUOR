const AboutHero = () => {
  return (
    <section className="px-6 pb-24">
      <div className="max-w-7xl mx-auto">

        <span
          className="inline-block px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.35em] mb-8"
          style={{
            background: "#fbddd3",
            color: "#b5854b",
            border: "1px solid #e4c28a",
          }}
        >
          Nosotros
        </span>

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* TEXTO */}
          <div>

            <h1
              className="text-7xl leading-[0.95] font-black italic mb-8"
              style={{ color: "#231e1d" }}
            >
              Más que confección,
              <br />

              <span style={{ color: "#e4c28a" }}>
                creamos experiencia.
              </span>
            </h1>

            <p
              className="text-2xl leading-relaxed"
              style={{ color: "rgba(35,30,29,0.72)" }}
            >
              En GUOR transformamos ideas en prendas con identidad,
              fusionando excelencia textil, producción premium y
              visión estratégica para negocios modernos.
            </p>
          </div>

          {/* IMAGEN */}
          <div
            className="rounded-[3rem] overflow-hidden shadow-2xl"
            style={{
              border: "2px solid #e4c28a",
              minHeight: "600px",
              backgroundImage: "url('/fotoAbout1.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default AboutHero;