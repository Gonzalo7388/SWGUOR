'use client';

import { motion } from 'framer-motion';

interface ColorSelectorProps {
  coloresDisponibles: string[];
  colorSeleccionado: string | null;
  onColorSeleccionado: (color: string) => void;
}

// Paleta oficial de colores con sus códigos hexadecimales
const PALETA_COLORES = {
  crema: '#FFF8DC',
  blanco: '#FFFFFF',
  negro: '#1F2937',
  rojo: '#DC2626',
  verde: '#16A34A',
  celeste: '#0EA5E9',
  lila: '#A855F7',
  marrón: '#92400E',
};

// Orden de presentación de colores
const ORDEN_COLORES = Object.keys(PALETA_COLORES) as (keyof typeof PALETA_COLORES)[];

export default function ColorSelector({
  coloresDisponibles,
  colorSeleccionado,
  onColorSeleccionado,
}: ColorSelectorProps) {
  if (coloresDisponibles.length === 0) {
    return null;
  }

  // Filtrar colores disponibles y ordenarlos según la paleta oficial
  const coloresOrdenados = ORDEN_COLORES.filter(color =>
    coloresDisponibles.some(c => c.toLowerCase() === color)
  );

  return (
    <div className="mb-6">
      <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
        🎨 Selecciona un Color
      </label>
      <div className="flex flex-wrap gap-3">
        {coloresOrdenados.length > 0 ? (
          coloresOrdenados.map((color) => {
            const colorHex = PALETA_COLORES[color];
            const isSelected = colorSeleccionado?.toLowerCase() === color;

            return (
              <motion.button
                key={color}
                onClick={() => {
                  // Buscar el nombre del color en la lista de disponibles (mantener el caso original)
                  const colorOriginal = coloresDisponibles.find(c => c.toLowerCase() === color);
                  onColorSeleccionado(colorOriginal || color);
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`relative group transition-all duration-200 ${
                  isSelected ? 'ring-2 ring-offset-2 ring-gray-900' : ''
                }`}
                type="button"
              >
                {/* Círculo de color */}
                <div
                  className="w-12 h-12 rounded-full border-2 transition-all duration-200 shadow-md hover:shadow-lg"
                  style={{
                    backgroundColor: colorHex,
                    borderColor: isSelected ? '#000' : '#D1D5DB',
                  }}
                >
                  {/* Checkmark si está seleccionado */}
                  {isSelected && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-white text-lg font-bold drop-shadow">✓</div>
                    </div>
                  )}
                </div>

                {/* Tooltip con nombre del color */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none capitalize">
                  {color}
                </div>
              </motion.button>
            );
          })
        ) : (
          <p className="text-gray-500 text-sm">No hay colores disponibles</p>
        )}
      </div>
    </div>
  );
}
