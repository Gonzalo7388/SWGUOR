'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DIAPOSITIVAS = [
  {
    id: 1,
    titulo: 'Colección de Verano 2026',
    subtitulo: 'Descubre nuestros nuevos diseños',
    descuento: '-40%',
    imagen: 'bg-linear-to-r from-pink-400 to-pink-600',
    llamada: 'Comprar Ahora',
  },
  {
    id: 2,
    titulo: 'Promoción Flash',
    subtitulo: 'Hoy: Todo en Vestidos con 50% de descuento',
    descuento: '-50%',
    imagen: 'bg-linear-to-r from-purple-400 to-purple-600',
    llamada: 'Ver Ofertas',
  },
  {
    id: 3,
    titulo: 'Prendas Exclusivas',
    subtitulo: 'Diseños únicos para ti',
    descuento: '-30%',
    imagen: 'bg-linear-to-r from-red-400 to-red-600',
    llamada: 'Explorar',
  },
];

export default function CarruselHeroi() {
  const [actual, setActual] = useState(0);

  useEffect(() => {
    const temporizador = setInterval(() => {
      setActual((prev) => (prev + 1) % DIAPOSITIVAS.length);
    }, 5000);
    return () => clearInterval(temporizador);
  }, []);

  const siguiente = () => setActual((prev) => (prev + 1) % DIAPOSITIVAS.length);
  const anterior = () => setActual((prev) => (prev - 1 + DIAPOSITIVAS.length) % DIAPOSITIVAS.length);

  return (
    <div className="relative w-full h-96 md:h-125 overflow-hidden rounded-lg md:rounded-2xl">
      {/* Diapositivas */}
      {DIAPOSITIVAS.map((diapositiva, indice) => (
        <div
          key={diapositiva.id}
          className={`absolute w-full h-full transition-opacity duration-1000 ease-in-out ${
            indice === actual ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className={`w-full h-full ${diapositiva.imagen} flex items-center justify-center`}>
            <div className="text-center text-white px-4">
              <div className="inline-block bg-white text-red-600 px-4 py-1 rounded-full text-sm font-bold mb-4">
                {diapositiva.descuento}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-2">{diapositiva.titulo}</h1>
              <p className="text-lg md:text-xl mb-6 opacity-90">{diapositiva.subtitulo}</p>
              <button className="bg-white text-red-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
                {diapositiva.llamada}
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Botones de Navegación */}
      <button
        onClick={anterior}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full transition"
      >
        <ChevronLeft className="text-gray-900" size={24} />
      </button>
      <button
        onClick={siguiente}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full transition"
      >
        <ChevronRight className="text-gray-900" size={24} />
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {DIAPOSITIVAS.map((_, indice) => (
          <button
            key={indice}
            onClick={() => setActual(indice)}
            className={`w-3 h-3 rounded-full transition ${
              indice === actual ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
