"use client";

import React from 'react';
import { Eye, Clock, CheckCircle2, AlertCircle, Truck, XCircle } from 'lucide-react';
import type { pedidos, clientes } from '@prisma/client';
import { EstadoPedido } from '@prisma/client';
import { ROLE_PALETTES, type RolPaleta } from './DashboardUtils';

// ── Tipos correctos según schema.prisma ────────────────────────────────────
type Pedido = pedidos & {
  clientes: Pick<clientes, 'razon_social'> | null;
};

interface RecentOrdersTableProps {
  orders: Pedido[];
  rol?: RolPaleta;
}

// ── Estados reales del enum EstadoPedido ───────────────────────────────────
const STATUS_CONFIG: Record<EstadoPedido, { cls: string; icon: React.ReactNode; label: string }> = {
  pendiente:           { cls: 'bg-blue-50 text-blue-600 border-blue-100',     icon: <Clock size={11} />,        label: 'Pendiente'       },
  en_produccion:       { cls: 'bg-orange-50 text-orange-600 border-orange-100', icon: <AlertCircle size={11} />, label: 'En producción'   },
  listo_para_despacho: { cls: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: <Truck size={11} />,    label: 'Listo despacho'  },
  entregado:           { cls: 'bg-slate-100 text-slate-600 border-slate-200',  icon: <CheckCircle2 size={11} />, label: 'Entregado'       },
  cancelado:           { cls: 'bg-rose-50 text-rose-600 border-rose-100',      icon: <XCircle size={11} />,      label: 'Cancelado'       },
};

const FALLBACK_STATUS = {
  cls: 'bg-gray-50 text-gray-600 border-gray-100',
  icon: null,
  label: 'Sin estado',
};

// ── Componente ─────────────────────────────────────────────────────────────
export default function RecentOrdersTable({ orders, rol }: RecentOrdersTableProps) {
  const p = rol ? ROLE_PALETTES[rol] : null;
  const headColor  = p?.mid  ?? '#94a3b8';
  const titleColor = p?.text ?? '#1e293b';
  const btnBg      = p?.text ?? '#0f172a';

  // "pendiente" es el estado inicial real según el schema
  const pendientes = orders.filter((o) => o.estado === 'pendiente').length;

  return (
    <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100 w-full overflow-hidden">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3
            className="font-black uppercase tracking-tight text-base leading-none"
            style={{ color: titleColor }}
          >
            Pedidos Recientes
          </h3>
          <p className="text-slate-400 text-xs font-medium mt-1.5">
            Monitor en tiempo real del flujo operativo
          </p>
        </div>
        <button
          className="text-[10px] font-black uppercase text-white px-3 py-2 rounded-xl transition-all shadow-sm shrink-0"
          style={{ background: btnBg }}
        >
          Ver todos
        </button>
      </div>

      {/* Table */}
      {orders.length === 0 ? (
        <div className="py-10 text-center text-slate-300 text-sm">
          Sin pedidos recientes
        </div>
      ) : (
        <table className="w-full text-left border-separate border-spacing-y-2 table-fixed">
          <colgroup>
            <col className="w-[15%]" />
            <col className="w-[35%]" />
            <col className="w-[18%]" />
            <col className="w-[22%]" />
            <col className="w-[10%]" />
          </colgroup>
          <thead>
            <tr
              className="text-[9px] font-black uppercase tracking-widest"
              style={{ color: headColor }}
            >
              <th className="pb-3 pl-3">ID</th>
              <th className="pb-3">Cliente</th>
              <th className="pb-3">Total</th>
              <th className="pb-3">Estado</th>
              <th className="pb-3 text-right pr-3">Ver</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const cfg = order.estado
                ? (STATUS_CONFIG[order.estado] ?? FALLBACK_STATUS)
                : FALLBACK_STATUS;

              return (
                <tr key={String(order.id)} className="group">
                  <td className="py-3 pl-3 bg-slate-50 group-hover:bg-white rounded-l-2xl border-y border-l border-transparent group-hover:border-slate-200 transition-all">
                    <span className="font-black text-slate-900 text-[11px] italic">
                      #{String(order.id).padStart(5, '0')}
                    </span>
                  </td>

                  <td className="py-3 bg-slate-50 group-hover:bg-white border-y border-transparent group-hover:border-slate-200 transition-all">
                    <p className="font-bold text-slate-700 text-xs uppercase truncate pr-2">
                      {order.clientes?.razon_social || 'Consumidor General'}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString('es-PE', {
                            day: 'numeric',
                            month: 'short',
                          })
                        : 'Sin fecha'}
                    </p>
                  </td>

                  <td className="py-3 bg-slate-50 group-hover:bg-white border-y border-transparent group-hover:border-slate-200 transition-all">
                    <span className="font-black text-slate-900 text-xs">
                      {/* total es Decimal en Prisma, se convierte a Number para mostrar */}
                      S/ {Number(order.total ?? 0).toLocaleString('es-PE')}
                    </span>
                  </td>

                  <td className="py-3 bg-slate-50 group-hover:bg-white border-y border-transparent group-hover:border-slate-200 transition-all">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase border ${cfg.cls}`}
                    >
                      {cfg.icon}
                      <span className="truncate max-w-[70px]">{cfg.label}</span>
                    </span>
                  </td>

                  <td className="py-3 pr-3 rounded-r-2xl border-y border-r border-transparent group-hover:border-slate-200 bg-slate-50 group-hover:bg-white transition-all text-right">
                    <button className="p-2 hover:bg-slate-900 hover:text-white text-slate-400 rounded-xl transition-all inline-flex">
                      <Eye size={14} strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Footer — solo se muestra si hay pendientes */}
      {pendientes > 0 && (
        <div className="mt-5 p-3 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
          <AlertCircle size={14} className="text-blue-600 shrink-0" />
          <div>
            <p className="text-[9px] font-black text-blue-900 uppercase tracking-wider">
              {pendientes} Pedido{pendientes !== 1 ? 's' : ''} pendiente{pendientes !== 1 ? 's' : ''}
            </p>
            <p className="text-[8px] text-blue-600 font-bold uppercase">
              Requieren atención
            </p>
          </div>
        </div>
      )}
    </div>
  );
}