'use client';

import { motion } from 'framer-motion';
import { Ruler } from 'lucide-react';

interface TallaSelectorProps {
  tallasDisponibles: string[];
  tallaSeleccionada: string | null;
  onTallaSeleccionada: (talla: string) => void;
}

export default function TallaSelector({ tallasDisponibles, tallaSeleccionada, onTallaSeleccionada }: TallaSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
          Tallas de Producción
        </label>
        <button className="flex items-center gap-1.5 text-[10px] font-bold text-gray-900 hover:text-rose-500 transition-colors uppercase">
          <Ruler size={14} /> Guía de medidas
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tallasDisponibles.map((talla) => {
          const isActive = tallaSeleccionada === talla;
          return (
            <motion.button
              key={talla}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTallaSeleccionada(talla)}
              className={`h-12 min-w-[3.5rem] px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center border-2 ${
                isActive 
                  ? 'border-black bg-black text-white shadow-lg' 
                  : 'border-gray-100 bg-white text-gray-900 hover:border-gray-300'
              }`}
            >
              {talla}
            </motion.button>
          );
        })}
      </div>
      
      {tallaSeleccionada && (
        <p className="text-[10px] text-gray-500 italic">
          * Las medidas de la talla <span className="font-bold text-gray-900">{tallaSeleccionada}</span> están sujetas a +/- 1cm de tolerancia en costura.
        </p>
      )}
    </div>
  );
}