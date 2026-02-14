'use client';

import { motion, easeOut } from 'framer-motion';
import { Flame, Gift, Zap } from 'lucide-react';
import Link from 'next/link';

export default function SeccionPromo() {
  const promos = [
    {
      id: 1,
      titulo: 'Liquidación Premium',
      subtitulo: 'Hasta 70% en prendas seleccionadas',
      icono: Flame,
      enlace: '/ecommerce/productos',
    },
    {
      id: 2,
      titulo: 'Promoción 2x1',
      subtitulo: 'Compra 2 y paga 1 esta semana',
      icono: Gift,
      enlace: '/ecommerce/productos',
    },
    {
      id: 3,
      titulo: 'Envío Gratis',
      subtitulo: 'En toda compra de $50,000 o más',
      icono: Zap,
      enlace: '/ecommerce/productos',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white via-primary-50/30 to-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-200/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent-200/20 to-transparent rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-primary-600 to-primary-500 rounded-full" />
            <span className="text-xs font-bold text-primary-700 uppercase tracking-widest">
              Promociones Exclusivas
            </span>
            <div className="h-1 w-12 bg-gradient-to-r from-accent-500 to-accent-600 rounded-full" />
          </div>
          
          <h2 className="text-5xl md:text-6xl font-black text-gray-950 mb-6 tracking-tight">
            Ofertas{' '}
            <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 bg-clip-text text-transparent">
              Especiales
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
            Descubre nuestras mejores promociones y aprovecha los descuentos en artículos seleccionados
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {promos.map((promo, index) => {
            const IconComponent = promo.icono;
            const isSpecial = index === 2;

            return (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.12 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="group relative"
              >
                {/* Glow effect on hover */}
                <div 
                  className={`absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500 ${
                    isSpecial 
                      ? 'bg-gradient-to-br from-primary-600 via-primary-500 to-accent-600'
                      : index === 0
                      ? 'bg-gradient-to-br from-primary-500 to-primary-600'
                      : 'bg-gradient-to-br from-accent-500 to-accent-600'
                  }`}
                />
                
                {/* Card */}
                <div 
                  className={`relative overflow-hidden rounded-3xl shadow-xl group-hover:shadow-2xl transition-all duration-500 border ${
                    isSpecial
                      ? 'bg-gradient-to-br from-primary-600 via-primary-500 to-accent-600 border-primary-400/30'
                      : index === 0
                      ? 'bg-gradient-to-br from-white to-primary-50 border-primary-200/60'
                      : 'bg-gradient-to-br from-white to-accent-50 border-accent-200/60'
                  }`}
                >
                  {/* Premium shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  </div>

                  {/* Content */}
                  <div className="relative p-10 md:p-12 flex flex-col h-full">
                    {/* Icon */}
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 8 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                      className="mb-8"
                    >
                      <div 
                        className={`inline-flex items-center justify-center w-18 h-18 rounded-3xl transition-all duration-300 shadow-md ${
                          isSpecial
                            ? 'bg-white/20 backdrop-blur-sm group-hover:bg-white/30'
                            : index === 0
                            ? 'bg-primary-100 group-hover:bg-primary-200'
                            : 'bg-accent-100 group-hover:bg-accent-200'
                        }`}
                      >
                        <IconComponent 
                          size={40} 
                          className={isSpecial ? 'text-white' : index === 0 ? 'text-primary-700' : 'text-accent-700'} 
                          strokeWidth={1.5} 
                        />
                      </div>
                    </motion.div>

                    {/* Text Content */}
                    <div className="flex-grow mb-8">
                      <h3 
                        className={`text-3xl md:text-2xl font-bold mb-4 leading-tight tracking-tight ${
                          isSpecial ? 'text-white' : index === 0 ? 'text-primary-900' : 'text-accent-900'
                        }`}
                      >
                        {promo.titulo}
                      </h3>
                      <p 
                        className={`text-base md:text-lg leading-relaxed font-light ${
                          isSpecial ? 'text-white/95' : index === 0 ? 'text-primary-700' : 'text-accent-700'
                        }`}
                      >
                        {promo.subtitulo}
                      </p>
                    </div>

                    {/* Badge & Button */}
                    <div className="space-y-5">
                      <div className="inline-flex">
                        <span 
                          className={`px-4 py-2 rounded-full text-xs md:text-sm font-bold uppercase tracking-widest ${
                            isSpecial
                              ? 'bg-white/25 text-white backdrop-blur-sm'
                              : index === 0
                              ? 'bg-primary-100 text-primary-700'
                              : 'bg-accent-100 text-accent-700'
                          }`}
                        >
                          Esta Semana
                        </span>
                      </div>
                      
                      <Link href={promo.enlace} className="block">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full py-4 px-6 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl ${
                            isSpecial
                              ? 'bg-white hover:bg-gray-50 text-primary-700'
                              : index === 0
                              ? 'bg-primary-600 hover:bg-primary-700 text-white'
                              : 'bg-accent-600 hover:bg-accent-700 text-white'
                          }`}
                        >
                          Aprovechar Oferta
                        </motion.button>
                      </Link>
                    </div>
                  </div>

                  {/* Decorative corner accent */}
                  <div 
                    className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-bl-full ${
                      isSpecial
                        ? 'bg-gradient-to-br from-white to-transparent'
                        : index === 0
                        ? 'bg-gradient-to-br from-primary-600 to-transparent'
                        : 'bg-gradient-to-br from-accent-600 to-transparent'
                    }`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}