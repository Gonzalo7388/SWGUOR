const stats = [
  {
    number: "+6",
    label: "Años de experiencia",
  },
  {
    number: "100%",
    label: "Compromiso premium",
  },
  {
    number: "B2B",
    label: "Enfoque estratégico",
  },
  {
    number: "24/7",
    label: "Atención corporativa",
  },
];

const BenefitsStats = () => {
  return (
    <section className="px-6 py-24">
      <div className="max-w-7xl mx-auto">

        <div
          className="rounded-[3rem] p-16"
          style={{
            background: "#231e1d",
            border: "1px solid #231e1d",
          }}
        >

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">

            {stats.map((stat, index) => (
              <div key={index} className="text-center">

                <h2
                  className="text-6xl font-black italic"
                  style={{ color: "#fff4e2" }}
                >
                  {stat.number}
                </h2>

                <p
                  className="uppercase tracking-[0.3em] text-sm font-bold mt-5"
                  style={{ color: "#e4c28a" }}
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