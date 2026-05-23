const CollectionsBanner = () => {
  return (
    <section className="px-6 py-32">
      <div className="max-w-7xl mx-auto">

        <div
          className="relative rounded-[3rem] overflow-hidden flex items-center"
          style={{
            minHeight: "760px",
            border: "2px solid #e8d5a8",
            backgroundImage: "url('/fotoColeccion2.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >

          {/* OVERLAY */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(26,20,16,0.80), rgba(26,20,16,0.18), transparent)",
            }}
          />

          {/* CONTENIDO */}
          <div className="relative z-10 w-full px-10 md:px-20">

            <div className="max-w-3xl">

              <p
                className="text-[11px] uppercase tracking-[0.4em] font-black mb-8"
                style={{ color: "#e8d5a8" }}
              >
                Editorial Fashion
              </p>

              <h2
                className="text-5xl md:text-7xl leading-[0.95] font-black italic mb-10"
                style={{
                  color: "#fdf9f3",
                  textShadow: "0 4px 25px rgba(0,0,0,0.45)",
                }}
              >
                Moda diseñada
                <br />

                para marcas
                <br />

                modernas.
              </h2>

              <p
                className="text-xl md:text-2xl leading-relaxed max-w-2xl"
                style={{
                  color: "rgba(253,249,243,0.92)",
                  textShadow: "0 2px 10px rgba(0,0,0,0.35)",
                }}
              >
                Producción textil premium con visión estratégica,
                identidad visual y excelencia operativa.
              </p>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default CollectionsBanner;