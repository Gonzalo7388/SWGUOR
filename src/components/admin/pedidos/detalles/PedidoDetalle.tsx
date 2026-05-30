'use client';

import React from 'react';
import { Package, Clock, CreditCard, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { COMPANY_PALETTE } from '@/components/admin/dashboards/widgets/DashboardUtils';
import { PedidoDetalleHeader } from './PedidoDetalleHeader';
import { PedidoDetalleSidebar } from './PedidoDetalleSidebar';
import { TabItems }             from './TabItems';
import { TabSeguimiento }       from './TabSeguimiento';
import { TabPagos }             from './TabPagos';
import type { DetallePedidoData, TallerOption, TabId } from './types';

export type { DetallePedidoData, TallerOption };

const G = COMPANY_PALETTE;

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'items',       label: 'Items',       icon: Package    },
  { id: 'seguimiento', label: 'Seguimiento', icon: Clock      },
  { id: 'pagos',       label: 'Pagos',       icon: CreditCard },
];

interface PedidoDetalleProps {
  pedido:   DetallePedidoData;
  talleres: TallerOption[];
}

export default function PedidoDetalle({ pedido }: PedidoDetalleProps) {
  const [activeTab, setActiveTab] = React.useState<TabId>('items');

  return (
    <div className="max-w-[96rem] mx-auto px-4 py-6 space-y-5">

      <PedidoDetalleHeader pedido={pedido} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

        <PedidoDetalleSidebar pedido={pedido} />

        <div className="lg:col-span-3 space-y-4">

          <div className="flex gap-1 bg-white border border-stone-100 rounded-xl p-1 shadow-sm w-fit">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
                  activeTab === id
                    ? 'text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-700 hover:bg-stone-50'
                }`}
                style={activeTab === id ? { background: G.accent } : undefined}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>

          <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm">
            {activeTab === 'items'       && <TabItems       pedido={pedido} />}
            {activeTab === 'seguimiento' && <TabSeguimiento pedido={pedido} />}
            {activeTab === 'pagos'       && <TabPagos       pedido={pedido} />}
          </div>

        </div>
      </div>
    </div>
  );
}