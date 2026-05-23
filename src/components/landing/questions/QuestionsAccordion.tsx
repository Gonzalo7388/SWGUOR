"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "¿Cómo funciona la alianza estratégica con GUOR?",
    answer:
      "Trabajamos junto a marcas y negocios ofreciendo producción textil premium, asesoría estratégica y atención personalizada para potenciar cada colección.",
  },
  {
    question: "¿Existe un pedido mínimo para empresas?",
    answer:
      "Sí. Dependiendo del tipo de prenda y producción, manejamos cantidades mínimas adaptadas a cada cliente corporativo.",
  },
  {
    question: "¿Cómo accedo al descuento de primera orden?",
    answer:
      "Al registrarte como nuevo socio estratégico, activamos automáticamente el beneficio exclusivo en tu primera producción.",
  },
  {
    question: "¿Qué tipo de prendas producen?",
    answer:
      "Desarrollamos colecciones urbanas, corporativas, premium y moda personalizada para negocios modernos.",
  },
  {
    question: "¿GUOR realiza envíos y seguimiento?",
    answer:
      "Sí. Contamos con logística inteligente, seguimiento operativo y atención constante durante todo el proceso.",
  },
];

const QuestionsAccordion = () => {
  const [active, setActive] = useState<number | null>(0);

  return (
    <section className="px-6 py-24">
      <div className="max-w-5xl mx-auto">

        {/* TITULO */}
        <div className="text-center mb-16">
          <p
            className="text-[11px] uppercase tracking-[0.35em] font-black mb-4"
            style={{ color: "#8a6d3b" }}
          >
            Preguntas Frecuentes
          </p>
          <h2
            className="text-5xl md:text-6xl leading-tight font-black italic"
            style={{ color: "#1a1410" }}
          >
            Todo lo que necesitas
            <br />
            saber sobre GUOR.
          </h2>
          <div className="w-12 h-px mx-auto mt-6" style={{ background: "#c4a35a" }} />
        </div>

        {/* FAQ */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = active === index;

            return (
              <div
                key={index}
                className="rounded-[1.75rem] overflow-hidden transition-all duration-300"
                style={{
                  background: "#f5efe4",
                  border: isOpen ? "1.5px solid #c4a35a" : "1.5px solid #e8d5a8",
                  boxShadow: isOpen
                    ? "0 4px 20px -4px rgba(196,163,90,0.20)"
                    : "0 1px 4px -1px rgba(26,20,16,0.04)",
                }}
              >
                {/* BUTTON */}
                <button
                  onClick={() => setActive(isOpen ? null : index)}
                  className="w-full flex items-center justify-between px-8 py-7 text-left"
                >
                  <h3
                    className="text-lg md:text-xl font-black pr-4"
                    style={{ color: "#1a1410" }}
                  >
                    {faq.question}
                  </h3>

                  <ChevronDown
                    size={24}
                    style={{
                      color: "#8a6d3b",
                      flexShrink: 0,
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "0.3s",
                    }}
                  />
                </button>

                {/* CONTENT */}
                <div
                  style={{
                    maxHeight: isOpen ? "300px" : "0px",
                    overflow: "hidden",
                    transition: "all 0.4s ease",
                  }}
                >
                  <div className="px-8 pb-7">
                    <div className="w-8 h-px mb-4" style={{ background: "#e8d5a8" }} />
                    <p
                      className="text-base leading-relaxed"
                      style={{ color: "rgba(26,20,16,0.68)" }}
                    >
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default QuestionsAccordion;