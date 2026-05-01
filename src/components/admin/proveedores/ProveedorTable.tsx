// src/components/admin/proveedores/ProveedorTable.tsx
'use client';

import { memo } from 'react';
import { Building2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ProveedorRow from '@/components/admin/proveedores/ProveedorRow';
import type { Proveedor } from '@/lib/schemas/proveedor';

interface ProveedorTableProps {
  data:         Proveedor[];
  loading?:     boolean;
  onEdit:       (p: Proveedor) => void;
  onDelete:     (p: Proveedor) => void;
  onViewDetail: (p: Proveedor) => void;
  // canEdit y canDelete se leen desde usePermissions dentro de ProveedorRow
}

function ProveedorTable({ data, loading, onEdit, onDelete, onViewDetail }: ProveedorTableProps) {
  return (
    <div className="overflow-x-auto pb-4">
      <table className="w-full border-separate border-spacing-y-3">
        <thead>
          <tr className="text-left">
            <th className="px-6 py-2 font-black text-[11px] tracking-widest text-slate-400 uppercase">Proveedor</th>
            <th className="px-6 py-2 font-black text-[11px] tracking-widest text-slate-400 uppercase hidden md:table-cell">Contacto</th>
            <th className="px-6 py-2 font-black text-[11px] tracking-widest text-slate-400 uppercase text-center hidden lg:table-cell">Categoría</th>
            <th className="px-6 py-2 font-black text-[11px] tracking-widest text-slate-400 uppercase text-center hidden lg:table-cell">Actividad</th>
            <th className="px-6 py-2 font-black text-[11px] tracking-widest text-slate-400 uppercase text-center">Estado</th>
            <th className="px-6 py-2 font-black text-[11px] tracking-widest text-slate-400 uppercase text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            // ── Skeleton ──
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={`sk-${i}`}>
                <td className="bg-white border-y border-l border-slate-100 py-4 px-6 rounded-l-2xl shadow-sm">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-11 w-11 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                </td>
                <td className="bg-white border-y border-slate-100 py-4 px-6 shadow-sm hidden md:table-cell">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </td>
                <td className="bg-white border-y border-slate-100 py-4 px-6 shadow-sm hidden lg:table-cell">
                  <Skeleton className="h-6 w-24 mx-auto rounded-lg" />
                </td>
                <td className="bg-white border-y border-slate-100 py-4 px-6 shadow-sm hidden lg:table-cell">
                  <Skeleton className="h-8 w-28 mx-auto rounded-lg" />
                </td>
                <td className="bg-white border-y border-slate-100 py-4 px-6 shadow-sm">
                  <Skeleton className="h-6 w-20 mx-auto rounded-full" />
                </td>
                <td className="bg-white border-y border-r border-slate-100 py-4 px-6 rounded-r-2xl shadow-sm">
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-9 w-9 rounded-xl" />
                    <Skeleton className="h-9 w-9 rounded-xl" />
                  </div>
                </td>
              </tr>
            ))
          ) : data.length === 0 ? (
            // ── Sin datos ──
            <tr>
              <td colSpan={6} className="bg-white rounded-2xl border border-slate-100 py-16 text-center shadow-sm">
                <div className="flex flex-col items-center gap-3">
                  <Building2 className="w-12 h-12 text-slate-200" />
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">
                    No se encontraron proveedores
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            // ── Lista ──
            data.map((p) => (
              <ProveedorRow
                key={String(p.id)}
                p={p}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewDetail={onViewDetail}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default memo(ProveedorTable);