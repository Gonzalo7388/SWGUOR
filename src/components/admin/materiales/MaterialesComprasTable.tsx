'use client';

import Link from 'next/link';
import { Eye, Edit2, Layers, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TIPOS_MATERIAL } from '@/lib/constants/materiales';
import { UNIDADES_MEDIDA } from '@/lib/constants/estados';
import type { MaterialCompraRow } from '@/lib/helpers/materiales-compras-helpers';
import type { TipoMaterial, UnidadMedida } from '@prisma/client';

interface Props {
  materiales: MaterialCompraRow[];
  isLoading?: boolean;
  onEdit?: (material: MaterialCompraRow) => void;
  canEdit?: boolean;
}

const tableWrap = 'bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden';
const thClass = 'text-left py-4 px-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest';
const tdClass = 'py-4 px-5';

function stockBadge(actual: number, minimo: number) {
  if (actual <= 0) return { label: 'Agotado', cls: 'bg-red-50 text-red-700 border-red-100' };
  if (actual <= minimo) return { label: 'Bajo', cls: 'bg-amber-50 text-amber-700 border-amber-100' };
  return { label: 'Óptimo', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
}

export default function MaterialesComprasTable({ materiales, isLoading, onEdit, canEdit }: Props) {
  if (isLoading) {
    return (
      <div className={`${tableWrap} py-16 flex flex-col items-center gap-2`}>
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        <span className="text-gray-400 text-sm">Cargando materiales...</span>
      </div>
    );
  }

  if (!materiales.length) {
    return (
      <div className={tableWrap}>
        <div className="py-16 text-center flex flex-col items-center gap-2">
          <Layers className="w-8 h-8 text-gray-300" />
          <span className="text-gray-400 italic text-sm">No hay materiales registrados</span>
        </div>
      </div>
    );
  }

  return (
    <div className={tableWrap}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/50">
            <tr>
              <th className={thClass}>Material</th>
              <th className={thClass}>Tipo</th>
              <th className={thClass}>Proveedor</th>
              <th className={`${thClass} text-center`}>Stock</th>
              <th className={`${thClass} text-right`}>Precio ref.</th>
              <th className={`${thClass} text-center`}>Órdenes C.</th>
              <th className={`${thClass} text-center`}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {materiales.map((material) => {
              const stock = Number(material.stock_actual);
              const minimo = Number(material.stock_minimo);
              const badge = stockBadge(stock, minimo);
              const ocCount = material._count?.ordenes_compra_items ?? 0;
              const unidad = UNIDADES_MEDIDA[material.unidad_medida as UnidadMedida]?.label ?? material.unidad_medida;

              return (
                <tr key={material.id} className="border-t border-gray-50 hover:bg-gray-50/30">
                  <td className={tdClass}>
                    <p className="font-semibold text-gray-900">{material.nombre}</p>
                    <p className="text-[10px] text-gray-400 uppercase">{unidad}</p>
                    {material.composicion && (
                      <p className="text-xs text-gray-500 mt-0.5">{material.composicion}</p>
                    )}
                  </td>
                  <td className={tdClass}>
                    <span className="text-xs font-medium text-gray-700">
                      {TIPOS_MATERIAL[material.tipo as TipoMaterial]?.label ?? material.tipo}
                    </span>
                    {material.gramaje && (
                      <p className="text-[10px] text-gray-400">{material.gramaje} g/m²</p>
                    )}
                  </td>
                  <td className={tdClass}>
                    <span className="text-sm text-gray-600">
                      {material.proveedores?.razon_social ?? '—'}
                    </span>
                  </td>
                  <td className={`${tdClass} text-center`}>
                    <p className="font-bold text-gray-800">{stock.toLocaleString('es-PE')}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <span className="font-semibold text-gray-800">
                      S/ {Number(material.precio_unitario ?? 0).toFixed(2)}
                    </span>
                  </td>
                  <td className={`${tdClass} text-center`}>
                    <span className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-lg text-xs font-bold ${ocCount > 0 ? 'bg-violet-50 text-violet-700' : 'bg-gray-50 text-gray-400'}`}>
                      {ocCount}
                    </span>
                  </td>
                  <td className={`${tdClass} text-center`}>
                    <div className="flex items-center justify-center gap-1">
                      <Link href={`/admin/Panel-Administrativo/materiales/${material.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-violet-600">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      {canEdit && onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-amber-600"
                          onClick={() => onEdit(material)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
