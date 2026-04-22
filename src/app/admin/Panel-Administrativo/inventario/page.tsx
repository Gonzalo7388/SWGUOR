"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileSpreadsheet, Plus, Search,
  AlertTriangle, XCircle, ChevronLeft, ChevronRight, 
  FileText, Layers, RefreshCw, CircleDollarSign
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { exportToExcel, exportToPDF } from "@/lib/utils/export-utils";
import { useInventario } from "@/lib/hooks/useInventario";
import { usePermissions } from "@/lib/hooks/usePermissions";

// Lazy loading con carga prioritaria para la tabla
const InventarioTable = dynamic(() => import("@/components/admin/inventario/InventarioTable"), {
  loading: () => <div className="h-64 animate-pulse bg-slate-100 rounded-2xl" />
});
const CreateInsumoDialog = dynamic(() => import("@/components/admin/inventario/CreateInsumoDialog"));
const EditInsumoDialog = dynamic(() => import("@/components/admin/inventario/EditInsumoDialog"));
const DeleteInsumoDialog = dynamic(() => import("@/components/admin/inventario/DeleteInsumoDialog"));

export default function InventarioPage() {
  const { can, isLoading: authLoading } = usePermissions();
  const { insumos, cargando, obtenerInsumosList } = useInventario();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedInsumo, setSelectedInsumo] = useState<any | null>(null);
  const [dialogMode, setDialogMode] = useState<"edit" | "delete" | null>(null);
  
  const [currentPage, setCurrentPage] = useState(0);
  const [quickFilter, setQuickFilter] = useState<"todos" | "bajo_stock" | "critico">("todos");
  const [selectedTipo, setSelectedTipo] = useState<string>("todos");
  
  const pageSize = 10;

  // Métricas financieras y operativas
  const stats = useMemo(() => {
    const totalInsumos = insumos.length;
    const bajoStock = insumos.filter((i: any) => i.stock_actual > 0 && i.stock_actual <= i.stock_minimo).length;
    const sinStock = insumos.filter((i: any) => i.stock_actual <= 0).length;
    
    // Cálculo del valor de activos en almacén (Stock * Precio Unitario)
    const valorAlmacen = insumos.reduce((acc: number, curr: any) => {
      const precio = curr.precio_unitario ? Number(curr.precio_unitario) : 0;
      return acc + (precio * curr.stock_actual);
    }, 0);

    return { totalInsumos, bajoStock, sinStock, valorAlmacen };
  }, [insumos]);

  // Permisos
  const canView = can('view', 'inventario');
  const canCreate = can('create', 'inventario');
  const canEdit = can('edit', 'inventario');
  const canDelete = can('delete', 'inventario');
  const canExport = can('export', 'inventario');

  useEffect(() => {
    if (!authLoading && canView) {
      obtenerInsumosList();
    }
  }, [obtenerInsumosList, authLoading, canView]);

  const filteredData = useMemo(() => {
    return insumos.filter((i: any) => {
      const matchSearch = !searchTerm || i.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTipo = selectedTipo === "todos" || i.tipo === selectedTipo;
      
      let matchQuick = true;
      if (quickFilter === "bajo_stock") matchQuick = i.stock_actual > 0 && i.stock_actual <= i.stock_minimo;
      if (quickFilter === "critico") matchQuick = i.stock_actual <= 0;
      
      return matchSearch && matchTipo && matchQuick;
    });
  }, [insumos, searchTerm, quickFilter, selectedTipo]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  // --- Handlers de Exportación Actualizados ---
  const handleExportPDF = () => {
    if (!canExport) return toast.error("Sin permisos");
    const headers = [["INSUMO", "TIPO", "STOCK", "PRECIO", "VALOR TOTAL"]];
    const body = filteredData.map((i: any) => [
      i.nombre.toUpperCase(),
      i.tipo,
      `${i.stock_actual} ${i.unidad_medida}`,
      `S/ ${Number(i.precio_unitario).toFixed(2)}`,
      `S/ ${(i.stock_actual * Number(i.precio_unitario)).toFixed(2)}`
    ]);

    exportToPDF(headers, body, { 
      title: "REPORTE VALORIZADO DE INVENTARIO",
      filename: `Kardex_GUOR_${new Date().toLocaleDateString()}` 
    });
  };

  const handleExportExcel = () => {
    if (!canExport) {
      toast.error("No tienes permisos para exportar");
      return;
    }
    
    if (filteredData.length === 0) {
      return toast.error("No hay datos para exportar");
    }

    const dataToExport = filteredData.map((i: any) => ({
      "INSUMO": i.nombre.toUpperCase(),
      "CATEGORÍA": i.tipo,
      "STOCK ACTUAL": i.stock_actual,
      "U.M.": i.unidad_medida,
      "PRECIO REPOSICIÓN": Number(i.precio_unitario || 0).toFixed(2),
      "VALOR TOTAL STOCK": (i.stock_actual * Number(i.precio_unitario || 0)).toFixed(2),
      "STOCK MÍNIMO": i.stock_minimo,
      "ESTADO": i.stock_actual === 0 
        ? "AGOTADO" 
        : i.stock_actual <= i.stock_minimo 
          ? "STOCK BAJO" 
          : "ÓPTIMO",
      "ÚLTIMA ACTUALIZACIÓN": i.updated_at ? new Date(i.updated_at).toLocaleDateString() : 'N/A'
    }));

    exportToExcel(dataToExport, { 
      filename: `Kardex_Valorizado_GUOR_${new Date().toISOString().split('T')[0]}` 
    });
    
    toast.success("Excel generado con métricas de valorización");
  };

  const handleEdit = (item: any) => {
    setSelectedInsumo(item);
    setDialogMode("edit");
  };

  const handleDelete = (item: any) => {
    setSelectedInsumo(item);
    setDialogMode("delete");
  };

  if (authLoading) return <LoadingScreen message="Verificando identidad..." />;
  if (!canView) return <AccessDenied />;

  return (
    <div className="p-4 md:p-8 space-y-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Principal */}
        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2 h-8 bg-slate-900 rounded-full" />
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Kardex Central</h1>
            </div>
            <p className="text-slate-500 text-sm font-medium ml-5">Telas, Avíos e Insumos Modas Guor SAC</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {canExport && (
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <Button onClick={handleExportPDF} variant="ghost" size="sm" className="hover:bg-white hover:text-red-600 font-bold transition-all h-9 rounded-lg">
                  <FileText className="w-4 h-4 mr-2" /> PDF
                </Button>
                <Button onClick={handleExportExcel} variant="ghost" size="sm" className="hover:bg-white hover:text-emerald-600 font-bold transition-all h-9 rounded-lg">
                  <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
                </Button>
              </div>
            )}
            {canCreate && (
              <Button onClick={() => setIsCreateOpen(true)} className="bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-200 font-bold gap-2 h-11 px-6 transition-all active:scale-95 rounded-xl text-white">
                <Plus className="w-5 h-5" /> Registrar Insumo
              </Button>
            )}
          </div>
        </div>

        {/* KPIs Dinámicos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="TOTAL ÍTEMS" 
            value={stats.totalInsumos} 
            icon={<Layers className="w-6 h-6" />} 
            isActive={quickFilter === "todos"} 
            onClick={() => {setQuickFilter("todos"); setCurrentPage(0);}} 
            color="slate" 
          />
          <MetricCard 
            title="CRÍTICO / BAJO" 
            value={stats.bajoStock} 
            icon={<AlertTriangle className="w-6 h-6" />} 
            isActive={quickFilter === "bajo_stock"} 
            onClick={() => {setQuickFilter("bajo_stock"); setCurrentPage(0);}} 
            color="amber" 
          />
          <MetricCard 
            title="SIN STOCK" 
            value={stats.sinStock} 
            icon={<XCircle className="w-6 h-6" />} 
            isActive={quickFilter === "critico"} 
            onClick={() => {setQuickFilter("critico"); setCurrentPage(0);}} 
            color="red" 
          />
          <MetricCard 
            title="VALOR ESTIMADO" 
            value={`S/ ${stats.valorAlmacen.toLocaleString()}`} 
            icon={<CircleDollarSign className="w-6 h-6" />} 
            isActive={false} 
            color="blue" 
            onClick={() => {}} 
          />
        </div>

        {/* Sección de Tabla */}
        <div className="space-y-4">
          {/* Filtros */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-4 top-3 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Filtrar por nombre del material..."
                className="pl-12 h-11 bg-slate-50/50 border-slate-100 focus:bg-white transition-all rounded-xl"
                value={searchTerm}
                onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(0);}}
              />
            </div>

            <Select value={selectedTipo} onValueChange={(v) => {setSelectedTipo(v); setCurrentPage(0);}}>
              <SelectTrigger className="h-11 w-full lg:w-56 rounded-xl bg-slate-50/50 border-slate-100">
                <SelectValue placeholder="Tipo de Insumo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="Materia Prima">Materia Prima</SelectItem>
                <SelectItem value="Insumo">Insumos (Botones, Cierres)</SelectItem>
                <SelectItem value="Herramienta">Herramientas</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="h-11 border-slate-100 hover:bg-slate-100 rounded-xl px-4 text-slate-400" onClick={() => obtenerInsumosList()}>
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <InventarioTable 
            data={paginatedData} 
            loading={cargando} 
            onEdit={handleEdit}
            onDelete={handleDelete}
            canEdit={canEdit}
            canDelete={canDelete}
          />
          
          {/* Paginación */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center justify-between">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">
              Página {currentPage + 1} de {totalPages || 1}
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0} className="rounded-xl h-10 w-10 p-0 border border-slate-100">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage + 1 >= totalPages} className="rounded-xl h-10 w-10 p-0 border border-slate-100">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Capa de Diálogos */}
      {canCreate && (
        <CreateInsumoDialog 
          isOpen={isCreateOpen} 
          onClose={() => setIsCreateOpen(false)} 
          onSuccess={obtenerInsumosList} 
        />
      )}
      
      {selectedInsumo && dialogMode === "edit" && (
        <EditInsumoDialog 
          isOpen={true} 
          insumo={selectedInsumo} 
          onClose={() => {setDialogMode(null); setSelectedInsumo(null);}} 
          onSuccess={obtenerInsumosList} 
        />
      )}

      {selectedInsumo && dialogMode === "delete" && (
        <DeleteInsumoDialog 
          isOpen={true} 
          insumo={selectedInsumo} 
          onClose={() => {setDialogMode(null); setSelectedInsumo(null);}} 
          onSuccess={obtenerInsumosList} 
        />
      )}
    </div>
  );
}

// Subcomponentes de apoyo para limpieza de código
function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{message}</p>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-xl flex flex-col items-center">
        <XCircle className="w-20 h-20 text-rose-500 mb-6" />
        <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Acceso Restringido</h2>
        <p className="text-slate-500 text-sm mb-6">No tienes los privilegios necesarios para el Kardex.</p>
        <Button variant="outline" className="rounded-xl font-bold" onClick={() => window.history.back()}>Regresar</Button>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, isActive, color, onClick }: any) {
  const styles: any = {
    slate: "ring-slate-100 border-slate-900 text-slate-900 icon:bg-slate-900",
    amber: "ring-amber-100 border-amber-500 text-amber-600 icon:bg-amber-500",
    red: "ring-red-100 border-red-500 text-red-600 icon:bg-red-500",
    blue: "ring-blue-100 border-blue-500 text-blue-600 icon:bg-blue-500"
  };

  return (
    <button 
      onClick={onClick} 
      className={`group p-6 rounded-[2rem] border-2 transition-all duration-300 flex items-center gap-5 ${
        isActive 
        ? `ring-8 scale-[1.03] bg-white ${styles[color]}` 
        : 'bg-white border-white shadow-sm hover:border-slate-200'
      }`}
    >
      <div className={`p-4 rounded-2xl transition-all duration-300 ${isActive ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>
        {icon}
      </div>
      <div className="text-left">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">{title}</p>
        <p className={`text-2xl font-black tracking-tighter ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>{value}</p>
      </div>
    </button>
  );
}