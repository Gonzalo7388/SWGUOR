"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  Plus, Trash2, Box, Fingerprint, Edit2, Check,
  X, ChevronDown, Palette, Ruler, PackagePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateVariantSKU } from "@/lib/utils/producto-utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const LABEL = "text-[9px] font-black text-gray-400 uppercase tracking-[0.14em] block mb-1";

function ColorSwatch({ color }: { color: string }) {
  const named = color?.trim().toLowerCase();
  // CSS reconoce colores en español en algunos casos; fallback a gris si no
  return (
    <span
      className="inline-block w-3.5 h-3.5 rounded-full border border-white shadow-sm shrink-0"
      style={{ background: named || "#e5e7eb" }}
    />
  );
}

function StockBadge({ value }: { value: number }) {
  const n = Number(value) || 0;
  const cls =
    n === 0
      ? "bg-rose-50 text-rose-500 border-rose-100"
      : n < 50
      ? "bg-amber-50 text-amber-600 border-amber-100"
      : "bg-emerald-50 text-emerald-600 border-emerald-100";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-black ${cls}`}>
      <Box size={11} />
      {n}
    </span>
  );
}

// ─── Fila en modo lectura ──────────────────────────────────────────────────────
function VariantRow({
  index,
  field,
  skuMaestro,
  mode,
  onEdit,
  onRemove,
}: {
  index: number;
  field: any;
  skuMaestro: string;
  mode: "create" | "edit";
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { watch } = useFormContext();
  const color = watch(`variantes.${index}.color`) || "";
  const talla = watch(`variantes.${index}.talla`) || "";
  const stock = watch(`variantes.${index}.stock`) ?? 0;
  const stockAdicional = watch(`variantes.${index}.stock_adicional`) || 0;

  const sku =
    color && talla && skuMaestro !== "SKU"
      ? generateVariantSKU(skuMaestro, color, talla)
      : field.sku || "—";

  return (
    <tr className="group hover:bg-gray-50/50 transition-colors">
      {/* Color */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <ColorSwatch color={color} />
          <span className="text-sm font-semibold text-gray-700 capitalize">{color || "—"}</span>
        </div>
      </td>

      {/* Talla */}
      <td className="px-5 py-3.5">
        <span className="text-xs font-black text-gray-600 uppercase bg-gray-100 px-2.5 py-1 rounded-lg">
          {talla || "—"}
        </span>
      </td>

      {/* SKU */}
      <td className="px-5 py-3.5">
        <code className="text-[10px] font-mono bg-gray-100 text-gray-500 px-2.5 py-1 rounded-lg">
          {sku}
        </code>
      </td>

      {/* Stock actual */}
      <td className="px-5 py-3.5 text-center">
        <StockBadge value={stock} />
      </td>

      {/* Stock adicional (solo edit) */}
      {mode === "edit" && (
        <td className="px-5 py-3.5 text-center">
          {Number(stockAdicional) > 0 ? (
            <span className="inline-flex items-center gap-1 text-xs font-black text-sky-600 bg-sky-50 border border-sky-100 px-2.5 py-1 rounded-lg">
              +{stockAdicional}
            </span>
          ) : (
            <span className="text-gray-300 text-xs">—</span>
          )}
        </td>
      )}

      {/* Acciones */}
      <td className="px-5 py-3.5">
        <div className="flex justify-end items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 rounded-lg text-gray-400 hover:text-pink-600 hover:bg-pink-50 transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Fila en modo edición inline ───────────────────────────────────────────────
function VariantEditRow({
  index,
  field,
  skuMaestro,
  mode,
  onSave,
  onCancel,
}: {
  index: number;
  field: any;
  skuMaestro: string;
  mode: "create" | "edit";
  onSave: () => void;
  onCancel: () => void;
}) {
  const { register, watch, setValue } = useFormContext();
  const color = watch(`variantes.${index}.color`) || "";
  const talla = watch(`variantes.${index}.talla`) || "";

  const sku =
    color && talla && skuMaestro !== "SKU"
      ? generateVariantSKU(skuMaestro, color, talla)
      : "—";

  // Sincroniza el sku oculto al cambiar color/talla
  useEffect(() => {
    if (sku !== "—") setValue(`variantes.${index}.sku`, sku);
  }, [sku, index, setValue]);

  return (
    <tr className="bg-pink-50/40 border-y border-pink-100">
      {/* Color */}
      <td className="px-5 py-3">
        <div className="space-y-1">
          <label className={LABEL}>Color</label>
          <div className="flex items-center gap-2 h-10 bg-white border border-pink-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-pink-300 transition">
            <ColorSwatch color={color} />
            <input
              {...register(`variantes.${index}.color`)}
              placeholder="ej. negro"
              className="flex-1 text-sm font-semibold text-gray-700 bg-transparent outline-none placeholder:text-gray-300 capitalize"
            />
          </div>
        </div>
      </td>

      {/* Talla */}
      <td className="px-5 py-3">
        <div className="space-y-1">
          <label className={LABEL}>Talla</label>
          <input
            {...register(`variantes.${index}.talla`)}
            placeholder="S / M / L"
            className="w-full h-10 bg-white border border-pink-200 rounded-xl px-3 text-sm font-black uppercase text-gray-700 outline-none focus:ring-2 focus:ring-pink-300 transition"
          />
        </div>
      </td>

      {/* SKU generado */}
      <td className="px-5 py-3">
        <div className="space-y-1">
          <label className={LABEL}>SKU</label>
          <div className="h-10 flex items-center gap-2 px-3 bg-gray-100 border border-dashed border-gray-200 rounded-xl">
            <Fingerprint size={11} className="text-gray-400 shrink-0" />
            <code className="text-[10px] font-mono text-gray-400">{sku}</code>
          </div>
          <input type="hidden" {...register(`variantes.${index}.sku`)} />
        </div>
      </td>

      {/* Stock */}
      <td className="px-5 py-3">
        {mode === "create" ? (
          <div className="space-y-1">
            <label className={LABEL}>Stock</label>
            <input
              type="number"
              min={0}
              {...register(`variantes.${index}.stock`, { valueAsNumber: true })}
              className="w-full h-10 bg-white border border-pink-200 rounded-xl px-3 text-sm font-black text-gray-700 outline-none focus:ring-2 focus:ring-pink-300 transition text-center"
            />
          </div>
        ) : (
          <div className="space-y-1">
            <label className={LABEL}>Stock actual</label>
            <div className="h-10 flex items-center justify-center">
              <StockBadge value={watch(`variantes.${index}.stock`) ?? 0} />
            </div>
          </div>
        )}
      </td>

      {/* Stock adicional (solo edit) */}
      {mode === "edit" && (
        <td className="px-5 py-3">
          <div className="space-y-1">
            <label className={LABEL}>Agregar stock</label>
            <input
              type="number"
              min={0}
              {...register(`variantes.${index}.stock_adicional`, { valueAsNumber: true })}
              placeholder="0"
              className="w-full h-10 bg-white border border-sky-200 rounded-xl px-3 text-sm font-black text-sky-600 outline-none focus:ring-2 focus:ring-sky-300 transition text-center"
            />
          </div>
        </td>
      )}

      {/* Confirmar / Cancelar */}
      <td className="px-5 py-3">
        <div className="flex justify-end items-center gap-1.5 pt-4">
          <button
            type="button"
            onClick={onSave}
            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
          >
            <Check size={16} />
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Panel de nueva variante ───────────────────────────────────────────────────
function NewVariantPanel({
  skuMaestro,
  mode,
  onAdd,
  onClose,
}: {
  skuMaestro: string;
  mode: "create" | "edit";
  onAdd: (v: any) => void;
  onClose: () => void;
}) {
  const [color, setColor]   = useState("");
  const [talla, setTalla]   = useState("");
  const [stock, setStock]   = useState(0);

  const sku =
    color && talla && skuMaestro !== "SKU"
      ? generateVariantSKU(skuMaestro, color, talla)
      : null;

  const handleAdd = () => {
    if (!color.trim() || !talla.trim()) return;
    onAdd({ color: color.trim(), talla: talla.trim().toUpperCase(), stock, sku: sku || "", stock_adicional: 0 });
    setColor(""); setTalla(""); setStock(0);
  };

  return (
    <div className="border-t border-gray-100 bg-gradient-to-b from-gray-50/80 to-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <PackagePlus size={14} className="text-pink-500" />
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Nueva Variante
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Color */}
        <div className="space-y-1">
          <label className={LABEL}>
            <Palette size={9} className="inline mr-1" />Color
          </label>
          <div className="flex items-center gap-2 h-10 bg-white border border-gray-200 rounded-xl px-3 focus-within:border-pink-300 focus-within:ring-2 focus-within:ring-pink-200 transition">
            <ColorSwatch color={color} />
            <input
              value={color}
              onChange={e => setColor(e.target.value)}
              placeholder="ej. negro"
              className="flex-1 text-sm font-semibold text-gray-700 bg-transparent outline-none placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Talla */}
        <div className="space-y-1">
          <label className={LABEL}>
            <Ruler size={9} className="inline mr-1" />Talla
          </label>
          <input
            value={talla}
            onChange={e => setTalla(e.target.value.toUpperCase())}
            placeholder="S / M / L / XL"
            className="w-full h-10 bg-white border border-gray-200 rounded-xl px-3 text-sm font-black uppercase text-gray-700 outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-200 transition"
          />
        </div>

        {/* Stock inicial */}
        <div className="space-y-1">
          <label className={LABEL}>
            <Box size={9} className="inline mr-1" />Stock inicial
          </label>
          <input
            type="number"
            min={0}
            value={stock}
            onChange={e => setStock(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full h-10 bg-white border border-gray-200 rounded-xl px-3 text-sm font-black text-gray-700 text-center outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-200 transition"
          />
        </div>

        {/* SKU Preview */}
        <div className="space-y-1">
          <label className={LABEL}>SKU generado</label>
          <div className="h-10 flex items-center gap-2 px-3 bg-gray-100 border border-dashed border-gray-200 rounded-xl">
            <Fingerprint size={11} className="text-gray-400 shrink-0" />
            <code className="text-[10px] font-mono text-gray-400 truncate">
              {sku ?? "AUTO"}
            </code>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 h-9 rounded-xl text-xs font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!color.trim() || !talla.trim()}
          className="flex items-center gap-1.5 px-5 h-9 rounded-xl text-xs font-black text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Check size={13} />
          Confirmar variante
        </button>
      </div>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────
export function VariantsSection({ stockResumen = [], mode = "create" }: any) {
  const { control, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "variantes" });

  const skuMaestro = watch("sku") || "SKU";
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showNewPanel, setShowNewPanel] = useState(false);

  // Sincroniza stocks desde la DB al cargar en modo edición
  useEffect(() => {
    if (!stockResumen?.length) return;
    stockResumen.forEach((item: any) => {
      const allVariants = watch("variantes") as any[];
      const index = allVariants?.findIndex(
        (v) => v.sku === item.sku || (v.color === item.color && v.talla === item.talla)
      );
      if (index !== -1 && index !== undefined) {
        setValue(`variantes.${index}.stock`, item.stock ?? 0, { shouldDirty: false });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockResumen]);

  const totalStock = (watch("variantes") as any[] || []).reduce(
    (acc: number, v: any) => acc + (Number(v.stock) || 0), 0
  );

  const colHeaders = [
    "Color", "Talla", "SKU Variante", "Stock actual",
    ...(mode === "edit" ? ["+ Agregar"] : []),
    "",
  ];

  return (
    <div className="max-w-4xl mx-auto w-full space-y-4">

      {/* ── Cabecera ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-pink-500 rounded-full" />
          <h3 className="text-xs font-black text-gray-700 uppercase tracking-widest">
            Variantes de Inventario
          </h3>
          {fields.length > 0 && (
            <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {fields.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {totalStock > 0 && (
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Total stock: <span className="text-gray-700">{totalStock}</span>
            </span>
          )}
          <Button
            type="button"
            onClick={() => { setShowNewPanel(v => !v); setEditingIndex(null); }}
            className={`h-9 px-4 rounded-xl text-xs font-black gap-1.5 transition-all ${
              showNewPanel
                ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                : "bg-gray-900 hover:bg-gray-800 text-white"
            }`}
          >
            {showNewPanel ? <X size={13} /> : <Plus size={13} />}
            {showNewPanel ? "Cerrar" : "Nueva variante"}
          </Button>
        </div>
      </div>

      {/* ── Tabla ── */}
      <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        {fields.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/60 border-b border-gray-100">
                {colHeaders.map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {fields.map((field, index) =>
                editingIndex === index ? (
                  <VariantEditRow
                    key={field.id}
                    index={index}
                    field={field}
                    skuMaestro={skuMaestro}
                    mode={mode}
                    onSave={() => setEditingIndex(null)}
                    onCancel={() => setEditingIndex(null)}
                  />
                ) : (
                  <VariantRow
                    key={field.id}
                    index={index}
                    field={field}
                    skuMaestro={skuMaestro}
                    mode={mode}
                    onEdit={() => { setEditingIndex(index); setShowNewPanel(false); }}
                    onRemove={() => {
                      if (editingIndex === index) setEditingIndex(null);
                      remove(index);
                    }}
                  />
                )
              )}
            </tbody>
          </table>
        ) : (
          /* Estado vacío */
          <div className="bg-white flex flex-col items-center justify-center py-14 gap-3 text-gray-300">
            <Box size={36} strokeWidth={1} />
            <p className="text-[10px] font-black uppercase tracking-widest">
              Sin variantes · Agrega la primera
            </p>
          </div>
        )}

        {/* Panel de nueva variante */}
        {showNewPanel && (
          <NewVariantPanel
            skuMaestro={skuMaestro}
            mode={mode}
            onAdd={(v) => {
              append(v);
              setShowNewPanel(false);
            }}
            onClose={() => setShowNewPanel(false)}
          />
        )}
      </div>
    </div>
  );
}