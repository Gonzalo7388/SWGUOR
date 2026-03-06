import { Banknote, BadgePercent, CircleCheckBig, MapPin, PackageCheck, Shield, Truck } from 'lucide-react';

const politicasPago = [
  'Se requiere pago por adelantado del 50% o del 100% para confirmar la orden mayorista.',
  'El saldo pendiente (si aplica) se cancela antes del despacho final del pedido.',
  'Los comprobantes de pago deben ser enviados por los canales oficiales para validacion.',
];

const politicasEnvio = [
  'El costo de envio se cotiza por separado y no esta incluido en el valor de las prendas.',
  'Trabajamos tarifas preferenciales para mantener un costo logístico reducido para nuestros clientes.',
  'La entrega se coordina segun destino, volumen y operador de transporte disponible.',
];

const seguimientoDelivery = [
  { estado: 'Pedido preparado', detalle: 'Validacion comercial y empaque final completados.' },
  { estado: 'En ruta', detalle: 'El operador logístico ya se encuentra en traslado.' },
  { estado: 'Entrega programada', detalle: 'Franja horaria coordinada con el cliente comprador.' },
];

export default function PaginaPoliticasEnvio() {
  return (
    <div className="min-h-screen bg-[#FCF7F7] text-[#4A3737]">
      <section className="border-b border-[#D4AF37]/20 bg-[#F5EBEB]">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#8A7676] mb-4">Atencion VIP</p>
          <h1 className="text-3xl md:text-5xl font-serif leading-tight">
            Politicas de <span className="text-[#B8962D] italic">Envio y Pago</span>
          </h1>
          <p className="mt-5 max-w-3xl text-sm md:text-base text-[#6D5A5A] leading-relaxed">
            Condiciones comerciales para gestionar pedidos mayoristas con transparencia y orden operativo.
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-12 md:py-16 space-y-8">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <article className="bg-white border border-[#E7D7D7] rounded-2xl p-6 md:p-7 shadow-[0_8px_28px_rgba(74,55,55,0.06)]">
            <div className="flex items-center gap-3 mb-4">
              <Banknote className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="font-serif text-xl">Condiciones de pago</h2>
            </div>
            <ul className="space-y-3 text-sm text-[#6D5A5A]">
              {politicasPago.map((item) => (
                <li key={item} className="flex items-start gap-2.5 leading-relaxed">
                  <CircleCheckBig className="w-4 h-4 text-[#B8962D] mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="bg-white border border-[#E7D7D7] rounded-2xl p-6 md:p-7 shadow-[0_8px_28px_rgba(74,55,55,0.06)]">
            <div className="flex items-center gap-3 mb-4">
              <Truck className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="font-serif text-xl">Condiciones de envio</h2>
            </div>
            <ul className="space-y-3 text-sm text-[#6D5A5A]">
              {politicasEnvio.map((item) => (
                <li key={item} className="flex items-start gap-2.5 leading-relaxed">
                  <PackageCheck className="w-4 h-4 text-[#B8962D] mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E7D7D7] rounded-2xl p-5">
            <BadgePercent className="w-5 h-5 text-[#D4AF37] mb-3" />
            <h3 className="font-medium mb-2">Pago flexible</h3>
            <p className="text-sm text-[#6D5A5A]">Puedes confirmar con 50% o 100% de adelanto segun tu plan de compra.</p>
          </div>
          <div className="bg-white border border-[#E7D7D7] rounded-2xl p-5">
            <Shield className="w-5 h-5 text-[#D4AF37] mb-3" />
            <h3 className="font-medium mb-2">Proceso validado</h3>
            <p className="text-sm text-[#6D5A5A]">Cada pedido sigue control de calidad y validacion comercial previa al despacho.</p>
          </div>
          <div className="bg-white border border-[#E7D7D7] rounded-2xl p-5">
            <Truck className="w-5 h-5 text-[#D4AF37] mb-3" />
            <h3 className="font-medium mb-2">Envio aparte</h3>
            <p className="text-sm text-[#6D5A5A]">El flete se calcula por destino con tarifas reducidas para optimizar costos.</p>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <article className="lg:col-span-5 bg-white border border-[#E7D7D7] rounded-2xl p-6 md:p-7 shadow-[0_8px_28px_rgba(74,55,55,0.06)]">
            <div className="flex items-center gap-3 mb-4">
              <Truck className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="font-serif text-xl">Anadir delivery</h2>
            </div>
            <p className="text-sm text-[#6D5A5A] leading-relaxed mb-4">
              El servicio de delivery se puede anadir siempre y cuando hayas realizado la compra y tu orden
              se encuentre confirmada por el equipo comercial.
            </p>
            <ul className="space-y-3 text-sm text-[#6D5A5A]">
              <li className="flex items-start gap-2.5">
                <CircleCheckBig className="w-4 h-4 text-[#B8962D] mt-0.5 shrink-0" />
                <span>Aplica para pedidos mayoristas con datos completos de destino y contacto.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CircleCheckBig className="w-4 h-4 text-[#B8962D] mt-0.5 shrink-0" />
                <span>La solicitud se registra al confirmar tu orden o antes del despacho.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CircleCheckBig className="w-4 h-4 text-[#B8962D] mt-0.5 shrink-0" />
                <span>El costo de delivery se informa por separado en la cotizacion final.</span>
              </li>
            </ul>
          </article>

          <article className="lg:col-span-7 bg-white border border-[#E7D7D7] rounded-2xl p-6 md:p-7 shadow-[0_8px_28px_rgba(74,55,55,0.06)]">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="font-serif text-xl">Seguimiento del delivery</h2>
            </div>
            <p className="text-sm text-[#6D5A5A] leading-relaxed mb-5">
              Vista de seguimiento referencial para monitorear el avance del despacho desde salida hasta entrega.
            </p>

            <div className="rounded-2xl border border-[#EAD7D7] overflow-hidden mb-5">
              <div className="relative h-44 bg-[radial-gradient(circle_at_20%_20%,#f5ebeb_0%,#f9f1f1_35%,#fff_100%)]">
                <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(to right, rgba(212,175,55,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(212,175,55,0.12) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
                <div className="absolute left-[10%] top-[68%] w-[78%] h-[2px] bg-[#D4AF37]/60" />
                <span className="absolute left-[8%] top-[62%] w-3.5 h-3.5 rounded-full bg-[#B8962D] ring-4 ring-[#D4AF37]/20" />
                <span className="absolute left-[46%] top-[62%] w-3.5 h-3.5 rounded-full bg-[#B8962D] ring-4 ring-[#D4AF37]/20" />
                <span className="absolute left-[84%] top-[62%] w-3.5 h-3.5 rounded-full bg-[#B8962D] ring-4 ring-[#D4AF37]/20" />
                <p className="absolute left-[6%] bottom-3 text-[11px] text-[#8A7676] uppercase tracking-[0.18em]">Origen</p>
                <p className="absolute left-[43%] bottom-3 text-[11px] text-[#8A7676] uppercase tracking-[0.18em]">Ruta</p>
                <p className="absolute right-[4%] bottom-3 text-[11px] text-[#8A7676] uppercase tracking-[0.18em]">Destino</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {seguimientoDelivery.map((item) => (
                <div key={item.estado} className="rounded-xl border border-[#EAD7D7] bg-[#FCF7F7] p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#8A7676] mb-2">{item.estado}</p>
                  <p className="text-sm text-[#6D5A5A] leading-relaxed">{item.detalle}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
