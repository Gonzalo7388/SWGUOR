import { ShieldCheck, Gem, Truck, Users } from "lucide-react";

const values = [
  {
    title: "Producción Premium",
    icon: Gem,
    text: "Materiales seleccionados y acabados de alta calidad.",
  },
  {
    title: "Atención Estratégica",
    icon: Users,
    text: "Asesoría personalizada para cada cliente y negocio.",
  },
  {
    title: "Logística Inteligente",
    icon: Truck,
    text: "Procesos eficientes y entregas optimizadas.",
  },
  {
    title: "Confianza Corporativa",
    icon: ShieldCheck,
    text: "Relaciones comerciales sólidas y transparentes.",
  },
];

const ValuesSection = () => {
  return (
    <section className="px-6 pb-32">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-16">
          <p
            className="text-[11px] font-black uppercase tracking-[0.35em] mb-4"
            style={{ color: "#8a6d3b" }}
          >
            Diferenciales
          </p>
          <h2
            className="text-6xl font-black italic"
            style={{ color: "#1a1410" }}
          >
            ¿Por qué elegir GUOR?
          </h2>
          <div className="w-12 h-px mx-auto mt-6" style={{ background: "#c4a35a" }} />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="rounded-[2rem] p-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
                style={{
                  background: "#f5efe4",
                  border: "1.5px solid #e8d5a8",
                  boxShadow: "0 2px 12px -4px rgba(26,20,16,0.06)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-8"
                  style={{ background: "rgba(196,163,90,0.12)", border: "1px solid #e8d5a8" }}
                >
                  <Icon size={22} color="#8a6d3b" />
                </div>

                <h3
                  className="text-xl font-black mb-4"
                  style={{ color: "#1a1410" }}
                >
                  {item.title}
                </h3>

                <div className="w-8 h-px mb-4" style={{ background: "#c4a35a" }} />

                <p
                  className="text-base leading-relaxed"
                  style={{ color: "rgba(26,20,16,0.62)" }}
                >
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;