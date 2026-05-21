'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface KpiItem {
  label: string;
  value: number;
  sub: string;
  icon: LucideIcon;
  href: string;
}

interface KpiCardsProps {
  kpis: KpiItem[];
}

export function KpiCards({ kpis }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Link 
            key={kpi.label} 
            href={kpi.href}
            className="group relative bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
          >
            <div className="absolute -top-2 -right-2 text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <Icon size={64} />
            </div>
            
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-[#d4af37] group-hover:text-white transition-colors duration-300 shrink-0">
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <h3 className="text-2xl font-black text-slate-900 leading-none">{kpi.value}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 truncate">{kpi.label}</p>
                <p className="text-[9px] font-medium text-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity duration-300 truncate mt-0.5">{kpi.sub}</p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}