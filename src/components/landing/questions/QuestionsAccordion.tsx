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
        <div className="text-center mb-40">

          <p
            className="text-[11px] uppercase tracking-[0.35em] font-black mb-6"
            style={{ color: "#b5854b" }}
          >
            Preguntas Frecuentes
          </p>

          <h2
            className="text-5xl md:text-6xl leading-tight font-black italic"
            style={{ color: "#231e1d" }}
          >
            Todo lo que necesitas
            <br />

            saber sobre GUOR.
          </h2>

        </div>

        {/* FAQ */}
        <div className="space-y-8">

          {faqs.map((faq, index) => {
            const isOpen = active === index;

            return (
              <div
                key={index}
                className="rounded-[2rem] overflow-hidden transition-all duration-300"
                style={{
                  background: "#fbddd3",
                  border: isOpen
                    ? "1px solid #b5854b"
                    : "1px solid #e4c28a",
                }}
              >

                {/* BUTTON */}
                <button
                  onClick={() =>
                    setActive(isOpen ? null : index)
                  }
                  className="w-full flex items-center justify-between px-8 py-8 text-left"
                >

                  <h3
                    className="text-xl md:text-2xl font-black"
                    style={{ color: "#231e1d" }}
                  >
                    {faq.question}
                  </h3>

                  <ChevronDown
                    size={30}
                    style={{
                      color: "#b5854b",
                      transform: isOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
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
                  <div className="px-8 pb-8">

                    <p
                      className="text-lg leading-relaxed"
                      style={{
                        color: "rgba(35,30,29,0.72)",
                      }}
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