"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { XCircle, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface DetalleVenta {
  id: number;
  venta_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  producto?: {
    nombre: string;
  };
}

interface Venta {
  id: number;
  codigo_pedido: string;
  estado_pedido: string;
  total: string | number;
}

interface VentaDetalleDialogProps {
  venta: Venta | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function VentaDetalleDialog({ venta, isOpen, onClose, onUpdate }: VentaDetalleDialogProps) {
  const [detalles, setDetalles] = useState<DetalleVenta[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetalle = useCallback(async () => {
    if (!venta?.id) return;

    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error: queryError } = await supabase
        .from("detalles_ventas")
        .select(`*, producto:producto_id(nombre)`)
        .eq("venta_id", venta.id);
      
      if (queryError) {
        console.error('[VentaDetalleDialog] Error loading detalles:', queryError);
        setError("Error al cargar los detalles");
        return;
      }

      setDetalles((data || []) as DetalleVenta[]);
    } catch (err: any) {
      console.error('[VentaDetalleDialog] Unexpected error:', err);
      setError("Error inesperado al cargar detalles");
    } finally {
      setLoading(false);
    }
  }, [venta?.id]);

  useEffect(() => {
    if (isOpen && venta?.id) {
      loadDetalle();
    }
  }, [isOpen, venta?.id, loadDetalle]);

  const handleCancelarVenta = async () => {
    const confirmar = confirm("¿Estás seguro de cancelar esta venta? Esta acción devolverá los productos al stock.");
    if (!confirmar) return;

    if (!venta) return;

    setCancelling(true);
    const supabase = getSupabaseBrowserClient();

    try {
      // 1. Actualizar el estado de la venta
      const { error: errorVenta } = await (supabase as any)
        .from("ventas")
        .update({ estado_pedido: "cancelado" })
        .eq("id", venta.id);

      if (errorVenta) throw new Error(errorVenta.message);

      // 2. Devolver stock para cada artículo
      for (const item of detalles) {
        const { error: rpcError } = await (supabase as any).rpc('increment_stock', { 
          row_id: item.producto_id, 
          quantity: item.cantidad 
        });

        if (rpcError) {
          console.error('[VentaDetalleDialog] RPC error for product:', item.producto_id, rpcError);
        }
      }

      toast.success("Venta cancelada e inventario actualizado");
      onUpdate();
      onClose();
    } catch (err: any) {
      console.error('[VentaDetalleDialog] Error cancelling venta:', err);
      toast.error(err.message || "Error al cancelar la venta");
    } finally {
      setCancelling(false);
    }
  };

  if (!venta) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
          <DialogTitle className="text-xl font-bold">
            Pedido: <span className="text-pink-600">{venta.codigo_pedido}</span>
          </DialogTitle>
          <Badge className={venta.estado_pedido === 'cancelado' ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}>
            {venta.estado_pedido.toUpperCase()}
          </Badge>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          {/* Mostrar errores si existen */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Listado de Productos */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-700">Artículos del Pedido</h4>
            {loading ? (
              <div className="flex justify-center py-4"><Loader2 className="animate-spin text-pink-600" /></div>
            ) : detalles.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-4 border text-center text-gray-500 text-sm">
                No hay detalles disponibles
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 border space-y-2">
                {detalles.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.producto?.nombre} (x{item.cantidad})</span>
                    <span className="font-medium">S/ {(item.cantidad * item.precio_unitario).toFixed(2)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-pink-600">S/ {Number(venta.total).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Sección de Acciones de Peligro */}
          {venta.estado_pedido !== "cancelado" && (
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-red-600 w-5 h-5" />
                <div>
                  <p className="text-sm font-bold text-red-900">Anulación de Venta</p>
                  <p className="text-xs text-red-700">Esto restaurará el stock de los productos.</p>
                </div>
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleCancelarVenta}
                disabled={cancelling}
                className="bg-red-600 hover:bg-red-700"
              >
                {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                Cancelar Pedido
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}