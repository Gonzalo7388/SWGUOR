"use client";

import { useState, useMemo } from "react";
import { useFichaMedidas } from "@/lib/hooks/useFichasTecnicas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Save, Ruler } from "lucide-react";

interface Props {
  fichaId: string;
  canEdit: boolean;
}

interface MedidaLocal {
  id?:          string;
  punto_medida: string;
  talla:        string;
  valor_cm:     string;
  tolerancia:   string;
}

export default function MedidasEditor({ fichaId, canEdit }: Props) {
  const { medidas, isLoading, save, isSaving } = useFichaMedidas(fichaId);

  const [rows, setRows] = useState<MedidaLocal[]>([]);
  const [editMode, setEditMode] = useState(false);

  // Inicializar rows desde medidas al entrar en edición
  const startEdit = () => {
    setRows(medidas.map((m: any) => ({
      id:           String(m.id),
      punto_medida: m.punto_medida,
      talla:        m.talla,
      valor_cm:     m.valor_cm   != null ? String(m.valor_cm)   : "",
      tolerancia:   m.tolerancia != null ? String(m.tolerancia) : "",
    })));
    setEditMode(true);
  };

  const cancelEdit = () => { setRows([]); setEditMode(false); };

  const addRow = () => setRows((prev) => [
    ...prev,
    { punto_medida: "", talla: "", valor_cm: "", tolerancia: "" },
  ]);

  const removeRow = (idx: number) => setRows((prev) => prev.filter((_, i) => i !== idx));

  const updateRow = (idx: number, field: keyof MedidaLocal, value: string) =>
    setRows((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));

  const handleSave = () => {
    const medidas = rows
      .filter((r) => r.punto_medida.trim() && r.talla.trim())
      .map((r) => ({
        punto_medida: r.punto_medida.trim(),
        talla:        r.talla.trim(),
        valor_cm:   r.valor_cm   ? Number(r.valor_cm)   : null,
        tolerancia: r.tolerancia ? Number(r.tolerancia) : null,
      }));
    save(medidas);
    setEditMode(false);
    setRows([]);
  };

  // Agrupar medidas por punto_medida para tabla cruzada
  const { puntos, tallas, matrix } = useMemo(() => {
    const puntosSet = new Set<string>();
    const tallasSet = new Set<string>();
    const map: Record<string, Record<string, { valor_cm: any; tolerancia: any }>> = {};

    for (const m of medidas as any[]) {
      puntosSet.add(m.punto_medida);
      tallasSet.add(m.talla);
      if (!map[m.punto_medida]) map[m.punto_medida] = {};
      map[m.punto_medida][m.talla] = { valor_cm: m.valor_cm, tolerancia: m.tolerancia };
    }

    return {
      puntos: Array.from(puntosSet).sort(),
      tallas: Array.from(tallasSet).sort(),
      matrix: map,
    };
  }, [medidas]);

  if (isLoading) return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-xl" />
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 font-semibold">
          {medidas.length} puntos de medida registrados
        </p>
        {canEdit && !editMode && (
          <Button onClick={startEdit} variant="outline"
            className="border-pink-200 text-pink-600 hover:bg-pink-50 font-bold gap-2 h-9">
            <Ruler size={15} /> Editar medidas
          </Button>
        )}
        {editMode && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={cancelEdit} className="h-9 border-slate-200">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}
              className="bg-pink-600 hover:bg-pink-700 text-white font-bold gap-2 h-9">
              <Save size={15} /> {isSaving ? "Guardando…" : "Guardar medidas"}
            </Button>
          </div>
        )}
      </div>

      {/* Vista lectura — tabla cruzada */}
      {!editMode && medidas.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 min-w-[150px]">
                  Punto de medida
                </th>
                {tallas.map((t) => (
                  <th key={t} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {puntos.map((punto, idx) => (
                <tr key={punto} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                  <td className="px-4 py-3 font-semibold text-slate-700">{punto}</td>
                  {tallas.map((talla) => {
                    const cell = matrix[punto]?.[talla];
                    return (
                      <td key={talla} className="px-4 py-3 text-center text-slate-600 tabular-nums">
                        {cell ? (
                          <span>
                            {cell.valor_cm ?? "—"}
                            {cell.tolerancia != null && (
                              <span className="text-[10px] text-slate-400 ml-1">
                                ±{cell.tolerancia}
                              </span>
                            )}
                          </span>
                        ) : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sin medidas */}
      {!editMode && medidas.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm py-16 flex flex-col items-center gap-2">
          <Ruler className="w-10 h-10 text-slate-200" />
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">
            No hay medidas registradas
          </p>
          {canEdit && (
            <Button onClick={startEdit} size="sm"
              className="mt-2 bg-pink-600 hover:bg-pink-700 text-white font-bold gap-2">
              <Plus size={14} /> Agregar medidas
            </Button>
          )}
        </div>
      )}

      {/* Vista edición — filas */}
      {editMode && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_120px_120px_40px] gap-0 border-b border-slate-100 bg-slate-50 px-4 py-2">
            {["Punto de medida", "Talla", "Valor (cm)", "Tolerancia", ""].map((h, i) => (
              <span key={i} className="text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</span>
            ))}
          </div>

          <div className="divide-y divide-slate-50">
            {rows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_1fr_120px_120px_40px] gap-2 px-4 py-2 items-center">
                <Input value={row.punto_medida} placeholder="Ej: Pecho"
                  onChange={(e) => updateRow(idx, "punto_medida", e.target.value)}
                  className="h-8 text-sm border-slate-200" />
                <Input value={row.talla} placeholder="Ej: M"
                  onChange={(e) => updateRow(idx, "talla", e.target.value)}
                  className="h-8 text-sm border-slate-200" />
                <Input type="number" value={row.valor_cm} placeholder="0.0"
                  onChange={(e) => updateRow(idx, "valor_cm", e.target.value)}
                  className="h-8 text-sm border-slate-200" />
                <Input type="number" value={row.tolerancia} placeholder="0.0"
                  onChange={(e) => updateRow(idx, "tolerancia", e.target.value)}
                  className="h-8 text-sm border-slate-200" />
                <Button variant="ghost" size="icon" onClick={() => removeRow(idx)}
                  className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50">
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>

          <div className="px-4 py-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={addRow}
              className="border-dashed border-slate-300 text-slate-500 hover:border-pink-300 hover:text-pink-600 font-bold gap-2">
              <Plus size={14} /> Agregar fila
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}