const BenefitsHero = () => {
  return (
    <section className="px-6 pt-28 pb-12">
      <div className="max-w-6xl mx-auto text-center">

        {/* BADGE */}
        <span
          className="inline-block px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.35em] mb-6"
          style={{ background: "#f5efe4", color: "#8a6d3b", border: "1px solid #e8d5a8" }}
        >
          Beneficios
        </span>

        {/* TITULO */}
        <h1
          className="text-5xl md:text-6xl leading-[1] font-black italic mb-6"
          style={{ color: "#1a1410" }}
        >
          Ventajas diseñadas
          <br />
          <span style={{ color: "#e8d5a8" }}>para impulsar tu negocio.</span>
        </h1>

        {/* DIVISOR */}
        <div
          className="w-16 h-0.5 mx-auto mb-6"
          style={{ background: "#e8d5a8" }}
        />

        {/* DESCRIPCION */}
        <p
          className="max-w-2xl mx-auto text-base leading-relaxed"
          style={{ color: "rgba(26,20,16,0.62)" }}
        >
          En GUOR ofrecemos soluciones premium enfocadas en calidad,
          producción eficiente y alianzas estratégicas para marcas modernas.
        </p>

      </div>
    </section>
  );
};

export default BenefitsHero;