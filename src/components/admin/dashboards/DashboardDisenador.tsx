"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { usePermissions } from '@/lib/hooks/usePermissions';
import type { Database } from '@/types/database';
import {
  Upload, Eye, CheckCircle, AlertCircle,
  ClipboardList, Layers, FileText, Inbox,
  Scissors, Shirt, Sparkles, Plus, Search,
  ArrowUpRight
} from 'lucide-react';

// --- Tipado ---
type Usuario = Database['public']['Tables']['usuarios']['Row'];
type EstadoPedido = 'pendiente' | 'corte' | 'costura' | 'acabado' | 'completado' | 'cancelado';

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

// --- Configuración de Etapas ---
const ETAPA_CONFIG: Record<EstadoPedido, {
  label: string;
  color: string;
  bg: string;
  icon: React.ElementType;
  progress: number;
}> = {
  pendiente: { label: 'Pendiente', color: 'text-slate-400', bg: 'bg-slate-100', icon: Inbox, progress: 5 },
  corte: { label: 'Corte', color: 'text-amber-500', bg: 'bg-amber-50', icon: Scissors, progress: 33 },
  costura: { label: 'Costura', color: 'text-blue-500', bg: 'bg-blue-50', icon: Shirt, progress: 66 },
  acabado: { label: 'Acabado', color: 'text-pink-500', bg: 'bg-pink-50', icon: Sparkles, progress: 85 },
  completado: { label: 'Completado', color: 'text-emerald-500', bg: 'bg-emerald-50', icon: CheckCircle, progress: 100 },
  cancelado: { label: 'Cancelado', color: 'text-rose-500', bg: 'bg-rose-50', icon: AlertCircle, progress: 0 },
};

export default function DisenadorDashboard({ usuario }: { usuario: Usuario }) {
  const router = useRouter();
  const { can, isLoading: permissionsLoading } = usePermissions();
  const supabase = getSupabaseBrowserClient();

  const [stats, setStats] = useState<Stats>({ 
    productosActivos: 0, fichasPendientes: 0, pedidosAsignados: 0, listosParaTaller: 0 
  });
  const [activeProducts, setActiveProducts] = useState<ProductoActivo[]>([]);
  const [assignedOrders, setAssignedOrders] = useState<PedidoAsignado[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const ESTADOS_ACTIVOS: EstadoPedido[] = ['pendiente', 'corte', 'costura', 'acabado'];

      // Optimizamos las queries para traer solo lo necesario
      const [productosRes, fichasRes, pedidosColaRes, pedidosListosRes] = await Promise.all([
        supabase
          .from('productos')
          .select('id, nombre, imagen, categoria_id, categorias(nombre)', { count: 'exact' })
          .eq('estado', 'activo')
          .order('created_at', { ascending: false })
          .limit(6),

        // Productos sin ficha técnica asociada
        supabase
          .from('productos')
          .select('id', { count: 'exact' })
          .eq('estado', 'activo')
          .not('id', 'in', supabase.from('fichas-tecnicas').select('id_producto')),

        supabase
          .from('pedidos')
          .select(`
            id, prioridad, created_at, estado,
            pedido_items(cantidad, productos(nombre))
          `)
          .in('estado', ESTADOS_ACTIVOS)
          .order('created_at', { ascending: true })
          .limit(5),

        supabase
          .from('pedidos')
          .select('id', { count: 'exact' })
          .in('estado', ['pendiente']) 
      ]);

      setStats({
        productosActivos: productosRes.count ?? 0,
        fichasPendientes: fichasRes.count ?? 0,
        pedidosAsignados: (pedidosColaRes.data?.length ?? 0),
        listosParaTaller: pedidosListosRes.count ?? 0,
      });

      setActiveProducts(
        (productosRes.data ?? []).map((p: any) => ({
          id: p.id,
          name: p.nombre,
          category: p.categorias?.nombre || 'General',
          imagen: p.imagen,
          hasFicha: !!p.imagen // Aquí podrías cruzar con la tabla de fichas si prefieres
        }))
      );

      setAssignedOrders(
        (pedidosColaRes.data ?? []).map((p: any) => {
          const totalUnidades = p.pedido_items?.reduce((acc: number, item: any) => acc + (item.cantidad || 0), 0);
          const diff = Math.floor((new Date(p.created_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          
          return {
            id: p.id,
            product: p.pedido_items?.[0]?.productos?.nombre || 'Sin nombre',
            quantity: totalUnidades,
            deadline: diff < 0 ? 'Vencido' : diff === 0 ? 'Hoy' : `En ${diff} días`,
            urgente: p.prioridad === 'alta' || p.prioridad === 'urgente',
            estado: (p.estado || 'pendiente') as EstadoPedido,
          };
        })
      );

    } catch (error) {
      console.error('Error:', error);
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
    const fileExt = file.name.split('.').pop();
    const filePath = `disenos/${productoId}-${Date.now()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage.from('productos').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('productos').getPublicUrl(filePath);
      const { error: updateError } = await supabase.from('productos').update({ imagen: publicUrl }).eq('id', productoId);
      if (updateError) throw updateError;

      toast.success('Diseño actualizado');
      fetchDashboardData();
    } catch (err) {
      toast.error('Error al subir el archivo');
    } finally {
      setUploadingId(null);
    }
  };

  if (permissionsLoading || loading) return <LoadingDashboard />;

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 bg-[#FAFAFB] min-h-screen">
      
      {/* Header Estilo Boutique */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Creative Studio <span className="h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
          </h1>
          <p className="text-slate-500 font-medium">Bienvenido, {usuario.nombre_completo || 'Diseñador'}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/admin/Panel-Administrativo/productos')}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-pink-200 hover:bg-pink-50/30 transition-all shadow-sm"
          >
            <Search className="w-4 h-4" /> Buscar Modelos
          </button>
          <button 
            onClick={() => router.push('/admin/Panel-Administrativo/productos')}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 rounded-xl text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            <Plus className="w-4 h-4" /> Nuevo Diseño
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Modelos Activos" value={stats.productosActivos} icon={Layers} color="indigo" />
        <StatCard label="Fichas Pendientes" value={stats.fichasPendientes} icon={FileText} color="pink" isCritical={stats.fichasPendientes > 0} />
        <StatCard label="En Taller" value={stats.pedidosAsignados} icon={Scissors} color="amber" />
        <StatCard label="Por Iniciar" value={stats.listosParaTaller} icon={Inbox} color="emerald" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Galería de Modelos */}
        <main className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Modelos Recientes</h2>
            <button className="text-xs font-bold text-pink-600 hover:underline">Ver catálogo completo</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-3xl border border-slate-100 p-6 hover:shadow-xl transition-all group overflow-hidden relative">
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">SKU {product.id}</span>
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-pink-600 transition-colors">{product.name}</h3>
                    <p className="text-xs text-slate-500">{product.category}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 ${
                    product.hasFicha ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600 animate-pulse'
                  }`}>
                    {product.hasFicha ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {product.hasFicha ? 'Listo' : 'Sin Ficha'}
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="file"
                    id={`file-${product.id}`}
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, product.id)}
                    disabled={uploadingId === product.id}
                  />
                  <label
                    htmlFor={`file-${product.id}`}
                    className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-800 transition-all active:scale-95"
                  >
                    {uploadingId === product.id ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Upload className="w-4 h-4" /> Cargar Diseño</>}
                  </label>
                  <button 
                    onClick={() => product.imagen && window.open(product.imagen, '_blank')}
                    className="w-12 h-11 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-pink-600 hover:border-pink-200 transition-all"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Barra Lateral de Producción */}
        <aside className="lg:col-span-4">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl sticky top-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-pink-500 rounded-full" />
                Flujo de Taller
              </h3>
              <ArrowUpRight className="w-4 h-4 text-slate-500" />
            </div>

            <div className="space-y-6">
              {assignedOrders.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Inbox className="w-8 h-8 text-slate-700 mx-auto" />
                  <p className="text-[10px] text-slate-500 uppercase font-black">Cola de producción vacía</p>
                </div>
              ) : assignedOrders.map((order) => {
                const config = ETAPA_CONFIG[order.estado];
                const Icon = config.icon;
                return (
                  <div key={order.id} className="group p-4 rounded-2xl hover:bg-slate-800/50 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded ${order.urgente ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        {order.urgente ? 'URGENTE' : order.deadline}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500">#{order.id}</span>
                    </div>
                    
                    <h4 className="text-sm font-bold text-slate-100 mb-1">{order.product}</h4>
                    <p className="text-[11px] text-slate-400 mb-4">{order.quantity} unidades en confección</p>
                    
                    <div className="flex items-center justify-between mb-2">
                      <div className={`flex items-center gap-1.5 ${config.color}`}>
                        <Icon className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-wider">{config.label}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">{config.progress}%</span>
                    </div>
                    
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-pink-600 transition-all duration-1000"
                        style={{ width: `${config.progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={() => router.push('/admin/Panel-Administrativo/pedidos')}
              className="w-full mt-8 py-4 bg-white text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-pink-50 transition-all flex items-center justify-center gap-2 shadow-xl"
            >
              <ClipboardList className="w-4 h-4" /> Ver Hoja de Ruta
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

// --- Subcomponentes Refinados ---

function StatCard({ label, value, icon: Icon, color, isCritical }: any) {
  const colors: any = {
    pink: 'text-pink-600 bg-pink-50 border-pink-100',
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  };

  return (
    <div className={`p-5 rounded-3xl bg-white border shadow-sm transition-all hover:shadow-md ${isCritical ? 'border-pink-200 animate-pulse' : 'border-slate-100'}`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{label}</p>
          <p className="text-2xl font-black text-slate-900 leading-none mt-0.5">{value}</p>
        </div>
      </div>
    </div>
  );
}

function LoadingDashboard() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
      <div className="relative flex h-12 w-12">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-20" />
        <div className="relative h-12 w-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 italic animate-pulse">Sincronizando Studio</p>
    </div>
  );
}