import {
  ShieldCheck,
  Gem,
  Truck,
  Users,
} from "lucide-react";

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
            className="text-[11px] font-black uppercase tracking-[0.35em] mb-6"
            style={{ color: "#b5854b" }}
          >
            Diferenciales
          </p>

          <h2
            className="text-6xl font-black italic"
            style={{ color: "#231e1d" }}
          >
            ¿Por qué elegir GUOR?
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {values.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="rounded-[2rem] p-10 transition-all duration-300 hover:-translate-y-2"
                style={{
                  background: "#fbddd3",
                  border: "1px solid #e4c28a",
                }}
              >
                <Icon size={42} color="#b5854b" />

                <h3
                  className="text-2xl font-black mt-8 mb-5"
                  style={{ color: "#231e1d" }}
                >
                  {item.title}
                </h3>

                <p
                  className="text-lg leading-relaxed"
                  style={{ color: "rgba(35,30,29,0.72)" }}
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