"use client";

import { useState, useEffect, useCallback } from "react";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, Label
} from "recharts";
import { 
  TrendingUp, Calendar, Download, 
  ShoppingBag, Layers, RefreshCcw,
  Target, Zap, Activity, ChevronRight, Loader2, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const COLORS = ['#e11d48', '#6366f1', '#10b981', '#f59e0b', '#8b5cf6'];

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 0 }).format(val);

export default function ReportesPage() {
  const { can, isLoading: authLoading } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30");
  const [isMounted, setIsMounted] = useState(false);

  const [metrics, setMetrics] = useState<any>(null);
  const [dataVentas, setDataVentas] = useState([]);
  const [dataTallas, setDataTallas] = useState([]);
  const [dataCategorias, setDataCategorias] = useState([]);

  const loadReportData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/reportes?days=${range}`);
      if (!response.ok) throw new Error("Error de conexión");
      const res = await response.json();
      
      setMetrics(res.metrics);
      setDataVentas(res.ventasPorDia || []);
      setDataTallas(res.concentracionTallas || []);
      setDataCategorias(res.ventasPorCategoria || []);
    } catch (error) {
      toast.error("Error al sincronizar datos del taller");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { setIsMounted(true); }, []);
  useEffect(() => {
    if (!authLoading && can('view', 'reportes')) loadReportData();
  }, [authLoading, can, loadReportData]);

  if (authLoading || loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8 font-sans text-slate-900">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* HEADER MODERNO */}
        <header className="relative overflow-hidden bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span>Panel de Inteligencia Empresarial</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 leading-none">
                Intelligence <span className="text-slate-300 font-light">Suite.<span className="text-rose-600">+</span></span>
              </h1>
              <p className="text-slate-500 text-sm font-medium max-w-md">Análisis integral de rendimiento financiero y operativo</p>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch justify-end gap-3 w-full md:w-auto">
              <div className="bg-slate-50 p-1 rounded-2xl flex items-center border border-slate-100 order-2 sm:order-1">
                <Select value={range} onValueChange={setRange}>
                  <SelectTrigger className="w-full sm:w-[180px] border-none bg-transparent shadow-none font-bold text-slate-600 focus:ring-0">
                    <Calendar className="w-4 h-4 mr-2 text-rose-500" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    <SelectItem value="7">Últimos 7 días</SelectItem>
                    <SelectItem value="30">Últimos 30 días</SelectItem>
                    <SelectItem value="90">Vista Trimestral</SelectItem>
                  </SelectContent>
                </Select>
                <div className="w-[1px] h-6 bg-slate-200 mx-1" />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={loadReportData}
                  className="rounded-xl hover:bg-white hover:text-rose-600"
                >
                  <RefreshCcw size={18} />
                </Button>
              </div>
              <Button className="bg-rose-600 hover:bg-rose-700 text-white rounded-2xl px-8 h-12 shadow-lg shadow-rose-200 transition-all font-bold text-sm order-1 sm:order-2">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </header>

        {/* KPIs - FILA 1 */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Ventas Totales" value={formatCurrency(metrics?.total || 0)} trend={`${metrics?.crecimiento || 0}%`} icon={TrendingUp} color="rose" sub="Ingresos confirmados" />
          <StatCard label="Pedidos Activos" value={metrics?.pedidos || 0} trend="+New" icon={ShoppingBag} color="indigo" sub="En flujo de taller" />
          <StatCard label="Capital en Proceso" value={formatCurrency(metrics?.produccionEnCurso || 0)} trend="Taller" icon={Zap} color="emerald" sub="Materia prima + Mo" />
          <StatCard label="Eficiencia" value="92.4%" trend="Óptimo" icon={Target} color="amber" sub="Cumplimiento de entrega" />
        </section>

        {/* DASHBOARD PRINCIPAL - FILA 2 & 3 */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* GRÁFICO LINEAL: Ocupa 8 columnas */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="border-none shadow-sm rounded-[3rem] bg-white overflow-hidden p-2">
              <CardHeader className="p-8 pb-0">
                <div className="flex justify-between items-end">
                  <div>
                    <CardTitle className="text-xl font-black text-slate-800 tracking-tight">Rendimiento Financiero</CardTitle>
                    <p className="text-sm text-slate-400 font-medium mt-1">Comparativa de ventas diarias</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-slate-900 leading-none">{formatCurrency(metrics?.total || 0)}</p>
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-2">Total del Periodo</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 h-[400px]">
                {isMounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dataVentas} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#e11d48" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="fecha" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 500}} 
                        dy={10}
                      >
                        <Label value="Período (Días)" position="bottom" offset={10} fill="#64748b" fontSize={12} fontWeight={600} />
                      </XAxis>
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 500}} 
                        tickFormatter={(v) => `S/${(v/1000).toFixed(0)}k`}
                      >
                        <Label value="Monto (S/)" angle={-90} position="insideLeft" style={{textAnchor: 'middle'}} fill="#64748b" fontSize={12} fontWeight={600} />
                      </YAxis>
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="ventas" 
                        stroke="#e11d48" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorSales)" 
                        dot={{ r: 5, fill: '#e11d48', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 7, strokeWidth: 1 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* GRÁFICO BARRAS: Debajo del lineal */}
            <Card className="border-none shadow-sm rounded-[3rem] bg-white p-8">
              <div className="mb-8">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Rentabilidad por Categoría</h3>
                <p className="text-sm text-slate-400 font-medium">Volumen de ventas segmentado</p>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataCategorias} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 11, fill: '#64748b', fontWeight: 500}}
                    >
                      <Label value="Categorías" position="bottom" offset={10} fill="#64748b" fontSize={12} fontWeight={600} />
                    </XAxis>
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 11, fill: '#64748b', fontWeight: 500}}
                      tickFormatter={(v) => `S/${(v/1000).toFixed(0)}k`}
                    >
                      <Label value="Monto Ventas (S/)" angle={-90} position="insideLeft" style={{textAnchor: 'middle'}} fill="#64748b" fontSize={12} fontWeight={600} />
                    </YAxis>
                    <Tooltip cursor={{fill: '#f8fafc'}} content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={50}>
                      {dataCategorias.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.9} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* CARD TALLAS: Ocupa 4 columnas (Sticky) */}
          <div className="lg:col-span-4 lg:sticky lg:top-8">
            <Card className="border-none bg-slate-900 text-white shadow-2xl rounded-[3rem] p-10 flex flex-col min-h-[600px] justify-between relative overflow-hidden">
              {/* Decoración de fondo */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-[80px] -mr-16 -mt-16 rounded-full" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">Análisis de Tallas</h3>
                    <p className="text-slate-400 text-sm font-medium mt-1">Demanda actual en taller</p>
                  </div>
                  <div className="p-3 bg-white/10 rounded-2xl"><Layers className="text-rose-500" size={24} /></div>
                </div>

                <div className="space-y-8">
                  {dataTallas.length > 0 ? dataTallas.slice(0, 6).map((item: any) => (
                    <div key={item.name} className="group">
                      <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400 mb-3 group-hover:text-white transition-colors">
                        <span>Talla {item.name}</span>
                        <span className="text-white bg-white/10 px-2 py-0.5 rounded-md">{item.value} und.</span>
                      </div>
                      <div className="h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
                        <div 
                          className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(225,29,72,0.3)]" 
                          style={{ width: `${Math.max((item.value / 100) * 100, 5)}%` }}
                        />
                      </div>
                    </div>
                  )) : (
                    <div className="py-20 text-center">
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Sin pedidos hoy</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative z-10 mt-12">
                <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-[1.5rem] py-8 font-black text-lg transition-all group border-none">
                  Ver Inventario
                  <ChevronRight size={22} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="text-center text-[10px] text-slate-500 font-bold uppercase mt-6 tracking-[0.2em]">Actualizado hace pocos minutos</p>
              </div>
            </Card>
          </div>

        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, icon: Icon, color, sub }: any) {
  const colors: any = {
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  };

  return (
    <Card className="border-2 shadow-sm rounded-[2.5rem] p-7 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3.5 rounded-2xl border ${colors[color]}`}><Icon size={22} strokeWidth={1.8} /></div>
        <div className="flex items-center gap-1.5 text-[9px] font-black px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl uppercase tracking-tighter border border-emerald-100">
          <ArrowUpRight size={11} /> {trend}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] leading-none">{label}</p>
        <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none">{value}</h3>
        <p className="text-[10px] text-slate-500 font-medium mt-3">{sub}</p>
      </div>
    </Card>
  );
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = payload[0].value;
    const formatted = formatCurrency(value);
    
    return (
      <div className="bg-slate-900 p-5 rounded-2xl shadow-2xl border border-slate-700 scale-95 origin-bottom">
        <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-3">Detalle de Registro</p>
        <p className="text-slate-400 text-[11px] font-bold mb-2">{data.name || data.fecha}</p>
        <div className="space-y-1 border-t border-slate-700 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider">Monto:</span>
            <span className="text-white text-sm font-black">{formatted}</span>
          </div>
          {data.quantity && (
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">Cantidad:</span>
              <span className="text-slate-300 text-sm font-bold">{data.quantity} und.</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

function LoadingSpinner() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-6">
      <div className="relative">
        <div className="w-20 h-20 border-[6px] border-rose-100 rounded-full animate-pulse" />
        <Loader2 className="absolute inset-0 m-auto animate-spin text-rose-600" size={40} />
      </div>
      <div className="text-center">
        <p className="text-sm font-black uppercase tracking-[0.5em] text-slate-900 animate-bounce">Generando Reportes</p>
        <p className="text-xs text-slate-400 font-bold uppercase mt-2">Sincronizando flujo de taller...</p>
      </div>
    </div>
  );
}