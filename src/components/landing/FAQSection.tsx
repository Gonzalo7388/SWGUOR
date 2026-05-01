"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

const faqs = [
  {
    question: "¿Qué respaldo tiene Modas y Estilos GUOR en el mercado?",
    answer:
      "Con 6 años de trayectoria oficial, nos hemos consolidado como proveedores clave de grandes marcas y cadenas comerciales en Gamarra y centros comerciales a nivel nacional.",
  },
  {
    question: "¿Cómo se formaliza una alianza estratégica y el beneficio del 20%?",
    answer:
      "Para nuevos socios comerciales, el beneficio se activa al registrarse. El sistema aplica automáticamente el descuento en tu primera orden.",
  },
  {
    question: "¿Cómo garantiza SWGUOR la excelencia operativa?",
    answer:
      "Nuestro ecosistema digital centraliza la gestión logística, elimina errores manuales y garantiza trazabilidad total.",
  },
  {
    question: "¿Cuál es el enfoque de calidad?",
    answer:
      "Combinamos artesanía textil con gestión eficiente, asegurando calidad e innovación constante.",
  },
];

const menuVariants: Variants = {
  open: { height: "auto", opacity: 1 },
  closed: { height: 0, opacity: 0 },
};

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section id="preguntas" className="py-24" style={{ background: "#fff4e2" }}>
      <div className="max-w-3xl mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4"
            style={{ background: "#fbddd3", color: "#b5854b", border: "1px solid #e4c28a" }}
          >
            <HelpCircle size={14} />
            Soporte al Socio
          </div>

          <h2 className="text-4xl font-black italic" style={{ color: "#231e1d" }}>
            Preguntas Frecuentes
          </h2>

          <p className="mt-4 text-sm" style={{ color: "rgba(35,30,29,0.6)" }}>
            Todo lo que necesitas saber sobre GUOR.
          </p>
        </div>

        {/* FAQ ITEMS */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeIndex === idx;

            return (
              <div
                key={idx}
                className="rounded-2xl transition-all duration-300"
                style={{
                  background: "#fff4e2",
                  border: isOpen ? "1px solid #b5854b" : "1px solid #e4c28a",
                  boxShadow: isOpen ? "0 4px 20px rgba(181,133,75,0.15)" : "none",
                }}
              >
                {/* BOTÓN */}
                <button
                  onClick={() => setActiveIndex(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex justify-between items-center"
                >
                  <span className="font-bold text-sm" style={{ color: "#231e1d" }}>
                    {faq.question}
                  </span>

                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ color: isOpen ? "#b5854b" : "#e4c28a" }}
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </button>

                {/* RESPUESTA */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      variants={menuVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="px-6 pb-6 pt-4 text-sm"
                        style={{ color: "rgba(35,30,29,0.7)", borderTop: "1px solid #e4c28a" }}
                      >
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FAQSection;