"use client";

import { motion } from "framer-motion";
import { Cpu, Users, Zap, Target, Eye, History } from "lucide-react";
import { useEffect, useState } from "react";

const AboutSection = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Stats técnicos (Los mantenemos porque validan tu ingeniería)
  const stats = [
    { label: "Procesos Optimizados", value: "100%", icon: <Zap className="text-[#D4AF37]" size={20} /> },
    { label: "Enfoque Estratégico", value: "B2B", icon: <Users className="text-[#D4AF37]" size={20} /> },
    { label: "Soporte", value: "IA", icon: <Cpu className="text-[#D4AF37]" size={20} /> },
  ];

  if (!mounted) return null;

  return (
    <section id="nosotros" className="py-24 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* PARTE 1: QUIÉNES SOMOS E HISTORIA (Fusión de tu código con la info nueva) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square bg-stone-100 rounded-[4rem] overflow-hidden border-8 border-[#FFFDFB] shadow-2xl relative z-10 flex flex-col items-center justify-center p-12 text-center">
              <History className="text-[#D4AF37] mb-4 opacity-20" size={80} />
              <h3 className="text-2xl font-black text-stone-900 uppercase tracking-tighter italic">6 Años de Resiliencia</h3>
              <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-2">Desde 2020</p>
            </div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-[#D4AF37]/5 blur-3xl rounded-full" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37] mb-4">¿Quiénes Somos?</h2>
            <h3 className="text-4xl font-black text-stone-900 tracking-tighter italic mb-6 leading-tight">
              Aliados Estratégicos de la <br />
              <span className="not-italic text-[#D4AF37]">Moda Mayorista en Perú</span>
            </h3>
            
            <div className="space-y-6 text-stone-600 font-medium leading-relaxed text-sm">
              <p>
                <span className="text-stone-900 font-bold">Modas y Estilos GUOR S.A.C.</span> es una corporación textil especializada en el diseño y comercialización mayorista femenina. Somos el aliado de grandes marcas en Gamarra y centros comerciales de prestigio.
              </p>
              <p>
                Nacimos en 2020, enfrentando desafíos globales con una capacidad de adaptación excepcional. Hoy, tras 6 años de crecimiento, escalamos nuestras operaciones con <span className="text-stone-900 font-bold italic">SWGUOR</span>, garantizando calidad corporativa y gestión logística eficiente.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-10">
              {stats.map((stat, idx) => (
                <div key={idx} className="p-4 bg-stone-50 rounded-2xl border border-stone-100 group hover:border-[#D4AF37]/30 transition-colors">
                  <div className="mb-2">{stat.icon}</div>
                  <div className="text-xl font-black text-stone-900 leading-none mb-1">{stat.value}</div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-stone-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* PARTE 2: MISIÓN Y VISIÓN (Los nuevos pilares) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            whileHover={{ y: -10 }}
            className="p-12 bg-stone-50 rounded-[3rem] border border-stone-100 relative overflow-hidden group"
          >
            <Target className="absolute -right-8 -bottom-8 text-stone-200 opacity-20 group-hover:text-[#D4AF37] transition-colors" size={200} />
            <h4 className="text-[#D4AF37] font-black text-xs uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              Misión
            </h4>
            <p className="text-stone-600 font-medium leading-relaxed relative z-10">
              Brindar soluciones integrales en el sector textil mediante la fabricación de prendas femeninas de alta calidad que superen las expectativas de nuestros clientes, comprometidos con la puntualidad y la innovación constante.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -10 }}
            className="p-12 bg-stone-900 text-white rounded-[3rem] shadow-2xl relative overflow-hidden group"
          >
            <Eye className="absolute -right-8 -bottom-8 text-white/5 opacity-10 group-hover:text-[#D4AF37] transition-colors" size={200} />
            <h4 className="text-[#D4AF37] font-black text-xs uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              Visión
            </h4>
            <p className="text-stone-300 font-medium leading-relaxed relative z-10">
              Consolidarnos como la empresa referente y líder del sector textil nacional, reconocida por nuestra excelencia operativa y nuestra capacidad de anticiparnos a las tendencias del mercado global.
            </p>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default AboutSection;