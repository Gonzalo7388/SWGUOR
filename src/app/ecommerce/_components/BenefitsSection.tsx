'use client';

import { Truck, Shield, RotateCcw, Headphones } from 'lucide-react';

const BENEFITS = [
  {
    id: 1,
    icon: Truck,
    title: 'Envío Rápido',
    description: 'Envío gratis en compras mayores a $50.000',
  },
  {
    id: 2,
    icon: Shield,
    title: 'Compra Segura',
    description: 'Pago 100% seguro con encriptación SSL',
  },
  {
    id: 3,
    icon: RotateCcw,
    title: 'Devoluciones',
    description: '30 días para devolver sin preguntas',
  },
  {
    id: 4,
    icon: Headphones,
    title: 'Soporte 24/7',
    description: 'Estamos aquí para ayudarte siempre',
  },
];

export default function BenefitsSection() {
  return (
    <section className="py-12 md:py-16 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div key={benefit.id} className="text-center">
                <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon size={32} />
                </div>
                <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                <p className="text-gray-400 text-sm">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
