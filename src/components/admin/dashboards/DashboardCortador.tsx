"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { usePermissions } from '@/lib/hooks/usePermissions';
import type { usuarios, personal_interno } from '@prisma/client';
import {
  Scissors, CheckCircle2, AlertTriangle, ArrowRight,
  Layers, Clock, Zap, ChevronRight, Timer, 
  Search, Download, Filter, Inbox, History, 
  MessageSquareWarning, ClipboardList
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Cell, PieChart, Pie
} from 'recharts';
import { ROLE_PALETTES } from './DashboardUtils';

// ─── CONFIGURACIÓN DE ESTILO: CORTADOR (Amber/Orange) ───────────────────────
const F = {
  primary: ROLE_PALETTES.cortador?.accent || '#f59e0b', // amber-500
  dark:    ROLE_PALETTES.cortador?.text   || '#78350f', // amber-900
  light:   ROLE_PALETTES.cortador?.bgSoft || '#fffbeb', // amber-50
  mid:     ROLE_PALETTES.cortador?.bg     || '#fef3c7', // amber-100
  border:  ROLE_PALETTES.cortador?.border || '#fde68a', // amber-200
  text:    ROLE_PALETTES.cortador?.text   || '#78350f', 
};

interface UsuarioConPersonal extends usuarios {
  personal_interno: personal_interno[];
}

interface LoteActivo {
  id: number;
  lote: string;
  producto: string;
  prioridad: 'Baja' | 'Normal' | 'Urgente';
  capas: number;
  tela: string;
  progreso: number;
  tallas: string[];
  color: string;
}

export default function DashboardCortador({ usuario }: { usuario: UsuarioConPersonal }) {
  const router = useRouter();
  const { can, isLoading: permissionsLoading } = usePermissions();
  const supabase = getSupabaseBrowserClient();

  // Estados
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [filtroActivo, setFiltroActivo] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [lotes, setLotes] = useState<LoteActivo[]>([]);
  
  const nombreUsuario = usuario?.personal_interno?.[0]?.nombre_completo || "Operador";
  const primerNombre = nombreUsuario.split(' ')[0];

  // Datos Mock para Gráficos (Estilo Diseñador)
  const productividadData = [
    { name: 'Lun', cortes: 12 }, { name: 'Mar', cortes: 15 },
    { name: 'Mie', cortes: 8 },  { name: 'Jue', cortes: 18 },
    { name: 'Vie', cortes: 22 }, { name: 'Sab', cortes: 10 },
  ];

  const eficienciaData = [
    { name: 'Completado', value: 75, color: F.primary },
    { name: 'En Proceso', value: 20, color: F.dark },
    { name: 'Demorado',   value: 5,  color: '#fbbf24' },
  ];

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/dashboard');
      const result = await res.json();
      
      // Mapeo similar al del diseñador para normalizar datos
      const tareasCorte = result?.recentOrders?.map((orden: any) => ({
        id: orden.id,
        lote: orden.codigo || `OT-${orden.id.toString().slice(-4)}`,
        producto: orden.clientes?.razon_social || "Pedido General",
        prioridad: orden.prioridad || 'Normal',
        capas: Math.floor(Math.random() * 50) + 10,
        tela: "Denim Premium",
        progreso: orden.estado === 'ENTREGADO' ? 100 : 35,
        tallas: ["S", "M", "L"],
        color: "Azul Indigo"
      })) || [];

      setLotes(tareasCorte);
    } catch {
      toast.error('No se pudo sincronizar la estación de corte');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const handleExportar = async () => {
    setExportando(true);
    try {
      const fecha = new Date().toLocaleDateString('es-PE');
      let csv = `CORTE STATION - REPORTE\nOperador,${nombreUsuario}\nFecha,${fecha}\n\n`;
      csv += 'LOTE,PRODUCTO,PRIORIDAD,PROGRESO\n';
      lotes.forEach(l => { csv += `${l.lote},${l.producto},${l.prioridad},${l.progreso}%\n`; });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `reporte-corte-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } finally { setExportando(false); }
  };

  if (loading || permissionsLoading) return <LoadingDashboard />;

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 bg-[#fffbeb] min-h-screen">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#451a03] tracking-tight flex items-center gap-3">
            Corte Station <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          </h1>
          <p className="text-amber-700 font-medium mt-1">
            Bienvenido, {primerNombre} • Mesa de Operaciones 01
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setFiltroActivo(!filtroActivo)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border ${
              filtroActivo ? 'bg-amber-600 text-white' : 'bg-amber-50 text-[#451a03] border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Filter className="w-4 h-4" /> Filtros
          </button>
          <button
            onClick={handleExportar} disabled={exportando}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm font-bold text-[#451a03] hover:bg-amber-100 transition-all shadow-sm"
          >
            {exportando ? <div className="w-4 h-4 border-2 border-amber-400 border-t-amber-700 rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
            Exportar
          </button>
        </div>
      </header>

      {/* Filtros (Estilo Diseñador) */}
      {filtroActivo && (
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-3xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-amber-700 uppercase">Prioridad</label>
              <select className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white text-sm">
                <option>Todas</option>
                <option>Urgente</option>
                <option>Normal</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-amber-700 uppercase">Tipo de Tela</label>
              <input type="text" placeholder="Ej: Denim..." className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white text-sm" />
            </div>
            <div className="flex items-end gap-2">
              <button className="flex-1 bg-amber-600 text-white py-2 rounded-lg font-bold text-xs">Aplicar</button>
              <button onClick={() => setFiltroActivo(false)} className="px-4 py-2 bg-white border border-amber-200 rounded-lg text-xs font-bold">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pendientes" value={lotes.length} cambio="+2 hoy" icon={Scissors} />
        <StatCard label="Eficiencia" value="94.2%" cambio="+1.5%" icon={Zap} />
        <StatCard label="En Mesa" value="3 Lotes" cambio="Carga Alta" icon={Layers} isCritical={true} />
        <StatCard label="Meta Diaria" value="82%" cambio="Faltan 5" icon={Timer} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content: Cola de Trabajo */}
        <main className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-amber-200 hover:shadow-md transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-black uppercase text-[#451a03] tracking-widest">Cola de Trabajo Activa</h2>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5" /> <LiveClock />
              </div>
            </div>

            <div className="space-y-4">
              {lotes.map((t, i) => {
                const isUrgente = t.prioridad === 'Urgente';
                const isActive = activeId === t.id;
                return (
                  <div 
                    key={t.id}
                    onClick={() => setActiveId(isActive ? null : t.id)}
                    className={`group rounded-2xl border cursor-pointer transition-all overflow-hidden ${
                      isActive ? 'ring-2 ring-amber-500 bg-amber-50/50' : 'bg-white hover:border-amber-400'
                    }`}
                    style={{ borderColor: isUrgente ? '#fca5a5' : '#fde68a' }}
                  >
                    <div className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="text-center min-w-[50px]">
                          <p className="text-[10px] font-black text-amber-500">#{String(i+1).padStart(2,'0')}</p>
                          <p className={`text-xl font-black ${isUrgente ? 'text-rose-600' : 'text-amber-700'}`}>{t.lote}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-sm uppercase text-[#451a03]">{t.producto}</h4>
                            {isUrgente && (
                              <span className="bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase animate-pulse">Urgente</span>
                            )}
                          </div>
                          <p className="text-[10px] font-bold text-amber-600 mt-1">{t.capas} capas • {t.tela} • {t.color}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-black text-amber-600">{t.progreso}%</p>
                          <ProgressBar value={t.progreso} />
                        </div>
                        <ChevronRight className={`w-5 h-5 text-amber-300 transition-transform ${isActive ? 'rotate-90' : ''}`} />
                      </div>
                    </div>

                    {isActive && (
                      <div className="px-5 pb-5 pt-2 grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-top-2">
                         <DetailBox label="Tallas" value={t.tallas.join(', ')} />
                         <DetailBox label="Progreso" value={`${t.progreso}%`} />
                         <DetailBox label="Tipo" value="Corte Recto" />
                         <button className="col-span-1 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all">
                           Iniciar Corte
                         </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gráfico Productividad */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-amber-200">
             <h2 className="text-sm font-black uppercase text-[#451a03] mb-6">Rendimiento Semanal (Cortes)</h2>
             <div className="h-56 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={productividadData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#fde68a" vertical={false} />
                   <XAxis dataKey="name" stroke="#78350f" style={{fontSize: '11px', fontWeight: 700}} />
                   <YAxis stroke="#78350f" style={{fontSize: '11px'}} />
                   <Tooltip cursor={{fill: '#fffbeb'}} contentStyle={{borderRadius: '12px', border: '1px solid #fde68a'}} />
                   <Bar dataKey="cortes" fill={F.primary} radius={[6, 6, 0, 0]}>
                     {productividadData.map((_, i) => <Cell key={i} fill={i === 4 ? F.dark : F.primary} />)}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>
        </main>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Gráfico Eficiencia */}
          <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-sm">
            <h3 className="text-xs font-black uppercase text-amber-800 mb-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Estado Lotes
            </h3>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={eficienciaData} innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                    {eficienciaData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {eficienciaData.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-[10px] font-bold p-2 hover:bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}} />
                    <span className="text-amber-900 uppercase">{item.name}</span>
                  </div>
                  <span className="text-amber-600">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200">
            <h3 className="text-[10px] font-black uppercase text-amber-700 mb-4 tracking-widest">Acciones Estación</h3>
            <div className="space-y-3">
              <button className="w-full bg-amber-600 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all flex items-center justify-center gap-2">
                <ClipboardList className="w-4 h-4" /> Hoja de Ruta
              </button>
              <button className="w-full bg-white border border-amber-200 text-amber-800 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all flex items-center justify-center gap-2">
                <MessageSquareWarning className="w-4 h-4" /> Reportar Falla
              </button>
              <button className="w-full bg-white border border-amber-200 text-amber-800 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all flex items-center justify-center gap-2">
                <History className="w-4 h-4" /> Historial
              </button>
            </div>
          </div>

          {/* Nota Supervisor */}
          <div className="bg-gradient-to-br from-amber-600 to-amber-700 p-6 rounded-3xl text-white shadow-lg shadow-amber-200">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-200" />
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-100">Instrucciones</p>
            </div>
            <p className="text-xs font-medium italic leading-relaxed">
              "Priorizar el lote L-405. El cliente requiere entrega para despacho mañana 08:00 AM."
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── COMPONENTES AUXILIARES ────────────────────────────────────────────────

function StatCard({ label, value, cambio, icon: Icon, isCritical }: any) {
  return (
    <div className={`p-5 rounded-3xl bg-white border transition-all hover:shadow-md ${isCritical ? 'border-rose-400 animate-pulse bg-rose-50' : 'border-amber-200'}`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${isCritical ? 'bg-rose-100 text-rose-600' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-black text-amber-600 uppercase tracking-tighter">{label}</p>
          <div className="flex items-baseline gap-3">
            <p className="text-2xl font-black text-[#451a03] leading-none mt-1">{value}</p>
            <p className="text-[9px] font-bold text-amber-500">{cambio}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailBox({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <p className="text-[9px] font-black text-amber-500 uppercase">{label}</p>
      <p className="text-[11px] font-black text-[#451a03]">{value}</p>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-16 h-1.5 bg-amber-100 rounded-full mt-1 overflow-hidden">
      <div className="h-full bg-amber-500 transition-all duration-700" style={{ width: `${value}%` }} />
    </div>
  );
}

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono">{time.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>;
}

function LoadingDashboard() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50 gap-4">
      <div className="h-12 w-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-black uppercase tracking-widest text-amber-700 animate-pulse">Sincronizando Estación de Corte</p>
    </div>
  );
}