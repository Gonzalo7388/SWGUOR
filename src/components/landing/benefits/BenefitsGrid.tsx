import { Gem, BadgePercent, Users, Truck } from "lucide-react";

const benefits = [
  {
    title: "Producción Premium",
    icon: Gem,
    items: ["Producción eficiente", "Materiales seleccionados", "Control de calidad"],
  },
  {
    title: "Descuentos Exclusivos",
    icon: BadgePercent,
    items: ["20% en primera orden", "Beneficios recurrentes", "Precios corporativos"],
  },
  {
    title: "Atención Estratégica",
    icon: Users,
    items: ["Asesoría personalizada", "Soporte constante", "Enfoque B2B profesional"],
  },
  {
    title: "Logística Inteligente",
    icon: Truck,
    items: ["Procesos organizados", "Entregas eficientes", "Seguimiento operativo"],
  },
];

const BenefitsGrid = () => {
  return (
    <section className="px-6 pb-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-5">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="rounded-[1.75rem] p-8 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "#f5efe4",
                  border: "1.5px solid #e8d5a8",
                  boxShadow: "0 2px 12px -4px rgba(26,20,16,0.06)",
                }}
              >
                {/* ICONO + TITULO */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(196,163,90,0.12)", border: "1px solid #e8d5a8" }}
                  >
                    <Icon size={20} color="#8a6d3b" />
                  </div>
                  <h2 className="text-xl font-black" style={{ color: "#1a1410" }}>
                    {benefit.title}
                  </h2>
                </div>

                {/* DIVISOR */}
                <div className="w-full h-px mb-6" style={{ background: "#e8d5a8" }} />

                {/* ITEMS */}
                <div className="space-y-3">
                  {benefit.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: "#c4a35a" }}
                      />
                      <p className="text-sm" style={{ color: "rgba(26,20,16,0.66)" }}>
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