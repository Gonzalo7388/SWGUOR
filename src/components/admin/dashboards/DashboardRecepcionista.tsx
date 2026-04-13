"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Users, Calendar, ArrowRight, FileText, Plus, Search, Download, Filter } from 'lucide-react';
import {
  BarChart, 
  Bar,
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
} from 'recharts';

type Usuario = {
  id: string | number;
  nombre_completo: string;
  rol: string;
  estado: string;
};

export default function DashboardRecepcionista({ usuario }: { usuario: Usuario }) {
  const [ventasData, setVentasData] = useState<any[]>([]);
  const [distribucionData, setDistribucionData] = useState<any[]>([]);
  const [pedidosDiaData, setPedidosDiaData] = useState<any[]>([]);
  const [filtroActivo, setFiltroActivo] = useState(false);
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    setVentasData([
      { dia: 'L', pedidos: 8 },
      { dia: 'M', pedidos: 10 },
      { dia: 'Mi', pedidos: 12 },
      { dia: 'J', pedidos: 15 },
      { dia: 'V', pedidos: 14 },
      { dia: 'S', pedidos: 6 },
    ]);

    setDistribucionData([
      { name: 'Completadas', value: 60, color: '#E2725B' },
      { name: 'En Progreso', value: 25, color: '#C05A31' },
      { name: 'Pendientes', value: 15, color: '#F2D2BD' },
    ]);

    setPedidosDiaData([
      { hora: '09:00', cliente: 'María López', tipo: 'Cotización', canal: 'Presencial', estado: 'Atendido', estatusColor: 'exito' },
      { hora: '10:30', cliente: 'Carlos Ruiz', tipo: 'Pedido', canal: 'WhatsApp', estado: 'En Proceso', estatusColor: 'proceso' },
      { hora: '11:15', cliente: 'Tienda del Sur', tipo: 'Pedido', canal: 'Teléfono', estado: 'Pendiente', estatusColor: 'pendiente' },
    ]);
  }, []);

  const handleExportarDashboard = async () => {
    setExportando(true);
    try {
      // Preparar datos para CSV
      const fechaActual = new Date().toLocaleDateString('es-PE');
      const horaActual = new Date().toLocaleTimeString('es-PE');
      
      // Crear contenido CSV
      let csvContent = '';
      
      // Encabezado
      csvContent += 'CENTRO DE ATENCIÓN - DASHBOARD\n';
      csvContent += `Usuario,${usuario.nombre_completo}\n`;
      csvContent += `Fecha,${fechaActual}\n`;
      csvContent += `Hora,${horaActual}\n`;
      csvContent += '\n\n';
      
      // Estadísticas
      csvContent += 'ESTADÍSTICAS DEL DÍA\n';
      csvContent += 'Métrica,Valor,Cambio\n';
      csvContent += 'Pedidos Hoy,12,+3\n';
      csvContent += 'Cotizaciones Generadas,6,+2\n';
      csvContent += 'Clientes Atendidos,18,+5\n';
      csvContent += 'Citas Programadas,5,0\n';
      csvContent += '\n\n';
      
      // Tabla de Pedidos
      csvContent += 'PEDIDOS DEL DÍA\n';
      csvContent += 'Hora,Cliente,Tipo,Canal,Estado\n';
      pedidosDiaData.forEach(p => {
        csvContent += `${p.hora},"${p.cliente}",${p.tipo},${p.canal},${p.estado}\n`;
      });
      
      csvContent += '\n';
      csvContent += 'Distribución de Tareas\n';
      csvContent += 'Estado,Porcentaje\n';
      distribucionData.forEach(d => {
        csvContent += `${d.name},${d.value}%\n`;
      });
      
      // Crear blob y descargar como CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const enlace = document.createElement('a');
      const url = URL.createObjectURL(blob);
      enlace.setAttribute('href', url);
      enlace.setAttribute('download', `dashboard-recepcion-${new Date().toISOString().split('T')[0]}.csv`);
      enlace.style.visibility = 'hidden';
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
    } finally {
      setExportando(false);
    }
  };

  const toggleFiltro = () => {
    setFiltroActivo(!filtroActivo);
  };

  const kpis: Array<{
    label: string;
    value: string;
    cambio: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    iconColor: string;
    cambioPositivo: boolean;
  }> = [
    { label: 'Pedidos Hoy', value: '12', cambio: '+3', icon: Clock, color: 'text-[#E2725B]', bg: 'bg-[#FFF9F2]', iconColor: '#E2725B', cambioPositivo: true },
    { label: 'Cotizaciones Generadas', value: '6', cambio: '+2', icon: FileText, color: 'text-[#C05A31]', bg: 'bg-[#F0E4D0]', iconColor: '#C05A31', cambioPositivo: true },
    { label: 'Clientes Atendidos', value: '18', cambio: '+5', icon: Users, color: 'text-[#E2725B]', bg: 'bg-[#FFF9F2]', iconColor: '#E2725B', cambioPositivo: true },
    { label: 'Citas Programadas', value: '5', cambio: '0', icon: Calendar, color: 'text-[#C05A31]', bg: 'bg-[#F0E4D0]', iconColor: '#C05A31', cambioPositivo: false },
  ];

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 bg-[#f8fafc] min-h-screen">
      
      {/* Header Premium */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#2B1B12] tracking-tight flex items-center gap-3">
            Centro de Atención <span className="h-2 w-2 rounded-full bg-[#E2725B] animate-pulse" />
          </h1>
          <p className="text-[#C05A31] font-medium mt-1">Bienvenido, {usuario.nombre_completo.split(' ')[0]} • Recepción Central</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <button 
            onClick={toggleFiltro}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
              filtroActivo 
                ? 'bg-[#E2725B] text-white border border-[#C05A31]' 
                : 'bg-[#FFF9F2] border border-[#F2D2BD] text-[#2B1B12] hover:border-[#E2725B] hover:bg-[#F0E4D0]/50'
            }`}
          >
            <Filter className="w-4 h-4" /> Filtro
          </button>
          <button 
            onClick={handleExportarDashboard}
            disabled={exportando}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#FFF9F2] border border-[#F2D2BD] rounded-xl text-sm font-bold text-[#2B1B12] hover:border-[#E2725B] hover:bg-[#F0E4D0]/50 transition-all shadow-sm disabled:opacity-50"
          >
            {exportando ? (
              <div className="w-4 h-4 border-2 border-[#C05A31] border-t-[#E2725B] rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Exportar
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2.5 bg-[#FFF9F2] border border-[#F2D2BD] rounded-xl text-sm font-bold text-[#2B1B12] hover:border-[#E2725B] hover:bg-[#F0E4D0]/50 transition-all shadow-sm"
          >
            <Search className="w-4 h-4" /> Buscar
          </button>
        </div>
      </header>

      {/* Panel de Filtros Rápido */}
      {filtroActivo && (
        <div className="bg-gradient-to-r from-[#FFF9F2] to-[#F0E4D0] border border-[#F2D2BD] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-[#2B1B12] uppercase tracking-widest">Filtros Rápidos</h3>
            <button 
              onClick={() => setFiltroActivo(false)}
              className="text-[#C05A31] hover:text-[#E2725B] transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#C05A31] uppercase">Estado</label>
              <select className="w-full px-3 py-2 rounded-lg border border-[#F2D2BD] bg-[#FFF9F2] text-sm font-medium text-[#2B1B12] focus:outline-none focus:border-[#E2725B]">
                <option>Todos</option>
                <option>Pendiente</option>
                <option>En Proceso</option>
                <option>Completado</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#C05A31] uppercase">Rango Fechas</label>
              <input type="date" className="w-full px-3 py-2 rounded-lg border border-[#F2D2BD] bg-[#FFF9F2] text-sm font-medium text-[#2B1B12] focus:outline-none focus:border-[#E2725B]" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#C05A31] uppercase">Prioridad</label>
              <select className="w-full px-3 py-2 rounded-lg border border-[#F2D2BD] bg-[#FFF9F2] text-sm font-medium text-[#2B1B12] focus:outline-none focus:border-[#E2725B]">
                <option>Todas</option>
                <option>Alta</option>
                <option>Media</option>
                <option>Baja</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#C05A31] uppercase">Cliente</label>
              <input type="text" placeholder="Buscar cliente..." className="w-full px-3 py-2 rounded-lg border border-[#F2D2BD] bg-[#FFF9F2] text-sm font-medium text-[#2B1B12] placeholder-[#C05A31] focus:outline-none focus:border-[#E2725B]" />
            </div>
          </div>

          <div className="flex gap-3 mt-4 pt-4 border-t border-[#F2D2BD]">
            <button className="px-4 py-2 bg-[#E2725B] text-white rounded-lg text-[10px] font-bold uppercase hover:bg-[#C05A31] transition-all">
              Aplicar Filtros
            </button>
            <button className="px-4 py-2 bg-[#FFF9F2] border border-[#F2D2BD] text-[#2B1B12] rounded-lg text-[10px] font-bold uppercase hover:bg-[#F0E4D0] transition-all">
              Limpiar
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Pedidos Hoy" 
          value={12} 
          cambio="+3"
          icon={Clock} 
          color="terracota"
        />
        <StatCard 
          label="Cotizaciones Generadas" 
          value={6} 
          cambio="+2"
          icon={FileText} 
          color="melocoton"
        />
        <StatCard 
          label="Clientes Atendidos" 
          value={18} 
          cambio="+5"
          icon={Users} 
          color="arcilla"
        />
        <StatCard 
          label="Citas Programadas" 
          value={5} 
          cambio="0"
          icon={Calendar} 
          color="dorado"
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Contenido Principal */}
        <main className="lg:col-span-8 space-y-6">
          {/* Pedidos Recibidos por Semana */}
          <div className="bg-[#FFF9F2] p-6 rounded-3xl shadow-sm border border-[#F2D2BD] overflow-hidden hover:shadow-md transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-black uppercase text-[#2B1B12] tracking-widest">Pedidos Recibidos por Semana</h2>
              <span className="text-xs font-bold text-[#C05A31] bg-[#FFF9F2] px-3 py-1 rounded-lg">2024</span>
            </div>
            
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ventasData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0e4d0" vertical={false} />
                  <XAxis 
                    dataKey="dia" 
                    stroke="#C05A31"
                    style={{ fontSize: '12px', fontWeight: 600 }}
                  />
                  <YAxis stroke="#C05A31" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFF9F2', 
                      border: '1px solid #F2D2BD',
                      borderRadius: '8px',
                      padding: '8px 12px'
                    }}
                  />
                  <Bar dataKey="pedidos" fill="#E2725B" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabla de Pedidos del Día */}
          <div className="bg-[#FFF9F2] p-6 rounded-3xl shadow-sm border border-[#F2D2BD] overflow-hidden hover:shadow-md transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black uppercase text-[#2B1B12] text-sm">Pedidos del Día</h3>
              <button className="text-xs font-bold text-[#E2725B] hover:text-[#C05A31] flex items-center gap-1 transition-colors">
                Ver Todos <ArrowRight size={12} />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#F0E4D0]">
                    <th className="pb-3 text-left font-black text-[#C05A31] uppercase tracking-widest text-[10px]">Hora</th>
                    <th className="pb-3 text-left font-black text-[#C05A31] uppercase tracking-widest text-[10px]">Cliente</th>
                    <th className="pb-3 text-left font-black text-[#C05A31] uppercase tracking-widest text-[10px]">Tipo</th>
                    <th className="pb-3 text-left font-black text-[#C05A31] uppercase tracking-widest text-[10px]">Canal</th>
                    <th className="pb-3 text-left font-black text-[#C05A31] uppercase tracking-widest text-[10px]">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E4D0]">
                  {pedidosDiaData.map((p, idx) => (
                    <tr key={idx} className="hover:bg-[#FFF9F2]/50 transition-colors">
                      <td className="py-4 font-bold text-[#2B1B12] text-[10px]">{p.hora}</td>
                      <td className="py-4">
                        <p className="font-black text-[#2B1B12] text-[10px]">{p.cliente}</p>
                      </td>
                      <td className="py-4 text-[10px] text-[#C05A31]">{p.tipo}</td>
                      <td className="py-4 text-[10px] text-[#C05A31]">{p.canal}</td>
                      <td className="py-4">
                        <span className={`text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase inline-block ${
                          p.estatusColor === 'emerald' ? 'bg-[#F0E4D0] text-[#C05A31] border border-[#F2D2BD]' :
                          p.estatusColor === 'blue' ? 'bg-[#F0E4D0] text-[#E2725B] border border-[#F2D2BD]' :
                          'bg-[#F2D2BD] text-[#E2725B] border border-[#F0E4D0]'
                        }`}>
                          {p.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Barra Lateral */}
        <aside className="lg:col-span-4 space-y-6 pb-6">
          
          {/* Distribución de Tareas */}
          <div className="bg-[#FFF9F2] p-6 rounded-3xl shadow-sm border border-[#F2D2BD] overflow-hidden hover:shadow-md transition-all">
            <h3 className="font-black uppercase text-[#2B1B12] text-xs mb-6 tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#E2725B] rounded-full" />
              Distribución de Tareas
            </h3>
            
            <div className="h-40 w-full flex items-center justify-center mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribucionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {distribucionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3 border-t border-[#F0E4D0] pt-4">
              {distribucionData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between hover:bg-[#FFF9F2] p-2 rounded-lg transition-all">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[9px] font-bold text-[#C05A31]">{item.name}</span>
                  </div>
                  <span className="text-[9px] font-black text-[#2B1B12] px-2 py-0.5 bg-[#FFF9F2] rounded">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="bg-[#FFF9F2] rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all border border-[#F2D2BD]">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#C05A31] mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#E2725B] rounded-full" />
              Acciones Rápidas
            </h3>
            
            <div className="space-y-3">
              <Link 
                href="/admin/Panel-Administrativo/pedidos/nuevo"
                className="block w-full bg-[#E2725B] text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#C05A31] transition-all text-center shadow-lg shadow-[#E2725B]/20"
              >
                + Nuevo Pedido
              </Link>
              <Link 
                href="/admin/Panel-Administrativo/clientes"
                className="block w-full bg-[#C05A31] text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#E2725B] transition-all text-center shadow-lg shadow-[#C05A31]/20"
              >
                + Registrar Cliente
              </Link>
            </div>
          </div>

          {/* Nota de Turno */}
          <div className="bg-gradient-to-br from-[#FFF9F2] to-[#F0E4D0] p-6 rounded-3xl border border-[#F2D2BD] overflow-hidden shadow-sm hover:shadow-md transition-all">
            <p className="text-[9px] font-black text-[#C05A31] uppercase mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#E2725B] rounded-full" />
              Nota de Turno
            </p>
            <p className="text-[10px] text-[#2B1B12] font-medium leading-relaxed">
              3 envíos por Olva Courier pendientes de recojo. Coordinado con logística.
            </p>
          </div>

        </aside>

      </div>
    </div>
  );
}

function StatCard({ label, value, cambio, icon: Icon, color }: any) {
  const colors: any = {
    terracota: 'text-[#E2725B] bg-[#F0E4D0] border-[#F2D2BD]',
    melocoton: 'text-[#F2D2BD] bg-[#FFF9F2] border-[#F2D2BD]',
    arcilla: 'text-[#C05A31] bg-[#F0E4D0] border-[#F2D2BD]',
    dorado: 'text-[#E2725B] bg-[#F0E4D0] border-[#F2D2BD]',
    exito: 'text-[#C05A31] bg-[#F0E4D0] border-[#F2D2BD]',
    proceso: 'text-[#E2725B] bg-[#FFF9F2] border-[#F2D2BD]',
    pendiente: 'text-[#C05A31] bg-[#F0E4D0] border-[#F2D2BD]',
  };

  const borderColor: any = {
    terracota: 'border-[#F2D2BD]',
    melocoton: 'border-[#F2D2BD]',
    arcilla: 'border-[#F2D2BD]',
    dorado: 'border-[#F2D2BD]',
    pink: 'border-pink-200',
    blue: 'border-blue-200',
    amber: 'border-amber-200',
    emerald: 'border-emerald-200',
    indigo: 'border-indigo-200',
  };

  return (
    <div className={`p-5 rounded-3xl bg-[#FFF9F2] border shadow-sm transition-all hover:shadow-md ${borderColor[color]}`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black text-[#C05A31] uppercase tracking-tighter">{label}</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-black text-[#2B1B12] leading-none mt-0.5">{value}</p>
            <p className="text-[10px] font-bold text-[#E2725B]">{cambio}</p>
          </div>
        </div>
      </div>
    </div>
  );
}