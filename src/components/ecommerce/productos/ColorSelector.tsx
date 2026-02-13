'use client';

import { motion } from 'framer-motion';

interface ColorSelectorProps {
  coloresDisponibles: string[];
  colorSeleccionado: string | null;
  onColorSeleccionado: (color: string) => void;
}

// Mapeo de colores a códigos hexadecimales
const COLORES_HEX: Record<string, string> = {
  crema: '#FFF8DC',
  blanco: '#FFFFFF',
  negro: '#1F2937',
  rojo: '#DC2626',
  'rojo oscuro': '#991B1B',
  verde: '#16A34A',
  'verde oscuro': '#15803D',
  celeste: '#0EA5E9',
  'azul claro': '#06B6D4',
  lila: '#A855F7',
  'púrpura': '#7C3AED',
  marron: '#92400E',
  'marrón': '#92400E',
  beige: '#F5DEB3',
  gris: '#6B7280',
  'gris oscuro': '#374151',
  rosa: '#EC4899',
  naranja: '#EA580C',
  amarillo: '#FBBF24',
};

export default function ColorSelector({
  coloresDisponibles,
  colorSeleccionado,
  onColorSeleccionado,
}: ColorSelectorProps) {
  if (coloresDisponibles.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
        🎨 Selecciona un Color
      </label>
      <div className="flex flex-wrap gap-3">
        {coloresDisponibles.map((color) => {
          const colorHex = COLORES_HEX[color.toLowerCase()] || '#E5E7EB';
          const isSelected = colorSeleccionado === color;

          return (
            <motion.button
              key={color}
              onClick={() => onColorSeleccionado(color)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`relative group transition-all duration-200 ${
                isSelected ? 'ring-2 ring-offset-2 ring-gray-900' : ''
              }`}
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
        })}
      </div>
    </div>
  );
}
