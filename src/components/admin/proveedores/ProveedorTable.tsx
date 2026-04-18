'use client';

import { Building2, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Proveedor } from '@/lib/schemas/proveedor';

interface Props {
  data:          Proveedor[];
  canEdit:       boolean;
  canDelete:     boolean;
  onEdit:        (p: Proveedor) => void;
  onDelete:      (p: Proveedor) => void;
  onViewDetail:  (p: Proveedor) => void;
}

export default function ProveedorTable({
  data, canEdit, canDelete, onEdit, onDelete, onViewDetail,
}: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border shadow-sm p-12 text-center">
        <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-semibold">No se encontraron proveedores</p>
        <p className="text-gray-400 text-sm mt-1">Intenta ajustar los filtros de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Razón Social', 'RUC', 'Contacto', 'Categoría', 'Estado', 'Acciones'].map((h, i) => (
                <th
                  key={h}
                  className={`px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider
                    ${i === 5 ? 'text-right' : 'text-left'}
                    ${i === 2 ? 'hidden md:table-cell' : ''}
                    ${i === 3 ? 'hidden lg:table-cell' : ''}
                  `}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3">
                  <button
                    onClick={() => onViewDetail(p)}
                    className="font-semibold text-gray-900 hover:text-rose-600 transition-colors text-left"
                  >
                    {p.razon_social}
                  </button>
                </td>
                <td className="px-4 py-3 font-mono text-gray-600">{p.ruc}</td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{p.contacto}</td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="inline-flex px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full">
                    {p.categoria_suministro}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${
                    p.estado === 'activo'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-gray-100 text-gray-500 border-gray-200'
                  }`}>
                    {p.estado === 'activo' ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600" onClick={() => onViewDetail(p)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    {canEdit && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-amber-600" onClick={() => onEdit(p)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                    {canDelete && p.estado === 'activo' && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600" onClick={() => onDelete(p)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}