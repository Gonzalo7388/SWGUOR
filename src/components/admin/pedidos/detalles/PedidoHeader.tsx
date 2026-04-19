// src/components/admin/pedidos/detalle/PedidoHeader.tsx
import { Building2, Phone, Mail, Calendar, Package } from "lucide-react";

export function PedidoHeader({ pedido }: { pedido: any }) {
  const cliente = pedido.clientes;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* Cliente */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</p>
        {cliente ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-gray-400 shrink-0" />
              <p className="text-sm font-bold text-gray-800">
                {cliente.nombre_comercial ?? cliente.razon_social ?? "—"}
              </p>
            </div>
            <p className="text-xs text-gray-400 font-mono">RUC: {cliente.ruc}</p>
            {cliente.telefono && (
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-gray-400" />
                <p className="text-xs text-gray-600">{cliente.telefono}</p>
              </div>
            )}
            {cliente.email && (
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-gray-400" />
                <p className="text-xs text-gray-600">{cliente.email}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Sin cliente asignado</p>
        )}
      </div>

      {/* Resumen */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resumen</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Package size={13} />
              Total unidades
            </div>
            <p className="text-sm font-bold text-gray-800">{pedido.total_unidades}</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Package size={13} />
              Total estimado
            </div>
            <p className="text-sm font-bold text-gray-800">
              S/. {Number(pedido.total_estimado ?? 0).toFixed(2)}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Package size={13} />
              MOQ aplicado
            </div>
            <p className="text-sm font-bold text-gray-800">{pedido.moq_aplicado}</p>
          </div>
          {pedido.created_at && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar size={13} />
                Fecha creación
              </div>
              <p className="text-xs text-gray-600">
                {new Date(pedido.created_at).toLocaleDateString('es-PE')}
              </p>
            </div>
          )}
        </div>
        {pedido.notas_pedido && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Notas</p>
            <p className="text-xs text-gray-600">{pedido.notas_pedido}</p>
          </div>
        )}
      </div>
    </div>
  );
}