const MissionVision = () => {
  return (
    <section className="px-6 pb-24">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10">

        {/* MISION */}
        <div
          className="rounded-[2.5rem] p-12"
          style={{
            background: "#fff4e2",
            border: "2px solid #e4c28a",
          }}
        >
          <p
            className="text-[11px] font-black uppercase tracking-[0.35em] mb-6"
            style={{ color: "#b5854b" }}
          >
            Misión
          </p>

          <h2
            className="text-5xl font-black italic mb-6"
            style={{ color: "#231e1d" }}
          >
            Calidad con
            <br />

            propósito.
          </h2>

          <p
            className="text-xl leading-relaxed"
            style={{ color: "rgba(35,30,29,0.72)" }}
          >
            Brindar soluciones textiles premium para negocios y marcas
            que buscan calidad, puntualidad y producción eficiente.
          </p>
        </div>

        {/* VISION */}
        <div
          className="rounded-[2.5rem] p-12"
          style={{
            background: "#231e1d",
            border: "2px solid #231e1d",
          }}
        >
          <p
            className="text-[11px] font-black uppercase tracking-[0.35em] mb-6"
            style={{ color: "#e4c28a" }}
          >
            Visión
          </p>

          <h2
            className="text-5xl font-black italic mb-6"
            style={{ color: "#fff4e2" }}
          >
            Liderar la
            <br />

            moda B2B.
          </h2>

          <p
            className="text-xl leading-relaxed"
            style={{ color: "rgba(255,244,226,0.82)" }}
          >
            Consolidarnos como referente nacional en confección
            mayorista, innovación operativa y excelencia textil.
          </p>
        </div>

      </div>
    </section>
  );
};

export default MissionVision;