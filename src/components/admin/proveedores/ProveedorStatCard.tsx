// src/components/admin/proveedores/ProveedorStatCard.tsx
import { Building2 } from 'lucide-react';

const colorMap: Record<string, {
  border: string; ring: string; text: string; bg: string; iconBg: string;
}> = {
  rose:    { border: 'border-rose-500',    ring: 'ring-rose-50',    text: 'text-rose-600',    bg: 'bg-rose-50',    iconBg: 'bg-rose-600'    },
  emerald: { border: 'border-emerald-500', ring: 'ring-emerald-50', text: 'text-emerald-600', bg: 'bg-emerald-50', iconBg: 'bg-emerald-600' },
  orange:  { border: 'border-orange-500',  ring: 'ring-orange-50',  text: 'text-orange-600',  bg: 'bg-orange-50',  iconBg: 'bg-orange-600'  },
};

interface ProveedorStatCardProps {
  label:    string;
  value:    number;
  color:    string;
  isActive: boolean;
  onClick:  () => void;
}

export function ProveedorStatCard({ label, value, color, isActive, onClick }: ProveedorStatCardProps) {
  const c = colorMap[color] ?? colorMap.rose;

  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-xl border transition-all duration-300 flex items-center gap-3 cursor-pointer ${
        isActive
          ? `${c.border} ring-4 shadow-xl scale-[1.02] z-10 ${c.bg}`
          : 'bg-white border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-95'
      }`}
    >
      <div className={`p-2 rounded-lg transition-all ${isActive ? `${c.iconBg} text-white rotate-3` : 'bg-gray-100 text-gray-600'}`}>
        <Building2 className="w-5 h-5" />
      </div>
      <div className="text-left overflow-hidden">
        <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest truncate">{label}</p>
        <p className={`text-xl font-black tracking-tight ${isActive ? c.text : 'text-gray-800'}`}>{value}</p>
      </div>
    </button>
  );
}