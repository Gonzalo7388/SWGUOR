import {
  Gem,
  BadgePercent,
  Users,
  Truck,
} from "lucide-react";

const benefits = [
  {
    title: "Producción Premium",
    icon: Gem,
    items: [
      "Acabados de alta calidad",
      "Materiales seleccionados",
      "Control textil eficiente",
    ],
  },
  {
    title: "Descuentos Exclusivos",
    icon: BadgePercent,
    items: [
      "20% en primera orden",
      "Beneficios recurrentes",
      "Precios corporativos",
    ],
  },
  {
    title: "Atención Estratégica",
    icon: Users,
    items: [
      "Asesoría personalizada",
      "Soporte constante",
      "Enfoque B2B profesional",
    ],
  },
  {
    title: "Logística Inteligente",
    icon: Truck,
    items: [
      "Procesos organizados",
      "Entregas eficientes",
      "Seguimiento operativo",
    ],
  },
];

const BenefitsGrid = () => {
  return (
    <section className="px-6 pb-28">
      <div className="max-w-7xl mx-auto">

        <div className="grid md:grid-cols-2 gap-8">

          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <div
                key={index}
                className="rounded-[2.5rem] p-12 transition-all duration-300 hover:-translate-y-2"
                style={{
                  background: "#fbddd3",
                  border: "1px solid #e4c28a",
                }}
              >

                <Icon size={48} color="#b5854b" />

                <h2
                  className="text-4xl font-black mt-8 mb-8"
                  style={{ color: "#231e1d" }}
                >
                  {benefit.title}
                </h2>

                <div className="space-y-5">

                  {benefit.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ background: "#b5854b" }}
                      />

                      <p
                        className="text-xl"
                        style={{
                          color: "rgba(35,30,29,0.75)",
                        }}
                      >
                        {item}
                      </p>
                    </div>
                  ))}

                </div>
              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
};

export default BenefitsGrid;