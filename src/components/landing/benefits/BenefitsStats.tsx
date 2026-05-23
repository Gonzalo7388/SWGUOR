const stats = [
  { number: "+6", label: "Años de experiencia" },
  { number: "100%", label: "Compromiso premium" },
  { number: "B2B", label: "Enfoque estratégico" },
  { number: "24/7", label: "Atención corporativa" },
];

const BenefitsStats = () => {
  return (
    <section className="px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div
          className="rounded-[2rem] p-10 md:p-12"
          style={{
            background: "#1a1410",
            border: "1.5px solid #2c2218",
            boxShadow: "0 8px 40px -8px rgba(26,20,16,0.30)",
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <h2
                  className="text-4xl md:text-5xl font-black italic"
                  style={{ color: "#fdf9f3" }}
                >
                  {stat.number}
                </h2>

                <div
                  className="w-8 h-px mx-auto my-3"
                  style={{ background: "#c4a35a" }}
                />

                <p
                  className="uppercase tracking-[0.2em] text-[10px] font-bold"
                  style={{ color: "#c4a35a" }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsStats;