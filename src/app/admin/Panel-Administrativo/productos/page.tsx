"use client";

import { useState, useMemo, useEffect } from "react";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { useProducts } from "@/lib/hooks/useProducts";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet,
  Plus,
  FileText,
  ChevronLeft,
  ChevronRight,
  Package,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
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
  const { can } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("all");
  const [colorFilter, setColorFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'none'>("none");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedProducto, setSelectedProducto] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isTechOpen, setIsTechOpen] = useState(false);

  const pageSize = 10;

  const { data: stockResumen } = useProductoStockResumen();

  const { productos, categorias, loading, refetch } = useProducts({
    categoriaId:
      selectedCategoria !== "all" ? selectedCategoria : undefined,
    busqueda: searchTerm || undefined,
    color: colorFilter || undefined,
    talla: sizeFilter || undefined,
    sortOrder
  });

  // Colores 
  const colors = useMemo(() => {
    return Array.from(
      new Set(
        productos.flatMap((p: any) => [
          ...(p.variantes_producto?.map((v: any) => v.color) || []),
          ...(Array.isArray(p.colores_disponibles)
            ? p.colores_disponibles
            : [])
        ])
      )
    ).filter(Boolean) as string[];
  }, [productos]);

  // Stats estilo categorías
  const stats = useMemo(() => {
    const total = productos.length;
    const activos = productos.filter((p: any) => p.estado === "activo").length;
    const bajoStock = productos.filter(
      (p: any) => p.stock > 0 && p.stock <= 5
    ).length;

    return { total, activos, bajoStock };
  }, [productos]);

  // Paginación
  const totalPages = Math.ceil(productos.length / pageSize);

  const paginatedData = productos
    .slice(currentPage * pageSize, (currentPage + 1) * pageSize)
    .map((p: any) => ({
      ...p,
      stock:
        stockResumen?.find((s) => s.producto_id === Number(p.id))
          ?.stock_total_adicional ?? p.stock ?? 0
    }));

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, selectedCategoria, colorFilter, sizeFilter, sortOrder]);

  // EXPORTACIONES
  const handleExportExcel = () => {
    exportProductosToExcel(productos, stockResumen || [], "Inventario");
    toast.success("Excel generado");
  };

  const handleExportPDF = () => {
    exportInventarioToPDF(productos, categorias, {
      filename: "Inventario",
      title: "REPORTE DE INVENTARIO"
    });
    toast.success("PDF generado");
  };

  // Estado toggle
  const handleToggleStatus = async (producto: any) => {
    try {
      await fetch(`/api/admin/productos/${producto.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          estado: producto.estado === "activo" ? "inactivo" : "activo"
        })
      });

      refetch();
      toast.success("Estado actualizado");
    } catch {
      toast.error("Error");
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Inventario</h1>
            <p className="text-gray-500 text-sm">
              Gestión de productos y stock
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleExportPDF}
              variant="outline"
              className="border-red-200 text-red-600"
            >
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>

            <Button
              onClick={handleExportExcel}
              variant="outline"
              className="border-emerald-200 text-emerald-600"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Excel
            </Button>

            {can("create", "productos") && (
              <Link href="/admin/Panel-Administrativo/productos/nuevo">
                <Button className="bg-pink-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="TOTAL" value={stats.total} icon={<Package />} />
          <StatCard title="ACTIVOS" value={stats.activos} icon={<CheckCircle2 />} />
          <StatCard title="STOCK BAJO" value={stats.bajoStock} icon={<AlertTriangle />} />
        </div>

        {/* FILTROS */}
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
          colors={colors}
        />

        {/* TABLA */}
        <ProductosTable
          data={paginatedData}
          categorias={categorias}
          loading={loading}
          onDelete={(p) => {
            setSelectedProducto(p);
            setIsDeleteOpen(true);
          }}
          onFicha={(p) => {
            setSelectedProducto(p);
            setIsTechOpen(true);
          }}
          onStatusChange={handleToggleStatus}
        />

        {/* PAGINACIÓN */}
        <div className="flex justify-between bg-white p-4 rounded-xl border shadow-sm">
          <Button
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 0}
            variant="outline"
          >
            <ChevronLeft />
          </Button>

          <span className="text-sm font-medium">
            Página {currentPage + 1} de {totalPages || 1}
          </span>

          <Button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage + 1 >= totalPages}
            variant="outline"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      {/* MODALES */}
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

function StatCard({ title, value, icon }: any) {
  return (
    <div className="p-4 bg-white rounded-xl border flex items-center gap-4 shadow-sm">
      <div className="p-3 bg-gray-100 rounded-lg">{icon}</div>
      <div>
        <p className="text-xs text-gray-400">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}