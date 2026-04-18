"use client";

import { useMemo, memo } from "react";
import Link from "next/link";
import { 
  Edit2, Trash2, Package, Tag, Lock, 
  FileText, CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProductoConRelaciones, Categoria } from "@/app/admin/Panel-Administrativo/productos/types";
import { usePermissions } from '@/lib/hooks/usePermissions';

interface ProductoRowProps {
  p: ProductoConRelaciones;
  categorias: Categoria[];
  onDelete: (p: ProductoConRelaciones) => void;
  onFicha: (p: ProductoConRelaciones) => void;
  onStatusChange?: (p: ProductoConRelaciones) => void;
  canEdit: boolean;
  canDelete: boolean;
}

const normalizeId = (id: any) => String(id).replace(/[^0-9]/g, '');

const ProductoRow = memo(({
  p,
  categorias,
  onDelete,
  onFicha,
  onStatusChange,
}: ProductoRowProps) => {
  const { can } =usePermissions();
  const canEdit = can('edit', 'productos');
  const canDelete = can('delete', 'productos');
  const rawImage = String(p.imagen || "").trim();
  const fileName = rawImage.split('/').pop();
  const publicUrl = fileName && fileName !== "null" && fileName !== ""
    ? `https://fkpvmgfsopjhvorckoat.supabase.co/storage/v1/object/public/productos/${fileName}`
    : null;
  
  const hasFicha = !!p.ficha_tecnica_rel;
  
  const categoriaNombre = useMemo(() => {
    // 1. Si el objeto de la relación ya viene incluido por Prisma, lo usamos directamente (Es lo más rápido)
    const relacionDirecta = p.categorias || (p as any).categoria;
    if (relacionDirecta && relacionDirecta.nombre) return relacionDirecta.nombre;

    // 2. Si no viene el objeto, buscamos por ID en la lista de categorías global
    if (!p.categoria_id) return 'Sin categoría';

    const encontrada = categorias.find(
      (c) => normalizeId(c.id) === normalizeId(p.categoria_id)
    );

    return encontrada ? encontrada.nombre : 'Sin categoría';
    }, [p.categoria_id, p.categorias, categorias]);

  return (
    <tr className="group transition-all duration-200">
      <td className="bg-white border-y border-l border-slate-100 py-4 px-6 rounded-l-2xl shadow-sm group-hover:shadow-md transition-all">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 relative bg-slate-50 rounded-xl border border-slate-100 shrink-0 overflow-hidden">
            {publicUrl ? (
              <img src={publicUrl} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-6 h-6 text-slate-300" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 text-sm tracking-tight uppercase leading-none">{p.sku}</span>
              {hasFicha && <CheckCircle2 size={14} className="text-emerald-500" />}
            </div>
            <div className="text-slate-500 text-[13px] font-medium mt-1 truncate max-w-[200px]">{p.nombre}</div>
            <div className="text-pink-600 font-black text-sm mt-1">S/ {Number(p.precio).toFixed(2)}</div>
          </div>
        </div>
      </td>

      <td className="bg-white border-y border-slate-100 text-center shadow-sm">
        <div className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-tight">
          <Tag size={10} /> {categoriaNombre}
        </div>
      </td>

      <td className="bg-white border-y border-slate-100 text-center shadow-sm">
        <div className="flex flex-col items-center">
          <span className="text-lg font-black text-slate-900">{p.stock}</span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Unidades</span>
        </div>
      </td>

      <td className="bg-white border-y border-slate-100 text-center shadow-sm">
        <button
            onClick={() => onStatusChange?.(p)}
            className="group/status relative"
        >
            <Badge 
            className={`rounded-full px-3 py-1 text-[9px] font-black border-2 uppercase transition-all duration-300 ${
                p.estado === 'activo' 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white' 
                : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-600 hover:text-white'
            }`} 
            variant="outline"
            >
            {p.estado}
            </Badge>
        </button>
        </td>

      <td className="bg-white border-y border-r border-slate-100 px-6 rounded-r-2xl text-right shadow-sm">
        <div className="flex justify-end items-center gap-2">
          <TooltipProvider>
            <Button variant="outline" size="icon" onClick={() => onFicha(p)} className="h-9 w-9 rounded-xl border-slate-200">
              <FileText size={16} className={hasFicha ? 'text-emerald-500' : 'text-slate-400'} />
            </Button>

            {canEdit ? (
              <Link href={`/admin/Panel-Administrativo/productos/${p.id}`}>
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200 text-slate-400 hover:text-pink-600 hover:bg-pink-50">
                  <Edit2 size={16} />
                </Button>
              </Link>
            ) : (
              <Button disabled variant="outline" size="icon" className="h-9 w-9 rounded-xl opacity-30">
                <Lock size={14} />
              </Button>
            )}

            {canDelete && (
              <Button variant="outline" size="icon" onClick={() => onDelete(p)} className="h-9 w-9 rounded-xl border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50">
                <Trash2 size={16} />
              </Button>
            )}
          </TooltipProvider>
        </div>
      </td>
    </tr>
  );
});

ProductoRow.displayName = "ProductoRow";
export default ProductoRow;