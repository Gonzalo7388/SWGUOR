const MissionVision = () => {
  return (
    <section className="px-6 pb-24">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">

        {/* MISION */}
        <div
          className="rounded-[2.5rem] p-12"
          style={{
            background: "#f5efe4",
            border: "1.5px solid #e8d5a8",
            boxShadow: "0 2px 20px -4px rgba(26,20,16,0.07)",
          }}
        >
          <p
            className="text-[11px] font-black uppercase tracking-[0.35em] mb-6"
            style={{ color: "#8a6d3b" }}
          >
            Misión
          </p>

          <h2
            className="text-5xl font-black italic mb-6 leading-tight"
            style={{ color: "#1a1410" }}
          >
            Calidad con
            <br />
            propósito.
          </h2>

          <div className="w-10 h-px mb-6" style={{ background: "#c4a35a" }} />

          <p
            className="text-xl leading-relaxed"
            style={{ color: "rgba(26,20,16,0.68)" }}
          >
            Brindar soluciones textiles premium para negocios y marcas
            que buscan calidad, puntualidad y producción eficiente.
          </p>
        </div>

        {/* VISION */}
        <div
          className="rounded-[2.5rem] p-12"
          style={{
            background: "#1a1410",
            border: "1.5px solid #2c2218",
            boxShadow: "0 8px 32px -8px rgba(26,20,16,0.28)",
          }}
        >
          <p
            className="text-[11px] font-black uppercase tracking-[0.35em] mb-6"
            style={{ color: "#c4a35a" }}
          >
            Visión
          </p>

          <h2
            className="text-5xl font-black italic mb-6 leading-tight"
            style={{ color: "#fdf9f3" }}
          >
            Liderar la
            <br />
            moda B2B.
          </h2>

          <div className="w-10 h-px mb-6" style={{ background: "#c4a35a" }} />

          <p
            className="text-xl leading-relaxed"
            style={{ color: "rgba(253,249,243,0.78)" }}
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