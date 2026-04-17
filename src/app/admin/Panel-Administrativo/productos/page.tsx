"use client";

import { useState, useMemo, useEffect } from "react";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { useProducts } from "@/lib/hooks/useProducts";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet, Plus, ChevronLeft, ChevronRight, FileText
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import ProductFilters from "@/components/admin/productos/ProductsFilters";
import ProductosTable from "@/components/admin/productos/ProductsTable";
import { toast } from "sonner";
import { useProductoStockResumen } from '@/lib/hooks/useStockResumen';

const DeleteProductoDialog = dynamic(() => import("@/components/admin/productos/DeleteProductDialog"));
const TechSheetDialog = dynamic(() => import("@/components/admin/productos/TechSheetDialog"));

export default function ProductosPage() {

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("all");
  const [colorFilter, setColorFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'none'>('none');

  const [currentPage, setCurrentPage] = useState(0);
  const [selectedProducto, setSelectedProducto] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isTechOpen, setIsTechOpen] = useState(false);

  const pageSize = 10;
  const { data: stockResumen } = useProductoStockResumen();

  const { productos, categorias, loading, refetch } = useProducts({
    categoriaId: selectedCategoria !== "all" ? selectedCategoria : undefined,
    busqueda: searchTerm || undefined,
    color: colorFilter || undefined,
    talla: sizeFilter || undefined,
    sortOrder
  });

  // ✅ FIX COLORS
  const colors = useMemo(() => {
    return Array.from(
      new Set(
        productos.flatMap((p: any) => [
          ...(p.variantes_producto?.map((v: any) => v.color) || []),
          ...(Array.isArray(p.colores_disponibles) ? p.colores_disponibles : [])
        ])
      )
    ).filter(Boolean) as string[];
  }, [productos]);

  const totalPages = Math.ceil(productos.length / pageSize);

  const paginatedData = productos.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, selectedCategoria, colorFilter, sizeFilter, sortOrder]);

  const handleToggleStatus = async (producto: any) => {
    try {
      await fetch(`/api/admin/productos/${producto.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ estado: "activo" }),
      });
      refetch();
      toast.success("Estado actualizado");
    } catch {
      toast.error("Error");
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventario</h1>

        <Link href="/admin/Panel-Administrativo/productos/nuevo">
          <Button className="bg-pink-600 text-white">
            <Plus className="w-4 h-4 mr-2"/> Nuevo
          </Button>
        </Link>
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