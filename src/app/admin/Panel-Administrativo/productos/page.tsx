"use client";

import { useState, useMemo } from "react";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { useProducts } from "@/lib/hooks/useProducts";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet, Plus, Package, AlertTriangle, XCircle,
  BarChart3, ChevronLeft, ChevronRight, FileText
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { exportToExcel, exportInventarioToPDF } from "@/lib/utils/export-utils";
import ProductFilters from "@/components/admin/productos/ProductsFilters";
import ProductosTable from "@/components/admin/productos/ProductsTable";
import { ProductoConRelaciones } from "./types";
import { toast } from "sonner";
import { useProductoStockResumen } from '@/lib/hooks/useStockResumen';

const DeleteProductoDialog = dynamic(() => import("@/components/admin/productos/DeleteProductDialog"));
const TechSheetDialog = dynamic(() => import("@/components/admin/productos/TechSheetDialog"));

const normalizeId = (id: any) => String(id).replace(/[^0-9]/g, '');

export default function ProductosPage() {
  const { can } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [colorFilter, setColorFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'none'>('none');
  const [sizeFilter, setSizeFilter] = useState("");
  const [activeStat, setActiveStat] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedProducto, setSelectedProducto] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isTechOpen, setIsTechOpen] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState("all");
  const { data: stockResumen } = useProductoStockResumen();
  const pageSize = 10;
  const { productos, categorias, loading, refetch } = useProducts({
    categoriaId: selectedCategoria,
    estado: "all", // o el estado que manejes
    busqueda: searchTerm
  });

  const productosFormateados = useMemo(() => {
    if (!Array.isArray(productos)) return [];
    return productos.map((p: any) => ({
      ...p,
      id: BigInt(p.id),
      categoria_id: p.categoria_id ? normalizeId(p.categoria_id) : null,
      // Mantenemos la relación que viene de la base de datos
      categorias: p.categorias || null,
      created_at: new Date(p.created_at),
      updated_at: new Date(p.updated_at),
    })) as ProductoConRelaciones[];
  }, [productos]);

  const stats = useMemo(() => {
    const total = productosFormateados.length;
    const agotados = productosFormateados.filter(p => p.stock === 0).length;
    const bajoStock = productosFormateados.filter(p => p.stock > 0 && p.stock <= 5).length;
    const activos = productosFormateados.filter(p => p.estado === "activo").length;
    return { total, agotados, bajoStock, activos };
  }, [productosFormateados]);

  const filteredProducts = useMemo(() => {
    return productosFormateados.filter((p) => {
      const matchSearch =
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory =
        categoryFilter === "all" ||
        normalizeId(p.categoria_id) === normalizeId(categoryFilter);
      const matchStatus = statusFilter === "all" || p.estado === statusFilter;
      let matchStat = true;
      if (activeStat === "agotados") matchStat = p.stock === 0;
      if (activeStat === "bajoStock") matchStat = p.stock > 0 && p.stock <= 5;
      if (activeStat === "activos") matchStat = p.estado === "activo";
      return matchSearch && matchCategory && matchStatus && matchStat;
    });
  }, [productosFormateados, searchTerm, categoryFilter, statusFilter, activeStat]);

  const paginatedData = filteredProducts.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  ).map((p) => ({
    ...p,
    stockResumenData: stockResumen.find(s => s.producto_id === Number(p.id)) ?? null,
  }));

  const totalPages = Math.ceil(filteredProducts.length / pageSize);

  const handleExportExcel = () => {
    const dataConStock = filteredProducts.map((p) => ({
      ...p,
      stock: stockResumen.find(s => s.producto_id === Number(p.id))?.stock_total_adicional ?? p.stock,
    }));

    exportToExcel(dataConStock, { 
      filename: `Inventario_GUOR_${new Date().toISOString().split("T")[0]}` 
    });
  };

  const handleExportPDF = () => {
  // Enriquecer cada producto con su stock real antes de exportar
  const dataConStock = filteredProducts.map((p) => ({
      ...p,
      stock: stockResumen.find(s => s.producto_id === Number(p.id))?.stock_total_adicional ?? p.stock,
    }));

    exportInventarioToPDF(dataConStock, categorias, {
      filename: `Inventario_GUOR_${new Date().toISOString().split("T")[0]}`,
      title: "REPORTE DE INVENTARIO",
    });
  };

  
  const handleToggleStatus = async (producto: ProductoConRelaciones) => {
    // 1. Identificar nuevo estado
    const nuevoEstado = producto.estado === 'activo' ? 'inactivo' : 'activo';
    const idLimpio = String(producto.id).split(':')[0];

    try {
      // 2. Llamada a la API (PATCH)
      const res = await fetch(`/api/admin/productos/${idLimpio}`, {
        method: 'PATCH',
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (res.ok) {
        refetch(); // Recargar datos
        toast.success("Estado actualizado");
      }
    } catch (error) {
      toast.error("Error al cambiar estado");
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventario de Productos</h1>
            <p className="text-gray-500 text-sm">
              Gestión de mercadería · Modas y Estilos GUOR
            </p>
          </div>

          <div className="flex items-center gap-3">
            {can("export", "productos") && (
              <>
                <Button
                  onClick={handleExportPDF}
                  variant="outline"
                  className="bg-white border-red-200 text-red-700 hover:bg-red-50 font-bold gap-2 h-11 transition-all active:scale-95"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Exportar PDF</span>
                </Button>
                <Button
                  onClick={handleExportExcel}
                  variant="outline"
                  className="bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold gap-2 h-11 transition-all active:scale-95"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span className="hidden sm:inline">Exportar Excel</span>
                </Button>
              </>
            )}

            {can("create", "productos") && (
              <Link href="/admin/Panel-Administrativo/productos/nuevo">
                <Button className="bg-pink-600 hover:bg-pink-700 text-white shadow-lg font-bold gap-2 h-11 px-6 transition-all active:scale-95">
                  <Plus className="w-4 h-4" /> Nuevo Producto
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total General"
            value={stats.total}
            icon={<Package className="w-5 h-5" />}
            color="pink"
            isActive={activeStat === "all"}
            onClick={() => { setActiveStat("all"); setCurrentPage(0); }}
          />
          <StatCard
            title="Catálogo Activo"
            value={stats.activos}
            icon={<BarChart3 className="w-5 h-5" />}
            color="emerald"
            isActive={activeStat === "activos"}
            onClick={() => { setActiveStat("activos"); setCurrentPage(0); }}
          />
          <StatCard
            title="Stock Bajo"
            value={stats.bajoStock}
            icon={<AlertTriangle className="w-5 h-5" />}
            color="orange"
            isActive={activeStat === "bajoStock"}
            onClick={() => { setActiveStat("bajoStock"); setCurrentPage(0); }}
          />
          <StatCard
            title="Sin Existencias"
            value={stats.agotados}
            icon={<XCircle className="w-5 h-5" />}
            color="red"
            isActive={activeStat === "agotados"}
            onClick={() => { setActiveStat("agotados"); setCurrentPage(0); }}
          />
        </div>

        {/* ── Buscador + Filtros ── */}
          <ProductFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategoria={selectedCategoria}
            setSelectedCategoria={setSelectedCategoria}
            colorFilter={colorFilter}
            setColorFilter={setColorFilter}
            sizeFilter={sizeFilter}
            setSizeFilter={setSizeFilter}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            categorias={categorias}
            colors={Array.from(
              new Set(
                productos.flatMap((p) => {
                  // 1. Intentar sacar de la relación variantes_producto
                  const deVariantes = p.variantes_producto?.map((v) => v.color) || [];
                  
                  // 2. Intentar sacar del campo JSON colores_disponibles (por si acaso)
                  const deJson = Array.isArray(p.colores_disponibles) ? p.colores_disponibles : [];
                  
                  return [...deVariantes, ...deJson];
                })
              )
            ).filter(Boolean) as string[]}
          />

        {/* ── Tabla ── */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center bg-white rounded-xl border animate-pulse">
            <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">
              Cargando inventario...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <ProductosTable
              data={paginatedData}
              categorias={categorias}
              loading={loading}
              onDelete={(p) => { setSelectedProducto(p); setIsDeleteOpen(true); }}
              onFicha={(p) => { setSelectedProducto(p); setIsTechOpen(true); }}
              onStatusChange={handleToggleStatus}
            />

            {/* Paginación */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-xs text-gray-500">
                Mostrando{" "}
                <span className="font-bold text-gray-900">{paginatedData.length}</span>{" "}
                de{" "}
                <span className="font-bold text-gray-900">{filteredProducts.length}</span>{" "}
                productos
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="px-4 py-1.5 text-xs font-bold bg-gray-50 border rounded-lg flex items-center">
                  Página {currentPage + 1} de {totalPages || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage + 1 >= totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Modales ── */}
      <DeleteProductoDialog
        isOpen={isDeleteOpen}
        producto={selectedProducto}
        onClose={() => setIsDeleteOpen(false)}
        onSuccess={refetch}
      />
      <TechSheetDialog
        isOpen={isTechOpen}
        producto={selectedProducto}
        onClose={() => setIsTechOpen(false)}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// StatCard — misma lógica que categorías
// ─────────────────────────────────────────────
function StatCard({ title, value, icon, isActive, color, onClick }: any) {
  const palette: Record<string, { border: string; icon: string; text: string; ring: string }> = {
    pink: {
      border: "border-pink-500",
      icon: "bg-pink-600 text-white",
      text: "text-pink-600",
      ring: "ring-pink-50",
    },
    emerald: {
      border: "border-emerald-500",
      icon: "bg-emerald-600 text-white",
      text: "text-emerald-600",
      ring: "ring-emerald-50",
    },
    orange: {
      border: "border-orange-500",
      icon: "bg-orange-500 text-white",
      text: "text-orange-500",
      ring: "ring-orange-50",
    },
    red: {
      border: "border-red-400",
      icon: "bg-red-500 text-white",
      text: "text-red-500",
      ring: "ring-red-50",
    },
  };

  const s = palette[color];

  return (
    <button
      onClick={onClick}
      className={`group p-4 rounded-xl border transition-all duration-200 flex items-center gap-4 cursor-pointer w-full text-left ${
        isActive
          ? `bg-white shadow-xl scale-[1.02] ring-4 ${s.ring} ${s.border}`
          : "bg-white border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95"
      }`}
    >
      <div
        className={`p-3 rounded-lg shrink-0 transition-all duration-200 ${
          isActive ? s.icon : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{title}</p>
        <p className={`text-2xl font-black tracking-tight ${isActive ? s.text : "text-gray-800"}`}>
          {value}
        </p>
      </div>
    </button>
  );
}