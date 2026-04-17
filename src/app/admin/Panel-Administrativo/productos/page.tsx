"use client";

import { useState, useMemo, useEffect } from "react";
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

export default function ProductosPage() {
  const { can } = usePermissions();

  // 🔹 Estados de filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [colorFilter, setColorFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'none'>('none');

  // 🔹 Otros estados
  const [activeStat, setActiveStat] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedProducto, setSelectedProducto] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isTechOpen, setIsTechOpen] = useState(false);

  const pageSize = 10;
  const { data: stockResumen } = useProductoStockResumen();

  // ✅ HOOK CON FILTROS REALES
  const { productos, categorias, loading, refetch } = useProducts({
    categoriaId: selectedCategoria || undefined,
    estado: statusFilter !== "all" ? statusFilter : undefined,
    busqueda: searchTerm || undefined,
    color: colorFilter || undefined,
    talla: sizeFilter || undefined,
    sortOrder
  });

  // 🔹 Formateo
  const productosFormateados = useMemo(() => {
    if (!Array.isArray(productos)) return [];
    return productos.map((p: any) => ({
      ...p,
      id: BigInt(p.id),
      created_at: new Date(p.created_at),
      updated_at: new Date(p.updated_at),
    })) as ProductoConRelaciones[];
  }, [productos]);

  // 🔹 Stats
  const stats = useMemo(() => {
    const total = productosFormateados.length;
    const agotados = productosFormateados.filter(p => p.stock === 0).length;
    const bajoStock = productosFormateados.filter(p => p.stock > 0 && p.stock <= 5).length;
    const activos = productosFormateados.filter(p => p.estado === "activo").length;
    return { total, agotados, bajoStock, activos };
  }, [productosFormateados]);

  // 🔹 Filtro SOLO para stats (no backend)
  const filteredProducts = useMemo(() => {
    let data = productosFormateados;

    if (activeStat === "agotados") data = data.filter(p => p.stock === 0);
    if (activeStat === "bajoStock") data = data.filter(p => p.stock > 0 && p.stock <= 5);
    if (activeStat === "activos") data = data.filter(p => p.estado === "activo");

    return data;
  }, [productosFormateados, activeStat]);

  // 🔹 Paginación
  const paginatedData = filteredProducts
    .slice(currentPage * pageSize, (currentPage + 1) * pageSize)
    .map((p) => ({
      ...p,
      stockResumenData: stockResumen.find(s => s.producto_id === Number(p.id)) ?? null,
    }));

  const totalPages = Math.ceil(filteredProducts.length / pageSize);

  // 🔴 RESET PAGINACIÓN
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, selectedCategoria, colorFilter, sizeFilter, sortOrder, statusFilter]);

  // 🔹 Exportaciones
  const handleExportExcel = () => {
    exportToExcel(filteredProducts, {
      filename: `Inventario_${new Date().toISOString().split("T")[0]}`
    });
  };

  const handleExportPDF = () => {
    exportInventarioToPDF(filteredProducts, categorias, {
      filename: `Inventario_${new Date().toISOString().split("T")[0]}`,
      title: "REPORTE DE INVENTARIO",
    });
  };

  // 🔹 Cambiar estado
  const handleToggleStatus = async (producto: ProductoConRelaciones) => {
    const nuevoEstado = producto.estado === 'activo' ? 'inactivo' : 'activo';

    try {
      const res = await fetch(`/api/admin/productos/${producto.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (res.ok) {
        refetch();
        toast.success("Estado actualizado");
      }
    } catch {
      toast.error("Error al cambiar estado");
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Inventario</h1>

          <div className="flex gap-2">
            <Button onClick={handleExportPDF}><FileText /> PDF</Button>
            <Button onClick={handleExportExcel}><FileSpreadsheet /> Excel</Button>

            {can("create", "productos") && (
              <Link href="/admin/Panel-Administrativo/productos/nuevo">
                <Button><Plus /> Nuevo</Button>
              </Link>
            )}
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Total" value={stats.total} onClick={() => setActiveStat("all")} />
          <StatCard title="Activos" value={stats.activos} onClick={() => setActiveStat("activos")} />
          <StatCard title="Stock Bajo" value={stats.bajoStock} onClick={() => setActiveStat("bajoStock")} />
          <StatCard title="Agotados" value={stats.agotados} onClick={() => setActiveStat("agotados")} />
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
        />

        {/* TABLA */}
        <ProductosTable
          data={paginatedData}
          categorias={categorias}
          loading={loading}
          onDelete={(p) => { setSelectedProducto(p); setIsDeleteOpen(true); }}
          onFicha={(p) => { setSelectedProducto(p); setIsTechOpen(true); }}
          onStatusChange={handleToggleStatus}
        />

        {/* PAGINACIÓN */}
        <div className="flex justify-between">
          <Button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0}>
            <ChevronLeft />
          </Button>

          <span>Página {currentPage + 1} de {totalPages || 1}</span>

          <Button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage + 1 >= totalPages}>
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

function StatCard({ title, value, onClick }: any) {
  return (
    <button onClick={onClick} className="p-4 bg-white rounded-xl border w-full text-left">
      <p className="text-xs text-gray-400">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </button>
  );
}