import Link from 'next/link';
import { ChevronRight, HelpCircle, MessageCircle, Phone } from 'lucide-react';

const FAQS = [
  {
    question: '¿Hay una cantidad minima de compra por modelo?',
    answer:
      'Si. Trabajamos en modalidad mayorista y el minimo de compra es de 400 prendas por modelo para iniciar produccion y asegurar consistencia de calidad.',
  },
  {
    question: '¿Puedo combinar tallas dentro del mismo modelo?',
    answer:
      'Si. Puedes distribuir tallas segun tu requerimiento comercial, respetando la disponibilidad de produccion y el volumen total acordado por modelo.',
  },
  {
    question: '¿Cual es el tiempo promedio de confeccion?',
    answer:
      'El plazo puede variar segun temporada y complejidad del modelo. Nuestro equipo comercial confirma una fecha estimada al cerrar la orden.',
  },
  {
    question: '¿Atienden envios a todo el Peru?',
    answer:
      'Si. Coordinamos despachos nacionales con operadores logísticos de confianza y seguimiento durante todo el proceso.',
  },
  {
    question: '¿Como solicito una cotizacion mayorista?',
    answer:
      'Puedes escribirnos por WhatsApp o correo con el modelo de interes, cantidades y ciudad de destino. Te responderemos con una propuesta formal.',
  },
];

export default function PaginaPreguntasFrecuentes() {
  return (
    <div className="min-h-screen bg-[#FCF7F7] text-[#4A3737]">
      <section className="border-b border-[#D4AF37]/20 bg-[#F5EBEB]">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#8A7676] mb-4">Atencion VIP</p>
          <h1 className="text-3xl md:text-5xl font-serif leading-tight">
            Preguntas <span className="text-[#B8962D] italic">Frecuentes</span>
          </h1>
          <p className="mt-5 max-w-3xl text-sm md:text-base text-[#6D5A5A] leading-relaxed">
            Informacion clave para clientes mayoristas de Modas y Estilos GUOR. Si necesitas atencion
            personalizada, nuestro equipo comercial puede ayudarte con una asesoria directa.
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          {FAQS.map((item, index) => (
            <details
              key={item.question}
              className="group bg-white border border-[#E7D7D7] rounded-2xl p-5 md:p-6 shadow-[0_6px_22px_rgba(74,55,55,0.06)]"
              open={index === 0}
            >
              <summary className="list-none cursor-pointer flex items-start justify-between gap-4">
                <span className="font-medium text-[#4A3737]">{item.question}</span>
                <ChevronRight className="w-4 h-4 text-[#B8962D] transition-transform group-open:rotate-90 shrink-0 mt-1" />
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-[#6D5A5A]">{item.answer}</p>
            </details>
          ))}
        </div>

        <aside className="lg:col-span-4">
          <div className="bg-white border border-[#E7D7D7] rounded-2xl p-6 space-y-5 sticky top-24 shadow-[0_8px_28px_rgba(74,55,55,0.08)]">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="text-lg font-serif">Soporte Comercial</h2>
            </div>
            <p className="text-sm text-[#6D5A5A] leading-relaxed">
              Nuestro canal VIP para mayoristas esta disponible para resolver dudas de tallas, plazos,
              produccion y cobertura de envio.
            </p>
            <div className="space-y-3 text-sm">
              <a
                href="https://wa.me/51908801912"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#4A3737] hover:text-[#B8962D] transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp: +51 908 801 912
              </a>
              <a href="tel:+51908801912" className="flex items-center gap-2 text-[#4A3737] hover:text-[#B8962D] transition-colors">
                <Phone className="w-4 h-4" /> Llamadas comerciales
              </a>
            </div>
            <Link
              href="/ecommerce/guia-de-tallas"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#4A3737] hover:text-[#B8962D] transition-colors"
            >
              Ver guia de tallas <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </aside>
      </main>
    </div>
  );
}
