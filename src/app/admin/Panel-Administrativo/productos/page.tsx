"use client";

import { useState, useMemo, useEffect } from "react";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { useProductos } from "@/lib/hooks/useProductos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileSpreadsheet, Plus, FileText, ChevronLeft, ChevronRight,
  Package, AlertTriangle, CheckCircle2, Search, RefreshCw} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import ProductFilters from "@/components/admin/productos/ProductsFilters";
import ProductosTable from "@/components/admin/productos/ProductsTable";
import { toast } from "sonner";
import { useProductoStockResumen } from "@/lib/hooks/useStockResumen";

import {
  exportProductosToExcel,
  exportInventarioToPDF
} from "@/lib/utils/export-utils";

const DeleteProductoDialog = dynamic(() =>
  import("@/components/admin/productos/DeleteProductDialog")
);
const TechSheetDialog = dynamic(() =>
  import("@/components/admin/productos/TechSheetDialog")
);

export default function ProductosPage() {
  const { can, isLoading: authLoading } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("all");
  const [colorFilter, setColorFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'none'>("none");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedProducto, setSelectedProducto] = useState<any>(null);
  const [isEditOpen, setIsEditOpen ] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isTechOpen, setIsTechOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const pageSize = 10;
  const { data: stockResumen } = useProductoStockResumen();

  const { productos, categorias, isLoading, refetch, toggleEstado, remove } = useProductos({
    categoriaId: selectedCategoria !== "all" ? selectedCategoria : undefined,
    busqueda: searchTerm || undefined,
    color: colorFilter || undefined,
    talla: sizeFilter || undefined,
    sortOrder
  });

  // Procesamiento de productos (Ordenamiento + Filtro de Stats)
  const productosProcesados = useMemo(() => {
    let result = [...productos];

    // Filtro por las Stat Cards
    if (statusFilter === "activo") {
      result = result.filter((p: any) => p.estado === "activo");
    } else if (statusFilter === "bajoStock") {
      result = result.filter((p: any) => p.stock > 0 && p.stock <= 5);
    }

    // Ordenar por nombre A-Z
    return result.sort((a: any, b: any) =>
      a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
    );
  }, [productos, statusFilter]);

  // Cálculo de estadísticas
  const stats = useMemo(() => ({
    total: productos.length,
    activos: productos.filter((p: any) => p.estado === "activo").length,
    bajoStock: productos.filter((p: any) => p.stock > 0 && p.stock <= 5).length
  }), [productos]);

  const totalPages = Math.ceil(productosProcesados.length / pageSize);
  
  const paginatedData = productosProcesados
    .slice(currentPage * pageSize, (currentPage + 1) * pageSize)
    .map((p: any) => ({
      ...p,
      stock: stockResumen?.find((s) => s.producto_id === Number(p.id))?.stock_total_adicional ?? p.stock ?? 0
    }));

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, selectedCategoria, colorFilter, sizeFilter, sortOrder, statusFilter]);

  // Handlers de exportación
  const handleExportExcel = () => {
    exportProductosToExcel(productosProcesados, stockResumen || [], "Inventario");
    toast.success("Excel generado");
  };

  const handleExportPDF = () => {
    exportInventarioToPDF(productosProcesados, categorias, {
      filename: "Inventario",
      title: "REPORTE DE INVENTARIO"
    });
    toast.success("PDF generado");
  };

  if (authLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Verificando Inventario...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Inventario
            </h1>
            <p className="text-gray-500 text-sm">Control de productos y existencias de Modas GUOR</p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleExportPDF} variant="outline" className="bg-white border-red-200 text-red-700 hover:bg-red-50 font-bold gap-2 h-11 transition-all active:scale-95">
              <FileText className="w-5 h-5" />
              <span className="hidden sm:inline">Reporte PDF</span>
            </Button>

            <Button onClick={handleExportExcel} variant="outline" className="bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold gap-2 h-11 transition-all active:scale-95">
              <FileSpreadsheet className="w-5 h-5" />
              <span className="hidden sm:inline">Exportar Excel</span>
            </Button>

            {can("create", "productos") && (
              <Link href="/admin/Panel-Administrativo/productos/nuevo">
                <Button className="bg-pink-600 hover:bg-pink-700 shadow-lg font-bold gap-2 h-11 px-6 text-white transition-all active:scale-95">
                  <Plus className="w-5 h-5" /> Nuevo Producto
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* STATS INTERACTIVAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="TOTAL PRODUCTOS"
            value={stats.total}
            icon={<Package className="w-6 h-6" />}
            isActive={statusFilter === null}
            color="pink"
            onClick={() => setStatusFilter(null)}
          />
          <StatCard
            title="EN LÍNEA / ACTIVOS"
            value={stats.activos}
            icon={<CheckCircle2 className="w-6 h-6" />}
            isActive={statusFilter === "activo"}
            color="emerald"
            onClick={() => setStatusFilter("activo")}
          />
          <StatCard
            title="REPOSICIÓN (STOCK BAJO)"
            value={stats.bajoStock}
            icon={<AlertTriangle className="w-6 h-6" />}
            isActive={statusFilter === "bajoStock"}
            color="orange"
            onClick={() => setStatusFilter("bajoStock")}
          />
        </div>

        {/* BUSCADOR Y FILTROS */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border shadow-sm">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nombre, SKU o código..."
                className="pl-10 h-11 border-gray-200 focus:ring-pink-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="h-11 border-gray-200" onClick={() => refetch()}>
              <RefreshCw className={`w-4 h-4 ${isLoading && 'animate-spin'}`} />
            </Button>
          </div>

          <ProductFilters
            searchTerm={""} setSearchTerm={() => {}} // El buscador ya está arriba
            selectedCategoria={selectedCategoria} setSelectedCategoria={setSelectedCategoria}
            colorFilter={colorFilter} setColorFilter={setColorFilter}
            sizeFilter={sizeFilter} setSizeFilter={setSizeFilter}
            sortOrder={sortOrder} setSortOrder={setSortOrder}
            categorias={categorias}
            colors={[]} // Se calculan dentro del hook useProductos
          />
        </div>

        {/* TABLA */}
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center bg-white rounded-xl border animate-pulse">
            <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Sincronizando Inventario...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <ProductosTable
              data={paginatedData}
              categorias={categorias}
              loading={isLoading}
              onEdit={(p) => { setSelectedProducto(p); setIsEditOpen(true); }}
              onDelete={(p) => { setSelectedProducto(p); setIsDeleteOpen(true); }}
              onFicha={(p) => { setSelectedProducto(p); setIsTechOpen(true); }}
              onStatusChange={(p) => toggleEstado(p.id.toString(), p.estado === 'activo' ? 'inactivo' : 'activo' )}
            />

            {/* PAGINACIÓN ESTILO CATEGORÍAS */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-xs text-gray-500">
                Mostrando <span className="font-bold text-gray-900">{paginatedData.length}</span> de <span className="font-bold text-gray-900">{productosProcesados.length}</span>
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

      {/* MODALES */}
      <DeleteProductoDialog
        isOpen={isDeleteOpen}
        producto={selectedProducto}
        onClose={() => setIsDeleteOpen(false)}
        onSuccess={() => remove(selectedProducto?.id?.toString())} 
      />
      <TechSheetDialog
        isOpen={isTechOpen}
        producto={selectedProducto}
        onClose={() => setIsTechOpen(false)}
      />
    </div>
  );
}

// Componente StatCard replicado de Categorías
function StatCard({ title, value, icon, isActive, color, onClick }: any) {
  const styles: any = {
    pink: { active: "border-pink-500 ring-pink-50 bg-white", iconActive: "bg-pink-600 text-white", textActive: "text-pink-600" },
    emerald: { active: "border-emerald-500 ring-emerald-50 bg-white", iconActive: "bg-emerald-600 text-white", textActive: "text-emerald-600" },
    orange: { active: "border-orange-500 ring-orange-50 bg-white", iconActive: "bg-orange-600 text-white", textActive: "text-orange-600" }
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