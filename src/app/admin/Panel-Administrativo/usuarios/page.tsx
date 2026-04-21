"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Search, Users, RefreshCw, UserCheck, UserMinus, ChevronLeft, ChevronRight, ShieldAlert, Plus, ShieldCheck } from "lucide-react";
import dynamic from "next/dynamic"; 
import { toast } from "sonner";
import { usePermissions } from "@/lib/hooks/usePermissions";
import type { EstadoUsuario } from "@prisma/client";

const UsuariosTable = dynamic(() => import("@/components/admin/usuarios/UsuarioTable"));
const CreateUsuarioDialog = dynamic(() => import("@/components/admin/usuarios/CreateUsuarioDialog"));
const EditUsuarioDialog = dynamic(() => import("@/components/admin/usuarios/EditUsuarioDialog"));
const DeleteUsuarioDialog = dynamic(() => import("@/components/admin/usuarios/DeleteUsuarioDialog"));

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsuario, setSelectedUsuario] = useState<any | null>(null);
  const [dialogMode, setDialogMode] = useState<"edit" | "new" | "delete" | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<EstadoUsuario | null>(null);
  const pageSize = 10;

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/usuarios');
      if (!res.ok) throw new Error("Error al obtener usuarios");
      const data = await res.json();
      setUsuarios(data || []);
    } catch (err) {
      toast.error("Error al sincronizar con el servidor");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);

  // Lógica de Filtrado Multicapa (Personal + Cliente)
  const filteredUsuarios = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return usuarios
      .filter(u => {
        const matchStatus = statusFilter ? u.estado === statusFilter : true;
        const nombre = u.personal_interno?.nombre_completo?.toLowerCase() ?? "";
        const email = u.email?.toLowerCase() ?? "";
        const razonSocial = u.clientes?.razon_social?.toLowerCase() ?? "";
        const ruc = u.clientes?.ruc?.toLowerCase() ?? "";
        
        return matchStatus && (
          nombre.includes(term) || email.includes(term) || razonSocial.includes(term) || ruc.includes(term)
        );
      })
      .sort((a, b) => {
        const labelA = a.personal_interno?.nombre_completo ?? a.clientes?.razon_social ?? a.email;
        const labelB = b.personal_interno?.nombre_completo ?? b.clientes?.razon_social ?? b.email;
        return labelA.localeCompare(labelB, 'es');
      });
  }, [usuarios, searchTerm, statusFilter]);

  // Cálculos para las estadísticas
  const stats = useMemo(() => ({
    total: usuarios.length,
    activos: usuarios.filter(u => u.estado === 'activo').length,
    inactivos: usuarios.filter(u => u.estado === 'inactivo').length,
    admins: usuarios.filter(u => u.rol === 'admin').length,
  }), [usuarios]);

  const paginatedUsuarios = useMemo(() => {
    const start = currentPage * pageSize;
    return filteredUsuarios.slice(start, start + pageSize);
  }, [filteredUsuarios, currentPage]);

  const { can, isLoading: authLoading } = usePermissions();

  if (!authLoading && !can('view', 'usuarios')) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-center p-6">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4 opacity-20" />
        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Acceso Restringido</h2>
        <p className="text-gray-500 max-w-sm mt-2">No tienes los privilegios necesarios para gestionar usuarios.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Profersional */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
              Gestión de <span className="text-pink-600">Usuarios</span>
            </h1>
            <p className="text-slate-500 font-medium">Control unificado de personal administrativo y accesos de clientes.</p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={fetchUsuarios} variant="outline" className="bg-white border-slate-200 font-bold h-12 px-6 hover:bg-slate-50 transition-all">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading && 'animate-spin'}`} />
              Actualizar
            </Button>
            <Button onClick={() => setDialogMode("new")} className="bg-slate-900 hover:bg-pink-700 text-white font-bold h-12 px-8 shadow-xl transition-all">
              <Plus className="w-5 h-5 mr-2" /> Nuevo Usuario
            </Button>
          </div>
        </div>

        {/* PANEL DE ESTADÍSTICAS UTILIZANDO LOS ICONOS FALTANTES */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total" value={stats.total} icon={<Users className="w-5 h-5" />} color="blue" />
          <StatCard title="Activos" value={stats.activos} icon={<UserCheck className="w-5 h-5" />} color="emerald" />
          <StatCard title="Inactivos" value={stats.inactivos} icon={<UserMinus className="w-5 h-5" />} color="orange" />
          <StatCard title="Staff / Admin" value={stats.admins} icon={<ShieldCheck className="w-5 h-5" />} color="pink" />
        </div>

        {/* Buscador Avanzado */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-pink-500 transition-colors" />
          <input 
            placeholder="Buscar por nombre, email, RUC o razón social..." 
            className="w-full pl-12 pr-4 h-14 bg-white border-2 border-slate-100 rounded-2xl focus:border-pink-500 focus:ring-0 outline-none transition-all shadow-sm text-lg font-medium"
            value={searchTerm}
            onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(0);}}
          />
        </div>

        {/* Tabla de Resultados */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <UsuariosTable 
            usuarios={paginatedUsuarios}
            loading={loading}
            onEdit={(u) => { setSelectedUsuario(u); setDialogMode("edit"); }}
            onDelete={(u) => { setSelectedUsuario(u); setDialogMode("delete"); }}
            onToggleStatus={async (u) => {
              const res = await fetch('/api/admin/usuarios', {
                method: 'PATCH',
                body: JSON.stringify({ id: u.id, estado: u.estado === 'activo' ? 'inactivo' : 'activo' })
              });
              if (res.ok) { toast.success("Estado actualizado"); fetchUsuarios(); }
            }}
          />
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between px-2">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            {filteredUsuarios.length} Usuarios encontrados
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0} className="rounded-xl h-10 w-10 p-0">
              <ChevronLeft />
            </Button>
            <span className="bg-white border px-4 py-2 rounded-xl text-sm font-black shadow-sm">
              {currentPage + 1} / {Math.ceil(filteredUsuarios.length / pageSize) || 1}
            </span>
            <Button variant="ghost" onClick={() => setCurrentPage(p => p + 1)} disabled={(currentPage + 1) * pageSize >= filteredUsuarios.length} className="rounded-xl h-10 w-10 p-0">
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>

      {/* Diálogos de Gestión */}
      <CreateUsuarioDialog isOpen={dialogMode === "new"} onClose={() => setDialogMode(null)} onSuccess={fetchUsuarios} />
      {selectedUsuario && (
        <>
          <EditUsuarioDialog isOpen={dialogMode === "edit"} usuario={selectedUsuario} onClose={() => setDialogMode(null)} onSuccess={fetchUsuarios} />
          <DeleteUsuarioDialog isOpen={dialogMode === "delete"} usuario={selectedUsuario} onClose={() => setDialogMode(null)} onSuccess={fetchUsuarios} />
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const colors: any = {
    blue: "text-blue-600 bg-blue-50",
    emerald: "text-emerald-600 bg-emerald-50",
    orange: "text-orange-600 bg-orange-50",
    pink: "text-pink-600 bg-pink-50"
  };
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <p className="text-xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
}