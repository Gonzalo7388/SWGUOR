const BenefitsHero = () => {
  return (
    <section className="px-6 pb-24">
      <div className="max-w-7xl mx-auto text-center">

        <span
          className="inline-block px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.35em] mb-8"
          style={{
            background: "#fbddd3",
            color: "#b5854b",
            border: "1px solid #e4c28a",
          }}
        >
          Beneficios
        </span>

        <h1
          className="text-7xl leading-[0.95] font-black italic mb-10"
          style={{ color: "#231e1d" }}
        >
          Ventajas diseñadas
          <br />

          <span style={{ color: "#e4c28a" }}>
            para impulsar tu negocio.
          </span>
        </h1>

        <p
          className="max-w-3xl mx-auto text-2xl leading-relaxed"
          style={{ color: "rgba(35,30,29,0.72)" }}
        >
          En GUOR ofrecemos soluciones premium enfocadas en
          calidad, producción eficiente y alianzas estratégicas
          para marcas modernas.
        </p>

      </div>
    </section>
  );
};

export default BenefitsHero;