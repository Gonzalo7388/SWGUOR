'use client';

import { motion } from 'framer-motion';
import { Flame, Gift, Zap } from 'lucide-react';
import Link from 'next/link';

export default function SeccionPromo() {
  const promos = [
    {
      id: 1,
      titulo: 'Liquidación',
      subtitulo: 'Hasta 70% en prendas seleccionadas',
      icono: Flame,
      color: 'from-orange-400 to-red-600',
      bgLight: 'bg-orange-50',
      textColor: 'text-orange-600',
      buttonColor: 'bg-orange-600 hover:bg-orange-700',
      enlace: '/ecommerce/productos',
    },
    {
      id: 2,
      titulo: '2x1 en Accesorios',
      subtitulo: 'Compra 2 y paga 1 esta semana',
      icono: Gift,
      color: 'from-pink-400 to-pink-600',
      bgLight: 'bg-pink-50',
      textColor: 'text-pink-600',
      buttonColor: 'bg-pink-600 hover:bg-pink-700',
      enlace: '/ecommerce/productos',
    },
    {
      id: 3,
      titulo: 'Envío Gratis',
      subtitulo: 'En toda compra de $50,000 o más',
      icono: Zap,
      color: 'from-purple-400 to-purple-600',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      enlace: '/ecommerce/productos',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Ofertas Especiales
          </h2>
          <p className="text-gray-600">Aprovecha nuestras promociones exclusivas esta semana</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {promos.map((promo) => {
            const IconComponent = promo.icono;
            return (
              <motion.div
                key={promo.id}
                variants={cardVariants}
                whileHover={{ translateY: -8 }}
                className={`group relative overflow-hidden rounded-2xl p-8 md:p-10 text-white transition-all duration-300 ${promo.bgLight} cursor-pointer`}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${promo.color} -z-10 transition-all duration-300 group-hover:scale-110`} />

                {/* Decorative circles */}
                <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-2xl transition-all duration-300 group-hover:scale-125" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-xl" />

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                      className="bg-white/20 backdrop-blur-sm p-3 rounded-full"
                    >
                      <IconComponent size={28} className="text-white" stroke={3} />
                    </motion.div>
                    <span className="text-xs font-black bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full uppercase tracking-wider">
                      Esta Semana
                    </span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">
                    {promo.titulo}
                  </h3>
                  <p className="text-white/90 mb-6 text-sm md:text-base font-light">
                    {promo.subtitulo}
                  </p>

                  <Link href={promo.enlace}>
                    <button
                      className={`w-full py-3 px-4 rounded-lg font-bold uppercase tracking-wider text-sm transition-all duration-300 transform group-hover:scale-105 active:scale-95 ${promo.buttonColor} text-white shadow-lg hover:shadow-xl`}
                    >
                      Aprovechar Oferta
                    </button>
                  </Link>
                </div>

                {/* Shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300 -skew-x-12 group-hover:translate-x-full" />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
