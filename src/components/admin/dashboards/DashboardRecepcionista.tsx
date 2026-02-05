"use client";

import React from "react";
import { ShoppingCart, Users, Clock } from "lucide-react";
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
  return (
    <div className="space-y-8 p-6 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Gestión de Recepción</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Pedidos y atención al cliente</p>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard 
          title="Pendientes" 
          value="8" 
          icon={<Clock />} 
          color="orange" 
        />
        <KpiCard 
          title="Pedidos Hoy" 
          value="12" 
          icon={<ShoppingCart />} 
          color="blue" 
        />
        <KpiCard 
          title="Clientes Nuevos" 
          value="5" 
          icon={<Users />} 
          color="emerald" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Acciones rápidas */}
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
          <h3 className="font-black uppercase text-slate-800 mb-6">Acciones Rápidas</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <Link href="/dashboard/pedidos/nuevo">
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase" size="lg">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Nuevo Pedido
              </Button>
            </Link>
            <Link href="/dashboard/clientes/nuevo">
              <Button variant="outline" className="w-full font-bold uppercase border-slate-200" size="lg">
                <Users className="mr-2 h-4 w-4" />
                Registrar Cliente
              </Button>
            </Link>
          </div>
        </div>

        {/* Pedidos pendientes */}
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
          <h3 className="font-black uppercase text-slate-800 mb-6">Pendientes de Confirmación</h3>
          <p className="text-sm text-slate-400">No hay pedidos pendientes</p>
        </div>

        {/* Gráficas */}
        <DashboardCharts />
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon, color, isAlert }: any) {
  const colors: any = { 
    rose: 'bg-rose-50 text-rose-600', 
    blue: 'bg-blue-50 text-blue-600', 
    emerald: 'bg-emerald-50 text-emerald-600', 
    orange: 'bg-orange-50 text-orange-600' 
  };
  return (
    <div className={`bg-white p-6 rounded-4xl border-2 transition-all ${isAlert ? 'border-rose-200 shadow-lg shadow-rose-100' : 'border-transparent shadow-sm'}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${colors[color]}`}>{icon}</div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}