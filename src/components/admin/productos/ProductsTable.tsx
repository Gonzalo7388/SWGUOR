"use client";

import { memo } from "react";
import { Loader2, Package } from "lucide-react";
import { ProductoConRelaciones, Categoria } from "@/app/admin/Panel-Administrativo/productos/types";
import ProductoRow from "@/components/admin/productos/ProductsRow";

interface ProductosTableProps {
  data: ProductoConRelaciones[];
  categorias: Categoria[];
  loading?: boolean;
  onDelete: (p: ProductoConRelaciones) => void;
  onFicha: (p: ProductoConRelaciones) => void;
  onStatusChange?: (p: ProductoConRelaciones) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

function ProductosTable({
  data,
  categorias,
  loading,
  onDelete,
  onFicha,
  onStatusChange,
  canEdit = false,
  canDelete = false
}: ProductosTableProps) {
  
  if (loading) {
    return (
      <div className="bg-white rounded-[32px] border border-slate-100 py-24 text-center shadow-sm">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
          <p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">Sincronizando Inventario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto pb-4">
        <table className="w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left">
              <th className="px-6 py-2 font-black text-[11px] tracking-widest text-slate-400 uppercase">Detalle Producto</th>
              <th className="px-6 py-2 font-black text-[11px] tracking-widest text-slate-400 uppercase text-center">Categoría</th>
              <th className="px-6 py-2 font-black text-[11px] tracking-widest text-slate-400 uppercase text-center">Stock</th>
              <th className="px-6 py-2 font-black text-[11px] tracking-widest text-slate-400 uppercase text-center">Estado</th>
              <th className="px-6 py-2 font-black text-[11px] tracking-widest text-slate-400 uppercase text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="bg-white rounded-2xl border border-slate-100 py-16 text-center shadow-sm">
                  <div className="flex flex-col items-center gap-3">
                    <Package className="w-12 h-12 text-slate-200" />
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No hay productos</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((p) => (
                <ProductoRow
                  key={p.id.toString()}
                  p={p}
                  categorias={categorias}
                  onDelete={onDelete}
                  onFicha={onFicha}
                  onStatusChange={onStatusChange}
                  canEdit={canEdit}
                  canDelete={canDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default memo(ProductosTable);