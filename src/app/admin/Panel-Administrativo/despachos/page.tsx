"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Truck, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Despacho {
  id: number;
  despacho_id: string;
  orden_id: number;
  cliente: string;
  direccion: string;
  estado: 'preparando' | 'enviado' | 'transito' | 'entregado';
  transportista: string;
  tracking: string;
  fecha_despacho: string;
  fecha_entrega: string;
}

export default function DespachosPage() {
  const [despachos, setDespachos] = useState<Despacho[]>([]);
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

      const response = await fetch(`/api/admin/despachos?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Error al cargar despachos');

      const { data } = await response.json();
      
      // Mapear datos del API
      const datosFormateados = data.map((item: any) => ({
        id: item.id,
        despacho_id: item.despacho_id,
        orden_id: item.orden,
        cliente: item.cliente,
        direccion: item.direccion,
        estado: item.estado,
        transportista: item.transportista,
        tracking: item.tracking,
        fecha_despacho: new Date(item.fechaDespacho).toISOString().split('T')[0],
        fecha_entrega: item.fechaEntrega ? new Date(item.fechaEntrega).toISOString().split('T')[0] : 'Pendiente'
      }));

      setDespachos(datosFormateados);
    } catch (error) {
      console.error('Error cargando despachos:', error);
    } finally {
      setLoading(false);
    }
  };

  const despachosFiltrados = despachos.filter(d => 
    filtroEstado === 'todos' || d.estado === filtroEstado
  );

  const stats = {
    hoy: despachos.filter(d => d.fecha_despacho === '2026-02-04').length,
    transito: despachos.filter(d => d.estado === 'transito').length,
    entregados: despachos.filter(d => d.estado === 'entregado').length
  };

  const getEstadoBadge = (estado: string) => {
    const badges: any = {
      preparando: { bg: 'bg-yellow-50', text: 'text-yellow-600', label: 'Preparando' },
      enviado: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Enviado' },
      transito: { bg: 'bg-purple-50', text: 'text-purple-600', label: 'En Tránsito' },
      entregado: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Entregado' }
    };
    return badges[estado];
  };

  return (
    <div className="space-y-8 p-6 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Gestión de Despachos</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Control de envíos y entregas</p>
        </div>
        <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase gap-2">
          <Plus size={18} />
          Nuevo Despacho
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard label="Despachos Hoy" value={stats.hoy} icon={<Truck />} color="orange" />
        <KpiCard label="En Tránsito" value={stats.transito} icon={<MapPin />} color="purple" />
        <KpiCard label="Entregados" value={stats.entregados} icon={<Calendar />} color="emerald" />
      </div>

      {/* FILTROS Y TABLA */}
      <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black uppercase text-slate-800">Listado de Despachos</h3>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold uppercase bg-white">
            <option value="todos">Todos los Estados</option>
            <option value="preparando">Preparando</option>
            <option value="enviado">Enviado</option>
            <option value="transito">En Tránsito</option>
            <option value="entregado">Entregado</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase">Despacho</th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase">Orden</th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase">Cliente</th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase">Dirección</th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase">Estado</th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase">Transportista</th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase">Tracking</th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase">Entrega</th>
              </tr>
            </thead>
            <tbody>
              {despachosFiltrados.map(desp => {
                const badge = getEstadoBadge(desp.estado);
                return (
                  <tr key={desp.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-4 font-bold text-slate-900">{desp.despacho_id}</td>
                    <td className="py-4 px-4 text-slate-700">#{desp.orden_id}</td>
                    <td className="py-4 px-4 text-slate-700">{desp.cliente}</td>
                    <td className="py-4 px-4 text-slate-600 text-sm">{desp.direccion}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-700 text-sm">{desp.transportista}</td>
                    <td className="py-4 px-4">
                      <button className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase">
                        {desp.tracking}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-slate-700 text-sm">{desp.fecha_entrega}</td>
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
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600'
  };
  return (
    <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${colors[color]}`}>{icon}</div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-slate-900 mt-2">{value}</p>
    </div>
  );
}
