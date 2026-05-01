// src/components/admin/pedidos/detalle/PedidoItems.tsx
import { Package } from "lucide-react";

export function PedidoItems({ items }: { items: any[] }) {
  if (!items.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
        <Package className="mx-auto text-gray-300 mb-3" size={32} />
        <p className="text-sm font-bold text-gray-400">Sin items registrados</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {["Producto", "Variante", "Color", "Talla", "Cantidad", "Especificaciones"].map(h => (
              <th key={h} className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 py-3 text-left">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {items.map((item: any) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <div>
                  <p className="font-bold text-gray-800 text-sm">{item.productos?.nombre ?? "—"}</p>
                  <p className="text-[11px] text-gray-400 font-mono">{item.productos?.sku}</p>
                </div>
              </td>
              <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                {item.variantes_producto?.sku ?? "—"}
              </td>
              <td className="px-4 py-3">
                <span className="text-xs font-bold text-gray-600 capitalize">
                  {item.variantes_producto?.color ?? "—"}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs font-bold text-gray-600">
                  {item.variantes_producto?.talla ?? "—"}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm font-black text-gray-800">{item.cantidad}</span>
              </td>
              <td className="px-4 py-3 text-xs text-gray-400">
                {item.especificaciones
                  ? JSON.stringify(item.especificaciones)
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}