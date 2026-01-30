'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    title: 'Colección de Verano 2026',
    subtitle: 'Descubre nuestros nuevos diseños',
    discount: '-40%',
    image: 'bg-gradient-to-r from-pink-400 to-pink-600',
    cta: 'Comprar Ahora',
  },
  {
    id: 2,
    title: 'Promoción Flash',
    subtitle: 'Hoy: Todo en Vestidos con 50% de descuento',
    discount: '-50%',
    image: 'bg-gradient-to-r from-purple-400 to-purple-600',
    cta: 'Ver Ofertas',
  },
  {
    id: 3,
    title: 'Prendas Exclusivas',
    subtitle: 'Diseños únicos para ti',
    discount: '-30%',
    image: 'bg-gradient-to-r from-red-400 to-red-600',
    cta: 'Explorar',
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % SLIDES.length);
  const prev = () => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  return (
    <div className="relative w-full h-96 md:h-[500px] overflow-hidden rounded-lg md:rounded-2xl">
      {/* Slides */}
      {SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className={`w-full h-full ${slide.image} flex items-center justify-center`}>
            <div className="text-center text-white px-4">
              <div className="inline-block bg-white text-red-600 px-4 py-1 rounded-full text-sm font-bold mb-4">
                {slide.discount}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-2">{slide.title}</h1>
              <p className="text-lg md:text-xl mb-6 opacity-90">{slide.subtitle}</p>
              <button className="bg-white text-red-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
                {slide.cta}
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full transition"
      >
        <ChevronLeft className="text-gray-900" size={24} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full transition"
      >
        <ChevronRight className="text-gray-900" size={24} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition ${
              index === current ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
