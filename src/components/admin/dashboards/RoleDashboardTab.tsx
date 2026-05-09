
'use client';

import { useState } from 'react';
import { Crown, Palette, Scissors, Phone, Truck, Building, Box } from 'lucide-react';
import { cn } from '@/lib/utils';

const ROLE_TABS = [
  { key: 'gerente',              label: 'Gerencial',     icon: Crown,   color: 'text-amber-600'  },
  { key: 'administrador',        label: 'Admin',         icon: Crown,   color: 'text-rose-600'   },
  { key: 'recepcionista',        label: 'Recepción',     icon: Phone,   color: 'text-blue-600'   },
  { key: 'disenador',            label: 'Diseño',        icon: Palette, color: 'text-purple-600' },
  { key: 'cortador',             label: 'Corte',         icon: Scissors,color: 'text-green-600'  },
  { key: 'ayudante',             label: 'Producción',    icon: Truck,   color: 'text-orange-600' },
  { key: 'almacenero',           label: 'Almacén',       icon: Box,     color: 'text-sky-600'    },
  { key: 'representante_taller', label: 'Taller',        icon: Building,color: 'text-teal-600'   },
];

export default function RoleDashboardTabs({
  activeRole,
  onChange,
}: {
  activeRole: string;
  onChange: (role: string) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap mb-6 p-1 bg-slate-100 rounded-2xl w-fit">
      {ROLE_TABS.map(({ key, label, icon: Icon, color }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
            activeRole === key
              ? 'bg-white shadow-sm text-slate-900'
              : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
          )}
        >
          <Icon size={15} className={activeRole === key ? color : ''} />
          {label}
        </button>
      ))}
    </div>
  );
}