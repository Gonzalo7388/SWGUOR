'use client';

import { motion } from 'framer-motion';
import { Truck, Shield, RotateCcw, Headphones } from 'lucide-react';

const BENEFICIOS = [
  {
    id: 1,
    icono: Truck,
    titulo: 'Envío Express',
    descripcion: 'Entregas en 24-48 horas',
  },
  {
    id: 2,
    icono: Shield,
    titulo: 'Compra Protegida',
    descripcion: 'Pago 100% seguro',
  },
  {
    id: 3,
    icono: RotateCcw,
    titulo: 'Cambios Fáciles',
    descripcion: '30 días sin preguntas',
  },
  {
    id: 4,
    icono: Headphones,
    titulo: 'Atención Premium',
    descripcion: 'Soporte dedicado 24/7',
  },
];

export default function SeccionBeneficios() {
  return (
    <section className="relative py-32 md:py-40 overflow-hidden">
      {/* Background Image con Overlay Original */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&h=1080&fit=crop&q=90)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-primary-900/90 to-accent-900/95"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Minimalista Original */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-block mb-6">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary-300 to-transparent mb-8 mx-auto"></div>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-6 tracking-tight">
            Experiencia de Lujo
          </h2>
          
          <p className="text-lg md:text-xl text-white/80 font-light max-w-2xl mx-auto leading-relaxed">
            Diseñada para ti
          </p>
        </motion.div>

        {/* Grid de Beneficios con Iconos Blancos y Centrados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {BENEFICIOS.map((beneficio, index) => {
            const Icono = beneficio.icono;
            
            return (
              <motion.div
                key={beneficio.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.7,
                  delay: index * 0.15,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="group text-center flex flex-col items-center" // Centrado de contenido
              >
                <div className="relative flex flex-col items-center w-full">
                  {/* Línea decorativa superior centrada */}
                  <div className="w-12 h-px bg-primary-300/40 mb-8 transform group-hover:scale-x-150 transition-transform duration-700 group-hover:bg-primary-200"></div>
                  
                  {/* Icono Blanco y Centrado */}
                  <div className="mb-8 flex justify-center w-full">
                    <div className="inline-flex items-center justify-center">
                      <Icono 
                        size={44} 
                        strokeWidth={1.5} 
                        className="text-white group-hover:text-primary-200 transition-all duration-500 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" 
                      />
                    </div>
                  </div>

                  {/* Contenido Centrado */}
                  <div className="space-y-4">
                    <h3 className="text-2xl md:text-3xl font-light text-white tracking-tight drop-shadow-lg">
                      {beneficio.titulo}
                    </h3>
                    <p className="text-base text-white/70 font-light leading-relaxed max-w-62.5">
                      {beneficio.descripcion}
                    </p>
                  </div>

                  {/* Hover Effect Line Centrada */}
                  <div className="mt-8 w-0 h-px bg-accent-200/50 group-hover:w-full transition-all duration-700"></div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats Section Original Restaurada */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-32 pt-20 border-t border-primary-300/20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-16">
            {[
              { numero: '+10K', texto: 'Clientas' },
              { numero: '98%', texto: 'Satisfacción' },
              { numero: '24/7', texto: 'Soporte' },
              { numero: '100%', texto: 'Seguro' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
                className="text-center group"
              >
                <div className="text-4xl md:text-5xl font-extralight text-transparent bg-clip-text bg-gradient-to-r from-primary-200 via-accent-100 to-primary-200 mb-3 tracking-tight group-hover:from-primary-100 group-hover:via-white group-hover:to-primary-100 transition-all duration-500 drop-shadow-[0_0_10px_rgba(212,148,90,0.3)]">
                  {stat.numero}
                </div>
                <div className="text-sm text-white/60 uppercase tracking-[0.3em] font-light group-hover:text-white/80 transition-colors">
                  {stat.texto}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Payment Methods Original Restaurada */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.2 }}
          className="mt-20 text-center"
        >
          <p className="text-sm text-white/50 mb-6 uppercase tracking-[0.3em] font-light">
            Métodos de Pago Seguros
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {['Visa', 'Mastercard', 'American Express', 'SSL Secure'].map((method) => (
              <div 
                key={method} 
                className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-lg border border-primary-300/30 hover:border-primary-200/60 hover:bg-white/15 transition-all duration-300"
              >
                <span className="text-sm font-light text-white/90">{method}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}