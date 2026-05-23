const CollectionsHero = () => {
  return (
    <section className="px-6 pb-28">
      <div className="max-w-7xl mx-auto">

        <div className="grid lg:grid-cols-2 gap-20 items-center">

          {/* TEXTO */}
          <div>

            <span
              className="inline-block px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.35em] mb-8"
              style={{
                background: "#f5efe4",
                color: "#8a6d3b",
                border: "1px solid #e8d5a8",
              }}
            >
              Colecciones
            </span>

            <h1
              className="text-7xl leading-[0.95] font-black italic mb-10"
              style={{ color: "#1a1410" }}
            >
              Diseños que elevan
              <br />

              <span style={{ color: "#e8d5a8" }}>
                tu marca.
              </span>
            </h1>

            <p
              className="text-2xl leading-relaxed max-w-2xl"
              style={{ color: "rgba(26,20,16,0.68)" }}
            >
              Colecciones premium diseñadas para negocios modernos,
              marcas estratégicas y moda con identidad propia.
            </p>

          </div>

          {/* IMAGEN */}
          <div
            className="rounded-[3rem] overflow-hidden"
            style={{
              minHeight: "650px",
              border: "2px solid #e8d5a8",
              backgroundImage: "url('/fotoColeccion.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

        </div>
      </div>
    </section>
  );
};

export default CollectionsHero;