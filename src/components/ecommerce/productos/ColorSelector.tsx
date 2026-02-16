'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ColorSelectorProps {
  coloresDisponibles: string[];
  colorSeleccionado: string | null;
  onColorSeleccionado: (color: string) => void;
}

// Mapa de colores basado en tus tipos de Supabase
const MAPA_COLORES: Record<string, string> = {
  'Blanco': '#ffffff',
  'Negro': '#000000',
  'Gris': '#9ca3af',
  'Beige': '#f5f5dc',
  'Marrón Pastel': '#b08d57',
  'Azul Jean': '#5dadec',
  'Azul Marino': '#000080',
  'Rojo': '#ef4444',
  'Rosa Pastel': '#ffdae0',
  'Morado Claro': '#d8b4fe',
  'Verde Olivo': '#556b2f',
  'Amarillo': '#facc15',
  'Naranja': '#fb923c',
  'Multicolor': 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)',
  'Único': '#e5e7eb'
};

export default function ColorSelector({ coloresDisponibles, colorSeleccionado, onColorSeleccionado }: ColorSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
          Color de Prenda
        </label>
        {colorSeleccionado && (
          <span className="text-[10px] font-bold text-rose-500 uppercase">{colorSeleccionado}</span>
        )}
      </div>
      
      <div className="flex flex-wrap gap-3">
        {coloresDisponibles.map((color) => {
          const isActive = colorSeleccionado === color;
          return (
            <button
              key={color}
              onClick={() => onColorSeleccionado(color)}
              className="group relative flex items-center justify-center"
              title={color}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`w-10 h-10 rounded-full border-2 transition-all ${
                  isActive ? 'border-black ring-2 ring-offset-2 ring-black' : 'border-transparent hover:border-gray-300'
                }`}
                style={{ 
                  background: MAPA_COLORES[color] || '#ccc',
                  boxShadow: color === 'Blanco' ? 'inset 0 0 0 1px #e5e7eb' : 'none' 
                }}
              >
                {isActive && (
                  <Check size={16} className={color === 'Blanco' || color === 'Rosa Pastel' ? 'text-black' : 'text-white'} strokeWidth={3} />
                )}
              </motion.div>
              
              {/* Tooltip simple */}
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {color}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}