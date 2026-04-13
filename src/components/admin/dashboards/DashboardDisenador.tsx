"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { usePermissions } from '@/lib/hooks/usePermissions';
import type { usuarios, EstadoPedido } from '@prisma/client';
import {
  Upload, Eye, CheckCircle, AlertCircle,
  ClipboardList, Layers, FileText, Inbox,
  Scissors, Shirt, Sparkles, Plus, Search,
  Download, Filter
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

interface ProductoActivo {
  id: number;
  name: string;
  category: string;
  imagen: string | null;
  hasFicha: boolean;
}

interface PedidoAsignado {
  id: number;
  product: string;
  quantity: number;
  deadline: string;
  urgente: boolean;
  estado: EstadoPedido;
}

interface Stats {
  productosActivos: number;
  fichasPendientes: number;
  pedidosAsignados: number;
  listosParaTaller: number;
}

const ETAPA_CONFIG: Record<EstadoPedido, {
  label: string; color: string; bg: string;
  icon: React.ElementType; progress: number;
}> = {
  pendiente:  { label: 'Pendiente',  color: 'text-slate-400',   bg: 'bg-slate-100',   icon: Inbox,       progress: 5   },
  corte:      { label: 'Corte',      color: 'text-amber-500',   bg: 'bg-amber-50',    icon: Scissors,    progress: 33  },
  costura:    { label: 'Costura',    color: 'text-fuchsia-500', bg: 'bg-fuchsia-50',  icon: Shirt,       progress: 66  },
  acabado:    { label: 'Acabado',    color: 'text-pink-500',    bg: 'bg-pink-50',     icon: Sparkles,    progress: 85  },
  completado: { label: 'Completado', color: 'text-emerald-500', bg: 'bg-emerald-50',  icon: CheckCircle, progress: 100 },
  cancelado:  { label: 'Cancelado',  color: 'text-rose-500',    bg: 'bg-rose-50',     icon: AlertCircle, progress: 0   },
};

// Paleta fucsia
const F = {
  primary:   '#d946ef', // fuchsia-500
  dark:      '#a21caf', // fuchsia-700
  light:     '#fdf4ff', // fuchsia-50
  mid:       '#fae8ff', // fuchsia-100
  border:    '#f0abfc', // fuchsia-300
  text:      '#701a75', // fuchsia-900
};

export default function DisenadorDashboard({ usuario }: { usuario: usuarios }) {
  const router = useRouter();
  const { can, isLoading: permissionsLoading } = usePermissions();
  const supabase = getSupabaseBrowserClient();

  const [stats, setStats] = useState<Stats>({
    productosActivos: 0, fichasPendientes: 0, pedidosAsignados: 0, listosParaTaller: 0,
  });
  const [activeProducts, setActiveProducts]   = useState<ProductoActivo[]>([]);
  const [assignedOrders, setAssignedOrders]   = useState<PedidoAsignado[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [uploadingId, setUploadingId]         = useState<number | null>(null);
  const [filtroActivo, setFiltroActivo]       = useState(false);
  const [exportando, setExportando]           = useState(false);

  // Datos de gráficos (mock igual que recepcionista)
  const disenosData = [
    { mes: 'Ene', diseños: 10 }, { mes: 'Feb', diseños: 12 },
    { mes: 'Mar', diseños: 8  }, { mes: 'Abr', diseños: 14 },
    { mes: 'May', diseños: 18 }, { mes: 'Jun', diseños: 15 },
    { mes: 'Jul', diseños: 11 },
  ];

  const estadoData = [
    { name: 'Aprobados',   value: 50, color: F.primary },
    { name: 'En Revisión', value: 25, color: F.dark    },
    { name: 'Borrador',    value: 20, color: F.border  },
    { name: 'Rechazados',  value: 5,  color: '#f5d0fe' },
  ];

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const ESTADOS_ACTIVOS: EstadoPedido[] = ['pendiente', 'corte', 'costura', 'acabado'];

      const [productosRes, fichasRes, pedidosColaRes, pedidosListosRes] = await Promise.all([
        supabase.from('productos').select('id, nombre, imagen, categoria_id, categorias(nombre)', { count: 'exact' })
          .eq('estado', 'activo').order('created_at', { ascending: false }).limit(6),
        supabase.from('productos').select('id', { count: 'exact' })
          .eq('estado', 'activo').not('id', 'in', supabase.from('fichas-tecnicas').select('id_producto')),
        supabase.from('pedidos').select('id, prioridad, created_at, estado, pedido_items(cantidad, productos(nombre))')
          .in('estado', ESTADOS_ACTIVOS).order('created_at', { ascending: true }).limit(5),
        supabase.from('pedidos').select('id', { count: 'exact' }).in('estado', ['pendiente']),
      ]);

      setStats({
        productosActivos: productosRes.count ?? 0,
        fichasPendientes: fichasRes.count ?? 0,
        pedidosAsignados: pedidosColaRes.data?.length ?? 0,
        listosParaTaller: pedidosListosRes.count ?? 0,
      });

      setActiveProducts((productosRes.data ?? []).map((p: any) => ({
        id: p.id, name: p.nombre,
        category: p.categorias?.nombre || 'General',
        imagen: p.imagen, hasFicha: !!p.imagen,
      })));

      setAssignedOrders((pedidosColaRes.data ?? []).map((p: any) => {
        const total = p.pedido_items?.reduce((acc: number, i: any) => acc + (i.cantidad || 0), 0);
        const diff  = Math.floor((new Date(p.created_at).getTime() - Date.now()) / 86400000);
        return {
          id: p.id,
          product: p.pedido_items?.[0]?.productos?.nombre || 'Sin nombre',
          quantity: total, urgente: p.prioridad === 'alta' || p.prioridad === 'urgente',
          deadline: diff < 0 ? 'Vencido' : diff === 0 ? 'Hoy' : `En ${diff} días`,
          estado: (p.estado || 'pendiente') as EstadoPedido,
        };
      }));
    } catch {
      toast.error('No se pudo sincronizar el estudio');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, productoId: number) => {
    const file = e.target.files?.[0];
    if (!file || !can('edit', 'productos')) return;
    setUploadingId(productoId);
    const filePath = `disenos/${productoId}-${Date.now()}.${file.name.split('.').pop()}`;
    try {
      const { error: upErr } = await supabase.storage.from('productos').upload(filePath, file);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('productos').getPublicUrl(filePath);
      const { error: updErr } = await supabase.from('productos').update({ imagen: publicUrl }).eq('id', productoId);
      if (updErr) throw updErr;
      toast.success('Diseño actualizado');
      fetchDashboardData();
    } catch { toast.error('Error al subir el archivo'); }
    finally { setUploadingId(null); }
  };

  const handleExportar = async () => {
    setExportando(true);
    try {
      const fecha = new Date().toLocaleDateString('es-PE');
      let csv = `CREATIVE STUDIO - DASHBOARD\nDiseñador,${usuario.nombre_completo}\nFecha,${fecha}\n\n`;
      csv += 'ESTADÍSTICAS\nMétrica,Valor\n';
      csv += `Modelos Activos,${stats.productosActivos}\n`;
      csv += `Fichas Pendientes,${stats.fichasPendientes}\n`;
      csv += `En Taller,${stats.pedidosAsignados}\n`;
      csv += `Por Iniciar,${stats.listosParaTaller}\n\n`;
      csv += 'DISEÑOS POR MES\nMes,Cantidad\n';
      disenosData.forEach(d => { csv += `${d.mes},${d.diseños}\n`; });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `dashboard-disenador-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } finally { setExportando(false); }
  };

  if (permissionsLoading || loading) return <LoadingDashboard />;

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 bg-[#fdf4ff] min-h-screen">

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#4a044e] tracking-tight flex items-center gap-3">
            Creative Studio <span className="h-2 w-2 rounded-full bg-fuchsia-500 animate-pulse" />
          </h1>
          <p className="text-fuchsia-600 font-medium mt-1">
            Bienvenido, {usuario.nombre_completo?.split(' ')[0]} • Área de Diseño
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setFiltroActivo(!filtroActivo)}
            style={{ borderColor: filtroActivo ? F.primary : F.border }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border ${
              filtroActivo
                ? 'bg-fuchsia-500 text-white'
                : 'bg-fuchsia-50 text-[#4a044e] hover:bg-fuchsia-100'
            }`}
          >
            <Filter className="w-4 h-4" /> Filtro
          </button>
          <button
            onClick={handleExportar} disabled={exportando}
            className="flex items-center gap-2 px-4 py-2.5 bg-fuchsia-50 border border-fuchsia-200 rounded-xl text-sm font-bold text-[#4a044e] hover:bg-fuchsia-100 transition-all shadow-sm disabled:opacity-50"
          >
            {exportando
              ? <div className="w-4 h-4 border-2 border-fuchsia-400 border-t-fuchsia-700 rounded-full animate-spin" />
              : <Download className="w-4 h-4" />}
            Exportar
          </button>
          <button
            onClick={() => router.push('/admin/Panel-Administrativo/productos')}
            className="flex items-center gap-2 px-4 py-2.5 bg-fuchsia-50 border border-fuchsia-200 rounded-xl text-sm font-bold text-[#4a044e] hover:bg-fuchsia-100 transition-all shadow-sm"
          >
            <Search className="w-4 h-4" /> Buscar
          </button>
        </div>
      </header>

      {/* Panel Filtros */}
      {filtroActivo && (
        <div className="bg-gradient-to-r from-fuchsia-50 to-fuchsia-100 border border-fuchsia-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-[#4a044e] uppercase tracking-widest">Filtros Rápidos</h3>
            <button onClick={() => setFiltroActivo(false)} className="text-fuchsia-600 hover:text-fuchsia-800 transition-colors">✕</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Estado', type: 'select', opts: ['Todos', 'Aprobado', 'En Revisión', 'Borrador'] },
              { label: 'Fecha', type: 'date' },
              { label: 'Categoría', type: 'select', opts: ['Todas', 'Vestidos', 'Camisas', 'Pantalones'] },
              { label: 'Modelo', type: 'text', placeholder: 'Buscar modelo...' },
            ].map(({ label, type, opts, placeholder }) => (
              <div key={label} className="space-y-2">
                <label className="text-[10px] font-black text-fuchsia-700 uppercase">{label}</label>
                {type === 'select' ? (
                  <select className="w-full px-3 py-2 rounded-lg border border-fuchsia-200 bg-fuchsia-50 text-sm font-medium text-[#4a044e] focus:outline-none focus:border-fuchsia-500">
                    {opts!.map(o => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={type} placeholder={placeholder} className="w-full px-3 py-2 rounded-lg border border-fuchsia-200 bg-fuchsia-50 text-sm font-medium text-[#4a044e] placeholder-fuchsia-400 focus:outline-none focus:border-fuchsia-500" />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4 pt-4 border-t border-fuchsia-200">
            <button className="px-4 py-2 bg-fuchsia-500 text-white rounded-lg text-[10px] font-bold uppercase hover:bg-fuchsia-700 transition-all">Aplicar</button>
            <button className="px-4 py-2 bg-fuchsia-50 border border-fuchsia-200 text-[#4a044e] rounded-lg text-[10px] font-bold uppercase hover:bg-fuchsia-100 transition-all">Limpiar</button>
          </div>
        </div>
      )}

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Modelos Activos"    value={stats.productosActivos} cambio="+2"  icon={Layers}    />
        <StatCard label="Fichas Pendientes"  value={stats.fichasPendientes} cambio="-1"  icon={FileText}  isCritical={stats.fichasPendientes > 0} />
        <StatCard label="En Taller"          value={stats.pedidosAsignados} cambio="+3"  icon={Scissors}  />
        <StatCard label="Por Iniciar"        value={stats.listosParaTaller} cambio="0"   icon={Inbox}     />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Main */}
        <main className="lg:col-span-8 space-y-6">

          {/* Gráfico de diseños por mes */}
          <div className="bg-fuchsia-50 p-6 rounded-3xl shadow-sm border border-fuchsia-200 hover:shadow-md transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-black uppercase text-[#4a044e] tracking-widest">Diseños por Mes</h2>
              <span className="text-xs font-bold text-fuchsia-600 bg-fuchsia-100 px-3 py-1 rounded-lg">2024</span>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={disenosData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0abfc" vertical={false} />
                  <XAxis dataKey="mes" stroke={F.dark} style={{ fontSize: '12px', fontWeight: 600 }} />
                  <YAxis stroke={F.dark} style={{ fontSize: '12px' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fdf4ff', border: '1px solid #f0abfc', borderRadius: '8px', padding: '8px 12px' }} />
                  <Bar dataKey="diseños" fill={F.primary} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabla de modelos recientes */}
          <div className="bg-fuchsia-50 p-6 rounded-3xl shadow-sm border border-fuchsia-200 hover:shadow-md transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black uppercase text-[#4a044e] text-sm">Modelos Recientes</h3>
              <button className="text-xs font-bold text-fuchsia-600 hover:text-fuchsia-800 flex items-center gap-1 transition-colors">
                Ver catálogo completo →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-fuchsia-100">
                    {['SKU', 'Modelo', 'Categoría', 'Estado', 'Acción'].map(h => (
                      <th key={h} className="pb-3 text-left font-black text-fuchsia-600 uppercase tracking-widest text-[10px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-fuchsia-100">
                  {activeProducts.length === 0 ? (
                    <tr><td colSpan={5} className="py-8 text-center text-xs text-fuchsia-400 font-bold">Sin modelos registrados</td></tr>
                  ) : activeProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-fuchsia-100/40 transition-colors">
                      <td className="py-4 font-bold text-[#4a044e] text-[10px]">#{p.id}</td>
                      <td className="py-4">
                        <p className="font-black text-[#4a044e] text-[10px]">{p.name}</p>
                      </td>
                      <td className="py-4 text-[10px] text-fuchsia-600">{p.category}</td>
                      <td className="py-4">
                        <span className={`text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase inline-flex items-center gap-1 ${
                          p.hasFicha
                            ? 'bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200'
                            : 'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}>
                          {p.hasFicha ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {p.hasFicha ? 'Con Ficha' : 'Sin Ficha'}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <input type="file" id={`file-${p.id}`} className="hidden" onChange={(e) => handleFileUpload(e, p.id)} disabled={uploadingId === p.id} />
                          <label htmlFor={`file-${p.id}`} className="px-3 py-1.5 bg-fuchsia-500 text-white rounded-lg text-[9px] font-bold flex items-center gap-1 cursor-pointer hover:bg-fuchsia-700 transition-all">
                            {uploadingId === p.id
                              ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              : <><Upload className="w-3 h-3" />Cargar</>}
                          </label>
                          <button onClick={() => p.imagen && window.open(p.imagen, '_blank')} className="px-2 py-1.5 border border-fuchsia-200 text-fuchsia-400 hover:text-fuchsia-700 rounded-lg transition-all">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
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

          {/* Distribución por estado */}
          <div className="bg-fuchsia-50 p-6 rounded-3xl shadow-sm border border-fuchsia-200 hover:shadow-md transition-all">
            <h3 className="font-black uppercase text-[#4a044e] text-xs mb-6 tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full" />
              Estado de Diseños
            </h3>
            <div className="h-40 w-full flex items-center justify-center mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={estadoData} cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={2} dataKey="value">
                    {estadoData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 border-t border-fuchsia-100 pt-4">
              {estadoData.map((item, i) => (
                <div key={i} className="flex items-center justify-between hover:bg-fuchsia-100/50 p-2 rounded-lg transition-all">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[9px] font-bold text-fuchsia-700">{item.name}</span>
                  </div>
                  <span className="text-[9px] font-black text-[#4a044e] px-2 py-0.5 bg-fuchsia-100 rounded">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Flujo de taller */}
          <div className="bg-fuchsia-50 p-6 rounded-3xl shadow-sm border border-fuchsia-200 hover:shadow-md transition-all">
            <h3 className="font-black uppercase text-[#4a044e] text-xs mb-4 tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full" />
              Flujo de Taller
            </h3>
            <div className="space-y-4">
              {assignedOrders.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <Inbox className="w-7 h-7 text-fuchsia-300 mx-auto" />
                  <p className="text-[10px] text-fuchsia-400 uppercase font-black">Cola vacía</p>
                </div>
              ) : assignedOrders.map((order) => {
                const cfg  = ETAPA_CONFIG[order.estado];
                const Icon = cfg.icon;
                return (
                  <div key={order.id} className="p-4 bg-white rounded-2xl border border-fuchsia-100 hover:border-fuchsia-300 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded ${order.urgente ? 'bg-fuchsia-500 text-white' : 'bg-fuchsia-100 text-fuchsia-700'}`}>
                        {order.urgente ? 'URGENTE' : order.deadline}
                      </span>
                      <span className="text-[10px] font-medium text-fuchsia-400">#{order.id}</span>
                    </div>
                    <h4 className="text-sm font-bold text-[#4a044e] mb-1">{order.product}</h4>
                    <p className="text-[11px] text-fuchsia-500 mb-3">{order.quantity} unidades</p>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={`flex items-center gap-1.5 ${cfg.color}`}>
                        <Icon className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase">{cfg.label}</span>
                      </div>
                      <span className="text-[10px] font-bold text-fuchsia-400">{cfg.progress}%</span>
                    </div>
                    <div className="h-1 w-full bg-fuchsia-100 rounded-full overflow-hidden">
                      <div className="h-full bg-fuchsia-500 transition-all duration-1000" style={{ width: `${cfg.progress}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="bg-fuchsia-50 rounded-3xl p-6 shadow-sm border border-fuchsia-200 hover:shadow-md transition-all">
            <h3 className="text-xs font-black uppercase tracking-widest text-fuchsia-700 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full" />
              Acciones Rápidas
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/admin/Panel-Administrativo/productos')}
                className="block w-full bg-fuchsia-500 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-fuchsia-700 transition-all text-center shadow-lg shadow-fuchsia-200"
              >
                <Plus className="inline w-3.5 h-3.5 mr-1" />Nuevo Diseño
              </button>
              <button
                onClick={() => router.push('/admin/Panel-Administrativo/pedidos')}
                className="block w-full bg-fuchsia-100 border border-fuchsia-200 text-fuchsia-800 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-fuchsia-200 transition-all text-center"
              >
                <ClipboardList className="inline w-3.5 h-3.5 mr-1" />Ver Hoja de Ruta
              </button>
            </div>
          </div>

          {/* Nota de turno */}
          <div className="bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 p-6 rounded-3xl border border-fuchsia-200 shadow-sm hover:shadow-md transition-all">
            <p className="text-[9px] font-black text-fuchsia-600 uppercase mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-fuchsia-500 rounded-full" />
              Nota de Turno
            </p>
            <p className="text-[10px] text-[#4a044e] font-medium leading-relaxed">
              3 fichas técnicas pendientes de aprobación. Revisión con gerencia programada para mañana.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatCard({ label, value, cambio, icon: Icon, isCritical }: any) {
  return (
    <div className={`p-5 rounded-3xl bg-fuchsia-50 border shadow-sm transition-all hover:shadow-md ${
      isCritical ? 'border-fuchsia-400 animate-pulse' : 'border-fuchsia-200'
    }`}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-fuchsia-100 border border-fuchsia-200 text-fuchsia-600">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black text-fuchsia-600 uppercase tracking-tighter">{label}</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-black text-[#4a044e] leading-none mt-0.5">{value}</p>
            <p className="text-[10px] font-bold text-fuchsia-500">{cambio}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingDashboard() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-fuchsia-50 gap-4">
      <div className="relative flex h-12 w-12">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-20" />
        <div className="relative h-12 w-12 border-4 border-fuchsia-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-xs font-black uppercase tracking-[0.3em] text-fuchsia-700 animate-pulse">Sincronizando Studio</p>
    </div>
  );
}