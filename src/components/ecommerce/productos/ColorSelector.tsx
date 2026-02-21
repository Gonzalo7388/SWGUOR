'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

interface ColorSelectorProps {
  coloresDisponibles: string[];
  colorSeleccionado: string | null;
  onColorSeleccionado: (color: string) => void;
  // Opcional: colores que existen pero no tienen stock para la talla elegida
  coloresAgotados?: string[];
}

// Mapa de colores basado en el enum ColorPrenda de Supabase
const MAPA_COLORES: Record<string, string> = {
  'Blanco': '#ffffff',
  'Negro': '#1a1a1a',
  'Gris': '#9ca3af',
  'Beige': '#e8dcc8',
  'Marrón Pastel': '#b08d57',
  'Azul Jean': '#5dadec',
  'Azul Marino': '#1e3a5f',
  'Rojo': '#ef4444',
  'Rosa Pastel': '#ffd6e0',
  'Morado Claro': '#d8b4fe',
  'Verde Olivo': '#556b2f',
  'Amarillo': '#facc15',
  'Naranja': '#fb923c',
  'Multicolor': 'conic-gradient(from 0deg, #ef4444, #fb923c, #facc15, #4ade80, #60a5fa, #a78bfa, #ef4444)',
  'Único': '#f3f4f6',
};

// Colores que necesitan check oscuro por ser muy claros
const COLORES_CLAROS = new Set(['Blanco', 'Beige', 'Rosa Pastel', 'Morado Claro', 'Amarillo', 'Único', 'Gris']);

export default function ColorSelector({
  coloresDisponibles,
  colorSeleccionado,
  onColorSeleccionado,
  coloresAgotados = [],
}: ColorSelectorProps) {
  // Todos los colores: disponibles + agotados (para mostrarlos deshabilitados)
  const todosLosColores = [
    ...coloresDisponibles,
    ...coloresAgotados.filter((c) => !coloresDisponibles.includes(c)),
  ];

  const handleClick = (color: string) => {
    if (coloresAgotados.includes(color)) return;
    // Toggle: si ya está seleccionado, deseleccionar
    onColorSeleccionado(colorSeleccionado === color ? '' : color);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-end">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
          Color de Prenda
        </label>
        <AnimatePresence mode="wait">
          {colorSeleccionado && (
            <motion.span
              key={colorSeleccionado}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="text-[10px] font-bold text-rose-500 uppercase tracking-wide"
            >
              {colorSeleccionado}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Círculos de color */}
      <div className="flex flex-wrap gap-3">
        {todosLosColores.map((color) => {
          const isActive = colorSeleccionado === color;
          const isAgotado = coloresAgotados.includes(color);
          const colorBg = MAPA_COLORES[color] || '#e5e7eb';
          const needsDarkCheck = COLORES_CLAROS.has(color);

          return (
            <button
              key={color}
              onClick={() => handleClick(color)}
              disabled={isAgotado}
              className="group relative flex items-center justify-center"
              title={isAgotado ? `${color} (sin stock)` : color}
            >
              <motion.div
                whileHover={!isAgotado ? { scale: 1.12 } : {}}
                whileTap={!isAgotado ? { scale: 0.9 } : {}}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className={`
                  relative w-10 h-10 rounded-full border-2 transition-all duration-200 overflow-hidden
                  ${isActive
                    ? 'border-black ring-2 ring-offset-2 ring-black shadow-lg'
                    : isAgotado
                    ? 'border-gray-200 opacity-30 cursor-not-allowed'
                    : 'border-transparent hover:border-gray-300 hover:shadow-md cursor-pointer'
                  }
                `}
                style={{
                  background: colorBg,
                  boxShadow: color === 'Blanco' && !isActive
                    ? 'inset 0 0 0 1px #e5e7eb'
                    : undefined,
                }}
              >
                {/* Check activo */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Check
                        size={16}
                        strokeWidth={3}
                        className={needsDarkCheck ? 'text-gray-800' : 'text-white drop-shadow'}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tachado para agotados */}
                {isAgotado && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-px bg-gray-400 rotate-45 opacity-60" />
                  </div>
                )}
              </motion.div>

              {/* Tooltip */}
              <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-10 shadow-lg">
                {isAgotado ? `${color} · sin stock` : color}
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
              </span>
            </button>
          );
        })}
      </div>

      {/* Hint si hay agotados */}
      {coloresAgotados.length > 0 && (
        <p className="text-[10px] text-gray-400 italic">
          Los colores atenuados no tienen stock en la talla seleccionada.
        </p>
      )}
    </div>
  );
}