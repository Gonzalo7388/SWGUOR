"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck, UserPlus, Download } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/lib/hooks/usePermissions";
import type { usuarios } from "@prisma/client";

import UsuariosTable from "@/components/admin/usuarios/UsuarioTable";
import UsuarioFilters, {
  UsuarioFiltrosState,
  EMPTY_FILTERS,
} from "@/components/admin/usuarios/UsuarioFilter";
import StatsUsuarios from "@/components/admin/usuarios/StatsUsuarios";
import UsuarioFormModal from "@/components/admin/usuarios/UsuarioFormModal";
import { UsuarioSuspendModal } from "@/components/admin/usuarios/UsuarioModals";

export default function UsuariosPage() {
  const { can } = usePermissions();

  const [usuarios, setUsuarios] = useState<usuarios[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<UsuarioFiltrosState>(EMPTY_FILTERS);
  const [statusFilter, setStatusFilter] = useState<"activo" | "inactivo" | null>(null);

  // Modal states
  const [formTarget, setFormTarget] = useState<usuarios | null | undefined>(undefined);
  const [suspenderTarget, setSuspenderTarget] = useState<usuarios | null>(null);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/usuarios");
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Error al cargar usuarios");
      setUsuarios(body.data ?? []);
    } catch (e: any) {
      toast.error(e.message ?? "Error inesperado");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const filtered = useMemo(() => {
    return usuarios.filter((u) => {
      // 1. Filtro por chips de stats
      if (statusFilter && u.estado !== statusFilter) return false;

      // 2. Filtro por barra de búsqueda y selectores
      if (filters.estado && u.estado !== filters.estado) return false;
      if (filters.rol && u.rol !== filters.rol) return false;
      
      const q = filters.q.toLowerCase().trim();
      if (q && !u.email?.toLowerCase().includes(q)) return false;

      return true;
    });
  }, [usuarios, filters, statusFilter]);

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gestión de Accesos</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Control de cuentas de usuario y permisos del sistema</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {can("export", "usuarios") && (
              <Button variant="outline" className="h-11 gap-2 border-slate-200 rounded-xl hover:bg-white font-bold text-slate-600 transition-all active:scale-95">
                <Download size={18} /> Exportar
              </Button>
            )}
            {can("create", "usuarios") && (
              <Button 
                onClick={() => setFormTarget(null)}
                className="h-11 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
              >
                <UserPlus size={18} /> Nuevo Usuario
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <StatsUsuarios 
          usuarios={usuarios} 
          loading={loading} 
          statusFilter={statusFilter}
          onFilterChange={setStatusFilter}
        />

        {/* Filtros */}
        <UsuarioFilters 
          filters={filters} 
          onChange={setFilters} 
          totalCount={filtered.length}
          onRefresh={fetchUsuarios}
          isRefreshing={loading}
        />

        {/* Tabla */}
        <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
          <UsuariosTable 
            usuarios={filtered} 
            loading={loading}
            onEdit={can("edit", "usuarios") ? setFormTarget : undefined}
            onSuspender={can("archive", "usuarios") ? setSuspenderTarget : undefined}
          />
        </div>

        {/* Modales */}
        {formTarget !== undefined && (
          <UsuarioFormModal
            usuario={formTarget}
            onClose={() => setFormTarget(undefined)}
            onSuccess={fetchUsuarios}
          />
        )}

        {suspenderTarget && (
          <UsuarioSuspendModal
            usuario={suspenderTarget}
            onClose={() => setSuspenderTarget(null)}
            onSuccess={fetchUsuarios}
          />
        )}

      </div>
    </div>
  );
}
