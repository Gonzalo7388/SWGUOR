'use client';

import { motion } from 'framer-motion';

interface TallaSelectorProps {
  tallasDisponibles: string[];
  tallaSeleccionada: string | null;
  onTallaSeleccionada: (talla: string) => void;
}

export default function TallaSelector({
  tallasDisponibles,
  tallaSeleccionada,
  onTallaSeleccionada,
}: TallaSelectorProps) {
  if (tallasDisponibles.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
        📏 Selecciona una Talla
      </label>
      <div className="flex flex-wrap gap-2">
        {tallasDisponibles.map((talla) => {
          const isSelected = tallaSeleccionada === talla;

          return (
            <motion.button
              key={talla}
              onClick={() => onTallaSeleccionada(talla)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all duration-200 border-2 ${
                isSelected
                  ? 'bg-gray-900 text-white border-gray-900 shadow-lg'
                  : 'bg-white text-gray-900 border-gray-300 hover:border-gray-900'
              }`}
            >
              {talla}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
