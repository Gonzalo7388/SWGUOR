"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Clock, Users, Calendar, ArrowRight, FileText, 
  Plus, Search, Download, Filter, MessageCircle, 
  UserPlus, MapPin, Zap, ChevronRight,
  BarChart3
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

// ─── CONFIGURACIÓN DE ESTILO: RECEPCIONISTA (Pink/Fuchsia) ─────────────────
const R = {
  accent:  '#be185d', // pink-700
  bg:      '#fce7f3', // pink-100
  soft:    '#fdf2f8', // pink-50
  border:  '#fbcfe8', // pink-200
  text:    '#500724', // pink-950
  mid:     '#db2777', // pink-600
};

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
    // Simulación de carga de datos
    setVentasData([
      { dia: 'Lun', pedidos: 8 }, { dia: 'Mar', pedidos: 10 }, { dia: 'Mié', pedidos: 12 },
      { dia: 'Jue', pedidos: 15 }, { dia: 'Vie', pedidos: 14 }, { dia: 'Sáb', pedidos: 6 },
    ]);
    setDistribucionData([
      { name: 'Completadas', value: 60, color: R.accent },
      { name: 'En Progreso', value: 25, color: R.mid },
      { name: 'Pendientes',  value: 15, color: R.border },
    ]);
    setPedidosDiaData([
      { hora: '09:00', cliente: 'María López',   tipo: 'Cotización', canal: 'Presencial', estado: 'Atendido',   estatusColor: 'exito'    },
      { hora: '10:30', cliente: 'Carlos Ruiz',   tipo: 'Pedido',     canal: 'WhatsApp',   estado: 'En Proceso', estatusColor: 'proceso'  },
      { hora: '11:15', cliente: 'Tienda del Sur', tipo: 'Pedido',     canal: 'Teléfono',   estado: 'Pendiente',  estatusColor: 'pendiente'},
    ]);
  }, []);

  const handleExportarDashboard = async () => {
    setExportando(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulación
    // Lógica de exportación CSV...
    setExportando(false);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 min-h-screen" style={{ background: R.soft }}>

      {/* HEADER DE BIENVENIDA */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white" style={{ background: R.accent }}>
              Front Desk
            </span>
            <span className="text-[10px] font-bold text-pink-400">Abril 2026</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none" style={{ color: R.text }}>
            Centro de Atención
          </h1>
          <p className="font-medium mt-2 flex items-center gap-2" style={{ color: R.mid }}>
            Gestión de recepción · {usuario.nombre_completo}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={() => setFiltroActivo(!filtroActivo)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition-all border shadow-sm"
            style={filtroActivo ? { background: R.accent, color: '#fff', borderColor: R.accent } : { background: '#fff', borderColor: R.border, color: R.text }}>
            <Filter size={16} /> FILTRAR
          </button>
          <button onClick={handleExportarDashboard} disabled={exportando}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition-all border bg-white shadow-sm"
            style={{ borderColor: R.border, color: R.text }}>
            {exportando ? <Zap className="animate-spin" size={16} /> : <Download size={16} />} 
            EXPORTAR
          </button>
        </div>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard label="Pedidos Hoy" value="12" cambio="+3" icon={Clock} color={R.accent} />
        <KpiCard label="Cotizaciones" value="06" cambio="+2" icon={FileText} color={R.mid} />
        <KpiCard label="Clientes Atendidos" value="18" cambio="+5" icon={Users} color="#831843" />
        <KpiCard label="Citas Programadas" value="05" cambio="0" icon={Calendar} color={R.accent} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PANEL PRINCIPAL: GRÁFICO Y TABLA */}
        <main className="lg:col-span-8 space-y-8">
          
          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm" style={{ borderColor: R.border }}>
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight" style={{ color: R.text }}>Flujo de Pedidos</h3>
                <p className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">Actividad Semanal</p>
              </div>
              <div className="p-3 rounded-2xl bg-pink-50 text-pink-600">
                <BarChart3 size={20} />
              </div>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ventasData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fdf2f8" />
                  <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: R.mid}} />
                  <YAxis hide />
                  <Tooltip cursor={{fill: '#fce7f3'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="pedidos" fill={R.accent} radius={[6, 6, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden" style={{ borderColor: R.border }}>
            <div className="p-8 flex justify-between items-center bg-white border-b border-pink-50">
              <h3 className="text-sm font-black uppercase tracking-widest" style={{ color: R.text }}>Bitácora de Atención</h3>
              <button className="text-[10px] font-black flex items-center gap-2 hover:gap-3 transition-all uppercase tracking-widest" style={{ color: R.accent }}>
                Ver histórico <ChevronRight size={14} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-pink-50/50">
                    {['Hora', 'Cliente', 'Canal', 'Estado'].map(h => (
                      <th key={h} className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest" style={{ color: R.mid }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50">
                  {pedidosDiaData.map((p, idx) => (
                    <tr key={idx} className="hover:bg-pink-50/30 transition-colors">
                      <td className="px-8 py-5 text-xs font-bold text-pink-900">{p.hora}</td>
                      <td className="px-8 py-5">
                        <p className="text-xs font-black" style={{ color: R.text }}>{p.cliente}</p>
                        <p className="text-[10px] font-medium text-pink-400">{p.tipo}</p>
                      </td>
                      <td className="px-8 py-5 text-[10px] font-bold uppercase text-pink-500">{p.canal}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                          p.estatusColor === 'exito' ? 'bg-green-50 text-green-700 border-green-100' : 
                          p.estatusColor === 'proceso' ? 'bg-pink-50 text-pink-700 border-pink-100' : 
                          'bg-amber-50 text-amber-700 border-amber-100'
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

        {/* SIDEBAR: ACCIONES Y NOTAS */}
        <aside className="lg:col-span-4 space-y-6">
          
          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm" style={{ borderColor: R.border }}>
            <h3 className="text-xs font-black uppercase tracking-widest mb-8 text-pink-400">Distribución de Carga</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distribucionData} innerRadius={50} outerRadius={75} paddingAngle={8} dataKey="value">
                    {distribucionData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-4">
              {distribucionData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-pink-50/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                    <span className="text-[10px] font-bold text-pink-800">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-black" style={{ color: R.accent }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#500724] rounded-[2.5rem] p-8 text-white shadow-xl">
            <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <Zap size={14} className="text-pink-400" /> Acciones Rápidas
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <QuickAction label="Nuevo Pedido" icon={Plus} href="/admin/pedidos/nuevo" primary />
              <QuickAction label="Registrar Cliente" icon={UserPlus} href="/admin/clientes" />
              <QuickAction label="Consultar Stock" icon={Search} href="/admin/inventario" />
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] border-2 border-dashed border-pink-200" style={{ background: R.bg }}>
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle size={16} style={{ color: R.accent }} />
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: R.accent }}>Nota de Turno</p>
            </div>
            <p className="text-xs font-medium leading-relaxed italic" style={{ color: R.text }}>
              "Recordar confirmar con el cliente de 'Tienda del Sur' si el recojo será por agencia o en local antes de las 5 PM."
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── COMPONENTES AUXILIARES ────────────────────────────────────────────────

function KpiCard({ label, value, cambio, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border shadow-sm hover:translate-y-[-4px] transition-all" style={{ borderColor: R.border }}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-2xl" style={{ background: `${color}15`, color: color }}>
          <Icon size={22} />
        </div>
        <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-green-50 text-green-600">{cambio}</span>
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-pink-400 mb-1">{label}</p>
      <p className="text-3xl font-black tracking-tighter" style={{ color: R.text }}>{value}</p>
    </div>
  );
}

function QuickAction({ label, icon: Icon, href, primary }: any) {
  return (
    <Link href={href} className={`flex items-center justify-between p-4 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest ${
      primary ? 'bg-pink-600 text-white shadow-lg hover:bg-pink-500' : 'bg-white/10 text-white hover:bg-white/20'
    }`}>
      <div className="flex items-center gap-3">
        <Icon size={16} />
        {label}
      </div>
      <ChevronRight size={14} />
    </Link>
  );
}