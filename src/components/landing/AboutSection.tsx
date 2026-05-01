"use client";

import { motion } from "framer-motion";
import { Cpu, Users, Zap, History } from "lucide-react";
import { useEffect, useState } from "react";

const AboutSection = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = [
    { label: "Procesos Optimizados", value: "100%", icon: <Zap style={{ color: "#b5854b" }} size={20} /> },
    { label: "Enfoque Estratégico", value: "B2B", icon: <Users style={{ color: "#b5854b" }} size={20} /> },
    { label: "Soporte", value: "IA", icon: <Cpu style={{ color: "#b5854b" }} size={20} /> },
  ];

  if (!mounted) return null;

  return (
    <section id="nosotros" className="py-24" style={{ background: "#fff4e2" }}>
      <div className="max-w-7xl mx-auto px-6">

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">

          {/* TARJETA IZQUIERDA */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div
              className="aspect-square rounded-[3rem] shadow-xl flex flex-col items-center justify-center p-12 text-center"
              style={{ background: "#fff4e2", border: "2px solid #e4c28a" }}
            >
              <History size={70} style={{ color: "rgba(181,133,75,0.35)", marginBottom: "1.5rem" }} />

              <h3 className="text-2xl font-black uppercase italic" style={{ color: "#231e1d" }}>
                6 Años de Resiliencia
              </h3>

              <div className="w-12 mx-auto my-4" style={{ height: "2px", background: "#e4c28a" }} />

              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#b5854b" }}>
                Desde 2020
              </p>
            </div>
          </motion.div>

          {/* TEXTO DERECHO */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-4" style={{ color: "#b5854b" }}>
              ¿Quiénes Somos?
            </h2>

            <h3 className="text-4xl font-black italic mb-6 leading-tight" style={{ color: "#231e1d" }}>
              Aliados Estratégicos de la <br />
              <span className="not-italic" style={{ color: "#e4c28a" }}>
                Moda Mayorista en Perú
              </span>
            </h3>

            <div className="space-y-6 text-sm font-medium leading-relaxed" style={{ color: "rgba(35,30,29,0.75)" }}>
              <p>
                <span className="font-bold" style={{ color: "#231e1d" }}>
                  Modas y Estilos GUOR S.A.C.
                </span>{" "}
                es una corporación textil especializada en el diseño y comercialización mayorista femenina.
              </p>
              <p>
                Nacimos en 2020, enfrentando desafíos globales. Hoy escalamos nuestras operaciones con{" "}
                <span className="font-bold italic" style={{ color: "#231e1d" }}>SWGUOR</span>
                , garantizando calidad y eficiencia.
              </p>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-4 mt-10">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl transition-all duration-300"
                  style={{ background: "#fff4e2", border: "1px solid #e4c28a" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "#b5854b"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "#e4c28a"}
                >
                  <div className="mb-2">{stat.icon}</div>
                  <div className="text-xl font-black" style={{ color: "#231e1d" }}>{stat.value}</div>
                  <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(35,30,29,0.5)" }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* MISION Y VISION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* MISION */}
          <motion.div
            whileHover={{ y: -6 }}
            className="p-10 rounded-3xl"
            style={{ background: "#fff4e2", border: "2px solid #e4c28a" }}
          >
            <h4 className="font-black text-xs uppercase tracking-[0.3em] mb-4" style={{ color: "#b5854b" }}>
              Misión
            </h4>
            <p className="text-sm" style={{ color: "rgba(35,30,29,0.8)" }}>
              Brindar soluciones integrales en el sector textil mediante prendas de alta calidad, con innovación y puntualidad.
            </p>
          </motion.div>

          {/* VISION */}
          <motion.div
            whileHover={{ y: -6 }}
            className="p-10 rounded-3xl shadow-xl"
            style={{ background: "#231e1d" }}
          >
            <h4 className="font-black text-xs uppercase tracking-[0.3em] mb-4" style={{ color: "#e4c28a" }}>
              Visión
            </h4>
            <p className="text-sm" style={{ color: "rgba(255,244,226,0.8)" }}>
              Ser la empresa líder del sector textil nacional, destacando por excelencia operativa e innovación constante.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;