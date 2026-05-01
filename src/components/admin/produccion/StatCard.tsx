"use client";

import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color: "pink" | "emerald" | "orange";
  isActive: boolean;
  onClick: () => void;
}

export default function StatCard({ 
  title, 
  value, 
  icon, 
  color, 
  isActive, 
  onClick 
}: StatCardProps) {
  
  // Mapeo de estilos exacto a tu página de productos
  const styles: any = {
    pink: { 
      active: "border-pink-500 ring-pink-50 bg-white", 
      iconActive: "bg-pink-600 text-white", 
      iconDefault: "bg-pink-100 text-pink-600",
      textActive: "text-pink-600" 
    },
    emerald: { 
      active: "border-emerald-500 ring-emerald-50 bg-white", 
      iconActive: "bg-emerald-600 text-white", 
      iconDefault: "bg-emerald-100 text-emerald-600",
      textActive: "text-emerald-600" 
    },
    orange: { 
      active: "border-orange-500 ring-orange-50 bg-white", 
      iconActive: "bg-orange-600 text-white", 
      iconDefault: "bg-orange-100 text-orange-600",
      textActive: "text-orange-600" 
    }
  };

  const currentStyle = styles[color];

  return (
    <button 
      onClick={onClick} 
      className={`
        group p-5 rounded-2xl border transition-all duration-300 flex items-center gap-4 cursor-pointer w-full
        ${isActive 
          ? `ring-4 shadow-xl scale-[1.02] z-10 ${currentStyle.active}` 
          : 'bg-white border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-95'
        }
      `}
    >
      <div className={`
        p-3 rounded-xl transition-all duration-300
        ${isActive ? currentStyle.iconActive : currentStyle.iconDefault}
        group-hover:scale-110
      `}>
        {icon}
      </div>

      <div className="text-left">
        <p className={`
          text-[10px] font-bold uppercase tracking-widest transition-colors
          ${isActive ? currentStyle.textActive : 'text-slate-400'}
        `}>
          {title}
        </p>
        <p className="text-2xl font-black text-slate-900 leading-none mt-1">
          {value}
        </p>
      </div>
    </button>
  );
}