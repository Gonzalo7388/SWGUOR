"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { 
  LineChart, Line, PieChart, Pie, Cell as BarCell,
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar 
} from "recharts";
import { 
  TrendingUp, Calendar, Download, 
  ShoppingBag, Users, FileBarChart, ShieldAlert,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

// SILENCIADOR DE ADVERTENCIAS DE RECHARTS
if (typeof window !== "undefined") {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === "string" && /defaultProps|ResizeObserver/.test(args[0])) return;
    originalConsoleError(...args);
  };
}

const COLORS = ['#db2777', '#f472b6', '#9333ea', '#3b82f6', '#10b981'];

export default function ReportesPage() {
  // --- 1. HOOKS DE ESTADO Y PERMISOS (Siempre al inicio) ---
  const { can, isLoading: authLoading } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30");
  const [isMounted, setIsMounted] = useState(false);

  const [metrics, setMetrics] = useState<any>(null);
  const [dataVentas, setDataVentas] = useState([]);
  const [dataCategorias, setDataCategorias] = useState([]);
  const [dataTallas, setDataTallas] = useState([]);

  // --- 2. LÓGICA DE CARGA (useCallback) ---
  const loadReportData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/reportes?days=${range}`);
      if (!response.ok) throw new Error("Error en el servidor (500)");
      
      const res = await response.json();
      setMetrics(res.metrics);
      setDataVentas(res.ventasPorDia || []);
      setDataCategorias(res.ventasPorCategoria || []);
      setDataTallas(res.concentracionTallas || []);
    } catch (error: any) {
      console.error("API Error:", error);
      toast.error("Error al sincronizar datos del taller");
    } finally {
      setLoading(false);
    }
  }, [range]);

  // --- 3. EFECTOS (useEffect) ---
  useEffect(() => { 
    setIsMounted(true); 
  }, []);

  useEffect(() => {
    // Solo cargamos datos si el usuario tiene permiso y la autenticación terminó
    if (!authLoading && can('view', 'reportes')) {
      loadReportData();
    }
  }, [authLoading, can, loadReportData]);

  // --- 4. CÁLCULOS MEMORIZADOS (useMemo) ---
  const SalesChart = useMemo(() => {
  if (!isMounted || dataVentas.length === 0) return <EmptyState label="Sin ventas" />;
  
  return (
    <ResponsiveContainer width="100%" height="100%" debounce={100}>
      <LineChart data={dataVentas} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
        <XAxis 
          dataKey="fecha" 
          axisLine={false} 
          tickLine={false} 
          tick={{fontSize: 10, fill: '#9ca3af', fontWeight: 600}} 
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{fontSize: 10, fill: '#9ca3af'}} 
        />
        <Tooltip contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)'}} />
        <Line 
          type="monotone" 
          dataKey="ventas" 
          stroke="#db2777" 
          strokeWidth={4} 
          dot={{r: 4, fill: '#db2777', strokeWidth: 2, stroke: '#fff'}} 
          activeDot={{r: 6}} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
}, [isMounted, dataVentas]);

  const TallasChart = useMemo(() => {
    if (!isMounted || dataTallas.length === 0) return <EmptyState label="Sin datos de tallas" />;
    return (
      <div className="h-72 w-full mt-4">
        {isMounted && dataTallas.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%" debounce={50}>
            <BarChart data={dataTallas} layout="vertical" margin={{left: -20, right: 20}}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 800}} />
              <Tooltip cursor={{fill: '#fdf2f8'}} />
              <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={25}>
                {dataTallas.map((_entry, i) => (
                  <BarCell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyState label="Sin datos de tallas" />}
      </div>
    );
  }, [isMounted, dataTallas]);

  // --- 5. CLÁUSULAS DE GUARDIA (Returns Condicionales) ---
  if (authLoading || loading) return <LoadingSpinner />;
  if (!can('view', 'reportes')) return <AccessDenied />;

  // --- 6. RENDERIZADO PRINCIPAL ---
  return (
    <div className="p-4 md:p-8 space-y-6 bg-[#fafafa] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileBarChart className="text-pink-600 w-8 h-8" />
            <h1 className="text-3xl font-black text-gray-900 italic uppercase tracking-tighter">Panel de Inteligencia</h1>
          </div>
          <div className="flex items-center gap-3">
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="w-44 bg-white rounded-xl font-bold shadow-sm border-none">
                <Calendar className="w-4 h-4 mr-2 text-pink-500" />
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-xl">
                <SelectItem value="7">Últimos 7 días</SelectItem>
                <SelectItem value="30">Últimos 30 días</SelectItem>
                <SelectItem value="90">Últimos 3 meses</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="rounded-xl font-bold border-pink-100 text-pink-600 hover:bg-pink-50">
              <Download className="w-4 h-4 mr-2" /> Exportar
            </Button>
          </div>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard 
            title="Ingresos Reales" 
            value={`S/ ${(metrics?.total || 0).toLocaleString()}`} 
            trend={metrics?.crecimiento || 0} 
            icon={TrendingUp} 
            colorClass="bg-emerald-50 text-emerald-600"
          />
          <StatCard 
            title="En Producción" 
            value={`S/ ${(metrics?.produccionEnCurso || 0).toLocaleString()}`} 
            trend="Valor taller" 
            icon={ShoppingBag} 
            colorClass="bg-amber-50 text-amber-600"
          />
          <StatCard title="Total Pedidos" value={metrics?.pedidos || 0} trend="Periodo" icon={FileBarChart} colorClass="bg-blue-50 text-blue-600" />
          <StatCard title="Clientes Activos" value={metrics?.clientes || 0} trend="Base GUOR" icon={Users} colorClass="bg-purple-50 text-purple-600" />
        </div>

        {/* Gráficas Principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-none shadow-sm bg-white p-6 rounded-[2.5rem]">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Fluctuación de Ingresos (Caja)</CardTitle>
            </CardHeader>
            <div className="h-72 w-full mt-4">{SalesChart}</div>
          </Card>

          <Card className="border-none shadow-sm bg-white p-6 rounded-[2.5rem]">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Demanda por Tallas (Producción)</CardTitle>
            </CardHeader>
            <div className="h-72 w-full mt-4">{TallasChart}</div>
          </Card>

          {/* Pareto de Categorías */}
          <Card className="border-none shadow-sm bg-white p-6 rounded-[2.5rem] lg:col-span-2">
            <CardHeader className="px-0 pt-0 text-center">
              <CardTitle className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Rentabilidad por Línea (Pareto)</CardTitle>
            </CardHeader>
            <div className="h-80 w-full mt-4 flex flex-col md:flex-row items-center justify-around">
              <div className="h-full w-full max-w-100">
                {isMounted && dataCategorias.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={dataCategorias} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value" cornerRadius={10}>
                        {dataCategorias.map((_, i) => <BarCell key={`cell-pie-${i}`} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <EmptyState label="Sin datos de categorías" />}
              </div>
              <div className="grid grid-cols-2 gap-x-12 gap-y-4 p-8 bg-gray-50/50 rounded-[2.5rem]">
                {dataCategorias.map((cat: any, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-xs font-black text-gray-800 uppercase">{cat.name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 ml-5">S/ {cat.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTES AUXILIARES ---

const StatCard = ({ title, value, trend, icon: Icon, colorClass }: any) => (
  <Card className="border-none shadow-sm bg-white p-6 rounded-3xl group hover:shadow-md transition-all">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl font-black text-gray-900 mt-1">{value}</h3>
      </div>
      <div className={`p-4 rounded-3xl ${colorClass} group-hover:scale-110 transition-transform`}>
        <Icon size={22} />
      </div>
    </div>
    <div className="mt-4 flex items-center gap-1">
      <span className={`text-xs font-bold ${typeof trend === 'number' && trend < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
        {typeof trend === 'number' ? (trend > 0 ? `+${trend}%` : `${trend}%`) : trend}
      </span>
      {typeof trend === 'number' && <span className="text-[10px] text-gray-400 font-medium tracking-tight">vs mes anterior</span>}
    </div>
  </Card>
);

const EmptyState = ({ label }: { label: string }) => (
  <div className="h-full flex flex-col items-center justify-center gap-2">
    <div className="w-12 h-1 bg-gray-100 rounded-full" />
    <p className="text-gray-300 text-[10px] font-black uppercase italic tracking-widest">{label}</p>
  </div>
);

function LoadingSpinner() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#fafafa] gap-6">
      <div className="relative flex items-center justify-center">
        <div className="h-20 w-20 border-4 border-pink-50 border-t-pink-600 rounded-full animate-spin" />
        <Loader2 className="absolute text-pink-600 animate-pulse" size={30} />
      </div>
      <div className="text-center space-y-1">
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] animate-pulse">Sincronizando Taller</p>
        <p className="text-[9px] font-bold text-pink-400 uppercase tracking-widest">Modas GUOR - Intelligence</p>
      </div>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white p-6 text-center">
      <div className="p-6 bg-rose-50 rounded-full mb-6">
        <ShieldAlert className="w-16 h-16 text-rose-500" />
      </div>
      <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">Acceso Restringido</h2>
      <p className="text-gray-500 max-w-sm mt-2 font-medium">Esta sección contiene datos financieros sensibles. Solo el rol de Administrador puede visualizar esta información.</p>
    </div>
  );
}