"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileSpreadsheet, Plus, Search,
  AlertTriangle, XCircle, BarChart3, ChevronLeft, ChevronRight, 
  FileText, Layers, RefreshCw
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { exportToExcel, exportToPDF } from "@/lib/utils/export-utils";
import { useInventario } from "@/lib/hooks/useInventory";
import { usePermissions } from "@/lib/hooks/usePermissions";

// Lazy loading de componentes de Modales
const InventarioTable = dynamic(() => import("@/components/admin/inventario/InventarioTable"));
const CreateInsumoDialog = dynamic(() => import("@/components/admin/inventario/CreateInsumoDialog"));
const EditInsumoDialog = dynamic(() => import("@/components/admin/inventario/EditInsumoDialog"));
const DeleteInsumoDialog = dynamic(() => import("@/components/admin/inventario/DeleteInsumoDialog"));

export default function InventarioPage() {
  const { can, isLoading: authLoading } = usePermissions();
  const { insumos, cargando, error, obtenerInsumosList, limpiar } = useInventario();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedInsumo, setSelectedInsumo] = useState<any | null>(null);
  const [dialogMode, setDialogMode] = useState<"edit" | "delete" | null>(null);
  
  const [currentPage, setCurrentPage] = useState(0);
  const [quickFilter, setQuickFilter] = useState<"todos" | "bajo_stock" | "critico">("todos");
  const [selectedTipo, setSelectedTipo] = useState<string>("todos");
  
  const pageSize = 10;
  const [stats, setStats] = useState({ total: 0, bajoStock: 0, sinStock: 0, categorias: 0 });

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

  // Calcular stats cuando cambien los insumos
  useEffect(() => {
    if (insumos.length > 0) {
      setStats({
        total: insumos.length,
        bajoStock: insumos.filter((i: any) => i.stock_actual > 0 && i.stock_actual <= i.stock_minimo).length,
        sinStock: insumos.filter((i: any) => i.stock_actual === 0).length,
        categorias: new Set(insumos.map((i: any) => i.tipo)).size
      });
    }
  }, [insumos]);

  const filteredData = useMemo(() => {
    return insumos.filter((i: any) => {
      const matchSearch = !searchTerm || i.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTipo = selectedTipo === "todos" || i.tipo === selectedTipo;
      
      let matchQuick = true;
      if (quickFilter === "bajo_stock") matchQuick = i.stock_actual > 0 && i.stock_actual <= i.stock_minimo;
      if (quickFilter === "critico") matchQuick = i.stock_actual === 0;
      
      return matchSearch && matchTipo && matchQuick;
    });
  }, [insumos, searchTerm, quickFilter, selectedTipo]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const handleExportPDF = () => {
    if (!canExport) {
      toast.error("No tienes permisos para exportar");
      return;
    }
    if (filteredData.length === 0) return toast.error("No hay datos para exportar");
    const headers = [["INSUMO", "TIPO", "STOCK", "U.M.", "ESTADO"]];
    const body = filteredData.map((i: any) => [
      i.nombre.toUpperCase(),
      i.tipo,
      i.stock_actual.toString(),
      i.unidad_medida,
      i.stock_actual === 0 ? "AGOTADO" : i.stock_actual <= i.stock_minimo ? "BAJO" : "OPTIMO"
    ]);

    exportToPDF(headers, body, { 
      title: "KARDEX DE INVENTARIO - MODAS GUOR",
      filename: `Inventario_Textil_${new Date().toISOString().split('T')[0]}` 
    });
    toast.success("PDF generado correctamente");
  };

  const handleExportExcel = () => {
    if (!canExport) {
      toast.error("No tienes permisos para exportar");
      return;
    }
    if (filteredData.length === 0) return toast.error("No hay datos para exportar");
    const dataToExport = filteredData.map((i: any) => ({
      Insumo: i.nombre.toUpperCase(),
      Tipo: i.tipo,
      "Stock Actual": i.stock_actual,
      "Unidad Medida": i.unidad_medida,
      "Stock Mínimo": i.stock_minimo,
      Estado: i.stock_actual === 0 
        ? "AGOTADO" 
        : i.stock_actual <= i.stock_minimo 
          ? "STOCK BAJO" 
          : "OK",
      "Última Actualización": new Date(i.updated_at).toLocaleDateString()
    }));

    exportToExcel(dataToExport, { 
      filename: `Inventario_Textil_GUOR_${new Date().toISOString().split('T')[0]}` 
    });
    toast.success("Excel generado correctamente");
  };

  const handleCreateClick = () => {
    if (!canCreate) {
      toast.error("No tienes permisos para crear insumos");
      return;
    }
    setIsCreateOpen(true);
  };

  const handleEdit = (item: any) => {
    if (!canEdit) {
      toast.error("No tienes permisos para editar insumos");
      return;
    }
    setSelectedInsumo(item);
    setDialogMode("edit");
  };

  const handleDelete = (item: any) => {
    if (!canDelete) {
      toast.error("No tienes permisos para eliminar insumos");
      return;
    }
    setSelectedInsumo(item);
    setDialogMode("delete");
  };

  // Mientras se cargan los permisos
  if (authLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Verificando permisos...</p>
      </div>
    );
  }

  // Sin permisos de visualización
  if (!canView) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
        <p className="text-gray-500">No tienes permisos para ver esta sección</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header con acciones principales - Diseño mejorado */}
        <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                Inventario de Materiales
              </h1>
              <p className="text-slate-500 text-sm font-medium mt-2">Control de insumos, telas y avíos de producción</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 justify-end">
              {canExport && (
                <>
                  <Button onClick={handleExportPDF} variant="outline" className="bg-white border-red-200 text-red-700 hover:bg-red-50 font-bold gap-2 h-11 transition-all active:scale-95 rounded-xl">
                    <FileText className="w-5 h-5" />
                    <span className="hidden sm:inline">PDF</span>
                  </Button>
                  <Button onClick={handleExportExcel} variant="outline" className="bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold gap-2 h-11 transition-all active:scale-95 rounded-xl">
                    <FileSpreadsheet className="w-5 h-5" />
                    <span className="hidden sm:inline">Excel</span>
                  </Button>
                </>
              )}
              {canCreate && (
                <Button onClick={handleCreateClick} className="bg-slate-900 hover:bg-slate-800 shadow-lg font-bold gap-2 h-11 transition-all active:scale-95 rounded-xl text-white">
                  <Plus className="w-5 h-5" /> Nuevo
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard de métricas - Mejorado */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard 
            title="TOTAL INSUMOS" 
            value={stats.total} 
            icon={<Layers className="w-6 h-6" />} 
            isActive={quickFilter === "todos"} 
            onClick={() => {setQuickFilter("todos"); setCurrentPage(0);}} 
            color="slate" 
          />
          <MetricCard 
            title="STOCK BAJO" 
            value={stats.bajoStock} 
            icon={<AlertTriangle className="w-6 h-6" />} 
            isActive={quickFilter === "bajo_stock"} 
            onClick={() => {setQuickFilter("bajo_stock"); setCurrentPage(0);}} 
            color="amber" 
          />
          <MetricCard 
            title="AGOTADOS" 
            value={stats.sinStock} 
            icon={<XCircle className="w-6 h-6" />} 
            isActive={quickFilter === "critico"} 
            onClick={() => {setQuickFilter("critico"); setCurrentPage(0);}} 
            color="red" 
          />
          <MetricCard 
            title="CATEGORÍAS" 
            value={stats.categorias} 
            icon={<BarChart3 className="w-6 h-6" />} 
            isActive={false} 
            color="blue" 
            onClick={() => {}} 
          />
        </div>

        {/* FILTROS Y BÚSQUEDA - Mejorado */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block mb-2">Buscar insumo</label>
              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre, material..."
                  className="pl-12 h-11 border-slate-200 focus:ring-slate-400 rounded-lg placeholder:text-slate-400"
                  value={searchTerm}
                  onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(0);}}
                />
              </div>
            </div>

            <div className="w-full lg:w-56">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block mb-2">Filtrar por tipo</label>
              <Select 
                value={selectedTipo} 
                onValueChange={(value) => {
                  setSelectedTipo(value);
                  setCurrentPage(0);
                }}
              >
                <SelectTrigger className="h-11 border-slate-200 rounded-lg focus:ring-slate-400">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-slate-200">
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  <SelectItem value="Materia Prima">Materia Prima</SelectItem>
                  <SelectItem value="Insumo">Insumos</SelectItem>
                  <SelectItem value="Herramienta">Herramientas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" className="h-11 border-slate-200 hover:bg-slate-50 rounded-lg px-6" onClick={() => obtenerInsumosList()}>
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Tabla principal */}
        {cargando ? (
          <div className="h-64 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin mb-4" />
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Sincronizando datos...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <InventarioTable 
              data={paginatedData} 
              loading={cargando} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            
            {/* Paginación - Mejorada */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
              <p className="text-sm text-slate-600 font-medium">
                Mostrando <span className="font-bold text-slate-900">{paginatedData.length}</span> de <span className="font-bold text-slate-900">{filteredData.length}</span> insumos
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0} className="rounded-lg h-10">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="px-4 py-2 text-sm font-bold bg-slate-100 border border-slate-200 rounded-lg flex items-center text-slate-700">
                  Página {currentPage + 1} de {totalPages || 1}
                </div>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage + 1 >= totalPages} className="rounded-lg h-10">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Renderizado Condicional de Modales */}
      {canCreate && (
        <CreateInsumoDialog 
          isOpen={isCreateOpen} 
          onClose={() => setIsCreateOpen(false)} 
          onSuccess={obtenerInsumosList} 
        />
      )}
      
      {canEdit && selectedInsumo && dialogMode === "edit" && (
        <EditInsumoDialog 
          isOpen={true} 
          insumo={selectedInsumo} 
          onClose={() => {setDialogMode(null); setSelectedInsumo(null);}} 
          onSuccess={obtenerInsumosList} 
        />
      )}

      {canDelete && selectedInsumo && dialogMode === "delete" && (
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

function MetricCard({ title, value, icon, isActive, color, onClick }: any) {
  const colorMap: any = {
    slate: {
      active: "border-slate-400 ring-slate-50 bg-white shadow-md",
      iconActive: "bg-slate-900 text-white",
      textActive: "text-slate-900"
    },
    amber: {
      active: "border-amber-400 ring-amber-50 bg-white shadow-md",
      iconActive: "bg-amber-600 text-white",
      textActive: "text-amber-600"
    },
    red: {
      active: "border-red-400 ring-red-50 bg-white shadow-md",
      iconActive: "bg-red-600 text-white",
      textActive: "text-red-600"
    },
    blue: {
      active: "border-blue-400 ring-blue-50 bg-white shadow-md",
      iconActive: "bg-blue-600 text-white",
      textActive: "text-blue-600"
    }
  };
  const currentStyle = colorMap[color];

  return (
    <button 
      onClick={onClick} 
      className={`group p-5 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 cursor-pointer hover:shadow-lg ${
        isActive 
        ? `ring-4 scale-[1.02] ${currentStyle.active}` 
        : 'bg-white border-slate-200 shadow-sm hover:-translate-y-1 active:scale-95'
      }`}
    >
      <div className={`p-3 rounded-xl transition-all duration-300 ${isActive ? `${currentStyle.iconActive}` : 'bg-slate-100 text-slate-400'}`}>
        {icon}
      </div>
      <div className="text-left">
        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">{title}</p>
        <p className={`text-2xl font-black tracking-tight ${isActive ? currentStyle.textActive : 'text-slate-800'}`}>{value}</p>
      </div>
    </button>
  );
}