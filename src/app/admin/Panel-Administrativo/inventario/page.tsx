"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileSpreadsheet, Plus, Search,
  AlertTriangle, XCircle, ChevronLeft, ChevronRight,
  FileText, Layers, RefreshCw, CircleDollarSign,
  Package, Shirt,
  Scale, History, X
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { exportToExcel, exportToPDF } from "@/lib/utils/export-utils";
import { useInventario } from "@/lib/hooks/useInventario";
import { useMateriales } from "@/lib/hooks/useMateriales";
import { usePermissions } from "@/lib/hooks/usePermissions";

import BuscarMaterial      from "@/components/admin/inventario/BuscarMaterial";
import HistorialMovimiento from "@/components/admin/inventario/HistorialMovimiento";
import UnitConverter from "@/components/admin/inventario/ConvertirUnidad";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";


const InsumosTable = dynamic(
  () => import("@/components/admin/inventario/insumos/InsumosTable"),
  { loading: () => <SkeletonTable /> }
);
const MaterialesTable = dynamic(
  () => import("@/components/admin/inventario/materiales/MaterialesTable"),
  { loading: () => <SkeletonTable /> }
);
const CreateInsumoDialog   = dynamic(() => import("@/components/admin/inventario/insumos/CreateInsumoDialog"));
const EditInsumoDialog     = dynamic(() => import("@/components/admin/inventario/insumos/EditInsumoDialog"));
const DeleteInsumoDialog   = dynamic(() => import("@/components/admin/inventario/insumos/DeleteInsumoDialog"));
const CreateMaterialDialog = dynamic(() => import("@/components/admin/inventario/materiales/CreateMaterialDialog"));
const EditMaterialDialog   = dynamic(() => import("@/components/admin/inventario/materiales/EditMaterialDialog"));
const DeleteMaterialDialog = dynamic(() => import("@/components/admin/inventario/materiales/DeleteMaterialDialog"));

type ActiveTab = "insumos" | "materiales";

export default function InventarioPage() {
  const { can, isLoading: authLoading } = usePermissions();
  const { insumos, cargando: cargandoInsumos, obtenerInsumosList, movimientos } = useInventario();
  const { materiales, isLoading: cargandoMateriales, refetch: refetchMateriales } = useMateriales();

  const [activeTab, setActiveTab]         = useState<ActiveTab>("insumos");
  const [drawerOpen, setDrawerOpen]       = useState(false); // Ahora controla el Historial en el Header

  // Insumos state
  const [searchTermIns,      setSearchTermIns]      = useState("");
  const [selectedTipoIns,    setSelectedTipoIns]    = useState<string>("todos");
  const [statusFilterIns,    setStatusFilterIns]    = useState<string | null>(null);
  const [currentPageIns,     setCurrentPageIns]     = useState(0);
  const [isCreateInsumoOpen, setIsCreateInsumoOpen] = useState(false);
  const [selectedInsumo,     setSelectedInsumo]     = useState<any | null>(null);
  const [dialogModeIns,      setDialogModeIns]      = useState<"edit" | "delete" | null>(null);

  // Materiales state
  const [searchTermMat,    setSearchTermMat]    = useState("");
  const [selectedTipoMat,  setSelectedTipoMat]  = useState<string>("todos");
  const [statusFilterMat,  setStatusFilterMat]  = useState<string | null>(null);
  const [currentPageMat,   setCurrentPageMat]   = useState(0);
  const [isCreateMatOpen,  setIsCreateMatOpen]  = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null);
  const [dialogModeMat,    setDialogModeMat]    = useState<"edit" | "delete" | null>(null);

  const pageSize  = 10;
  const canCreate = can("create", "inventario");
  const canEdit   = can("edit",   "inventario");
  const canDelete = can("delete", "inventario");
  const canExport = can("export", "inventario");

  useEffect(() => {
    if (!authLoading && can("view", "inventario")) obtenerInsumosList();
  }, [obtenerInsumosList, authLoading]);

  // Stats (Tu lógica original intacta)
  const statsIns = useMemo(() => {
    const total        = insumos.length;
    const bajoStock    = insumos.filter((i: any) => i.stock_actual > 0 && i.stock_actual <= i.stock_minimo).length;
    const sinStock     = insumos.filter((i: any) => i.stock_actual <= 0).length;
    const optimo       = total - bajoStock - sinStock;
    const valorAlmacen = insumos.reduce((acc: number, i: any) =>
      acc + (Number(i.precio_unitario ?? 0) * i.stock_actual), 0);
    return { total, bajoStock, sinStock, optimo, valorAlmacen };
  }, [insumos]);

  const statsMat = useMemo(() => {
    const total        = materiales.length;
    const bajoStock    = materiales.filter((m: any) => m.stock_actual > 0 && m.stock_actual <= m.stock_minimo).length;
    const sinStock     = materiales.filter((m: any) => m.stock_actual <= 0).length;
    const optimo       = total - bajoStock - sinStock;
    const valorAlmacen = materiales.reduce((acc: number, m: any) =>
      acc + (Number(m.precio_unitario ?? 0) * Number(m.stock_actual ?? 0)), 0);
    return { total, bajoStock, sinStock, optimo, valorAlmacen };
  }, [materiales]);

  // Filtrado (Tu lógica original intacta)
  const filteredInsumos = useMemo(() => insumos.filter((i: any) => {
    const matchSearch = !searchTermIns || i.nombre.toLowerCase().includes(searchTermIns.toLowerCase());
    const matchTipo   = selectedTipoIns === "todos" || i.tipo === selectedTipoIns;
    let   matchStatus = true;
    if (statusFilterIns === "bajoStock") matchStatus = i.stock_actual > 0 && i.stock_actual <= i.stock_minimo;
    if (statusFilterIns === "sinStock")  matchStatus = i.stock_actual <= 0;
    if (statusFilterIns === "optimo")    matchStatus = i.stock_actual > i.stock_minimo;
    return matchSearch && matchTipo && matchStatus;
  }), [insumos, searchTermIns, selectedTipoIns, statusFilterIns]);

  const filteredMateriales = useMemo(() => materiales.filter((m: any) => {
    const matchSearch = !searchTermMat || m.nombre.toLowerCase().includes(searchTermMat.toLowerCase());
    const matchTipo   = selectedTipoMat === "todos" || m.tipo === selectedTipoMat;
    let   matchStatus = true;
    if (statusFilterMat === "bajoStock") matchStatus = m.stock_actual > 0 && m.stock_actual <= m.stock_minimo;
    if (statusFilterMat === "sinStock")  matchStatus = m.stock_actual <= 0;
    if (statusFilterMat === "optimo")    matchStatus = m.stock_actual > m.stock_minimo;
    return matchSearch && matchTipo && matchStatus;
  }), [materiales, searchTermMat, selectedTipoMat, statusFilterMat]);

  useEffect(() => { setCurrentPageIns(0); }, [searchTermIns, selectedTipoIns, statusFilterIns]);
  useEffect(() => { setCurrentPageMat(0); }, [searchTermMat, selectedTipoMat, statusFilterMat]);

  const totalPagesIns       = Math.ceil(filteredInsumos.length / pageSize);
  const paginatedInsumos    = filteredInsumos.slice(currentPageIns * pageSize, (currentPageIns + 1) * pageSize);
  const totalPagesMat       = Math.ceil(filteredMateriales.length / pageSize);
  const paginatedMateriales = filteredMateriales.slice(currentPageMat * pageSize, (currentPageMat + 1) * pageSize);

  // Exportaciones (Tu lógica original intacta)
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
        "INSUMO":               i.nombre.toUpperCase(),
        "CATEGORÍA":            i.tipo,
        "STOCK ACTUAL":         i.stock_actual,
        "U.M.":                 i.unidad_medida,
        "PRECIO REPOSICIÓN":    Number(i.precio_unitario || 0).toFixed(2),
        "VALOR TOTAL STOCK":    (i.stock_actual * Number(i.precio_unitario || 0)).toFixed(2),
        "STOCK MÍNIMO":         i.stock_minimo,
        "ESTADO":               i.stock_actual === 0 ? "AGOTADO" : i.stock_actual <= i.stock_minimo ? "STOCK BAJO" : "ÓPTIMO",
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
        "MATERIAL":             m.nombre.toUpperCase(),
        "TIPO":                 m.tipo ?? "—",
        "COMPOSICIÓN":          m.composicion ?? "—",
        "GRAMAJE (g/m²)":       m.gramaje ?? "—",
        "COLOR":                m.color ?? "—",
        "ANCHO TOTAL (m)":      m.ancho_total ?? "—",
        "STOCK ACTUAL":         m.stock_actual,
        "U.M.":                 m.unidad_medida ?? "metros",
        "PRECIO UNITARIO":      Number(m.precio_unitario || 0).toFixed(2),
        "VALOR TOTAL STOCK":    (Number(m.stock_actual) * Number(m.precio_unitario || 0)).toFixed(2),
        "STOCK MÍNIMO":         m.stock_minimo,
        "ESTADO":               m.stock_actual === 0 ? "AGOTADO" : m.stock_actual <= m.stock_minimo ? "STOCK BAJO" : "ÓPTIMO",
        "ÚLTIMA ACTUALIZACIÓN": m.updated_at ? new Date(m.updated_at).toLocaleDateString() : "N/A",
      })),
      { filename: `Kardex_Materiales_GUOR_${new Date().toISOString().split("T")[0]}` }
    );
    toast.success("Excel de materiales generado");
  };

  if (authLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Verificando Inventario...</p>
    </div>
  );

  const isInsumos = activeTab === "insumos";
  const cargando  = isInsumos ? cargandoInsumos : cargandoMateriales;
  const stats     = isInsumos ? statsIns : statsMat;
  const statusFilter    = isInsumos ? statusFilterIns : statusFilterMat;
  const setStatusFilter = isInsumos
    ? (v: string | null) => setStatusFilterIns(v)
    : (v: string | null) => setStatusFilterMat(v);

  const movimientosFiltrados = (movimientos ?? []).filter((m: any) =>
    isInsumos ? m.insumo_id !== undefined : m.material_id !== undefined
  );

  return (
    <div className="p-4 md:p-8 space-y-6 bg-[#f7f7f8] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header rediseñado con Historial Integrado ── */}
        <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
          <div className="absolute left-0 inset-y-0 w-1 bg-gradient-to-b from-pink-400 via-rose-500 to-pink-300 rounded-l-2xl" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5 pl-8">
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight leading-tight">Gestión de Inventario</h1>
              <p className="text-gray-400 text-[13px] font-medium">Control de telas, avíos e insumos · Modas GUOR</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Botón Movimientos (Alterna el historial abajo) */}
              <button
                onClick={() => setDrawerOpen(!drawerOpen)}
                className={`flex items-center gap-2 h-10 px-5 rounded-xl border transition-all font-bold text-sm ${
                  drawerOpen 
                    ? "bg-gray-900 border-gray-900 text-white shadow-lg shadow-gray-200" 
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${drawerOpen ? 'rotate-180' : ''} transition-transform duration-500`} />
                {drawerOpen ? "Cerrar Historial" : "Movimientos"}
                {!drawerOpen && movimientosFiltrados.length > 0 && (
                  <span className="ml-1 bg-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {movimientosFiltrados.length}
                  </span>
                )}
              </button>

              {canExport && (
                <>
                  <Button
                    onClick={isInsumos ? handleExportPDFInsumos : handleExportPDFMateriales}
                    variant="outline"
                    className="bg-white border-red-100 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold gap-2 h-9 px-4 text-sm rounded-xl"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">PDF</span>
                  </Button>
                  <Button
                    onClick={isInsumos ? handleExportExcelInsumos : handleExportExcelMateriales}
                    variant="outline"
                    className="bg-white border-emerald-100 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 font-semibold gap-2 h-9 px-4 text-sm rounded-xl"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span className="hidden sm:inline">Excel</span>
                  </Button>
                </>
              )}
              {canCreate && (
                <Button
                  onClick={() => isInsumos ? setIsCreateInsumoOpen(true) : setIsCreateMatOpen(true)}
                  className="bg-gradient-to-r from-pink-500 to-rose-600 font-bold gap-2 h-9 px-5 text-sm text-white rounded-xl border-0 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  {isInsumos ? "Nuevo Insumo" : "Nuevo Material"}
                </Button>
              )}
            </div>
          </div>

          {/* SECCIÓN DESPLEGABLE DEL HISTORIAL (Encabezado) */}
          {drawerOpen && (
            <div className="px-8 pb-8 pt-2 animate-in slide-in-from-top duration-500 fade-in border-t border-gray-50 bg-gray-50/20">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-inner">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <History className="w-4 h-4 text-pink-500" />
                    Historial Reciente de {activeTab}
                  </h3>
                  <button onClick={() => setDrawerOpen(false)} className="text-xs font-bold text-gray-400 hover:text-gray-600">
                    Ocultar
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <HistorialMovimiento movimientos={movimientosFiltrados.slice(0, 6)} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Tabs + Stats ── */}
        <div className="space-y-3">
          <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1.5 shadow-sm w-fit">
            <TabButton
              label="Insumos" icon={<Package className="w-4 h-4" />} isActive={isInsumos}
              count={statsIns.total} alerts={statsIns.bajoStock + statsIns.sinStock}
              onClick={() => setActiveTab("insumos")}
            />
            <TabButton
              label="Materiales" icon={<Shirt className="w-4 h-4" />} isActive={!isInsumos}
              count={statsMat.total} alerts={statsMat.bajoStock + statsMat.sinStock}
              onClick={() => setActiveTab("materiales")}
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              title="Total ítems" value={stats.total} sub={`${stats.optimo} en óptimo`} icon={<Layers className="w-5 h-5" />}
              isActive={statusFilter === null} onClick={() => setStatusFilter(null)} variant="neutral"
            />
            <StatCard
              title="Stock bajo" value={stats.bajoStock} sub="Próximos a agotarse" icon={<AlertTriangle className="w-5 h-5" />}
              isActive={statusFilter === "bajoStock"} onClick={() => setStatusFilter(statusFilter === "bajoStock" ? null : "bajoStock")} variant="warning"
            />
            <StatCard
              title="Sin stock" value={stats.sinStock} sub="Requieren reposición" icon={<XCircle className="w-5 h-5" />}
              isActive={statusFilter === "sinStock"} onClick={() => setStatusFilter(statusFilter === "sinStock" ? null : "sinStock")} variant="danger"
            />
            <StatCard
              title="Valor estimado" value={`S/ ${stats.valorAlmacen.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`}
              sub="Costo en almacén" icon={<CircleDollarSign className="w-5 h-5" />}
              isActive={false} onClick={() => {}} variant="success" noFilter
            />
          </div>
        </div>

        {/* ── Barra de búsqueda + Calculadora Modal ── */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
            {isInsumos ? (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                <Input
                  placeholder="Buscar insumo por nombre..." className="pl-9 h-10 border-gray-200 rounded-xl text-sm"
                  value={searchTermIns} onChange={(e) => setSearchTermIns(e.target.value)}
                />
              </div>
            ) : (
              <div className="flex-1">
                <BuscarMaterial onSearch={setSearchTermMat} />
              </div>
            )}

            <div className="flex items-center gap-2">
              <Select value={isInsumos ? selectedTipoIns : selectedTipoMat} onValueChange={isInsumos ? setSelectedTipoIns : setSelectedTipoMat}>
                <SelectTrigger className="h-10 w-full md:w-48 border-gray-200 rounded-xl text-sm">
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

              {/* Botón Calculadora Modal */}
                {!isInsumos && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-10 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl gap-2 font-bold">
                        <Scale className="w-4 h-4 text-pink-500" />
                        Calculadora
                      </Button>
                    </DialogTrigger>
                    
                    {/* Ajustamos el contenido para eliminar bordes y fondos extra que causan transparencia visual */}
                    <DialogContent className="max-w-md p-0 border-none bg-transparent shadow-none overflow-hidden">
                      {/* 1. Solución al error de accesibilidad: Título oculto para lectores de pantalla */}
                      <DialogTitle className="sr-only">Calculadora de Rendimiento</DialogTitle>
                      
                      {/* 2. Tu componente UnitConverter con su propio estilo oscuro */}
                      <UnitConverter />
                    </DialogContent>
                  </Dialog>
                )}

              <Button
                variant="outline" className="h-10 px-3 border-gray-200 rounded-xl"
                onClick={() => isInsumos ? obtenerInsumosList() : refetchMateriales()}
              >
                <RefreshCw className={`w-4 h-4 text-gray-400 ${cargando ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </div>
          
        {/* ── Tabla de Datos ── */}
        {cargando ? (
          <SkeletonTable />
        ) : (
          <div className="space-y-3">
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              {isInsumos ? (
                <InsumosTable
                  data={paginatedInsumos} loading={cargandoInsumos} canEdit={canEdit} canDelete={canDelete}
                  onEdit={(item: any) => { setSelectedInsumo(item); setDialogModeIns("edit"); }}
                  onDelete={(item: any) => { setSelectedInsumo(item); setDialogModeIns("delete"); }}
                />
              ) : (
                <MaterialesTable
                  data={paginatedMateriales} loading={cargandoMateriales} canEdit={canEdit} canDelete={canDelete}
                  onEdit={(item: any) => { setSelectedMaterial(item); setDialogModeMat("edit"); }}
                  onDelete={(item: any) => { setSelectedMaterial(item); setDialogModeMat("delete"); }}
                />
              )}
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 font-medium">
                Mostrando <span className="font-bold text-gray-700">{isInsumos ? paginatedInsumos.length : paginatedMateriales.length}</span> de <span className="font-bold text-gray-700">{isInsumos ? filteredInsumos.length : filteredMateriales.length}</span> registros
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline" size="sm" className="h-8 w-8 p-0 rounded-xl"
                  onClick={() => isInsumos ? setCurrentPageIns(p => p - 1) : setCurrentPageMat(p => p - 1)}
                  disabled={isInsumos ? currentPageIns === 0 : currentPageMat === 0}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <span className="text-xs font-bold text-gray-500">
                  {(isInsumos ? currentPageIns : currentPageMat) + 1} / {(isInsumos ? totalPagesIns : totalPagesMat) || 1}
                </span>
                <Button
                  variant="outline" size="sm" className="h-8 w-8 p-0 rounded-xl"
                  onClick={() => isInsumos ? setCurrentPageIns(p => p + 1) : setCurrentPageMat(p => p + 1)}
                  disabled={isInsumos ? currentPageIns + 1 >= totalPagesIns : currentPageMat + 1 >= totalPagesMat}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Diálogos (Originales) */}
      {canCreate && (
        <>
          <CreateInsumoDialog isOpen={isCreateInsumoOpen} onClose={() => setIsCreateInsumoOpen(false)} onSuccess={obtenerInsumosList} />
          <CreateMaterialDialog isOpen={isCreateMatOpen} onClose={() => setIsCreateMatOpen(false)} onSuccess={refetchMateriales} />
        </>
      )}
      {selectedInsumo && (
        <>
          <EditInsumoDialog isOpen={dialogModeIns === "edit"} insumo={selectedInsumo} onClose={() => setDialogModeIns(null)} onSuccess={obtenerInsumosList} />
          <DeleteInsumoDialog isOpen={dialogModeIns === "delete"} insumo={selectedInsumo} onClose={() => setDialogModeIns(null)} onSuccess={obtenerInsumosList} />
        </>
      )}
      {selectedMaterial && (
        <>
          <EditMaterialDialog isOpen={dialogModeMat === "edit"} material={selectedMaterial} onClose={() => setDialogModeMat(null)} onSuccess={refetchMateriales} />
          <DeleteMaterialDialog isOpen={dialogModeMat === "delete"} material={selectedMaterial} onClose={() => setDialogModeMat(null)} onSuccess={refetchMateriales} />
        </>
      )}
    </div>
  );
}

// ── COMPONENTES INTERNOS ──

function TabButton({ label, icon, isActive, count, alerts, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${
        isActive ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-200" : "text-gray-500 hover:bg-gray-50"
      }`}
    >
      {icon} {label}
      <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
        {count}
      </span>
      {alerts > 0 && !isActive && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-400 text-white text-[9px] font-black flex items-center justify-center shadow-sm">
          {alerts}
        </span>
      )}
    </button>
  );
}

function StatCard({ title, value, sub, icon, isActive, onClick, variant, noFilter }: any) {
  const styles = {
    neutral: { bar: "from-pink-400 to-rose-400", bg: "bg-pink-50 text-pink-500", active: "ring-pink-100 border-pink-300" },
    warning: { bar: "from-orange-400 to-amber-400", bg: "bg-orange-50 text-orange-500", active: "ring-orange-100 border-orange-300" },
    danger: { bar: "from-red-400 to-rose-500", bg: "bg-red-50 text-red-500", active: "ring-red-100 border-red-300" },
    success: { bar: "from-emerald-400 to-teal-400", bg: "bg-emerald-50 text-emerald-500", active: "" },
  }[variant as "neutral" | "warning" | "danger" | "success"];

  return (
    <button
      onClick={onClick} disabled={noFilter}
      className={`relative w-full text-left p-4 bg-white rounded-2xl border transition-all ${
        isActive ? `ring-2 shadow-lg -translate-y-0.5 ${styles.active}` : "border-gray-100 shadow-sm hover:shadow-md"
      }`}
    >
      <span className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${styles.bar} ${isActive ? 'opacity-100' : 'opacity-0'}`} />
      <div className="flex justify-between items-start">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{title}</p>
          <p className="text-2xl font-black text-gray-900 truncate">{value}</p>
          <p className="text-[11px] text-gray-400 mt-1 truncate">{sub}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${styles.bg}`}>{icon}</div>
      </div>
    </button>
  );
}

function SkeletonTable() {
  return (
    <div className="space-y-2 p-4 bg-white rounded-2xl border border-gray-100">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  );
}