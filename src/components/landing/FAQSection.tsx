"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

// 1. DATA: Definida fuera para evitar re-renderizados innecesarios
const faqs = [
  {
    question: "¿Qué respaldo tiene Modas y Estilos GUOR en el mercado?",
    answer: "Con 6 años de trayectoria oficial y fundados a inicios de 2020, nos hemos consolidado como proveedores clave de grandes marcas y cadenas comerciales en Gamarra y centros comerciales de prestigio a nivel nacional."
  },
  {
    question: "¿Cómo se formaliza una alianza estratégica y el beneficio del 20%?",
    answer: "Para nuevos socios comerciales, el beneficio se activa al registrarse en GUOR Corp. El sistema SWGUOR valida tu perfil corporativo y aplica automáticamente el descuento en tu primera orden de fabricación mayorista."
  },
  {
    question: "¿Cómo garantiza SWGUOR la excelencia operativa en mis pedidos?",
    answer: "A diferencia de los métodos tradicionales, nuestro ecosistema digital centraliza la gestión logística. Esto elimina errores manuales, garantiza la puntualidad en las entregas y ofrece trazabilidad total desde el diseño hasta el despacho final."
  },
  {
    question: "¿Cuál es el enfoque de calidad de la corporación?",
    answer: "Combinamos la artesanía textil con una gestión logística eficiente. Cada prenda es fabricada bajo altos estándares de calidad exigidos por el mercado corporativo, asegurando innovación constante en cada colección."
  }
];

// 2. VARIANTES: Tipadas correctamente para evitar errores de TypeScript
const menuVariants: Variants = {
  open: { 
    height: "auto", 
    opacity: 1,
    transition: { 
      height: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2, delay: 0.1 }
    } 
  },
  closed: { 
    height: 0, 
    opacity: 0,
    transition: { 
      height: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.1 }
    }
  }
};

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section id="preguntas" className="relative z-10 py-24 bg-white/80 backdrop-blur-md border-y border-stone-100">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* CABECERA OPTIMIZADA */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }} // Añade 'amount' para que dispare antes
            className="inline-flex items-center gap-2 px-4 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full text-[10px] font-black uppercase tracking-widest mb-4"
          >
            <HelpCircle size={14} /> Soporte al Socio
          </motion.div>
          <h2 className="text-4xl font-black text-stone-900 tracking-tighter italic">
            Preguntas Frecuentes
          </h2>
          <p className="text-stone-500 font-medium mt-4">
            Todo lo que necesitas saber sobre el nuevo ecosistema digital de GUOR.
          </p>
        </div>

        {/* LISTA DE ACORDEONES */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeIndex === idx;
            
            return (
              <motion.div
                layout
                key={idx}
                className={`border rounded-[2rem] overflow-hidden bg-white shadow-sm transition-colors duration-500 ${
                  isOpen ? 'border-[#D4AF37] shadow-md' : 'border-stone-100'
                }`}
              >
                <button
                  onClick={() => setActiveIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full p-8 text-left flex justify-between items-center hover:bg-stone-50/50 transition-colors duration-300 group"
                >
                  <span className={`font-bold text-sm transition-colors duration-300 ${
                    isOpen ? 'text-stone-900' : 'text-stone-700'
                  }`}>
                    {faq.question}
                  </span>
                  
                  <motion.div
                    animate={{ 
                      rotate: isOpen ? 180 : 0,
                      backgroundColor: isOpen ? "rgba(212, 175, 55, 0.1)" : "rgba(212, 175, 55, 0)"
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="text-[#D4AF37] p-1 rounded-full"
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      variants={menuVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      className="overflow-hidden"
                    >
                      <div className="px-8 pb-8 text-stone-500 text-sm leading-relaxed border-t border-stone-50 pt-4">
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          {faq.answer}
                        </motion.p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;