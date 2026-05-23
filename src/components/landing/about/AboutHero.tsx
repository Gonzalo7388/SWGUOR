const AboutHero = () => {
  return (
    <section className="px-6 pb-24">
      <div className="max-w-7xl mx-auto">

        <span
          className="inline-block px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.35em] mb-8"
          style={{
            background: "#ede8e0",
            color: "#8a6d3b",
            border: "1px solid #e8d5a8",
          }}
        >
          Nosotros
        </span>

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* TEXTO */}
          <div>
            <h1
              className="text-7xl leading-[0.95] font-black italic mb-6"
              style={{ color: "#1a1410" }}
            >
              Más que confección,
              <br />
              <span style={{ color: "#c4a35a" }}>
                creamos experiencia.
              </span>
            </h1>

            <div className="w-12 h-px mb-8" style={{ background: "#c4a35a" }} />

            <p
              className="text-2xl leading-relaxed"
              style={{ color: "rgba(26,20,16,0.68)" }}
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
              border: "1.5px solid #e8d5a8",
              minHeight: "600px",
              backgroundImage: "url('/fotoAbout1.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              boxShadow: "0 20px 60px -12px rgba(26,20,16,0.16)",
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default AboutHero;