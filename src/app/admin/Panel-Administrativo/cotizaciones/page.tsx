"use client";

import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Cotizacion {
  id: number;
  cotizacion_id: string;
  cliente: string;
  descripcion: string;
  monto: number;
  estado: 'pendiente' | 'aceptada' | 'rechazada' | 'expirada';
  fecha_vencimiento: string;
  fecha_creacion: string;
}

export default function CotizacionesPage() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filtroEstado !== 'todos') params.append('estado', filtroEstado);

      const response = await fetch(`/api/admin/cotizaciones?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Error al cargar cotizaciones');

      const { data } = await response.json();
      
      // Mapear datos del API
      const datosFormateados = data.map((item: any) => ({
        id: item.id,
        cotizacion_id: item.cotizacion_id,
        cliente: item.cliente,
        descripcion: item.descripcion,
        monto: item.monto,
        estado: item.estado,
        fecha_vencimiento: new Date(item.vencimiento).toISOString().split('T')[0],
        fecha_creacion: new Date(item.fechaCreacion).toISOString().split('T')[0]
      }));

      setCotizaciones(datosFormateados);
    } catch (error) {
      console.error('Error cargando cotizaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const cotizacionesFiltradas = cotizaciones.filter(c => 
    filtroEstado === 'todos' || c.estado === filtroEstado
  );

  const stats = {
    pendientes: cotizaciones.filter(c => c.estado === 'pendiente').length,
    aceptadas: cotizaciones.filter(c => c.estado === 'aceptada').length,
    totalValor: cotizaciones.filter(c => c.estado !== 'rechazada').reduce((sum, c) => sum + c.monto, 0)
  };

  const getEstadoBadge = (estado: string) => {
    const badges: any = {
      pendiente: { bg: 'bg-yellow-50', text: 'text-yellow-600', label: 'Pendiente' },
      aceptada: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Aceptada' },
      rechazada: { bg: 'bg-red-50', text: 'text-red-600', label: 'Rechazada' },
      expirada: { bg: 'bg-slate-50', text: 'text-slate-600', label: 'Expirada' }
    };
    return badges[estado];
  };

  return (
    <div className="space-y-8 p-6 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Gestión de Cotizaciones</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Presupuestos y propuestas de venta</p>
        </div>
        <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase gap-2">
          <Plus size={18} />
          Nueva Cotización
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard label="Pendientes" value={stats.pendientes} icon={<Calendar />} color="yellow" />
        <KpiCard label="Aceptadas" value={stats.aceptadas} icon={<CheckCircle2 />} color="emerald" />
        <KpiCard label="Valor Total" value={`S/ ${stats.totalValor.toLocaleString()}`} icon={<DollarSign />} color="blue" />
      </div>

      {/* FILTROS Y TABLA */}
      <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black uppercase text-slate-800">Cotizaciones</h3>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold uppercase bg-white">
            <option value="todos">Todos los Estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="aceptada">Aceptada</option>
            <option value="rechazada">Rechazada</option>
            <option value="expirada">Expirada</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase">Cotización</th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase">Cliente</th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase">Descripción</th>
                <th className="text-right py-3 px-4 text-[10px] font-black text-slate-400 uppercase">Monto</th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase">Estado</th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase">Vencimiento</th>
                <th className="text-center py-3 px-4 text-[10px] font-black text-slate-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cotizacionesFiltradas.map(cot => {
                const badge = getEstadoBadge(cot.estado);
                return (
                  <tr key={cot.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-4 font-bold text-slate-900">{cot.cotizacion_id}</td>
                    <td className="py-4 px-4 text-slate-700">{cot.cliente}</td>
                    <td className="py-4 px-4 text-slate-700 text-sm">{cot.descripcion}</td>
                    <td className="py-4 px-4 text-right font-bold text-slate-900">S/ {cot.monto.toLocaleString()}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-700 text-sm">{cot.fecha_vencimiento}</td>
                    <td className="py-4 px-4 text-center">
                      <button className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase">Ver</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon, color }: any) {
  const colors: any = {
    yellow: 'bg-yellow-50 text-yellow-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600'
  };
  return (
    <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${colors[color]}`}>{icon}</div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-slate-900 mt-2">{value}</p>
    </div>
  );
}
