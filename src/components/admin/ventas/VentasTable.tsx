"use client";
import { Eye, Receipt, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function VentasTable({ data, onViewDetail }: any) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-y-3">
        <thead>
          <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-6">
            <th className="px-6 py-2">Comprobante</th>
            <th className="px-6 py-2">Cliente</th>
            <th className="px-6 py-2">Monto Total</th>
            <th className="px-6 py-2 text-center">Estado</th>
            <th className="px-6 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((v: any) => (
            <tr key={v.id} className="group">
              <td className="bg-white py-4 px-6 rounded-l-2xl border-y border-l border-gray-100 shadow-sm transition-all group-hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-50 rounded-lg text-pink-600">
                    <Receipt size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-gray-900 text-sm uppercase italic">
                      {v.numero_comprobante || `ORD-${v.orden_id}`}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400">
                      {v.created_at && format(new Date(v.created_at), "dd MMM yyyy", { locale: es })}
                    </span>
                  </div>
                </div>
              </td>
              <td className="bg-white py-4 px-6 border-y border-gray-100 shadow-sm transition-all group-hover:shadow-md">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-700 text-xs uppercase tracking-tight">
                    {v.ordenes?.clientes?.razon_social || "Público General"}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">{v.ordenes?.clientes?.ruc || "Sin RUC"}</span>
                </div>
              </td>
              <td className="bg-white py-4 px-6 border-y border-gray-100 shadow-sm transition-all group-hover:shadow-md">
                <div className="flex flex-col">
                  <span className="font-black text-gray-900 text-sm">S/ {Number(v.total).toFixed(2)}</span>
                  <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 uppercase">
                    <Wallet size={10} /> {v.ordenes?.metodo_pago || 'Efectivo'}
                  </div>
                </div>
              </td>
              <td className="bg-white py-4 px-6 border-y border-gray-100 text-center shadow-sm transition-all group-hover:shadow-md">
                <Badge className={`rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-tighter ${
                  v.ordenes?.estado === 'cancelado' ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                }`}>
                  {v.ordenes?.estado}
                </Badge>
              </td>
              <td className="bg-white py-4 px-6 rounded-r-2xl border-y border-r border-gray-100 shadow-sm text-right transition-all group-hover:shadow-md">
                <button 
                  onClick={() => onViewDetail(v)}
                  className="p-2 hover:bg-pink-50 rounded-xl text-gray-300 hover:text-pink-600 transition-colors"
                >
                  <Eye size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}