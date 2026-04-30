"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileSpreadsheet, Plus, Search, Factory, RefreshCw, 
  AlertTriangle, CheckCircle, XCircle, ChevronLeft, ChevronRight, 
  FileText, ShieldAlert
} from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { exportToExcel, exportToPDF } from "@/lib/utils/export-utils";
import { getSupabaseBrowserClient } from "@/lib/supabase";

// Lazy loading de componentes de talleres
const TalleresTable = dynamic(() => import("@/components/admin/talleres/TalleresTable"));
const CreateTallerDialog = dynamic(() => import("@/components/admin/talleres/CreateTallerDialog"));
const DeleteTallerDialog = dynamic(() => import("@/components/admin/talleres/DeleteTallerDialog"));
const TallerSkeleton = dynamic(() => import("@/components/admin/talleres/TallerSkeleton"));
const EditTallerDialog = dynamic(() => import("@/components/admin/talleres/EditTallerDialog"));

export default function TalleresPage() {
  const { can, isLoading: authLoading } = usePermissions();
  const supabase = getSupabaseBrowserClient();
  
  const [talleres, setTalleres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTaller, setSelectedTaller] = useState<any | null>(null);
  const [dialogMode, setDialogMode] = useState<"delete" | null>(null);
  
  const [currentPage, setCurrentPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<"todos" | "activo" | "inactivo" | "suspendido">("todos");

    const [editTaller, setEditTaller] = useState<any | null>(null);
  
  const pageSize = 10;

  // Carga de datos directamente desde Supabase para mayor control
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("talleres")
        .select("*")
        .order("nombre", { ascending: false });

      if (error) throw error;
      setTalleres(data || []);
    } catch (err: any) {
      console.error("Error loading talleres:", err);
      toast.error("Error al sincronizar con la base de datos");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (!authLoading && can('view', 'talleres')) {
      loadData();
    }
  }, [authLoading, can, loadData]);

  // Estadísticas calculadas en tiempo real
  const stats = useMemo(() => ({
    total: talleres.length,
    activos: talleres.filter(t => t.estado?.toLowerCase() === 'activo').length,
    inactivos: talleres.filter(t => t.estado?.toLowerCase() === 'inactivo').length,
    suspendidos: talleres.filter(t => t.estado?.toLowerCase() === 'suspendido').length
  }), [talleres]);

  const handleDelete = useCallback((t: any) => { 
    setSelectedTaller(t); 
    setDialogMode("delete"); 
  }, []);
  const handleEdit = (t: any) => {
    setEditTaller(t);
  };

  // Lógica de filtrado (Búsqueda + Estado)
  const filteredTalleres = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    return talleres.filter((t: any) => { 
      const matchSearch = !search || 
        t.nombre.toLowerCase().includes(search) || 
        t.ruc.includes(search) ||
        t.contacto.toLowerCase().includes(search);
      
      const matchStatus = statusFilter === "todos" || t.estado?.toLowerCase() === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [talleres, searchTerm, statusFilter]);

  // Paginación
  const totalPages = Math.ceil(filteredTalleres.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = currentPage * pageSize;
    return filteredTalleres.slice(start, start + pageSize);
  }, [filteredTalleres, currentPage]);

  if (authLoading) return <LoadingTalleres />;
  if (!can('view', 'talleres')) return <AccessDenied />;

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase">
              Gestión de Talleres
            </h1>
            <p className="text-gray-500 text-sm font-medium">Control centralizado de maquila y servicios externos</p>
          </div>
          
          <div className="flex items-center gap-3">
            {can('export', 'talleres') && (
              <div className="hidden sm:flex gap-2">
                <Button onClick={() => exportToPDF(talleres, [], { title: "Reporte de Talleres", filename: "Talleres_GUOR" })} variant="outline" className="border-red-200 text-red-700 hover:bg-red-50 gap-2 h-11 transition-all font-bold">
                  <FileText className="w-5 h-5" /> PDF
                </Button>
                <Button onClick={() => exportToExcel(filteredTalleres, { filename: "Talleres" })} variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 gap-2 h-11 transition-all font-bold">
                  <FileSpreadsheet className="w-5 h-5" /> Excel
                </Button>
              </div>
            )}

            {can('create', 'talleres') && (
              <Button onClick={() => setIsCreateOpen(true)} className="bg-pink-600 hover:bg-pink-700 text-white shadow-lg font-bold gap-2 h-11 px-6 transition-all rounded-xl">
                <Plus className="w-5 h-5" /> Nuevo Taller
              </Button>
            )}
          </div>
        </div>

        {/* Stats Grid con filtros funcionales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="TOTAL" value={stats.total} icon={<Factory />} isActive={statusFilter === "todos"} color="pink" onClick={() => {setStatusFilter("todos"); setCurrentPage(0);}} />
          <StatCard title="ACTIVOS" value={stats.activos} icon={<CheckCircle />} isActive={statusFilter === "activo"} color="green" onClick={() => {setStatusFilter("activo"); setCurrentPage(0);}} />
          <StatCard title="INACTIVOS" value={stats.inactivos} icon={<XCircle />} isActive={statusFilter === "inactivo"} color="gray" onClick={() => {setStatusFilter("inactivo"); setCurrentPage(0);}} />
          <StatCard title="SUSPENDIDOS" value={stats.suspendidos} icon={<AlertTriangle />} isActive={statusFilter === "suspendido"} color="red" onClick={() => {setStatusFilter("suspendido"); setCurrentPage(0);}} />
        </div>

        {/* Filtro de búsqueda */}
        <div className="flex gap-4 items-center bg-white p-4 rounded-2xl border shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Buscar por nombre, RUC o contacto..."
              className="pl-10 h-11 border-gray-100 bg-gray-50/50 focus:bg-white transition-all"
              value={searchTerm}
              onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(0);}}
            />
          </div>
          <Button variant="outline" className="h-11 w-11 p-0 border-gray-100" onClick={loadData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading && 'animate-spin'}`} />
          </Button>
        </div>

        {/* Contenido Principal */}
        {loading ? (
          <div className="space-y-4">
            <TallerSkeleton /> {/* <--- Aquí lo colocamos */}
            <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">
              Sincronizando directorio GUOR...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <TalleresTable 
              data={paginatedData}
              canEdit={can('edit', 'talleres')}
              canDelete={can('delete', 'talleres')}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
            
            {/* Paginación mejorada */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border shadow-sm">
              <span className="text-xs font-bold text-gray-400">
                PÁGINA {currentPage + 1} DE {totalPages || 1}
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0} className="hover:bg-pink-50">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage + 1 >= totalPages} className="hover:bg-pink-50">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modales dinámicos */}
      <CreateTallerDialog 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSuccess={loadData} 
      />

      {selectedTaller && dialogMode === "delete" && (
        <DeleteTallerDialog 
          isOpen={true} 
          taller={selectedTaller} 
          onClose={() => {setDialogMode(null); setSelectedTaller(null);}} 
          onSuccess={loadData} 
        />
      )}
      {editTaller && (
        <EditTallerDialog
          isOpen={true}
          taller={editTaller}
          onClose={() => setEditTaller(null)}
          onSuccess={loadData}
        />
        )}
    </div>
  );
}

// Sub-componentes
function AccessDenied() {
  return (
    <div className="h-[80vh] flex flex-col items-center justify-center text-center p-6 bg-gray-50">
      <div className="bg-amber-50 p-6 rounded-full mb-6">
        <ShieldAlert className="w-16 h-16 text-amber-600" />
      </div>
      <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">Acceso Denegado</h2>
      <p className="text-gray-500 max-w-sm mt-2 font-medium">
        Tu rol actual no tiene permisos para gestionar talleres externos.
      </p>
    </div>
  );
}

function LoadingTalleres() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3 bg-gray-50">
      <div className="h-16 w-16 rounded-full border-4 border-pink-100 border-t-pink-600 animate-spin" />
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Cargando talleres...</p>
    </div>
  );
}

function StatCard({ title, value, icon, isActive, color, onClick }: any) {
  const styles: any = {
    pink: { active: "border-pink-500 ring-pink-50 bg-white", iconActive: "bg-pink-600 text-white", textActive: "text-pink-600" },
    green: { active: "border-green-500 ring-green-50 bg-white", iconActive: "bg-green-600 text-white", textActive: "text-green-600" },
    gray: { active: "border-gray-500 ring-gray-50 bg-white", iconActive: "bg-gray-600 text-white", textActive: "text-gray-600" },
    red: { active: "border-red-500 ring-red-50 bg-white", iconActive: "bg-red-600 text-white", textActive: "text-red-600" }
  };
  const currentStyle = styles[color];
  return (
    <button onClick={onClick} className={`group p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 cursor-pointer ${isActive ? `ring-4 shadow-xl scale-[1.02] z-10 ${currentStyle.active}` : 'bg-white border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-95'}`}>
      <div className={`p-3 rounded-lg transition-all duration-300 ${isActive ? `${currentStyle.iconActive} rotate-3` : 'bg-gray-100 text-gray-600 group-hover:rotate-3'}`}>
        {icon}
      </div>
      <div className="text-left">
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{title}</p>
        <p className={`text-2xl font-black tracking-tight ${isActive ? currentStyle.textActive : 'text-gray-800'}`}>{value}</p>
      </div>
    </button>
  );
}
