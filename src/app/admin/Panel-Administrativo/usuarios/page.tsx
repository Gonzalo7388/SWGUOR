"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import dynamic from "next/dynamic";
import { usePermissions } from "@/lib/hooks/usePermissions";

import StatsUsuarios from "@/components/admin/usuarios/StatsUsuarios";
import UsuariosTable  from "@/components/admin/usuarios/UsuarioTable";
import UsuarioFilters, { EMPTY_FILTERS, type UsuarioFiltrosState } 
  from "@/components/admin/usuarios/UsuarioFilter";
import type {usuarios } from '@prisma/client';
import UsuariosPageSkeleton from "@/components/admin/usuarios/SkeletonUsuario";

const CreateUsuarioDialog = dynamic(() => import("@/components/admin/usuarios/CreateUsuarioDialog"));
const EditUsuarioDialog   = dynamic(() => import("@/components/admin/usuarios/EditUsuarioDialog"));
const SuspenderDialog     = dynamic(() => import("@/components/admin/usuarios/SuspenderUsuarioDialog"));

async function fetchUsuarios(): Promise<usuarios[]> {
  const res = await fetch("/api/admin/usuarios");
  const body = await res.json();
  if (!res.ok) throw new Error(body.error);
  return body.data ?? body;
}

export default function UsuariosPage() {
  const { can, isLoading: authLoading } = usePermissions();
  const qc = useQueryClient();

  // 1. Carga de Datos (Solo Usuarios)
  const { data, isLoading, isRefetching } = useQuery({ 
    queryKey: ["usuarios"], 
    queryFn: fetchUsuarios, 
    refetchOnWindowFocus: false 
  });

  const [filtros, setFiltros] = useState<UsuarioFiltrosState>(EMPTY_FILTERS);
  const [statFilter, setStatFilter] = useState<"activo" | "inactivo" | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<usuarios | null>(null);
  const [dialogMode, setDialogMode] = useState<"edit" | "suspender" | null>(null);

  const canCreate = can("create", "usuarios");
  const canEdit   = can("edit", "usuarios");

  // 2. Lógica de Filtrado
  const usuariosFiltrados = useMemo(() => {
    return (data ?? []).filter(u => {
      const q = filtros.q.toLowerCase();
      
      // Búsqueda por Email
      const matchBusqueda = !q || u.email.toLowerCase().includes(q);
      
      // Filtro por Estado (Select)
      const matchEstado = !filtros.estado || u.estado === filtros.estado;
      
      // Filtro por Rol (Select)
      const matchRol = !filtros.rol || u.rol === filtros.rol;
      
      // Filtro rápido por Stats (Activo/Inactivo)
      const matchStat = !statFilter || (statFilter === "activo" ? u.estado === "activo" : u.estado !== "activo");

      return matchBusqueda && matchEstado && matchRol && matchStat;
    });
  }, [data, filtros, statFilter]);

  const refresh = useCallback(() => qc.invalidateQueries({ queryKey: ["usuarios"] }), [qc]);

  if (authLoading) return <UsuariosPageSkeleton />;

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Simplificado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Gestión de Accesos</h1>
          </div>

          {canCreate && (
            <Button 
              onClick={() => setCreateOpen(true)}
              className="bg-pink-600  hover:bg-pink-700 text-white font-bold rounded-2xl h-12 px-6 shadow-lg shadow-pink-200 transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4 mr-2" /> Nuevo Acceso
            </Button>
          )}
        </div>

        {/* Estadísticas de Accesos */}
        <StatsUsuarios 
          usuarios={data ?? []} 
          loading={isLoading} 
          statusFilter={statFilter} 
          onFilterChange={setStatFilter} 
        />

        {/* Sección de Tabla */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <UsuarioFilters 
                filters={filtros} 
                onChange={setFiltros} 
                totalCount={usuariosFiltrados.length}
                onRefresh={refresh}
                isRefreshing={isRefetching}
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <UsuariosTable 
              usuarios={usuariosFiltrados} 
              loading={isLoading}
              onEdit={canEdit ? (u) => { setSelectedUser(u); setDialogMode("edit"); } : undefined}
              onSuspender={canEdit ? (u) => { setSelectedUser(u); setDialogMode("suspender"); } : undefined} 
            />
          </div>
        </div>
      </div>

      {/* Modales */}
      <CreateUsuarioDialog isOpen={createOpen} onClose={() => setCreateOpen(false)} onSuccess={refresh} />
      
      {selectedUser && dialogMode === "edit" && (
        <EditUsuarioDialog 
          isOpen 
          usuario={selectedUser} 
          onClose={() => { setDialogMode(null); setSelectedUser(null); }} 
          onSuccess={refresh} 
        />
      )}

      {selectedUser && dialogMode === "suspender" && (
        <SuspenderDialog 
          isOpen 
          usuario={selectedUser} 
          onClose={() => { setDialogMode(null); setSelectedUser(null); }} 
          onSuccess={refresh} 
        />
      )}
    </div>
  );
}
