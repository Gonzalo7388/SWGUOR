'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ALCANCE_CAMPANA_OPCIONES } from '@/lib/constants/promociones';
import { type AlcanceCampanaValue } from '@/lib/constants/promociones';
import type { EscalaCampanaForm } from '@/lib/schemas/promociones-ofertas';

interface CategoriaOpt {
  id: number | string;
  nombre: string;
}

interface ProductoOpt {
  id: number | string;
  nombre: string;
}

interface Props {
  alcance: AlcanceCampanaValue;
  categoriaId: string | number | null;
  productoId: string | number | null;
  escalas: EscalaCampanaForm[];
  categorias: CategoriaOpt[];
  productos: ProductoOpt[];
  errors: Record<string, string>;
  onAlcanceChange: (alcance: AlcanceCampanaValue) => void;
  onCategoriaChange: (id: string | number | null) => void;
  onProductoChange: (id: string | number | null) => void;
  onEscalasChange: (escalas: EscalaCampanaForm[]) => void;
}

export function EscalaDescuentosSection({
  alcance,
  categoriaId,
  productoId,
  escalas,
  categorias,
  productos,
  errors,
  onAlcanceChange,
  onCategoriaChange,
  onProductoChange,
  onEscalasChange,
}: Props) {
  const updateEscala = (index: number, patch: Partial<EscalaCampanaForm>) => {
    const next = [...escalas];
    next[index] = { ...next[index], ...patch };
    onEscalasChange(next);
  };

  const addEscala = () => {
    const ultima = escalas[escalas.length - 1];
    onEscalasChange([
      ...escalas,
      {
        cantidad_min: (ultima?.cantidad_min ?? 400) + 100,
        valor_descuento: Math.min((ultima?.valor_descuento ?? 5) + 2, 100),
      },
    ]);
  };

  const removeEscala = (index: number) => {
    if (escalas.length <= 1) return;
    onEscalasChange(escalas.filter((_, i) => i !== index));
  };

  return (
    <div className="border rounded-xl p-4 space-y-4 bg-slate-50/60 border-slate-200">
      <div>
        <p className="text-sm font-semibold text-slate-800">Escala de descuentos (reglas)</p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Define cantidades mínimas y porcentajes. Se crean reglas vinculadas a esta campaña.
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Alcance</label>
        <select
          className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
          value={alcance}
          onChange={(e) => onAlcanceChange(e.target.value as AlcanceCampanaValue)}
        >
          {ALCANCE_CAMPANA_OPCIONES.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {alcance === 'categoria' && (
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Categoría *</label>
          <select
            className={`w-full h-10 rounded-lg border px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-600 ${
              errors.categoria_id ? 'border-red-400' : 'border-gray-200'
            }`}
            value={categoriaId ?? ''}
            onChange={(e) => onCategoriaChange(e.target.value ? e.target.value : null)}
          >
            <option value="">Seleccionar categoría...</option>
            {categorias.map((c) => (
              <option key={c.id} value={String(c.id)}>{c.nombre}</option>
            ))}
          </select>
          {errors.categoria_id && (
            <p className="text-xs text-red-500 mt-1 font-medium">{errors.categoria_id}</p>
          )}
        </div>
      )}

      {alcance === 'producto' && (
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Producto *</label>
          <select
            className={`w-full h-10 rounded-lg border px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-600 ${
              errors.producto_id ? 'border-red-400' : 'border-gray-200'
            }`}
            value={productoId ?? ''}
            onChange={(e) => onProductoChange(e.target.value ? e.target.value : null)}
          >
            <option value="">Seleccionar producto...</option>
            {productos.map((p) => (
              <option key={p.id} value={String(p.id)}>{p.nombre}</option>
            ))}
          </select>
          {errors.producto_id && (
            <p className="text-xs text-red-500 mt-1 font-medium">{errors.producto_id}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Escalas</p>
          <Button type="button" size="sm" variant="outline" onClick={addEscala}>
            <Plus className="w-4 h-4 mr-1" /> Agregar escala
          </Button>
        </div>

        {escalas.map((escala, idx) => (
          <div
            key={`escala-${idx}`}
            className="flex gap-3 items-end bg-white p-3 rounded-lg border border-slate-100"
          >
            <div className="flex-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Cantidad mínima
              </label>
              <Input
                type="number"
                min={1}
                value={escala.cantidad_min}
                onChange={(e) =>
                  updateEscala(idx, { cantidad_min: Number(e.target.value) || 1 })
                }
                className="h-10"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                % descuento
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={escala.valor_descuento}
                onChange={(e) =>
                  updateEscala(idx, { valor_descuento: Number(e.target.value) || 0 })
                }
                className="h-10"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={escalas.length <= 1}
              onClick={() => removeEscala(idx)}
              className="h-10 w-10 text-red-500 hover:bg-red-50 shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {errors.escalas && (
          <p className="text-xs text-red-500 font-medium">{errors.escalas}</p>
        )}
      </div>
    </div>
  );
}
