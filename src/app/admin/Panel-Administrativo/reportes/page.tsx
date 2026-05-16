'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

// Componentes Base
import AdminPageHeader from '@/components/admin/common/AdminPageHeader';

// Componentes del Módulo
import {
  ReportFilters,
  ReportStats,
  RevenueChart,
  CategoryProfitability,
  SizeAnalysis,
  LoadingSpinner
} from '@/components/admin/reportes';

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 0 }).format(val);

export default function ReportesPage() {
  const { can, isLoading: authLoading } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30');
  const [isMounted, setIsMounted] = useState(false);

  const [metrics, setMetrics] = useState<any>(null);
  const [dataVentas, setDataVentas] = useState([]);
  const [dataTallas, setDataTallas] = useState([]);
  const [dataCategorias, setDataCategorias] = useState([]);

  const loadReportData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/reportes?days=${range}`);
      if (!response.ok) throw new Error('Error de conexión');
      const res = await response.json();
      
      setMetrics(res.metrics);
      setDataVentas(res.ventasPorDia || []);
      setDataTallas(res.concentracionTallas || []);
      setDataCategorias(res.ventasPorCategoria || []);
    } catch (error) {
      toast.error('Error al sincronizar datos del reporte');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { setIsMounted(true); }, []);
  useEffect(() => {
    if (!authLoading && can('view', 'reportes')) loadReportData();
  }, [authLoading, can, loadReportData]);

  if (authLoading || (loading && !metrics)) return <LoadingSpinner />;

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gray-50/50 min-h-screen font-sans">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <AdminPageHeader
            title="Intelligence Suite"
            description="Análisis integral de rendimiento financiero y operativo en tiempo real"
            actionLabel="Exportar Reporte"
            onAction={() => { toast.success('Preparando descarga...'); }}
            icon={Download}
          />

          <ReportFilters 
            range={range} 
            setRange={setRange} 
            onRefresh={loadReportData} 
            isLoading={loading} 
          />
        </div>

        {/* KPIs */}
        <ReportStats metrics={metrics} formatCurrency={formatCurrency} />

        {/* Dashboards */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-8">
            <RevenueChart 
              data={dataVentas} 
              totalPeriodo={metrics?.total || 0} 
              formatCurrency={formatCurrency} 
              isMounted={isMounted}
              CustomTooltip={CustomTooltip}
            />

            <CategoryProfitability 
              data={dataCategorias} 
              CustomTooltip={CustomTooltip}
            />
          </div>

          <div className="lg:col-span-4 lg:sticky lg:top-8">
            <SizeAnalysis data={dataTallas} />
          </div>

        </section>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = payload[0].value;
    const formatted = formatCurrency(value);
    
    return (
      <div className="bg-slate-900 p-5 rounded-2xl shadow-2xl border border-white/5 backdrop-blur-xl">
        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-3">Registro de Datos</p>
        <p className="text-slate-400 text-[11px] font-bold mb-2">{data.name || data.fecha}</p>
        <div className="space-y-1 border-t border-white/10 pt-3">
          <div className="flex justify-between items-center gap-8">
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