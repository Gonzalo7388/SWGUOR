import Link from 'next/link';
import { ClipboardCheck, Clock3, Factory, ShieldCheck, Truck, CircleHelp } from 'lucide-react';

const etapas = [
  {
    icon: ClipboardCheck,
    title: 'Orden confirmada',
    detail: 'Registramos tu orden mayorista y validamos cantidades, tallas y datos de entrega.',
    eta: '24 horas',
  },
  {
    icon: Factory,
    title: 'Produccion',
    detail: 'Tu pedido ingresa a confeccion y control interno de calidad por lote.',
    eta: 'Segun programacion',
  },
  {
    icon: ShieldCheck,
    title: 'Control de calidad',
    detail: 'Verificamos acabados, tallaje y empaque para asegurar estandar comercial.',
    eta: '1 a 2 dias',
  },
  {
    icon: Truck,
    title: 'Despacho',
    detail: 'Coordinamos envio con operador logístico y compartimos datos de salida.',
    eta: 'Entrega nacional',
  },
];

export default function PaginaSeguimientoPedido() {
  return (
    <div className="min-h-screen bg-[#FCF7F7] text-[#4A3737]">
      <section className="border-b border-[#D4AF37]/20 bg-[#F5EBEB]">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#8A7676] mb-4">Atencion VIP</p>
          <h1 className="text-3xl md:text-5xl font-serif leading-tight">
            Seguimiento de <span className="text-[#B8962D] italic">Pedido</span>
          </h1>
          <p className="mt-5 max-w-3xl text-sm md:text-base text-[#6D5A5A] leading-relaxed">
            Mantenemos una comunicacion clara durante todo el proceso de produccion y despacho para que tu
            operacion comercial avance con seguridad.
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-12 md:py-16 space-y-8">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {etapas.map((etapa) => {
            const Icon = etapa.icon;
            return (
              <article
                key={etapa.title}
                className="bg-white border border-[#E7D7D7] rounded-2xl p-6 shadow-[0_8px_28px_rgba(74,55,55,0.06)]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-full bg-[#F5EBEB] border border-[#D4AF37]/30 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#B8962D]" />
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-[#8A7676]">{etapa.eta}</span>
                </div>
                <h2 className="text-lg font-serif mb-2">{etapa.title}</h2>
                <p className="text-sm text-[#6D5A5A] leading-relaxed">{etapa.detail}</p>
              </article>
            );
          })}
        </section>

        <section className="bg-white border border-[#E7D7D7] rounded-2xl p-6 md:p-8 shadow-[0_8px_28px_rgba(74,55,55,0.06)]">
          <div className="flex items-center gap-3 mb-4">
            <Clock3 className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="font-serif text-xl">Canales de actualizacion</h3>
          </div>
          <p className="text-sm text-[#6D5A5A] leading-relaxed mb-6">
            Compartimos avances por WhatsApp y correo en los hitos principales de tu pedido. Si tu equipo
            requiere reportes semanales, podemos coordinar un formato ejecutivo durante la atencion comercial.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://wa.me/51908801912"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full bg-[#D4AF37] hover:bg-[#B8962D] text-white text-xs uppercase tracking-[0.2em] font-semibold transition-colors"
            >
              WhatsApp de seguimiento
            </a>
            <a
              href="mailto:modasyestilosguor@gmail.com"
              className="px-5 py-2.5 rounded-full border border-[#D4AF37]/40 text-[#4A3737] hover:border-[#B8962D] hover:text-[#B8962D] text-xs uppercase tracking-[0.2em] font-semibold transition-colors"
            >
              Correo comercial
            </a>
          </div>
        </section>

        <section className="bg-[#F5EBEB] border border-[#EAD7D7] rounded-2xl p-6 md:p-8">
          <div className="flex items-start gap-3">
            <CircleHelp className="w-5 h-5 text-[#B8962D] mt-0.5" />
            <p className="text-sm text-[#6D5A5A] leading-relaxed">
              Si deseas una consulta puntual de estado, incluye en tu mensaje el nombre del cliente, fecha de
              orden y modelo solicitado para brindarte una respuesta mas rapida.
            </p>
          </div>
          <Link href="/ecommerce/preguntas-frecuentes" className="inline-block mt-5 text-xs uppercase tracking-[0.2em] font-semibold text-[#4A3737] hover:text-[#B8962D] transition-colors">
            Ver preguntas frecuentes
          </Link>
        </section>
      </main>
    </div>
  );
}
