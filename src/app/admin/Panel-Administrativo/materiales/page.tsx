'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Layers, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import AdminPageHeader from '@/components/admin/common/AdminPageHeader';
import { MaterialesStats } from '@/components/admin/materiales/MaterialesStats';
import { MaterialesToolbar } from '@/components/admin/materiales/MaterialesToolbar';
import MaterialesComprasTable from '@/components/admin/materiales/MaterialesComprasTable';
import { useMaterialesCompras } from '@/lib/hooks/useMaterialesCompras';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { TIPOS_MATERIAL } from '@/lib/constants/materiales';
import { UNIDADES_MEDIDA } from '@/lib/constants/estados';
import type { MaterialCompraRow } from '@/lib/helpers/materiales-compras-helpers';
import { exportToExcel, exportToPDF } from '@/lib/utils/export-utils';
import type { TipoMaterial, UnidadMedida } from '@prisma/client';

const MaterialFormDialog = dynamic(() => import('@/components/admin/materiales/MaterialFormDialog'));

export default function MaterialesPage() {
  const { can, isLoading: authLoading } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [stockFilter, setStockFilter] = useState('todos');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MaterialCompraRow | null>(null);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  const { materiales, isLoading, refetch, create, update, isSaving } = useMaterialesCompras({
    tipo: tipoFilter !== 'todos' ? tipoFilter : undefined,
    busqueda: searchTerm.trim() || undefined,
    stockBajo: stockFilter === 'bajo' ? true : undefined,
  });

  const canView = can('view', 'materiales');
  const canCreate = can('create', 'materiales');
  const canEdit = can('edit', 'materiales');
  const canExport = can('export', 'materiales');

  const filtered = useMemo(() => {
    let list = materiales as MaterialCompraRow[];
    if (stockFilter === 'sin') {
      list = list.filter((m) => Number(m.stock_actual) <= 0);
    } else if (stockFilter === 'optimo') {
      list = list.filter((m) => Number(m.stock_actual) > Number(m.stock_minimo));
    } else if (stockFilter === 'bajo') {
      list = list.filter(
        (m) => Number(m.stock_actual) > 0 && Number(m.stock_actual) <= Number(m.stock_minimo),
      );
    }
    return list;
  }, [materiales, stockFilter]);

  const stats = useMemo(() => {
    const list = materiales as MaterialCompraRow[];
    return {
      total: list.length,
      bajoStock: list.filter(
        (m) => Number(m.stock_actual) > 0 && Number(m.stock_actual) <= Number(m.stock_minimo),
      ).length,
      sinStock: list.filter((m) => Number(m.stock_actual) <= 0).length,
      conOrdenes: list.filter((m) => (m._count?.ordenes_compra_items ?? 0) > 0).length,
    };
  }, [materiales]);

  const handleSave = async (data: Record<string, unknown>) => {
    if (editing) {
      const res = await update(String(editing.id), data);
      return { success: res?.success === true, error: res?.error };
    }
    const res = await create(data);
    return { success: res?.success === true, error: res?.error };
  };

  const handleExportExcel = async () => {
    if (!canExport || filtered.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }
    try {
      setExportingExcel(true);
      await exportToExcel(
        filtered.map((m) => ({
          Nombre: m.nombre,
          Tipo: TIPOS_MATERIAL[m.tipo as TipoMaterial]?.label ?? m.tipo,
          Composición: m.composicion ?? '—',
          Proveedor: m.proveedores?.razon_social ?? '—',
          Stock: Number(m.stock_actual),
          Unidad: UNIDADES_MEDIDA[m.unidad_medida as UnidadMedida]?.label ?? m.unidad_medida,
          'Precio ref.': Number(m.precio_unitario ?? 0),
          'Órdenes compra': m._count?.ordenes_compra_items ?? 0,
        })),
        { filename: 'Materiales_SWGUOR' },
      );
      toast.success('Excel descargado');
    } catch {
      toast.error('Error al exportar');
    } finally {
      setExportingExcel(false);
    }
  };

  const handleExportPDF = async () => {
    if (!canExport || filtered.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }
    try {
      setExportingPDF(true);
      await exportToPDF(
        [['Material', 'Tipo', 'Proveedor', 'Stock', 'Precio', 'OC']],
        filtered.map((m) => [
          m.nombre,
          TIPOS_MATERIAL[m.tipo as TipoMaterial]?.label ?? m.tipo,
          m.proveedores?.razon_social ?? '—',
          String(Number(m.stock_actual)),
          `S/ ${Number(m.precio_unitario ?? 0).toFixed(2)}`,
          String(m._count?.ordenes_compra_items ?? 0),
        ]),
        { title: 'Catálogo de Materiales', filename: `Materiales_${new Date().toISOString().split('T')[0]}` },
      );
      toast.success('PDF descargado');
    } catch {
      toast.error('Error al exportar PDF');
    } finally {
      setExportingPDF(false);
    }
  };

  if (!authLoading && !canView) {
    return (
      <div className="p-8 text-center text-gray-500">
        No tienes permisos para ver el catálogo de materiales.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <AdminPageHeader
        title="Materiales"
        description="Catálogo de telas y materiales vinculados a órdenes de compra."
        actionLabel="Nuevo material"
        onAction={() => { setEditing(null); setShowForm(true); }}
        showAction={canCreate}
        icon={Layers}
      >
        {canExport && (
          <>
            <Button
              variant="outline"
              className="h-11 rounded-xl bg-white"
              onClick={handleExportExcel}
              disabled={exportingExcel}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Excel
            </Button>
            <Button
              variant="outline"
              className="h-11 rounded-xl bg-white"
              onClick={handleExportPDF}
              disabled={exportingPDF}
            >
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </>
        )}
      </AdminPageHeader>

      <MaterialesStats stats={stats} />

      <MaterialesToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        tipoFilter={tipoFilter}
        onTipoChange={setTipoFilter}
        stockFilter={stockFilter}
        onStockChange={setStockFilter}
        isLoading={isLoading}
        onRefresh={() => refetch()}
      />

      <MaterialesComprasTable
        materiales={filtered}
        isLoading={isLoading || authLoading}
        canEdit={canEdit}
        onEdit={(m) => { setEditing(m); setShowForm(true); }}
      />

      <MaterialFormDialog
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        onSave={handleSave}
        material={editing}
        isSaving={isSaving}
      />
    </div>
  );
}
