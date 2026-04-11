"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, RefreshCw, Plus, ChevronLeft, ChevronRight, 
  Zap, Hammer, Clock, XCircle, CheckCircle2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { usePermissions } from "@/lib/hooks/usePermissions";

const ConfeccionesTable = dynamic(() => import("@/components/admin/confecciones/ConfeccionesTable").then(mod => mod.ConfeccionesTable), { loading: () => <SkeletonTable /> });
const NuevaOrdenModal = dynamic(() => import("@/components/admin/confecciones/NuevaOrdenModal").then(mod => mod.NuevaOrdenModal));

export default function ConfeccionesPage() {
  const { can, isLoading: authLoading } = usePermissions();
  const [confecciones, setConfecciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroTaller, setFiltroTaller] = useState("todos");
  const pageSize = 10;

  const [stats, setStats] = useState({ 
    total: 0, 
    enProceso: 0, 
    completadas: 0, 
    pendientes: 0 
  });

  const canView = can("view", "confecciones");
  const canCreate = can("create", "confecciones");
  const canEdit = can("edit", "confecciones");

  const cargarDatos = useCallback(async () => {
    if (!canView) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(filtroEstado !== "todos" && { estado: filtroEstado }),
        ...(filtroTaller !== "todos" && { taller: filtroTaller })
      });
      const response = await fetch(`/api/admin/confecciones?${params}`);
      const { data } = await response.json();
      const formateados = data.map((item: any) => ({
        ...item,
        fecha_entrega: new Date(item.fechaFin || item.fechaInicio).toISOString().split("T")[0]
      }));
      setConfecciones(formateados);

      setStats({
        total: formateados.length,
        enProceso: formateados.filter((c: any) => ["corte", "confeccionando", "remallado"].includes(c.estado)).length,
        completadas: formateados.filter((c: any) => c.estado === "terminado").length,
        pendientes: formateados.filter((c: any) => c.estado === "solicitado" || c.estado === "pendiente").length
      });
    } catch (error) {
      console.error("Error cargando datos:", error);
      toast.error("Error al sincronizar confecciones");
    } finally {
      setLoading(false);
    }
  }, [canView, filtroEstado, filtroTaller]);

  useEffect(() => {
    if (!authLoading) {
      cargarDatos();
    }
  }, [authLoading, filtroEstado, filtroTaller, cargarDatos]);

  const filteredConfecciones = useMemo(() => {
    return confecciones.filter(c =>
      c.id?.toString().includes(searchTerm) ||
      c.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.taller?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [confecciones, searchTerm]);

  const currentTotalForPagination = stats.total;
  const totalPages = Math.ceil(currentTotalForPagination / pageSize);

  if (authLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Verificando permisos...</p>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
        <p className="text-gray-500">No tienes permisos para ver confecciones</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Confecciones
            </h1>
            <p className="text-gray-500 text-sm">Control de producción en talleres</p>
          </div>

          <div className="flex items-center gap-3">
            {canCreate && (
              <Button onClick={() => setIsModalOpen(true)} className="bg-pink-600 hover:bg-pink-700 shadow-lg font-bold gap-2 h-11 px-6 text-white transition-all active:scale-95">
                <Plus className="w-5 h-5" /> Nueva Orden
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard 
            title="TOTAL" 
            value={stats.total} 
            icon={<Hammer className="w-5 h-5" />} 
            isActive={filtroEstado === "todos"} 
            color="pink" 
            onClick={() => {setFiltroEstado("todos"); setCurrentPage(0);}} 
          />
          <StatCard 
            title="EN PROCESO" 
            value={stats.enProceso} 
            icon={<Zap className="w-5 h-5" />} 
            isActive={filtroEstado === "confeccionando"} 
            color="orange" 
            onClick={() => {setFiltroEstado("confeccionando"); setCurrentPage(0);}} 
          />
          <StatCard 
            title="COMPLETADAS" 
            value={stats.completadas} 
            icon={<CheckCircle2 className="w-5 h-5" />} 
            isActive={filtroEstado === "terminado"} 
            color="emerald" 
            onClick={() => {setFiltroEstado("terminado"); setCurrentPage(0);}} 
          />
          <StatCard 
            title="PENDIENTES" 
            value={stats.pendientes} 
            icon={<Clock className="w-5 h-5" />} 
            isActive={filtroEstado === "solicitado"} 
            color="blue" 
            onClick={() => {setFiltroEstado("solicitado"); setCurrentPage(0);}} 
          />
        </div>

        {/* Buscador y Filtros */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Buscar por orden, cliente o taller..." 
              className="pl-10 h-11 border-gray-200 focus:ring-pink-500"
              value={searchTerm}
              onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(0);}}
            />
          </div>
          <Button variant="outline" className="h-11 border-gray-200" onClick={cargarDatos}>
            <RefreshCw className={`w-4 h-4 ${loading && 'animate-spin'}`} />
          </Button>
        </div>

        {/* Tabla */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center bg-white rounded-xl border animate-pulse">
            <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Sincronizando confecciones...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <ConfeccionesTable data={filteredConfecciones} loading={loading} />
            
            {/* Paginación */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-xs text-gray-500">
                Mostrando <span className="font-bold text-gray-900">{confecciones.length}</span> de <span className="font-bold text-gray-900">{currentTotalForPagination}</span>
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="px-4 py-1.5 text-xs font-bold bg-gray-50 border rounded-lg flex items-center">
                  Página {currentPage + 1} de {totalPages || 1}
                </div>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage + 1 >= totalPages}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <NuevaOrdenModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          cargarDatos();
          setIsModalOpen(false);
          toast.success("Orden creada correctamente");
        }} 
      />
    </div>
  );
}

const SkeletonTable = () => (
  <div className="w-full space-y-4 animate-pulse">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="h-16 bg-slate-100 rounded-2xl w-full" />
    ))}
  </div>
);

function StatCard({ title, value, icon, isActive, color, onClick }: any) {
  const styles: any = {
    pink: { active: "border-pink-500 ring-pink-50 bg-white", iconActive: "bg-pink-600 text-white", iconInactive: "bg-gray-100 text-gray-600", textActive: "text-pink-600", textInactive: "text-gray-800" },
    orange: { active: "border-orange-500 ring-orange-50 bg-white", iconActive: "bg-orange-600 text-white", iconInactive: "bg-gray-100 text-gray-600", textActive: "text-orange-600", textInactive: "text-gray-800" },
    emerald: { active: "border-emerald-500 ring-emerald-50 bg-white", iconActive: "bg-emerald-600 text-white", iconInactive: "bg-gray-100 text-gray-600", textActive: "text-emerald-600", textInactive: "text-gray-800" },
    blue: { active: "border-blue-500 ring-blue-50 bg-white", iconActive: "bg-blue-600 text-white", iconInactive: "bg-gray-100 text-gray-600", textActive: "text-blue-600", textInactive: "text-gray-800" }
  };
  const currentStyle = styles[color] || styles.pink;

  return (
    <button 
      onClick={onClick} 
      className={`group p-3 rounded-xl border transition-all duration-300 flex items-center gap-3 cursor-pointer ${
        isActive 
          ? `ring-4 shadow-xl scale-[1.02] z-10 ${currentStyle.active}` 
          : 'bg-white border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-95'
      }`}
    >
      <div className={`p-2 rounded-lg transition-all duration-300 ${
        isActive ? `${currentStyle.iconActive} rotate-3` : `${currentStyle.iconInactive} group-hover:rotate-3`
      }`}>
        {icon}
      </div>
      <div className="text-left overflow-hidden"> 
        <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest truncate">{title}</p>
        <p className={`text-xl font-black tracking-tight ${isActive ? currentStyle.textActive : currentStyle.textInactive}`}>
          {value}
        </p>
      </div>
    </button>
  );
}