"use client";
import { ShieldOff, Loader2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { tienePermiso, type RolUsuario } from "@/lib/constants/roles";

interface DescontinuarInsumoProps {
  isOpen:     boolean;
  onClose:    () => void;
  onSuccess:  () => void;
  insumo:     { id: number; nombre: string } | null;
  rolUsuario: RolUsuario | null;
}

export default function DescontinuarInsumoDialog({
  isOpen, onClose, onSuccess, insumo, rolUsuario
}: DescontinuarInsumoProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !insumo) return null;
  if (!rolUsuario || !tienePermiso(rolUsuario, 'descontinuar_insumo')) return null;

  const handleDescontinuar = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/inventario?id=${insumo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "inactivo" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Insumo descontinuado correctamente");
      onSuccess();
      onClose();
    } catch {
      toast.error("No se pudo descontinuar el insumo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-amber-50">
        <div className="h-2 bg-amber-500 w-full" />
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
            <ShieldOff className="text-amber-500" size={32} />
          </div>

          <div>
            <h3 className="text-xl font-black text-gray-900 uppercase">¿Descontinuar insumo?</h3>
            <p className="text-gray-500 text-sm mt-2 font-medium">
              Estás por descontinuar{" "}
              <span className="text-amber-600 font-bold">{insumo.nombre}</span>
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-left">
            <div className="flex gap-2 items-start">
              <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={14} />
              <p className="text-[11px] text-amber-700 font-bold leading-tight italic">
                El insumo pasará a estado inactivo. Puedes reactivarlo en cualquier momento.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDescontinuar}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-xl font-black hover:bg-amber-600 shadow-lg shadow-amber-100 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="animate-spin" size={16} />}
              Descontinuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}