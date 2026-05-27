'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { exportCotizacionesToPDF, exportToExcel } from '@/lib/utils/export-utils';
import type { CotizacionRow } from '@/lib/services/cotizaciones.service';
import AdminPageHeader from '@/components/admin/common/AdminPageHeader';
import { CotizacionesStats }   from '@/components/admin/cotizaciones/CotizacionesStats';
import { CotizacionesToolbar } from '@/components/admin/cotizaciones/CotizacionesToolbar';
import { CotizacionesTable }   from '@/components/admin/cotizaciones/CotizacionesTable';

const PAGE_SIZE = 10;

export default function CotizacionesPage() {
  const [cotizaciones, setCotizaciones] = useState<CotizacionRow[]>([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<string | null>(null);
  const [currentPage, setCurrentPage]   = useState(0);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPDF, setExportingPDF]     = useState(false);
  const [stats, setStats] = useState({ pendientes: 0, aprobadas: 0, expiradas: 0, totalValor: 0 });

  const loadCotizaciones = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/cotizaciones', { cache: 'no-store' });
      if (!res.ok) throw new Error('Error al cargar cotizaciones');
      const json = await res.json();
      const data: CotizacionRow[] = json.data ?? json;
      setCotizaciones(data);
      setStats({
        pendientes: data.filter((c) => c.estado === 'borrador' || c.estado === 'enviada').length,
        aprobadas:  data.filter((c) => c.estado === 'aprobada' || c.estado === 'convertida').length,
        expiradas:  data.filter((c) => c.estado === 'expirada').length,
        totalValor: data
          .filter((c) => c.estado !== 'rechazada' && c.estado !== 'expirada')
          .reduce((sum, c) => sum + c.monto, 0),
      });
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar cotizaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCotizaciones(); }, [loadCotizaciones]);

  const filtered = useMemo(() => cotizaciones.filter((c) => {
    const matchSearch =
      c.cotizacion_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.cliente ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.descripcion ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = estadoFiltro === null || c.estado === estadoFiltro;
    return matchSearch && matchEstado;
  }), [cotizaciones, searchTerm, estadoFiltro]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const resetPage  = () => setCurrentPage(0);

  const handleFiltroChange = (filtro: string | null) => {
    setEstadoFiltro(filtro);
    resetPage();
  };

  const handleExportPDF = async () => {
    if (!filtered.length) return toast.error('No hay datos para exportar');
    const toastId = toast.loading('Preparando PDF...');
    try {
      setExportingPDF(true);
      await exportCotizacionesToPDF(
        filtered.map((c) => ({ ...c, cliente: c.cliente ?? 'Sin Cliente', descripcion: c.descripcion ?? '---' })),
        { title: 'REPORTE DE COTIZACIONES', filename: `Cotizaciones_GUOR_${new Date().toISOString().split('T')[0]}` },
      );
      toast.success('PDF generado correctamente', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Error al generar el PDF', { id: toastId });
    } finally {
      setExportingPDF(false);
    }
  };

  const handleExportExcel = async () => {
    if (!filtered.length) return toast.error('No hay datos para exportar');
    try {
      setExportingExcel(true);
      exportToExcel(
        filtered.map((c) => ({
          'N° Cotización': c.cotizacion_id,
          'Cliente':        c.cliente ?? '---',
          'Monto (S/.)':    c.monto,
          'Estado':         c.estado.toUpperCase(),
          'Vencimiento':    c.fecha_vencimiento,
          'Creación':       c.fecha_creacion,
          'Descripción':    c.descripcion ?? '---',
        })),
        { filename: `Cotizaciones_GUOR_${new Date().toISOString().split('T')[0]}`, sheetName: 'Cotizaciones' },
      );
      toast.success('Excel generado correctamente');
    } catch (error) {
      console.error(error);
      toast.error('Error al exportar a Excel');
    } finally {
      setExportingExcel(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <AdminPageHeader
            title="Cotizaciones"
            description="Gestión de propuestas comerciales de Modas y Estilos GUOR"
            actionLabel="Nueva Cotización"
            onAction={undefined}
          />
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleExportExcel} disabled={exportingExcel || loading}
              className="h-11 rounded-xl border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 font-medium transition-all">
              <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600" />
              {exportingExcel ? 'Exportando...' : 'Exportar Excel'}
            </Button>
            <Button variant="outline" onClick={handleExportPDF} disabled={exportingPDF || loading}
              className="h-11 rounded-xl border-red-200 hover:bg-red-50 hover:text-red-700 text-gray-600 font-medium transition-all">
              <FileText className="w-4 h-4 mr-2 text-red-600" />
              {exportingPDF ? 'Exportando...' : 'Exportar PDF'}
            </Button>
          </div>
        </div>

        <CotizacionesStats
          stats={stats}
          estadoFiltro={estadoFiltro}
          onFiltroChange={handleFiltroChange}
        />

        <CotizacionesToolbar
          searchTerm={searchTerm}
          onSearchChange={(v) => { setSearchTerm(v); resetPage(); }}
          estadoFiltro={estadoFiltro}
          onEstadoChange={handleFiltroChange}
          loading={loading}
          onRefresh={loadCotizaciones}
        />

        {loading ? (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse">
            {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-gray-50 border-b border-gray-100" />)}
          </div>
        ) : (
          <CotizacionesTable
            paginated={paginated}
            filtered={filtered}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onRefresh={loadCotizaciones}
          />
        )}
      </div>
    </div>
  );
}