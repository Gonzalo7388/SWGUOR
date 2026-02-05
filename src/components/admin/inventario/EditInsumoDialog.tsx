"use client";
import { Loader2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInventario } from "@/lib/hooks/useInventory";

interface EditInsumoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  insumo: any; 
}

export default function EditInsumoDialog({ isOpen, onClose, onSuccess, insumo }: EditInsumoProps) {
  const [loading, setLoading] = useState(false);
  const { actualizarStock, descontar, incrementar } = useInventario();
  const [operacion, setOperacion] = useState<"actualizar" | "descontar" | "incrementar">("actualizar");
  const [cantidad, setCantidad] = useState("");

  // Si no está abierto o no hay insumo, no renderizamos nada
  if (!isOpen || !insumo) return null;

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      let success = false;
      
      if (operacion === "actualizar") {
        const nuevoStock = Number(formData.get("stock_actual"));
        success = await actualizarStock(insumo.id, nuevoStock);
      } else if (operacion === "descontar" && cantidad) {
        success = await descontar(insumo.id, Number(cantidad));
      } else if (operacion === "incrementar" && cantidad) {
        success = await incrementar(insumo.id, Number(cantidad));
      }

      if (success) {
        toast.success(`Insumo actualizado correctamente`);
        onSuccess();
        onClose();
        setCantidad("");
      }
    } catch (error) {
      toast.error("No se pudo actualizar el insumo");
    } finally {
      setLoading(false);
    }
  };

  const nuevoStockCalculado = 
    operacion === "descontar" ? Math.max(0, insumo.stock_actual - (Number(cantidad) || 0)) :
    operacion === "incrementar" ? insumo.stock_actual + (Number(cantidad) || 0) :
    insumo.stock_actual;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
        {/* Header del Modal */}
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase">Editar Insumo</h2>
            <p className="text-xs text-gray-500 font-bold">{insumo.nombre}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="p-6 space-y-4">
          {/* Selector de operación */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setOperacion("actualizar")}
              className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${
                operacion === "actualizar" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
              }`}
            >
              Actualizar
            </button>
            <button
              type="button"
              onClick={() => setOperacion("descontar")}
              className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${
                operacion === "descontar" ? "bg-white text-red-600 shadow-sm" : "text-gray-500"
              }`}
            >
              Descontar
            </button>
            <button
              type="button"
              onClick={() => setOperacion("incrementar")}
              className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${
                operacion === "incrementar" ? "bg-white text-green-600 shadow-sm" : "text-gray-500"
              }`}
            >
              Incrementar
            </button>
          </div>

          {/* Stock actual vs Nuevo */}
          {operacion !== "actualizar" && (
            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl">
              <div className="text-center">
                <p className="text-[9px] font-bold text-gray-500 uppercase">Actual</p>
                <p className="text-lg font-black text-gray-900">{insumo.stock_actual}</p>
              </div>
              <div className={`text-center rounded-lg p-2 ${
                operacion === "descontar" ? "bg-red-50" : "bg-green-50"
              }`}>
                <p className="text-[9px] font-bold text-gray-500 uppercase">Nuevo</p>
                <p className={`text-lg font-black ${
                  operacion === "descontar" ? "text-red-600" : "text-green-600"
                }`}>{nuevoStockCalculado}</p>
              </div>
            </div>
          )}

          {operacion === "actualizar" ? (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre del Insumo</label>
                <input 
                  name="nombre" 
                  required
                  defaultValue={insumo.nombre} 
                  className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all font-medium" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock Actual</label>
                  <input 
                    name="stock_actual" 
                    type="number" 
                    step="0.01" 
                    required
                    defaultValue={insumo.stock_actual} 
                    className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all font-bold" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock Mínimo</label>
                  <input 
                    name="stock_minimo" 
                    type="number" 
                    step="0.01" 
                    required
                    defaultValue={insumo.stock_minimo} 
                    className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all font-bold text-orange-600" 
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cantidad</label>
              <input 
                type="number" 
                step="0.01" 
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                placeholder="Ingresa cantidad"
                className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all font-bold text-center text-lg" 
                required
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading || (operacion !== "actualizar" && !cantidad)}
              className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-xl font-black flex items-center gap-2 shadow-lg shadow-pink-100 disabled:opacity-50 transition-all active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "GUARDAR CAMBIOS"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}