"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/lib/hooks/usePermissions";
import type { ClienteEditable, ClienteListItem } from "@/lib/services/clientes-services";
import type { TipoCliente } from "@prisma/client";
import { exportClientesListToExcel, exportClientesListToPDF } from "@/lib/utils/export-utils";
import ClientesTable         from "@/components/admin/clientes/ClientesTable";
import ClienteFilters, { ClienteFiltrosState, EMPTY_CLIENTE_FILTERS } from "@/components/admin/clientes/FiltersClientes";
import StatsClientes         from "@/components/admin/clientes/StatsCliente";
import EditClienteDialog     from "@/components/admin/clientes/EditClienteDialog";
import SuspenderClienteDialog from "@/components/admin/clientes/SuspenderClienteDialog";
import ClientesPageSkeleton  from  "@/components/admin/clientes/SkeletonCliente";

export default function ClientesPage() {
  const { can, isLoading: authLoading  } = usePermissions();

  const [clientes,     setClientes]     = useState<ClienteListItem[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [filters,      setFilters]      = useState<ClienteFiltrosState>(EMPTY_CLIENTE_FILTERS);
  const [statusFilter, setStatusFilter] = useState<"activo" | "inactivo" | "conPedidos" | null>(null);

  const [editTarget,      setEditTarget]      = useState<ClienteEditable | null>(null);
  const [suspenderTarget, setSuspenderTarget] = useState<ClienteListItem | null>(null);

  // ── Fetch ────────────────────────────────────────────────────
  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/clientes");
      const body = await res.json();
      if (!res.ok) throw new Error(body?.message ?? "Error al cargar clientes");
      setClientes(body.data ?? []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClientes(); }, [fetchClientes]);

  // ── Filtrado local ───────────────────────────────────────────
  const filtered = useMemo(() => {
    return clientes.filter((c) => {
      if (statusFilter === "activo"    && c.activo !== "activo")  return false;
      if (statusFilter === "inactivo"  && c.activo === "activo")  return false;
      if (statusFilter === "conPedidos") {
        if (!c.ultimo_pedido_en) return false;
        if (Date.now() - new Date(c.ultimo_pedido_en).getTime() >= 90 * 24 * 60 * 60 * 1000) return false;
      }

      const q = filters.q.toLowerCase();
      if (q) {
        const hayMatch =
          c.razon_social?.toLowerCase().includes(q) ||
          c.ruc?.toLowerCase().includes(q) ||
          c.usuarios?.email?.toLowerCase().includes(q);
        if (!hayMatch) return false;
      }

      if (filters.estado && c.activo !== filters.estado) return false;

      return true;
    });
  }, [clientes, filters, statusFilter]);

  if (authLoading) return <ClientesPageSkeleton />;

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Gestión de Clientes</h1>
            <p className="text-gray-500 text-sm">Administración del Cliente</p>
          </div>
            {can("export", "clientes") && clientes.length > 0 && (
              <>
                <Button onClick={() =>
                  exportClientesListToPDF(filtered)
                    .then(() => toast.success("PDF generado"))
                    .catch(() => toast.error("Error al generar PDF"))
                  }
                  variant="outline"
                  className="bg-white border-red-200 text-red-700 hover:bg-red-50 font-bold gap-2 h-11 transition-all active:scale-95">
                  <FileText className="w-5 h-5" />
                  <span className="hidden sm:inline">Reporte PDF</span>
                </Button>
                <Button onClick={() =>
                  exportClientesListToExcel(filtered)
                    .then(() => toast.success("Excel generado"))
                    .catch(() => toast.error("Error al generar Excel"))
                  }
                  variant="outline"
                  className="bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold gap-2 h-11 transition-all active:scale-95">
                  <FileSpreadsheet className="w-5 h-5" />
                  <span className="hidden sm:inline">Exportar Excel</span>
                </Button>
              </>
            )}
        </div>
      </div>

      {/* Stats */}
      <StatsClientes
        clientes={clientes}
        loading={loading}
        statusFilter={statusFilter}
        onFilterChange={setStatusFilter}
      />

      {/* Filtros */}
      <ClienteFilters
        filters={filters}
        onChange={setFilters}
        totalCount={filtered.length}
      />

      {/* Tabla */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <ClientesTable
          clientes={filtered}
          loading={loading}
          onEdit={can("edit", "clientes") ? (c) => {
            setEditTarget({
              id:               c.id,
              ruc:              c.ruc              ?? "",
              razon_social:     c.razon_social     ?? null,
              nombre_comercial: c.nombre_comercial ?? null,
              telefono:         c.telefono         ?? null,
              direccion_fiscal: c.direccion_fiscal ?? null,
              tipo_cliente:     c.tipo_cliente as TipoCliente ?? null,
              direcciones_cliente: c.direcciones_cliente ?? [],
            });
          } : undefined}
          onSuspender={can("archive", "clientes") ? setSuspenderTarget : undefined}
        />
      </div>

      {/* Dialogs */}
      <EditClienteDialog
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={fetchClientes}
        cliente={editTarget}
      />
      <SuspenderClienteDialog
        isOpen={!!suspenderTarget}
        onClose={() => setSuspenderTarget(null)}
        onSuccess={fetchClientes}
        cliente={suspenderTarget}
      />
    </div>
  );
}