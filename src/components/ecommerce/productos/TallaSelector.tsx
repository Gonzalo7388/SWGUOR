'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Ruler } from 'lucide-react';

interface TallaSelectorProps {
  tallasDisponibles: string[];
  tallaSeleccionada: string | null;
  onTallaSeleccionada: (talla: string) => void;
  // Opcional: tallas que existen pero no tienen stock para el color elegido
  tallasAgotadas?: string[];
  // Opcional: mostrar guía de tallas
  onVerGuia?: () => void;
}

// Orden canónico de tallas para mostrar siempre en orden correcto
const ORDEN_TALLAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34'];

export default function TallaSelector({
  tallasDisponibles,
  tallaSeleccionada,
  onTallaSeleccionada,
  tallasAgotadas = [],
  onVerGuia,
}: TallaSelectorProps) {
  // Unir disponibles + agotadas y ordenar canónicamente
  const todasLasTallas = [
    ...new Set([...tallasDisponibles, ...tallasAgotadas]),
  ].sort((a, b) => {
    const ia = ORDEN_TALLAS.indexOf(a);
    const ib = ORDEN_TALLAS.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  const handleClick = (talla: string) => {
    if (tallasAgotadas.includes(talla)) return;
    // Toggle: si ya está seleccionada, deseleccionar
    onTallaSeleccionada(tallaSeleccionada === talla ? '' : talla);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
          Tallas Disponibles
        </label>
        {onVerGuia && (
          <button
            onClick={onVerGuia}
            className="flex items-center gap-1.5 text-[10px] font-bold text-gray-900 hover:text-rose-500 transition-colors uppercase"
          >
            <Ruler size={13} />
            Guía de medidas
          </button>
        )}
      </div>

      {/* Botones de talla */}
      <div className="flex flex-wrap gap-2">
        {todasLasTallas.map((talla) => {
          const isActive = tallaSeleccionada === talla;
          const isAgotada = tallasAgotadas.includes(talla);

          return (
            <motion.button
              key={talla}
              whileHover={!isAgotada ? { y: -2 } : {}}
              whileTap={!isAgotada ? { scale: 0.93 } : {}}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              onClick={() => handleClick(talla)}
              disabled={isAgotada}
              className={`
                relative h-11 min-w-[3.25rem] px-4 rounded-xl text-xs font-black
                transition-all duration-200 flex items-center justify-center border-2
                ${isActive
                  ? 'border-black bg-black text-white shadow-lg'
                  : isAgotada
                  ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                  : 'border-gray-100 bg-white text-gray-900 hover:border-gray-400 hover:shadow-sm cursor-pointer'
                }
              `}
            >
              {/* Tachado SVG para agotadas */}
              {isAgotada && (
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  preserveAspectRatio="none"
                >
                  <line
                    x1="10%"
                    y1="90%"
                    x2="90%"
                    y2="10%"
                    stroke="#d1d5db"
                    strokeWidth="1.5"
                  />
                </svg>
              )}
              {talla}
            </motion.button>
          );
        })}
      </div>

      {/* Info dinámica */}
      <AnimatePresence mode="wait">
        {tallaSeleccionada ? (
          <motion.p
            key="seleccionada"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="text-[10px] text-gray-500 italic"
          >
            Talla{' '}
            <span className="font-bold text-gray-900 not-italic">{tallaSeleccionada}</span>{' '}
            seleccionada · +/- 1 cm de tolerancia en costura.
          </motion.p>
        ) : tallasAgotadas.length > 0 ? (
          <motion.p
            key="agotadas"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="text-[10px] text-gray-400 italic"
          >
            Las tallas tachadas no tienen stock para el color seleccionado.
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}