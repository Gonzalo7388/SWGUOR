'use client';

import { motion } from 'framer-motion';

interface TallaSelectorProps {
  tallasDisponibles: string[];
  tallaSeleccionada: string | null;
  onTallaSeleccionada: (talla: string) => void;
}

// Orden de presentación de tallas
const ORDEN_TALLAS = ['S', 'M', 'L'];

export default function TallaSelector({
  tallasDisponibles,
  tallaSeleccionada,
  onTallaSeleccionada,
}: TallaSelectorProps) {
  if (tallasDisponibles.length === 0) {
    return null;
  }

  // Filtrar tallas disponibles y ordenarlas según el orden oficial
  const tallasOrdenadas = ORDEN_TALLAS.filter(talla =>
    tallasDisponibles.some(t => t.toUpperCase() === talla)
  );

  return (
    <div className="mb-6">
      <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
        📏 Selecciona una Talla
      </label>
      <div className="flex flex-wrap gap-2">
        {tallasOrdenadas.length > 0 ? (
          tallasOrdenadas.map((talla) => {
            const isSelected = tallaSeleccionada?.toUpperCase() === talla;

            return (
              <motion.button
                key={talla}
                onClick={() => {
                  // Buscar el nombre de la talla en la lista de disponibles (mantener el caso original)
                  const tallaOriginal = tallasDisponibles.find(t => t.toUpperCase() === talla);
                  onTallaSeleccionada(tallaOriginal || talla);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all duration-200 border-2 ${
                  isSelected
                    ? 'bg-gray-900 text-white border-gray-900 shadow-lg'
                    : 'bg-white text-gray-900 border-gray-300 hover:border-gray-900'
                }`}
                type="button"
              >
                {talla}
              </motion.button>
            );
          })
        ) : (
          <p className="text-gray-500 text-sm">No hay tallas disponibles</p>
        )}      </div>
    </div>
  );
}