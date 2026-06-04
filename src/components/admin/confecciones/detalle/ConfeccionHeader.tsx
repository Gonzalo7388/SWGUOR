// src/components/admin/confecciones/detalle/ConfeccionHeader.tsx
import { Building2, Package, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { es }     from "date-fns/locale";

export function ConfeccionHeader({ confeccion }: { confeccion: any }) {
  const cliente = confeccion.pedido?.cliente;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

      {/* Taller */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-2">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Taller</p>
        <div className="flex items-center gap-2">
          <Building2 size={14} className="text-gray-400 shrink-0" />
          <p className="text-sm font-bold text-gray-800">
            {confeccion.taller?.nombre ?? "—"}
          </p>
        </div>
        {confeccion.taller?.especialidad && (
          <p className="text-xs text-gray-400 capitalize">
            {confeccion.taller.especialidad.replace(/_/g, " ")}
          </p>
        )}
        {confeccion.taller?.email && (
          <p className="text-xs text-gray-500">{confeccion.taller.email}</p>
        )}
      </div>

      {/* Pedido + cliente */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-2">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pedido</p>
        <p className="text-sm font-bold text-gray-800">
          #{confeccion.pedido?.id ?? "—"}
        </p>
        {cliente && (
          <p className="text-xs text-gray-500">
            {cliente.nombre_comercial ?? cliente.razon_social}
          </p>
        )}
        <div className="flex items-center gap-2 pt-1">
          <Package size={13} className="text-gray-400" />
          <p className="text-xs text-gray-600">
            <span className="font-bold">{confeccion.cantidad.toLocaleString("es-PE")}</span> unidades
          </p>
        </div>
      </div>

      {/* Fechas + costo */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-2">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fechas y costo</p>
        {confeccion.fecha_entrega && (
          <div className="flex items-center gap-2">
            <Calendar size={13} className="text-gray-400" />
            <p className="text-xs text-gray-600">
              Entrega:{" "}
              <span className="font-bold">
                {format(new Date(confeccion.fecha_entrega), "d MMM yyyy", { locale: es })}
              </span>
            </p>
          </div>
        )}
        {confeccion.fecha_inicio && (
          <div className="flex items-center gap-2">
            <Calendar size={13} className="text-gray-400" />
            <p className="text-xs text-gray-600">
              Inicio:{" "}
              <span className="font-bold">
                {format(new Date(confeccion.fecha_inicio), "d MMM yyyy", { locale: es })}
              </span>
            </p>
          </div>
        )}
        {confeccion.costo_unitario && (
          <div className="flex items-center gap-2 pt-1">
            <DollarSign size={13} className="text-gray-400" />
            <p className="text-xs text-gray-600">
              <span className="font-bold">S/. {Number(confeccion.costo_unitario).toFixed(2)}</span> por unidad
            </p>
          </div>
        )}
      </div>
    </div>
  );
}