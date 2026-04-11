'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CotizacionesHeader() {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
          Gestión de Cotizaciones
        </h1>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
          Presupuestos y propuestas de venta
        </p>
      </div>
      <Button
        asChild
        className="bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase gap-2"
      >
        <Link href="/admin/Panel-Administrativo/cotizaciones/nueva">
          <Plus size={18} />
          Nueva Cotización
        </Link>
      </Button>
    </div>
  );
}
