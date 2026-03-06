import { Ruler, Shirt, Sparkles } from 'lucide-react';

const tallasSuperiores = ['S', 'M', 'L', 'XL'];
const tallasInferiores = ['26', '28', '30', '32'];

export default function PaginaGuiaTallas() {
  return (
    <div className="min-h-screen bg-[#FCF7F7] text-[#4A3737]">
      <section className="border-b border-[#D4AF37]/20 bg-[#F5EBEB]">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#8A7676] mb-4">Atencion VIP</p>
          <h1 className="text-3xl md:text-5xl font-serif leading-tight">
            Guia de <span className="text-[#B8962D] italic">Tallas</span>
          </h1>
          <p className="mt-5 max-w-3xl text-sm md:text-base text-[#6D5A5A] leading-relaxed">
            Referencia oficial de tallaje para ventas mayoristas. Esta estructura permite estandarizar tu
            compra y asegurar una mejor rotacion en tienda.
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-12 md:py-16 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <article className="bg-white border border-[#E7D7D7] rounded-2xl p-6 md:p-7 shadow-[0_8px_28px_rgba(74,55,55,0.06)]">
            <div className="flex items-center gap-3 mb-4">
              <Shirt className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="font-serif text-xl">Blusas y Polos</h2>
            </div>
            <p className="text-sm text-[#6D5A5A] mb-5">
              Para prendas superiores manejamos tallas estandar de moda femenina:
            </p>
            <div className="flex flex-wrap gap-3">
              {tallasSuperiores.map((talla) => (
                <span
                  key={talla}
                  className="min-w-12 text-center px-4 py-2 rounded-full bg-[#F5EBEB] border border-[#D4AF37]/30 text-sm font-semibold"
                >
                  {talla}
                </span>
              ))}
            </div>
          </article>

          <article className="bg-white border border-[#E7D7D7] rounded-2xl p-6 md:p-7 shadow-[0_8px_28px_rgba(74,55,55,0.06)]">
            <div className="flex items-center gap-3 mb-4">
              <Ruler className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="font-serif text-xl">Pantalones y Vestidos</h2>
            </div>
            <p className="text-sm text-[#6D5A5A] mb-5">
              Para prendas inferiores y vestidos usamos el siguiente rango numerico:
            </p>
            <div className="flex flex-wrap gap-3">
              {tallasInferiores.map((talla) => (
                <span
                  key={talla}
                  className="min-w-12 text-center px-4 py-2 rounded-full bg-[#F5EBEB] border border-[#D4AF37]/30 text-sm font-semibold"
                >
                  {talla}
                </span>
              ))}
            </div>
          </article>
        </div>

        <section className="bg-white border border-[#E7D7D7] rounded-2xl p-6 md:p-8 shadow-[0_8px_28px_rgba(74,55,55,0.06)]">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="font-serif text-xl">Recomendaciones para pedidos mayoristas</h3>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-[#6D5A5A] leading-relaxed">
            <li className="bg-[#FCF7F7] rounded-xl p-4 border border-[#EAD7D7]">Valida el mix de tallas segun el historial de rotacion de tu punto de venta.</li>
            <li className="bg-[#FCF7F7] rounded-xl p-4 border border-[#EAD7D7]">Solicita asesoria comercial para equilibrar tallas de alta demanda por temporada.</li>
            <li className="bg-[#FCF7F7] rounded-xl p-4 border border-[#EAD7D7]">Considera una distribucion progresiva para minimizar quiebres de stock.</li>
            <li className="bg-[#FCF7F7] rounded-xl p-4 border border-[#EAD7D7]">Confirma tallas finales antes del corte para evitar ajustes posteriores en produccion.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
