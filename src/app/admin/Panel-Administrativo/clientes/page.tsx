"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Search, Users, RefreshCw, UserCheck, UserMinus, ChevronLeft, ChevronRight, Ban, Star } from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { exportToExcel } from "@/lib/utils/export-utils";
import { usePermissions } from "@/lib/hooks/usePermissions";

const ClientesTable = dynamic(() => import("@/components/admin/clientes/ClientesTable"));
const EditClienteDialog = dynamic(() => import("@/components/admin/clientes/EditClienteDialog"));
const DeleteClienteDialog = dynamic(() => import("@/components/admin/clientes/DeleteClienteDialog"));

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCliente, setSelectedCliente] = useState<any | null>(null);
  const [dialogMode, setDialogMode] = useState<"edit" | "delete" | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const pageSize = 10;

  // Actualizado para incluir todos los estados de tu Enum EstadoCliente
  const [stats, setStats] = useState({ 
    total: 0, 
    activo: 0, 
    inactivo: 0, 
    suspendido: 0, 
    potencial: 0 
  });

  const loadStats = useCallback(async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      const [resTotal, resActivos, resInactivos, resSusp, resPot] = await Promise.all([
        supabase.from("clientes").select("*", { count: 'exact', head: true }),
        supabase.from("clientes").select("*", { count: 'exact', head: true }).eq("activo", "activo"),
        supabase.from("clientes").select("*", { count: 'exact', head: true }).eq("activo", "inactivo"),
        supabase.from("clientes").select("*", { count: 'exact', head: true }).eq("activo", "suspendido"),
        supabase.from("clientes").select("*", { count: 'exact', head: true }).eq("activo", "potencial"),
      ]);
      
      setStats({
        total: resTotal.count || 0,
        activo: resActivos.count || 0,
        inactivo: resInactivos.count || 0,
        suspendido: resSusp.count || 0,
        potencial: resPot.count || 0
      });
    } catch (err) { console.error(err); }
  }, []);

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      let query = supabase.from("clientes").select("*", { count: 'exact' });
      
      // Corregido: Filtro por string exacto en minúsculas
      if (statusFilter) query = query.eq("activo", statusFilter);

      const from = currentPage * pageSize;
      const { data, error } = await query
        .order("razon_social", { ascending: true })
        .range(from, from + pageSize - 1);

      if (error) throw error;
      setClientes(data || []);
      loadStats(); 
    } catch (err) {
      toast.error("Error al sincronizar datos");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, loadStats]);

  useEffect(() => { fetchClientes(); }, [fetchClientes]);

  const handleToggleStatus = async (cliente: any) => {
    try {
      const supabase = getSupabaseBrowserClient();
      const nuevoEstado = cliente.activo === 'activo' ? 'inactivo' : 'activo';
     
      const { error } = await (supabase.from("clientes") as any)
        .update({ activo: nuevoEstado })
        .eq("id", cliente.id);

      if (error) throw error;
      toast.success(`Cliente actualizado a ${nuevoEstado}`);
      fetchClientes();
    } catch (err) { 
      toast.error("No se pudo cambiar el estado"); 
    }
  };

  // 2. Funciones que faltaban (Errores 2304)
  const handleEdit = (cliente: any) => {
    setSelectedCliente(cliente);
    setDialogMode("edit");
  };

  const handleDeleteTrigger = (cliente: any) => {
    setSelectedCliente(cliente);
    setDialogMode("delete");
  };

  const handleExportExcel = () => {
    if (clientes.length === 0) return toast.error("No hay datos para exportar");
    const dataToExport = clientes.map(c => ({
      "Razón Social": c.razon_social,
      "RUC": c.ruc,
      "Correo": c.email,
      "Teléfono": c.telefono,
      "Dirección": c.direccion,
      "Estado": c.activo?.toUpperCase() || "SIN ESTADO",
      "Registro": new Date(c.created_at).toLocaleDateString()
    }));
    exportToExcel(dataToExport, { filename: `Clientes_GUOR_${new Date().toISOString().split('T')[0]}` });
    toast.success("Excel generado exitosamente");
  };

  const filteredClientes = useMemo(() => {
    return clientes.filter(c => 
      c.razon_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ruc?.toString().includes(searchTerm)
    );
  }, [clientes, searchTerm]);

  // Corregido: Obtención de total dinámico para paginación
  const currentTotalForPagination = statusFilter ? (stats as any)[statusFilter] : stats.total;
  const totalPages = Math.ceil(currentTotalForPagination / pageSize);

  const { can, isLoading: authLoading } = usePermissions();

  if (!authLoading && !can('view', 'clientes')) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500 font-bold uppercase tracking-tighter text-center">
          Acceso Denegado<br/>
          <span className="text-xs font-normal">No tienes permisos para ver el directorio de clientes</span>
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="text-pink-600" /> Directorio de Clientes
            </h1>
            <p className="text-gray-500 text-sm">Gestión de base de datos GUOR</p>
          </div>

          <div className="flex items-center gap-3">
            {can('export', 'clientes') && (
              <Button onClick={handleExportExcel} variant="outline" className="bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold gap-2 h-11 transition-all">
                <FileSpreadsheet className="w-5 h-5" />
                <span className="hidden sm:inline">Exportar Excel</span>
              </Button>
            )}
          </div>
        </div>

        {/* CARTAS DE ESTADÍSTICAS AMPLIADAS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <StatCard title="TOTAL" value={stats.total} icon={<Users className="w-5 h-5" />} isActive={statusFilter === null} color="pink" onClick={() => {setStatusFilter(null); setCurrentPage(0);}} />
          <StatCard title="ACTIVOS" value={stats.activo} icon={<UserCheck className="w-5 h-5" />} isActive={statusFilter === 'activo'} color="emerald" onClick={() => {setStatusFilter('activo'); setCurrentPage(0);}} />
          <StatCard title="INACTIVOS" value={stats.inactivo} icon={<UserMinus className="w-5 h-5" />} isActive={statusFilter === 'inactivo'} color="orange" onClick={() => {setStatusFilter('inactivo'); setCurrentPage(0);}} />
          <StatCard title="SUSPENDIDOS" value={stats.suspendido} icon={<Ban className="w-5 h-5" />} isActive={statusFilter === 'suspendido'} color="red" onClick={() => {setStatusFilter('suspendido'); setCurrentPage(0);}} />
          <StatCard title="POTENCIALES" value={stats.potencial} icon={<Star className="w-5 h-5" />} isActive={statusFilter === 'potencial'} color="blue" onClick={() => {setStatusFilter('potencial'); setCurrentPage(0);}} />
        </div>

        {/* Buscador y Tabla omitidos por brevedad, se mantienen igual pero con filteredClientes */}
        {/* ... (Resto del JSX de búsqueda y tabla) */}
        
        {/* Asegúrate de pasar las props correctas a ClientesTable */}
        {!loading && (
            <ClientesTable 
                data={filteredClientes} 
                onEdit={handleEdit}
                onDelete={handleDeleteTrigger}
                onToggleStatus={handleToggleStatus}
            />
        )}
        
        {/* Paginación */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
            <p className="text-xs text-gray-500">
                Mostrando <span className="font-bold text-gray-900">{clientes.length}</span> de <span className="font-bold text-gray-900">{currentTotalForPagination}</span>
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

      {/* Diálogos */}
      {selectedCliente && dialogMode === "edit" && (
        <EditClienteDialog isOpen={true} onClose={() => {setDialogMode(null); setSelectedCliente(null);}} onSuccess={fetchClientes} cliente={selectedCliente} />
      )}
      {selectedCliente && dialogMode === "delete" && (
        <DeleteClienteDialog isOpen={true} onClose={() => {setDialogMode(null); setSelectedCliente(null);}} onSuccess={fetchClientes} cliente={selectedCliente} />
      )}
    </div>
  );
}

// StatCard actualizado con soporte para nuevos colores
function StatCard({ title, value, icon, isActive, color, onClick }: any) {
  const styles: any = {
    pink: { active: "border-pink-500 ring-pink-50 bg-white", icon: "bg-pink-600 text-white", text: "text-pink-600" },
    emerald: { active: "border-emerald-500 ring-emerald-50 bg-white", icon: "bg-emerald-600 text-white", text: "text-emerald-600" },
    orange: { active: "border-orange-500 ring-orange-50 bg-white", icon: "bg-orange-600 text-white", text: "text-orange-600" },
    red: { active: "border-red-500 ring-red-50 bg-white", icon: "bg-red-600 text-white", text: "text-red-600" },
    blue: { active: "border-blue-500 ring-blue-50 bg-white", icon: "bg-blue-600 text-white", text: "text-blue-600" }
  };

  const currentStyle = styles[color] || styles.pink;

  return (
    <button onClick={onClick} className={`group p-3 rounded-xl border transition-all duration-300 flex items-center gap-3 cursor-pointer ${isActive ? `ring-4 shadow-md scale-[1.02] ${currentStyle.active}` : 'bg-white border-gray-100 hover:shadow-md'}`}>
      <div className={`p-2 rounded-lg ${isActive ? currentStyle.icon : 'bg-gray-100 text-gray-600'}`}> {icon} </div>
      <div className="text-left overflow-hidden"> 
        <p className="text-[9px] text-gray-400 font-black uppercase tracking-tighter truncate">{title}</p>
        <p className={`text-xl font-black ${isActive ? currentStyle.text : 'text-gray-800'}`}>{value}</p>
      </div>
    </button>
  );
}