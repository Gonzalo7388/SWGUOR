"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileSpreadsheet, Plus, Search,
  AlertTriangle, XCircle, ChevronLeft, ChevronRight,
  FileText, Layers, RefreshCw, CircleDollarSign,
  Package, Shirt, Scale, CheckCircle2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { exportToExcel, exportToPDF } from "@/lib/utils/export-utils";
import { useInventario } from "@/lib/hooks/useInventario";
import { useMateriales } from "@/lib/hooks/useMateriales";
import { usePermissions } from "@/lib/hooks/usePermissions";

import BuscarMaterial from "@/components/admin/inventario/BuscarMaterial";
import UnitConverter from "@/components/admin/inventario/ConvertirUnidad";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import SkeletonInsumosTable from "@/components/admin/inventario/insumos/SkeletonInsumo";
import InsumosTable from "@/components/admin/inventario/insumos/InsumosTable";
import MaterialesTable from "@/components/admin/inventario/materiales/MaterialesTable";
import SkeletonMaterialesTable from "@/components/admin/inventario/materiales/SkeletonMateriales";

const CreateInsumoDialog = dynamic(() => import("@/components/admin/inventario/insumos/CreateInsumoDialog"));
const EditInsumoDialog = dynamic(() => import("@/components/admin/inventario/insumos/EditInsumoDialog"));
const DescontinuarInsumoDialog = dynamic(() => import("@/components/admin/inventario/insumos/DescontinuarInsumoDialog"));
const CreateMaterialDialog = dynamic(() => import("@/components/admin/inventario/materiales/CreateMaterialDialog"));
const EditMaterialDialog = dynamic(() => import("@/components/admin/inventario/materiales/EditMaterialDialog"));
const DescontinuarMaterialDialog = dynamic(() => import("@/components/admin/inventario/materiales/DescontinuarMaterialDialog"));

type ActiveTab = "insumos" | "materiales";

export default function InventarioPage() {
  const { can, role, isLoading: authLoading } = usePermissions();
  const { insumos, cargando: cargandoInsumos, obtenerInsumosList } = useInventario();
  const { materiales, isLoading: cargandoMateriales, refetch: refetchMateriales } = useMateriales();

  const [activeTab, setActiveTab] = useState<ActiveTab>("insumos");

  // Insumos state
  const [searchTermIns, setSearchTermIns] = useState("");
  const [selectedTipoIns, setSelectedTipoIns] = useState<string>("todos");
  const [statusFilterIns, setStatusFilterIns] = useState<string | null>(null);
  const [currentPageIns, setCurrentPageIns] = useState(0);
  const [isCreateInsumoOpen, setIsCreateInsumoOpen] = useState(false);
  const [selectedInsumo, setSelectedInsumo] = useState<any | null>(null);
  const [dialogModeIns, setDialogModeIns] = useState<"edit" | "archive" | null>(null);

  // Materiales state
  const [searchTermMat, setSearchTermMat] = useState("");
  const [selectedTipoMat, setSelectedTipoMat] = useState<string>("todos");
  const [statusFilterMat, setStatusFilterMat] = useState<string | null>(null);
  const [currentPageMat, setCurrentPageMat] = useState(0);
  const [isCreateMatOpen, setIsCreateMatOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null);
  const [dialogModeMat, setDialogModeMat] = useState<"edit" | "archive" | null>(null);

  const pageSize = 10;
  const canCreate = can("create", "inventario");
  const canEdit = can("edit", "inventario");
  const canDelete = can("archive", "inventario");
  const canExport = can("export", "inventario");

  useEffect(() => {
    if (!authLoading && can("view", "inventario")) obtenerInsumosList();
  }, [obtenerInsumosList, authLoading]);

  // Stats
  const statsIns = useMemo(() => {
    const total = insumos.length;
    const bajoStock = insumos.filter((i: any) => i.stock_actual > 0 && i.stock_actual <= i.stock_minimo).length;
    const sinStock = insumos.filter((i: any) => i.stock_actual <= 0).length;
    const optimo = total - bajoStock - sinStock;
    const valorAlmacen = insumos.reduce((acc: number, i: any) =>
      acc + (Number(i.precio_unitario ?? 0) * i.stock_actual), 0);
    return { total, bajoStock, sinStock, optimo, valorAlmacen };
  }, [insumos]);

  const statsMat = useMemo(() => {
    const total = materiales.length;
    const bajoStock = materiales.filter((m: any) => m.stock_actual > 0 && m.stock_actual <= m.stock_minimo).length;
    const sinStock = materiales.filter((m: any) => m.stock_actual <= 0).length;
    const optimo = total - bajoStock - sinStock;
    const valorAlmacen = materiales.reduce((acc: number, m: any) =>
      acc + (Number(m.precio_unitario ?? 0) * Number(m.stock_actual ?? 0)), 0);
    return { total, bajoStock, sinStock, optimo, valorAlmacen };
  }, [materiales]);

  // Filtering
  const filteredInsumos = useMemo(() => insumos.filter((i: any) => {
    const matchSearch = !searchTermIns || i.nombre.toLowerCase().includes(searchTermIns.toLowerCase());
    const matchTipo = selectedTipoIns === "todos" || i.tipo === selectedTipoIns;
    let matchStatus = true;
    if (statusFilterIns === "bajoStock") matchStatus = i.stock_actual > 0 && i.stock_actual <= i.stock_minimo;
    if (statusFilterIns === "sinStock") matchStatus = i.stock_actual <= 0;
    if (statusFilterIns === "optimo") matchStatus = i.stock_actual > i.stock_minimo;
    return matchSearch && matchTipo && matchStatus;
  }), [insumos, searchTermIns, selectedTipoIns, statusFilterIns]);

  const filteredMateriales = useMemo(() => materiales.filter((m: any) => {
    const matchSearch = !searchTermMat || m.nombre.toLowerCase().includes(searchTermMat.toLowerCase());
    const matchTipo = selectedTipoMat === "todos" || m.tipo === selectedTipoMat;
    let matchStatus = true;
    if (statusFilterMat === "bajoStock") matchStatus = m.stock_actual > 0 && m.stock_actual <= m.stock_minimo;
    if (statusFilterMat === "sinStock") matchStatus = m.stock_actual <= 0;
    if (statusFilterMat === "optimo") matchStatus = m.stock_actual > m.stock_minimo;
    return matchSearch && matchTipo && matchStatus;
  }), [materiales, searchTermMat, selectedTipoMat, statusFilterMat]);

  useEffect(() => { setCurrentPageIns(0); }, [searchTermIns, selectedTipoIns, statusFilterIns]);
  useEffect(() => { setCurrentPageMat(0); }, [searchTermMat, selectedTipoMat, statusFilterMat]);

  const totalPagesIns = Math.ceil(filteredInsumos.length / pageSize);
  const paginatedInsumos = filteredInsumos.slice(currentPageIns * pageSize, (currentPageIns + 1) * pageSize);
  const totalPagesMat = Math.ceil(filteredMateriales.length / pageSize);
  const paginatedMateriales = filteredMateriales.slice(currentPageMat * pageSize, (currentPageMat + 1) * pageSize);

  // Export handlers
  const handleExportPDFInsumos = () => {
    if (!canExport) return toast.error("Sin permisos");
    exportToPDF(
      [["INSUMO", "TIPO", "STOCK", "PRECIO", "VALOR TOTAL"]],
      filteredInsumos.map((i: any) => [
        i.nombre.toUpperCase(), i.tipo,
        `${i.stock_actual} ${i.unidad_medida}`,
        `S/ ${Number(i.precio_unitario).toFixed(2)}`,
        `S/ ${(i.stock_actual * Number(i.precio_unitario)).toFixed(2)}`,
      ]),
      { title: "REPORTE VALORIZADO — INSUMOS", filename: `Kardex_Insumos_GUOR_${new Date().toLocaleDateString()}` }
    );
  };

  const handleExportExcelInsumos = () => {
    if (!canExport) return toast.error("Sin permisos para exportar");
    if (filteredInsumos.length === 0) return toast.error("No hay datos para exportar");
    exportToExcel(
      filteredInsumos.map((i: any) => ({
        "INSUMO": i.nombre.toUpperCase(),
        "CATEGORÍA": i.tipo,
        "STOCK ACTUAL": i.stock_actual,
        "U.M.": i.unidad_medida,
        "PRECIO REPOSICIÓN": Number(i.precio_unitario || 0).toFixed(2),
        "VALOR TOTAL STOCK": (i.stock_actual * Number(i.precio_unitario || 0)).toFixed(2),
        "STOCK MÍNIMO": i.stock_minimo,
        "ESTADO": i.stock_actual === 0 ? "AGOTADO" : i.stock_actual <= i.stock_minimo ? "STOCK BAJO" : "ÓPTIMO",
        "ÚLTIMA ACTUALIZACIÓN": i.updated_at ? new Date(i.updated_at).toLocaleDateString() : "N/A",
      })),
      { filename: `Kardex_Insumos_GUOR_${new Date().toISOString().split("T")[0]}` }
    );
    toast.success("Excel de insumos generado");
  };

  const handleExportPDFMateriales = () => {
    if (!canExport) return toast.error("Sin permisos");
    exportToPDF(
      [["MATERIAL", "TIPO", "COMPOSICIÓN", "GRAMAJE", "STOCK", "PRECIO", "VALOR TOTAL"]],
      filteredMateriales.map((m: any) => [
        m.nombre.toUpperCase(), m.tipo ?? "—", m.composicion ?? "—",
        m.gramaje ? `${m.gramaje} g/m²` : "—",
        `${m.stock_actual} ${m.unidad_medida ?? "m"}`,
        `S/ ${Number(m.precio_unitario ?? 0).toFixed(2)}`,
        `S/ ${(Number(m.stock_actual) * Number(m.precio_unitario ?? 0)).toFixed(2)}`,
      ]),
      { title: "REPORTE VALORIZADO — MATERIALES", filename: `Kardex_Materiales_GUOR_${new Date().toLocaleDateString()}` }
    );
  };

  const handleExportExcelMateriales = () => {
    if (!canExport) return toast.error("Sin permisos para exportar");
    if (filteredMateriales.length === 0) return toast.error("No hay datos para exportar");
    exportToExcel(
      filteredMateriales.map((m: any) => ({
        "MATERIAL": m.nombre.toUpperCase(),
        "TIPO": m.tipo ?? "—",
        "COMPOSICIÓN": m.composicion ?? "—",
        "GRAMAJE (g/m²)": m.gramaje ?? "—",
        "COLOR": m.color ?? "—",
        "ANCHO TOTAL (m)": m.ancho_total ?? "—",
        "STOCK ACTUAL": m.stock_actual,
        "U.M.": m.unidad_medida ?? "metros",
        "PRECIO UNITARIO": Number(m.precio_unitario || 0).toFixed(2),
        "VALOR TOTAL STOCK": (Number(m.stock_actual) * Number(m.precio_unitario || 0)).toFixed(2),
        "STOCK MÍNIMO": m.stock_minimo,
        "ESTADO": m.stock_actual === 0 ? "AGOTADO" : m.stock_actual <= m.stock_minimo ? "STOCK BAJO" : "ÓPTIMO",
        "ÚLTIMA ACTUALIZACIÓN": m.updated_at ? new Date(m.updated_at).toLocaleDateString() : "N/A",
      })),
      { filename: `Kardex_Materiales_GUOR_${new Date().toISOString().split("T")[0]}` }
    );
    toast.success("Excel de materiales generado");
  };

  if (authLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Verificando acceso...</p>
      </div>
    );
  }

  const isInsumos = activeTab === "insumos";
  const cargando = isInsumos ? cargandoInsumos : cargandoMateriales;
  const stats = isInsumos ? statsIns : statsMat;
  const statusFilter = isInsumos ? statusFilterIns : statusFilterMat;
  const setStatusFilter = isInsumos
    ? (v: string | null) => setStatusFilterIns(v)
    : (v: string | null) => setStatusFilterMat(v);

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Inventario
            </h1>
            <p className="text-gray-500 text-sm">Control de telas, avíos e insumos de Modas y Estilos GUOR</p>
          </div>

          <div className="flex items-center gap-3">
            {canExport && (
              <>
                <Button
                  onClick={isInsumos ? handleExportPDFInsumos : handleExportPDFMateriales}
                  variant="outline"
                  className="bg-white border-red-200 text-red-700 hover:bg-red-50 font-bold gap-2 h-11 transition-all active:scale-95"
                >
                  <FileText className="w-5 h-5" />
                  <span className="hidden sm:inline">Exportar PDF</span>
                </Button>

                <Button
                  onClick={isInsumos ? handleExportExcelInsumos : handleExportExcelMateriales}
                  variant="outline"
                  className="bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold gap-2 h-11 transition-all active:scale-95"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  <span className="hidden sm:inline">Exportar Excel</span>
                </Button>
              </>
            )}

            {canCreate && (
              <Button
                onClick={() => isInsumos ? setIsCreateInsumoOpen(true) : setIsCreateMatOpen(true)}
                className="bg-pink-600 hover:bg-pink-700 shadow-lg font-bold gap-2 h-11 px-6 text-white transition-all active:scale-95"
              >
                <Plus className="w-5 h-5" />
                {isInsumos ? "Nuevo Insumo" : "Nuevo Material"}
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white border border-gray-100 rounded-xl p-1 w-fit shadow-sm">
          <TabButton
            label="Insumos"
            icon={<Package className="w-4 h-4" />}
            isActive={isInsumos}
            count={statsIns.total}
            onClick={() => setActiveTab("insumos")}
          />
          <TabButton
            label="Materiales"
            icon={<Shirt className="w-4 h-4" />}
            isActive={!isInsumos}
            count={statsMat.total}
            onClick={() => setActiveTab("materiales")}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="TOTAL"
            value={stats.total}
            icon={<Layers className="w-6 h-6" />}
            isActive={statusFilter === null}
            color="pink"
            onClick={() => setStatusFilter(null)}
          />
          <StatCard
            title="STOCK ÓPTIMO"
            value={stats.optimo}
            icon={<CheckCircle2 className="w-6 h-6" />}
            isActive={statusFilter === "optimo"}
            color="emerald"
            onClick={() => setStatusFilter(statusFilter === "optimo" ? null : "optimo")}
          />
          <StatCard
            title="STOCK BAJO"
            value={stats.bajoStock}
            icon={<AlertTriangle className="w-6 h-6" />}
            isActive={statusFilter === "bajoStock"}
            color="orange"
            onClick={() => setStatusFilter(statusFilter === "bajoStock" ? null : "bajoStock")}
          />
          <StatCard
            title="VALOR ALMACÉN"
            value={`S/ ${stats.valorAlmacen.toLocaleString("es-PE", { maximumFractionDigits: 0 })}`}
            icon={<CircleDollarSign className="w-6 h-6" />}
            isActive={false}
            color="blue"
            onClick={() => { }}
            disabled
          />
        </div>

        {/* Buscador */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border shadow-sm">
          <div className="relative flex-1 w-full">
            {isInsumos ? (
              <>
                <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar insumo por nombre..."
                  className="pl-10 h-11 border-gray-200 focus:ring-pink-500"
                  value={searchTermIns}
                  onChange={(e) => setSearchTermIns(e.target.value)}
                />
              </>
            ) : (
              <BuscarMaterial onSearch={setSearchTermMat} />
            )}
          </div>

          <Select value={isInsumos ? selectedTipoIns : selectedTipoMat} onValueChange={isInsumos ? setSelectedTipoIns : setSelectedTipoMat}>
            <SelectTrigger className="h-11 w-full md:w-48 border-gray-200">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los tipos</SelectItem>
              {isInsumos ? (
                <>
                  <SelectItem value="Materia Prima">Materia Prima</SelectItem>
                  <SelectItem value="Insumo">Botones / Cierres</SelectItem>
                  <SelectItem value="Herramienta">Herramientas</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="plano">Plano</SelectItem>
                  <SelectItem value="punto">Punto</SelectItem>
                  <SelectItem value="tejido">Tejido</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>

          {!isInsumos && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-11 border-gray-200 gap-2 font-bold">
                  <Scale className="w-4 h-4" />
                  Calculadora
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md p-0 border-none bg-transparent shadow-none overflow-hidden">
                <DialogTitle className="sr-only">Calculadora de Rendimiento</DialogTitle>
                <UnitConverter />
              </DialogContent>
            </Dialog>
          )}

          <Button variant="outline" className="h-11 border-gray-200" onClick={() => isInsumos ? obtenerInsumosList() : refetchMateriales()}>
            <RefreshCw className={`w-4 h-4 ${cargando && 'animate-spin'}`} />
          </Button>
        </div>

        {/* Tabla */}
        {cargando ? (
          <div className="h-64 flex flex-col items-center justify-center bg-white rounded-xl border animate-pulse">
            <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Cargando {isInsumos ? "insumos" : "materiales"}...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {isInsumos ? (
              <InsumosTable
                data={paginatedInsumos}
                loading={cargandoInsumos}
                canEdit={canEdit}
                canDelete={canDelete}
                onEdit={(item: any) => { setSelectedInsumo(item); setDialogModeIns("edit"); }}
                onDelete={(item: any) => { setSelectedInsumo(item); setDialogModeIns("archive"); }}
              />
            ) : (
              <MaterialesTable
                data={paginatedMateriales}
                loading={cargandoMateriales}
                canEdit={canEdit}
                canDelete={canDelete}
                onEdit={(item: any) => { setSelectedMaterial(item); setDialogModeMat("edit"); }}
                onDelete={(item: any) => { setSelectedMaterial(item); setDialogModeMat("archive"); }}
              />
            )}

            {/* Paginación */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-xs text-gray-500">
                Mostrando <span className="font-bold text-gray-900">{isInsumos ? paginatedInsumos.length : paginatedMateriales.length}</span> de <span className="font-bold text-gray-900">{isInsumos ? filteredInsumos.length : filteredMateriales.length}</span>
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => isInsumos ? setCurrentPageIns(p => p - 1) : setCurrentPageMat(p => p - 1)}
                  disabled={isInsumos ? currentPageIns === 0 : currentPageMat === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="px-4 py-1.5 text-xs font-bold bg-gray-50 border rounded-lg flex items-center">
                  Página {(isInsumos ? currentPageIns : currentPageMat) + 1} de {(isInsumos ? totalPagesIns : totalPagesMat) || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => isInsumos ? setCurrentPageIns(p => p + 1) : setCurrentPageMat(p => p + 1)}
                  disabled={isInsumos ? currentPageIns + 1 >= totalPagesIns : currentPageMat + 1 >= totalPagesMat}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Modales */}
      {canCreate && (
        <>
          <CreateInsumoDialog isOpen={isCreateInsumoOpen} onClose={() => setIsCreateInsumoOpen(false)} onSuccess={obtenerInsumosList} />
          <CreateMaterialDialog isOpen={isCreateMatOpen} onClose={() => setIsCreateMatOpen(false)} onSuccess={refetchMateriales} />
        </>
      )}
      {selectedInsumo && (
        <>
          <EditInsumoDialog isOpen={dialogModeIns === "edit"} insumo={selectedInsumo} onClose={() => setDialogModeIns(null)} onSuccess={obtenerInsumosList} />
          <DescontinuarInsumoDialog isOpen={dialogModeIns === "archive"} insumo={selectedInsumo} onClose={() => setDialogModeIns(null)} onSuccess={obtenerInsumosList} rolUsuario={role} />
        </>
      )}
      {selectedMaterial && (
        <>
          <EditMaterialDialog isOpen={dialogModeMat === "edit"} material={selectedMaterial} onClose={() => setDialogModeMat(null)} onSuccess={refetchMateriales} />
          <DescontinuarMaterialDialog isOpen={dialogModeMat === "archive"} material={selectedMaterial} onClose={() => setDialogModeMat(null)} onSuccess={refetchMateriales} rolUsuario={role} />
        </>
      )}
    </div>
  );
}

// ── COMPONENTES INTERNOS ──

function TabButton({ label, icon, isActive, count, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${
        isActive ? "bg-pink-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {icon} {label}
      <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"}`}>
        {count}
      </span>
    </button>
  );
}

function StatCard({ title, value, icon, isActive, color, onClick, disabled }: any) {
  const styles: any = {
    pink: {
      active: "border-pink-500 ring-pink-50 bg-white",
      iconActive: "bg-pink-600 text-white",
      textActive: "text-pink-600"
    },
    emerald: {
      active: "border-emerald-500 ring-emerald-50 bg-white",
      iconActive: "bg-emerald-600 text-white",
      textActive: "text-emerald-600"
    },
    orange: {
      active: "border-orange-500 ring-orange-50 bg-white",
      iconActive: "bg-orange-600 text-white",
      textActive: "text-orange-600"
    },
    blue: {
      active: "border-blue-500 ring-blue-50 bg-white",
      iconActive: "bg-blue-600 text-white",
      textActive: "text-blue-600"
    }
  };

  const currentStyle = styles[color];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 cursor-pointer ${
        isActive ? `ring-4 shadow-xl scale-[1.02] z-10 ${currentStyle.active}` : 'bg-white border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-95 disabled:cursor-default disabled:opacity-60'
      }`}
    >
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
