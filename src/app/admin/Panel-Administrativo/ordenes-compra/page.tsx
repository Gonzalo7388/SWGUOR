'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag, Plus, Search, RefreshCw, Clock, CheckCircle2, DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import AdminPageHeader from '@/components/admin/common/AdminPageHeader';
import StatCard from '@/components/admin/common/StatCard';
import OrdenesCompraTable from '@/components/admin/ordenes-compra/OrdenesCompraTable';
import OrdenCompraDetailSheet from '@/components/admin/ordenes-compra/OrdenCompraDetailSheet';
import { useOrdenesCompra } from '@/lib/hooks/useOrdenesCompra';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { ESTADOS_ORDEN_COMPRA } from '@/lib/constants/estados';
import type { OrdenCompraRow } from '@/components/admin/ordenes-compra/types';

export default function OrdenesCompraPage() {
  const router = useRouter();
  const { can, isLoading: authLoading } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('todos');
  const [detailOrden, setDetailOrden] = useState<OrdenCompraRow | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const {
    ordenes,
    isLoading,
    refetch,
    confirmar,
    cancelar,
    isConfirming,
    isCancelling,
  } = useOrdenesCompra({
    estado: estadoFilter !== 'todos' ? estadoFilter : undefined,
  });

  const canView = can('view', 'ordenes_compra');
  const canCreate = can('create', 'ordenes_compra');
  const canEdit = can('edit', 'ordenes_compra');
  const canCancel = can('cancel', 'ordenes_compra');

  const filtered = useMemo(() => {
    const list = ordenes as OrdenCompraRow[];
    if (!searchTerm.trim()) return list;
    const q = searchTerm.toLowerCase();
    return list.filter(
      (o) =>
        o.proveedores?.razon_social?.toLowerCase().includes(q) ||
        String(o.id).includes(q) ||
        o.cotizaciones_proveedor?.numero_externo?.toLowerCase().includes(q),
    );
  }, [ordenes, searchTerm]);

  const stats = useMemo(() => {
    const list = ordenes as OrdenCompraRow[];
    return {
      total: list.length,
      pendientes: list.filter((o) => o.estado === 'pendiente').length,
      confirmadas: list.filter((o) => o.estado === 'confirmada').length,
      montoTotal: list
        .filter((o) => o.estado !== 'cancelada')
        .reduce((acc, o) => acc + Number(o.total_orden), 0),
    };
  }, [ordenes]);

  const handleConfirmar = async (orden: OrdenCompraRow) => {
    try {
      await confirmar(orden.id);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al confirmar');
    }
  };

  const handleCancelar = async (orden: OrdenCompraRow) => {
    if (!confirm('¿Cancelar esta orden de compra?')) return;
    try {
      await cancelar(orden.id);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al cancelar');
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="p-8 text-center text-slate-500">
        No tiene permisos para ver órdenes de compra.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <AdminPageHeader
          title="Órdenes de Compra"
          description="Generación y seguimiento de órdenes a proveedores (CUS-50)"
          actionLabel={canCreate ? 'Nueva orden' : undefined}
          onAction={
            canCreate
              ? () => router.push('/admin/Panel-Administrativo/ordenes-compra/nueva')
              : undefined
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total OC" value={stats.total} icon={ShoppingBag} color="slate" />
          <StatCard title="Pendientes" value={stats.pendientes} icon={Clock} color="orange" />
          <StatCard title="Confirmadas" value={stats.confirmadas} icon={CheckCircle2} color="emerald" />
          <StatCard
            title="Monto activo"
            value={`S/ ${stats.montoTotal.toLocaleString('es-PE', { minimumFractionDigits: 0 })}`}
            icon={DollarSign}
            color="blue"
            disabled
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por proveedor, N° OC..."
              className="pl-10 h-11 bg-white rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={estadoFilter} onValueChange={setEstadoFilter}>
            <SelectTrigger className="w-full sm:w-48 h-11 bg-white rounded-xl">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              {Object.entries(ESTADOS_ORDEN_COMPRA).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>
                  {cfg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-11 rounded-xl" onClick={() => refetch()}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          {canCreate && (
            <Button
              className="h-11 rounded-xl bg-rose-600 hover:bg-rose-700"
              onClick={() => router.push('/admin/Panel-Administrativo/ordenes-compra/nueva')}
            >
              <Plus className="w-4 h-4 mr-1" /> Nueva
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl border animate-pulse h-64" />
        ) : (
          <OrdenesCompraTable
            ordenes={filtered}
            onVer={(o) => {
              setDetailOrden(o);
              setSheetOpen(true);
            }}
            onConfirmar={canEdit ? handleConfirmar : undefined}
            onCancelar={canCancel ? handleCancelar : undefined}
            canConfirm={canEdit && !isConfirming}
            canCancel={canCancel && !isCancelling}
          />
        )}

        <OrdenCompraDetailSheet
          orden={detailOrden}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
        />
      </div>
    </div>
  );
}
