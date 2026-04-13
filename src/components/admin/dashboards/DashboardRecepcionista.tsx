"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Users, Calendar, ArrowRight, FileText, Plus, Search, Download, Filter } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

// ─── PALETA ROL: RECEPCIONISTA — pink-100 / pink-700 ─────────────────────────
const ROLE_ACCENT  = '#be185d'; // pink-700
const ROLE_BG      = '#fce7f3'; // pink-100
const ROLE_BG_SOFT = '#fdf2f8'; // pink-50
const ROLE_BORDER  = '#fbcfe8'; // pink-200
const ROLE_TEXT    = '#500724'; // pink-950
const ROLE_MID     = '#db2777'; // pink-600

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
      { dia: 'L', pedidos: 8 }, { dia: 'M', pedidos: 10 }, { dia: 'Mi', pedidos: 12 },
      { dia: 'J', pedidos: 15 }, { dia: 'V', pedidos: 14 }, { dia: 'S', pedidos: 6 },
    ]);
    setDistribucionData([
      { name: 'Completadas', value: 60, color: ROLE_ACCENT },
      { name: 'En Progreso', value: 25, color: ROLE_MID },
      { name: 'Pendientes',  value: 15, color: ROLE_BG   },
    ]);
    setPedidosDiaData([
      { hora: '09:00', cliente: 'María López',   tipo: 'Cotización', canal: 'Presencial', estado: 'Atendido',  estatusColor: 'exito'    },
      { hora: '10:30', cliente: 'Carlos Ruiz',   tipo: 'Pedido',     canal: 'WhatsApp',   estado: 'En Proceso', estatusColor: 'proceso'  },
      { hora: '11:15', cliente: 'Tienda del Sur', tipo: 'Pedido',    canal: 'Teléfono',   estado: 'Pendiente',  estatusColor: 'pendiente'},
    ]);
  }, []);

  const handleExportarDashboard = async () => {
    setExportando(true);
    try {
      const fechaActual = new Date().toLocaleDateString('es-PE');
      const horaActual = new Date().toLocaleTimeString('es-PE');
      let csvContent = `CENTRO DE ATENCIÓN - DASHBOARD\nUsuario,${usuario.nombre_completo}\nFecha,${fechaActual}\nHora,${horaActual}\n\n`;
      csvContent += 'ESTADÍSTICAS DEL DÍA\nMétrica,Valor,Cambio\nPedidos Hoy,12,+3\nCotizaciones Generadas,6,+2\nClientes Atendidos,18,+5\nCitas Programadas,5,0\n\n';
      csvContent += 'PEDIDOS DEL DÍA\nHora,Cliente,Tipo,Canal,Estado\n';
      pedidosDiaData.forEach(p => { csvContent += `${p.hora},"${p.cliente}",${p.tipo},${p.canal},${p.estado}\n`; });
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const enlace = document.createElement('a');
      enlace.setAttribute('href', URL.createObjectURL(blob));
      enlace.setAttribute('download', `dashboard-recepcion-${new Date().toISOString().split('T')[0]}.csv`);
      enlace.style.visibility = 'hidden';
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
    } finally {
      setExportando(false);
    }
  };

  const kpis = [
    { label: 'Pedidos Hoy',            value: '12', cambio: '+3', icon: Clock    },
    { label: 'Cotizaciones Generadas', value: '6',  cambio: '+2', icon: FileText },
    { label: 'Clientes Atendidos',     value: '18', cambio: '+5', icon: Users    },
    { label: 'Citas Programadas',      value: '5',  cambio: '0',  icon: Calendar },
  ];

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 min-h-screen" style={{ background: ROLE_BG_SOFT }}>

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3" style={{ color: ROLE_TEXT }}>
            Centro de Atención
            <span className="h-2 w-2 rounded-full animate-pulse inline-block" style={{ background: ROLE_ACCENT }} />
          </h1>
          <p className="font-medium mt-1" style={{ color: ROLE_MID }}>
            Bienvenida, {usuario.nombre_completo.split(' ')[0]} · Recepción Central
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <button onClick={() => setFiltroActivo(!filtroActivo)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border"
            style={filtroActivo
              ? { background: ROLE_ACCENT, color: '#fff', borderColor: ROLE_ACCENT }
              : { background: ROLE_BG_SOFT, borderColor: ROLE_BORDER, color: ROLE_TEXT }}>
            <Filter className="w-4 h-4" /> Filtro
          </button>
          <button onClick={handleExportarDashboard} disabled={exportando}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border disabled:opacity-50"
            style={{ background: ROLE_BG_SOFT, borderColor: ROLE_BORDER, color: ROLE_TEXT }}>
            {exportando
              ? <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: ROLE_BORDER, borderTopColor: ROLE_ACCENT }} />
              : <Download className="w-4 h-4" />}
            Exportar
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border"
            style={{ background: ROLE_BG_SOFT, borderColor: ROLE_BORDER, color: ROLE_TEXT }}>
            <Search className="w-4 h-4" /> Buscar
          </button>
        </div>
      </header>

      {/* Filtros */}
      {filtroActivo && (
        <div className="border rounded-3xl p-6" style={{ background: ROLE_BG, borderColor: ROLE_BORDER }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: ROLE_TEXT }}>Filtros Rápidos</h3>
            <button onClick={() => setFiltroActivo(false)} className="text-xs font-bold" style={{ color: ROLE_MID }}>Cerrar</button>
          </div>
          <div className="flex flex-wrap gap-3">
            {['Hoy', 'Esta Semana', 'Este Mes', 'Atendidos', 'Pendientes', 'En Proceso'].map(f => (
              <button key={f} className="px-4 py-2 rounded-xl text-xs font-bold border transition-all"
                style={{ background: '#fff', borderColor: ROLE_BORDER, color: ROLE_TEXT }}>
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map(({ label, value, cambio, icon: Icon }) => (
          <div key={label} className="p-5 rounded-3xl bg-white border shadow-sm hover:shadow-md transition-all" style={{ borderColor: ROLE_BORDER }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: ROLE_BG }}>
                <Icon className="w-6 h-6" style={{ color: ROLE_ACCENT }} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-tighter" style={{ color: ROLE_MID }}>{label}</p>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-black leading-none mt-0.5" style={{ color: ROLE_TEXT }}>{value}</p>
                  <p className="text-[10px] font-bold" style={{ color: ROLE_ACCENT }}>{cambio}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cuerpo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <main className="lg:col-span-8 space-y-6">

          {/* Gráfico barras */}
          <div className="bg-white p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all" style={{ borderColor: ROLE_BORDER }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black uppercase text-sm" style={{ color: ROLE_TEXT }}>Pedidos Recibidos por Semana</h3>
              <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ background: ROLE_BG, color: ROLE_MID }}>2024</span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ventasData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={ROLE_BG} />
                  <XAxis dataKey="dia" tick={{ fontSize: 11, fill: ROLE_MID }} axisLine={false} />
                  <YAxis axisLine={false} tick={{ fontSize: 11, fill: ROLE_MID }} />
                  <Tooltip
                    contentStyle={{ background: ROLE_TEXT, border: 'none', borderRadius: 12, color: '#fff' }}
                    labelStyle={{ color: ROLE_BG }}
                  />
                  <Bar dataKey="pedidos" fill={ROLE_ACCENT} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all" style={{ borderColor: ROLE_BORDER }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black uppercase text-sm" style={{ color: ROLE_TEXT }}>Pedidos del Día</h3>
              <button className="text-xs font-bold flex items-center gap-1 transition-colors" style={{ color: ROLE_ACCENT }}>
                Ver Todos <ArrowRight size={12} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: ROLE_BG }}>
                    {['Hora', 'Cliente', 'Tipo', 'Canal', 'Estado'].map(h => (
                      <th key={h} className="pb-3 text-left font-black uppercase tracking-widest text-[10px]" style={{ color: ROLE_MID }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ '--tw-divide-opacity': '1' } as any}>
                  {pedidosDiaData.map((p, idx) => (
                    <tr key={idx} className="transition-colors">
                      <td className="py-4 font-bold text-[10px]" style={{ color: ROLE_TEXT }}>{p.hora}</td>
                      <td className="py-4 font-black text-[10px]" style={{ color: ROLE_TEXT }}>{p.cliente}</td>
                      <td className="py-4 text-[10px]" style={{ color: ROLE_MID }}>{p.tipo}</td>
                      <td className="py-4 text-[10px]" style={{ color: ROLE_MID }}>{p.canal}</td>
                      <td className="py-4">
                        <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase border inline-block"
                          style={
                            p.estatusColor === 'exito'
                              ? { background: ROLE_BG, color: ROLE_ACCENT, borderColor: ROLE_BORDER }
                              : p.estatusColor === 'proceso'
                              ? { background: ROLE_BG_SOFT, color: ROLE_MID, borderColor: ROLE_BORDER }
                              : { background: '#fff7ed', color: '#c2410c', borderColor: '#fed7aa' }
                          }>
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

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-6 pb-6">

          {/* Donut */}
          <div className="bg-white p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all" style={{ borderColor: ROLE_BORDER }}>
            <h3 className="font-black uppercase text-xs mb-6 tracking-widest flex items-center gap-2" style={{ color: ROLE_TEXT }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: ROLE_ACCENT }} />
              Distribución de Tareas
            </h3>
            <div className="h-40 w-full flex items-center justify-center mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distribucionData} cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={2} dataKey="value">
                    {distribucionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 border-t pt-4" style={{ borderColor: ROLE_BG }}>
              {distribucionData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                    <span className="text-[9px] font-bold" style={{ color: ROLE_MID }}>{item.name}</span>
                  </div>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded" style={{ background: ROLE_BG, color: ROLE_TEXT }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="bg-white rounded-3xl p-6 border shadow-sm" style={{ borderColor: ROLE_BORDER }}>
            <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: ROLE_MID }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: ROLE_ACCENT }} />
              Acciones Rápidas
            </h3>
            <div className="space-y-3">
              <Link href="/admin/Panel-Administrativo/pedidos/nuevo"
                className="block w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center text-white transition-all"
                style={{ background: ROLE_ACCENT }}>
                + Nuevo Pedido
              </Link>
              <Link href="/admin/Panel-Administrativo/clientes"
                className="block w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center text-white transition-all"
                style={{ background: ROLE_MID }}>
                + Registrar Cliente
              </Link>
            </div>
          </div>

          {/* Nota de turno */}
          <div className="p-6 rounded-3xl border" style={{ background: ROLE_BG, borderColor: ROLE_BORDER }}>
            <p className="text-[9px] font-black uppercase mb-2 flex items-center gap-2" style={{ color: ROLE_MID }}>
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: ROLE_ACCENT }} />
              Nota de Turno
            </p>
            <p className="text-[10px] font-medium leading-relaxed" style={{ color: ROLE_TEXT }}>
              3 envíos por Olva Courier pendientes de recojo. Coordinado con logística.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}