'use client';

import { Truck, Shield, RotateCcw, Headphones } from 'lucide-react';

const BENEFICIOS = [
  {
    id: 1,
    icono: Truck,
    titulo: 'Envío Rápido',
    descripcion: 'Envío gratis en compras mayores a $50.000',
  },
  {
    id: 2,
    icono: Shield,
    titulo: 'Compra Segura',
    descripcion: 'Pago 100% seguro con encriptación SSL',
  },
  {
    id: 3,
    icono: RotateCcw,
    titulo: 'Devoluciones',
    descripcion: '30 días para devolver sin preguntas',
  },
  {
    id: 4,
    icono: Headphones,
    titulo: 'Soporte 24/7',
    descripcion: 'Estamos aquí para ayudarte siempre',
  },
];

export default function SeccionBeneficios() {
  return (
    <section className="py-12 md:py-16 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {BENEFICIOS.map((beneficio) => {
            const Icono = beneficio.icono;
            return (
              <div key={beneficio.id} className="text-center">
                <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icono size={32} />
                </div>
                <h3 className="font-bold text-lg mb-2">{beneficio.titulo}</h3>
                <p className="text-gray-400 text-sm">{beneficio.descripcion}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
