"use client";

import { Loader2, X, CircleDollarSign, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInventario } from "@/lib/hooks/useInventario";
// Importamos el tipo nativo directo de tu cliente sincronizado
import type { insumo as Insumo } from "@prisma/client";

interface EditInsumoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  insumo: Insumo | null | any;
}

export default function EditInsumoDialog({ isOpen, onClose, onSuccess, insumo }: EditInsumoProps) {
  const [loading, setLoading] = useState(false);
  const { ajustarStock } = useInventario();

  const [operacion, setOperacion] = useState<"actualizar" | "descontar" | "incrementar">("incrementar");
  const [cantidad, setCantidad] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");

  if (!isOpen || !insumo) return null;

  // Forzamos el casteo numérico seguro para evitar fallos si Prisma devuelve Strings en los Decimales
  const stockActualNum = Number(insumo.stock_actual || 0);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const valorNumerico = Number(cantidad);
      const valorPrecio = precioCompra ? Number(precioCompra) : undefined;

      const operacionMap: Record<string, "sumar" | "restar" | "absoluto"> = {
        incrementar: "sumar",
        descontar: "restar",
        actualizar: "absoluto"
      };

      const success = await ajustarStock({
        id: insumo.id,
        cantidad: operacion === "actualizar"
          ? Number((e.currentTarget.elements.namedItem("stock_actual") as HTMLInputElement).value)
          : valorNumerico,
        operacion: operacionMap[operacion],
        precio_unitario: valorPrecio,
        costo_unitario: valorPrecio,
        motivo: operacion === "incrementar" ? "Compra / Entrada de material" : "Ajuste manual"
      });

      if (success) {
        toast.success(`Inventario y precios actualizados con éxito`);
        onSuccess();
        onClose();
        setCantidad("");
        setPrecioCompra("");
      }
    } catch (error) {
      toast.error("Error al procesar el movimiento en el almacén");
    } finally {
      setLoading(false);
    }
  };

  // Cálculo proyectado reactivo corregido usando constantes numéricas seguras
  const nuevoStockCalculado =
    operacion === "descontar" ? Math.max(0, stockActualNum - (Number(cantidad) || 0)) :
      operacion === "incrementar" ? stockActualNum + (Number(cantidad) || 0) :
        Number(cantidad) || stockActualNum;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase">Gestión de Stock</h2>
            <p className="text-xs text-pink-600 font-bold">{insumo.nombre}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="p-6 space-y-4">
          {/* Selector de Operación */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
            {(["incrementar", "descontar", "actualizar"] as const).map((op) => (
              <button
                key={op}
                type="button"
                onClick={() => {
                  setOperacion(op);
                  setCantidad(""); // Limpia la cantidad al cambiar de modo para evitar proyecciones erróneas
                }}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all capitalize ${operacion === op ? "bg-white text-pink-600 shadow-sm" : "text-gray-500"
                  }`}
              >
                {op}
              </button>
            ))}
          </div>

          {/* Visualización de Cambio */}
          <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="text-center">
              <p className="text-[9px] font-bold text-gray-400 uppercase">Stock Actual</p>
              <p className="text-lg font-black text-gray-700">
                {stockActualNum} <span className="text-[10px] font-normal lowercase">{insumo.unidad_medida}</span>
              </p>
            </div>
            <div className={`text-center rounded-lg p-2 ${operacion === "descontar" ? "bg-red-50" : "bg-emerald-50"}`}>
              <p className="text-[9px] font-bold text-gray-400 uppercase">Proyectado</p>
              <p className={`text-lg font-black ${operacion === "descontar" ? "text-red-600" : "text-emerald-600"}`}>
                {nuevoStockCalculado % 1 === 0 ? nuevoStockCalculado : nuevoStockCalculado.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Inputs Dinámicos */}
          <div className="space-y-4">
            {operacion === "actualizar" ? (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Package size={12} /> Ajuste de Inventario Físico
                </label>
                <input
                  name="stock_actual"
                  type="number"
                  step="0.01"
                  required
                  defaultValue={stockActualNum}
                  className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none font-bold"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cantidad</label>
                  <input
                    type="number"
                    step="0.01"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    placeholder="0.00"
                    className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none font-bold text-lg"
                    required
                  />
                </div>

                {/* Precio Unitario de Reposición */}
                {operacion === "incrementar" && (
                  <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                    <label className="text-[10px] font-black text-pink-600 uppercase tracking-widest flex items-center gap-2">
                      <CircleDollarSign size={12} /> Nuevo Precio Unitario (S/.)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={precioCompra}
                      onChange={(e) => setPrecioCompra(e.target.value)}
                      placeholder={insumo.precio_unitario?.toString() || "0.00"}
                      className="w-full border-pink-100 bg-pink-50/30 border p-3 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none font-bold text-pink-700"
                    />
                    <p className="text-[9px] text-gray-400 leading-tight">
                      * Al completar, se actualizará el costo en todas las fichas técnicas automáticamente.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-3 text-sm font-bold text-gray-400 hover:text-gray-600">
              Cerrar
            </button>
            <button
              type="submit"
              disabled={loading || (operacion !== "actualizar" && !cantidad)}
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-black flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95 shadow-xl"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "PROCESAR"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}