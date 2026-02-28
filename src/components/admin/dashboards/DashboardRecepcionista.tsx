"use client";

import React from "react";
import { 
  ShoppingCart, Users, Clock, Plus, 
  Search, ClipboardList, Wallet, ArrowUpRight,
  UserPlus, PackagePlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DashboardCharts from "./DashboardCharts";

type Usuario = {
  id: string | number;
  nombre_completo: string;
  rol: string;
  estado: string;
};

export default function DashboardRecepcionista({ usuario }: { usuario: Usuario }) {
  // Datos simulados para la vista de recepción
  const pedidosRecientes = [
    { id: "1024", cliente: "Ana García", total: "S/ 450", estado: "Pendiente", tiempo: "Hace 15 min" },
    { id: "1025", cliente: "Carlos Ruiz", total: "S/ 1,200", estado: "Confirmado", tiempo: "Hace 40 min" },
    { id: "1026", cliente: "Tienda Sur", total: "S/ 890", estado: "Pendiente", tiempo: "Hace 1 hora" },
  ];

  return (
    <div className="space-y-8 p-6 bg-[#fcfcfe] min-h-screen">
      
      {/* HEADER DE BIENVENIDA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            Atención al Cliente
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 italic">
            Bienvenido, {usuario.nombre_completo.split(' ')[0]} • Recepción Central
          </p>
        </div>
        
        <div className="flex bg-white p-2 rounded-3xl border border-slate-100 shadow-sm">
          <div className="px-6 py-2 text-right">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Caja del Día</p>
             <p className="text-xl font-black text-emerald-600">S/ 4,280.50</p>
          </div>
          <div className="w-px bg-slate-100 h-10 my-auto" />
          <div className="px-6 py-2">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estado</p>
             <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-900 uppercase">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> En Línea
             </span>
          </div>
        </div>
      </div>

      {/* KPI GRID - MÉTRICAS DE SERVICIO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard 
          title="Por Confirmar" 
          value="08" 
          icon={<Clock size={22} />} 
          color="orange" 
          detail="Pedidos web"
        />
        <KpiCard 
          title="Ventas Hoy" 
          value="12" 
          icon={<Wallet size={22} />} 
          color="blue" 
          detail="Procesadas hoy"
        />
        <KpiCard 
          title="Clientes Nuevos" 
          value="05" 
          icon={<UserPlus size={22} />} 
          color="emerald" 
          detail="Registrados hoy"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PANEL IZQUIERDO: OPERACIONES */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* ACCIONES RÁPIDAS - BOTONES GRANDES */}
          <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-6">Operaciones Rápidas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/dashboard/pedidos/nuevo" className="group">
                <div className="bg-slate-900 p-6 rounded-[2rem] text-white flex items-center justify-between hover:bg-slate-800 transition-all cursor-pointer shadow-lg shadow-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/10 p-3 rounded-2xl group-hover:rotate-6 transition-transform">
                      <PackagePlus size={24} />
                    </div>
                    <div>
                      <p className="font-black uppercase text-xs">Nuevo Pedido</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Registrar venta o proforma</p>
                    </div>
                  </div>
                  <Plus size={20} className="text-slate-500" />
                </div>
              </Link>

              <Link href="/dashboard/clientes/nuevo" className="group">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl group-hover:rotate-6 transition-transform">
                      <UserPlus size={24} />
                    </div>
                    <div>
                      <p className="font-black uppercase text-xs text-slate-800">Registrar Cliente</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Alta de nuevo usuario</p>
                    </div>
                  </div>
                  <Plus size={20} className="text-slate-200" />
                </div>
              </Link>
            </div>
          </div>

          {/* LISTA DE SEGUIMIENTO */}
          <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black uppercase text-slate-800 text-sm flex items-center gap-2">
                <ClipboardList size={18} className="text-blue-600" />
                Pendientes de Confirmación
              </h3>
              <button className="text-[10px] font-black text-blue-600 uppercase hover:underline">Ver todos</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="pb-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                    <th className="pb-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                    <th className="pb-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                    <th className="pb-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                    <th className="pb-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pedidosRecientes.map((p) => (
                    <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 text-xs font-black text-slate-400 italic">#{p.id}</td>
                      <td className="py-4">
                        <p className="text-[11px] font-black text-slate-800 uppercase leading-none">{p.cliente}</p>
                        <p className="text-[9px] text-slate-400 mt-1">{p.tiempo}</p>
                      </td>
                      <td className="py-4 text-xs font-black text-slate-900">{p.total}</td>
                      <td className="py-4">
                        <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase ${
                          p.estado === 'Pendiente' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {p.estado}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-slate-400 hover:text-blue-600 transition-all">
                          <ArrowUpRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: ANALÍTICA Y BÚSQUEDA */}
        <div className="lg:col-span-4 space-y-8">
          
          <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl text-white">
            <h3 className="font-black uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2">
              <Search className="text-blue-400" size={14} />
              Analítica de Ventas
            </h3>
            
            {/* Gráfica minimalista integrada (Ya sin error de TS) */}
            <DashboardCharts minimal={true} />

            <div className="mt-8 pt-8 border-t border-slate-800">
               <div className="flex justify-between items-center mb-4">
                  <p className="text-[9px] font-black text-slate-500 uppercase">Conversión hoy</p>
                  <p className="text-xs font-black text-white">78%</p>
               </div>
               <div className="w-full bg-slate-800 h-1.5 rounded-full">
                  <div className="bg-blue-500 h-full w-[78%] rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
               </div>
            </div>
          </div>

          <div className="bg-indigo-50 p-8 rounded-[3rem] border border-indigo-100 flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm">
              <ClipboardList size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-900 uppercase">Nota de Turno</p>
              <p className="text-[11px] text-indigo-700 italic font-medium leading-tight">
                "Hay 3 envíos por Olva Courier pendientes de recojo."
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// SUB-COMPONENTE KPI
function KpiCard({ title, value, icon, color, isAlert, detail }: any) {
  const colorMap: any = { 
    orange: 'bg-orange-50 text-orange-600', 
    blue: 'bg-blue-50 text-blue-600', 
    emerald: 'bg-emerald-50 text-emerald-600' 
  };
  
  return (
    <div className={`bg-white p-6 rounded-[2.5rem] border-2 transition-all group ${
      isAlert ? 'border-rose-100 shadow-lg' : 'border-transparent shadow-sm'
    }`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:-rotate-6 transition-transform ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      <div className="flex items-baseline gap-2 mt-2">
        <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter italic">{detail}</p>
      </div>
    </div>
  );
}