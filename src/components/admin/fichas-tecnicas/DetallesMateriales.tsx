"use client";

import { useFichaDetalle } from "@/lib/hooks/useFichaDetalle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Package2, Trash2, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  fichaId: string;
  canEdit: boolean;
}

export default function DetallesMateriales({ fichaId, canEdit }: Props) {
  const { detalles, isLoading, remove, isDeleting } = useFichaDetalle(fichaId);

  if (isLoading) return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );

  // Calcular costo total
  const costoTotal = (detalles as any[]).reduce((total, d) => {
    const precio    = Number(d.material?.precio_unitario ?? d.insumo?.precio_unitario ?? 0);
    const cantidad  = Number(d.cantidad_consumo);
    const desperdicio = Number(d.porcentaje_desperdicio ?? 0) / 100;
    return total + precio * cantidad * (1 + desperdicio);
  }, 0);

  return (
    <div className="space-y-4">

      {/* Header con costo total */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 font-semibold">
          {detalles.length} {detalles.length === 1 ? "item" : "items"} registrados
        </p>
        {detalles.length > 0 && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Costo total estimado</span>
            <span className="text-sm font-black text-emerald-700">S/ {costoTotal.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Sin datos */}
      {detalles.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm py-16 flex flex-col items-center gap-2">
          <Layers className="w-10 h-10 text-slate-200" />
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">
            No hay materiales ni insumos registrados
          </p>
        </div>
      )}

      {/* Tabla */}
      {detalles.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Ítem", "Tipo", "Cantidad", "% Desperdicio", "Precio unit.", "Subtotal", canEdit ? "" : null]
                  .filter(Boolean)
                  .map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {h}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(detalles as any[]).map((d, idx) => {
                const esM       = !!d.material;
                const item      = d.material ?? d.insumo;
                const precio    = Number(item?.precio_unitario ?? 0);
                const cantidad  = Number(d.cantidad_consumo);
                const desp      = Number(d.porcentaje_desperdicio ?? 0) / 100;
                const subtotal  = precio * cantidad * (1 + desp);

                return (
                  <tr key={d.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}>
                    {/* Ítem */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                          esM ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                        }`}>
                          <Package2 size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">{item?.nombre ?? "—"}</p>
                          {item?.composicion && (
                            <p className="text-[10px] text-slate-400 truncate">{item.composicion}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Tipo */}
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`rounded-full text-[10px] font-bold uppercase border ${
                        esM
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-purple-50 text-purple-700 border-purple-200"
                      }`}>
                        {esM ? "Material" : "Insumo"}
                      </Badge>
                    </td>

                    {/* Cantidad */}
                    <td className="px-4 py-3 text-slate-600 tabular-nums">
                      {cantidad} <span className="text-slate-400 text-xs">{item?.unidad_medida ?? ""}</span>
                    </td>

                    {/* Desperdicio */}
                    <td className="px-4 py-3 text-slate-600 tabular-nums">
                      {d.porcentaje_desperdicio ?? 0}%
                    </td>

                    {/* Precio unit. */}
                    <td className="px-4 py-3 text-slate-600 tabular-nums">
                      S/ {precio.toFixed(2)}
                    </td>

                    {/* Subtotal */}
                    <td className="px-4 py-3 font-bold text-slate-800 tabular-nums">
                      S/ {subtotal.toFixed(2)}
                    </td>

                    {/* Acción */}
                    {canEdit && (
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="icon" disabled={isDeleting}
                          onClick={() => remove(String(d.id))}
                          className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50">
                          <Trash2 size={14} />
                        </Button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>

            {/* Footer con total */}
            <tfoot>
              <tr className="border-t border-slate-200 bg-slate-50">
                <td colSpan={canEdit ? 5 : 4} className="px-4 py-3 text-right text-xs font-black uppercase tracking-widest text-slate-400">
                  Total estimado
                </td>
                <td className="px-4 py-3 font-black text-emerald-700 tabular-nums">
                  S/ {costoTotal.toFixed(2)}
                </td>
                {canEdit && <td />}
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}