"use client";

import { memo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Scissors, Calendar, Pencil, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ESTADO_LABELS, PRIORIDAD_LABELS } from "@/lib/schemas/confecciones";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import type { ConfeccionRow_T } from "./ConfeccionesTable";

const ESTADO_BADGE: Record<string, string> = {
  pendiente: "bg-slate-50 text-slate-600 border-slate-200",
  en_corte: "bg-blue-50 text-blue-600 border-blue-200",
  en_costura: "bg-violet-50 text-violet-600 border-violet-200",
  acabados: "bg-amber-50 text-amber-600 border-amber-200",
  completado: "bg-emerald-50 text-emerald-600 border-emerald-200",
  cancelado: "bg-rose-50 text-rose-600 border-rose-200",
};

const PRIORIDAD_BADGE: Record<string, string> = {
  baja: "bg-slate-50 text-slate-500 border-slate-200",
  media: "bg-sky-50 text-sky-600 border-sky-200",
  alta: "bg-orange-50 text-orange-600 border-orange-200",
  urgente: "bg-red-50 text-red-600 border-red-200",
};

const PRIORIDAD_DOT: Record<string, string> = {
  baja: "bg-slate-400",
  media: "bg-sky-500",
  alta: "bg-orange-500",
  urgente: "bg-red-500",
};

interface ConfeccionRowProps {
  orden: ConfeccionRow_T;
  onDelete?: (id: number) => void;
  onEdit?: (orden: ConfeccionRow_T) => void;
}

const ConfeccionRow = memo(({ orden, onDelete, onEdit }: ConfeccionRowProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const iniciales = (orden.prenda ?? "??").substring(0, 2).toUpperCase();

  const handleDelete = async () => {
    if (!onDelete) return;
    
    try {
      const res = await fetch(`/api/admin/confecciones/${orden.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Error al eliminar");
      }

      toast.success("Orden eliminada correctamente");
      onDelete(orden.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      toast.error("Error al eliminar la orden");
    }
  };

  return (
    <>
      <tr className="group transition-all duration-200">
        <td className="bg-white border-y border-l border-slate-100 py-4 px-6 rounded-l-2xl shadow-sm group-hover:shadow-md group-hover:bg-slate-50 transition-all">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-black text-sm border border-pink-100 uppercase group-hover:scale-110 transition-transform shrink-0">
              {iniciales}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 text-sm tracking-tight uppercase leading-none">
                  {orden.prenda}
                </span>
              </div>
              <div className="text-slate-400 text-[11px] font-medium mt-1">
                #{orden.id}
                {orden.pedido && (
                  <span className="ml-1.5">· Pedido #{orden.pedido.id}</span>
                )}
              </div>
              {orden.costo_unitario != null && (
                <div className="text-pink-600 font-black text-sm mt-1">
                  S/ {orden.costo_unitario.toFixed(2)}
                  <span className="text-slate-400 font-medium text-[10px] ml-1">/ unidad</span>
                </div>
              )}
            </div>
          </div>
        </td>

        <td className="bg-white border-y border-slate-100 text-center shadow-sm group-hover:bg-slate-50 transition-all">
          <div className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-tight">
            <Scissors size={10} />
            {orden.talleres?.nombre ?? "—"}
          </div>
        </td>

        <td className="bg-white border-y border-slate-100 text-center shadow-sm group-hover:bg-slate-50 transition-all">
          <div className="flex flex-col items-center">
            <span className="text-lg font-black text-slate-900">
              {orden.cantidad.toLocaleString("es-PE")}
            </span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Unidades</span>
          </div>
        </td>

        <td className="bg-white border-y border-slate-100 text-center shadow-sm group-hover:bg-slate-50 transition-all">
          <Badge
            variant="outline"
            className={`rounded-full px-3 py-1 text-[9px] font-black border-2 uppercase inline-flex items-center gap-1.5 ${PRIORIDAD_BADGE[orden.prioridad]}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORIDAD_DOT[orden.prioridad]}`} />
            {PRIORIDAD_LABELS[orden.prioridad]}
          </Badge>
        </td>

        <td className="bg-white border-y border-slate-100 text-center shadow-sm group-hover:bg-slate-50 transition-all">
          <Badge
            variant="outline"
            className={`rounded-full px-3 py-1 text-[9px] font-black border-2 uppercase ${ESTADO_BADGE[orden.estado] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}
          >
            {ESTADO_LABELS[orden.estado] ?? orden.estado}
          </Badge>
        </td>

        <td className="bg-white border-y border-slate-100 text-center shadow-sm group-hover:bg-slate-50 transition-all">
          {orden.fecha_entrega ? (
            <div className="inline-flex items-center gap-1.5 text-slate-600 text-[11px] font-semibold">
              <Calendar size={11} className="text-slate-400" />
              {format(new Date(orden.fecha_entrega), "d MMM yyyy", { locale: es })}
            </div>
          ) : (
            <span className="text-slate-300 text-xs">—</span>
          )}
        </td>

        <td className="bg-white border-y border-r border-slate-100 px-6 rounded-r-2xl text-right shadow-sm group-hover:bg-slate-50 transition-all">
          <div className="flex justify-end items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setOpen(true)}>
              <Eye size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit?.(orden)}
              className="text-blue-600 hover:text-blue-700"
            >
              <Pencil size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </td>
      </tr>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>¿Eliminar orden?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>¿Estás seguro de que deseas eliminar la orden #{orden.id} - {orden.prenda}?</p>
            <p className="text-sm text-red-500 mt-2">Esta acción no se puede deshacer.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl rounded-3xl bg-white [&>button]:text-black [&>button]:hover:text-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-pink-600">
              Orden de Confección #{orden.id}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-slate-100 p-4 rounded-xl">
              <p className="text-xs text-slate-500 uppercase tracking-wider">PRENDA</p>
              <p className="font-bold text-slate-900 mt-1">{orden.prenda}</p>
            </div>

            <div className="bg-slate-100 p-4 rounded-xl">
              <p className="text-xs text-slate-500 uppercase tracking-wider">CANTIDAD</p>
              <p className="font-bold text-slate-900 mt-1">{orden.cantidad.toLocaleString("es-PE")} unidades</p>
            </div>

            <div className="bg-slate-100 p-4 rounded-xl">
              <p className="text-xs text-slate-500 uppercase tracking-wider">TALLER</p>
              <p className="font-bold text-slate-900 mt-1">{orden.talleres?.nombre ?? "—"}</p>
            </div>

            <div className="bg-slate-100 p-4 rounded-xl">
              <p className="text-xs text-slate-500 uppercase tracking-wider">ESTADO CONFECCIÓN</p>
              <p className="font-bold text-orange-600 mt-1">
                {ESTADO_LABELS[orden.estado] ?? orden.estado}
              </p>
            </div>

            <div className="bg-slate-100 p-4 rounded-xl">
              <p className="text-xs text-slate-500 uppercase tracking-wider">PRIORIDAD</p>
              <p className="font-bold text-slate-900 mt-1">{PRIORIDAD_LABELS[orden.prioridad]}</p>
            </div>

            {orden.costo_unitario != null && (
              <div className="bg-slate-100 p-4 rounded-xl">
                <p className="text-xs text-slate-500 uppercase tracking-wider">COSTO UNITARIO</p>
                <p className="font-bold text-emerald-600 mt-1">S/ {orden.costo_unitario.toFixed(2)}</p>
              </div>
            )}

            {orden.fecha_entrega && (
              <div className="bg-slate-100 p-4 rounded-xl">
                <p className="text-xs text-slate-500 uppercase tracking-wider">FECHA ENTREGA</p>
                <p className="font-bold text-slate-900 mt-1">
                  {format(new Date(orden.fecha_entrega), "d MMMM yyyy", { locale: es })}
                </p>
              </div>
            )}

            {orden.ordenes_produccion && (
              <>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-xs text-blue-600 uppercase tracking-wider">ORDEN PRODUCCIÓN</p>
                  <p className="font-bold text-blue-900 mt-1">#{orden.ordenes_produccion.id}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-xs text-green-600 uppercase tracking-wider">ESTADO PRODUCCIÓN</p>
                  <p className="font-bold text-green-900 mt-1">{orden.ordenes_produccion.estado}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-xs text-green-600 uppercase tracking-wider">CANTIDAD SOLICITADA</p>
                  <p className="font-bold text-green-900 mt-1">{orden.ordenes_produccion.cantidad_solicitada} unidades</p>
                </div>
              </>
            )}

            {orden.pedido && (
              <div className="bg-purple-50 p-4 rounded-xl">
                <p className="text-xs text-purple-600 uppercase tracking-wider">PEDIDO</p>
                <p className="font-bold text-purple-900 mt-1">#{orden.pedido.id}</p>
              </div>
            )}

            {orden.ordenes_produccion?.pedidos && (
              <div className="bg-emerald-50 p-4 rounded-xl">
                <p className="text-xs text-emerald-600 uppercase tracking-wider">ESTADO PEDIDO</p>
                <p className="font-bold text-emerald-900 mt-1">{orden.ordenes_produccion.pedidos.estado}</p>
              </div>
            )}

            {orden.ordenes_produccion?.pedidos?.clientes && (
              <div className="bg-amber-50 p-4 rounded-xl col-span-2">
                <p className="text-xs text-amber-600 uppercase tracking-wider">CLIENTE</p>
                <p className="font-bold text-amber-900 mt-1">
                  {orden.ordenes_produccion.pedidos.clientes.razon_social || 
                   orden.ordenes_produccion.pedidos.clientes.nombre_comercial}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

ConfeccionRow.displayName = "ConfeccionRow";
export default ConfeccionRow;