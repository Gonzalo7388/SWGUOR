'use client';

export default function SeccionPromo() {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Promo 1 */}
          <div className="bg-linear-to-br from-blue-400 to-blue-600 rounded-lg p-6 md:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <h3 className="text-2xl md:text-3xl font-bold mb-2 relative z-10">
              Liquidación
            </h3>
            <p className="text-blue-100 mb-4 relative z-10">
              Hasta 70% en prendas seleccionadas
            </p>
            <button className="bg-white text-blue-600 font-bold px-6 py-2 rounded-lg hover:bg-gray-100 transition relative z-10">
              Comprar
            </button>
          </div>

          {/* Promo 2 */}
          <div className="bg-linear-to-br from-red-400 to-red-600 rounded-lg p-6 md:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <h3 className="text-2xl md:text-3xl font-bold mb-2 relative z-10">
              2x1 en Accesorios
            </h3>
            <p className="text-red-100 mb-4 relative z-10">
              Compra 2 y paga 1 esta semana
            </p>
            <button className="bg-white text-red-600 font-bold px-6 py-2 rounded-lg hover:bg-gray-100 transition relative z-10">
              Aprovechar
            </button>
          </div>

          {/* Promo 3 */}
          <div className="bg-linear-to-br from-purple-400 to-purple-600 rounded-lg p-6 md:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <h3 className="text-2xl md:text-3xl font-bold mb-2 relative z-10">
              Envío Gratis
            </h3>
            <p className="text-purple-100 mb-4 relative z-10">
              En toda compra de $50,000 o más
            </p>
            <button className="bg-white text-purple-600 font-bold px-6 py-2 rounded-lg hover:bg-gray-100 transition relative z-10">
              Explorar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
