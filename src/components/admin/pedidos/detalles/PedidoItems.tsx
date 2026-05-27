import { Package } from "lucide-react";

// ── Tipos y Estructuras de Datos Relacionales ──────────────────

export interface ItemsPedidoProductoBase {
  nombre: string | null;
  sku: string | null;
}

export interface ItemsPedidoVarianteBase {
  sku: string | null;
  color: string | null;
  talla: string | null;
}

export interface ItemPedidoRow {
  id: string | number;
  pedido_id: string | number;
  cantidad: number;
  // Representación tipada de columnas tipo JSONB de la base de datos
  especificaciones?: Record<string, string | number | boolean> | null;
  productos?: ItemsPedidoProductoBase | null;
  variantes_producto?: ItemsPedidoVarianteBase | null;
}

interface PedidoItemsProps {
  items: ItemPedidoRow[];
}

// ── Componente Principal ───────────────────────────────────────

export function PedidoItems({ items }: PedidoItemsProps) {
  if (!items.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
        <Package className="mx-auto text-gray-300 mb-3" size={32} />
        <p className="text-sm font-bold text-gray-400">Sin items registrados</p>
      </div>
    );
  }

  // Helper para renderizar de manera limpia y estética el objeto JSON de especificaciones
  const renderEspecificaciones = (esp: ItemPedidoRow["especificaciones"]) => {
    if (!esp || Object.keys(esp).length === 0) return <span className="text-gray-400">—</span>;

    return (
      <div className="flex flex-wrap gap-1.5 max-w-xs">
        {Object.entries(esp).map(([key, value]) => (
          <span 
            key={key} 
            className="inline-flex items-center gap-1 bg-gray-50 text-gray-600 border border-gray-200 text-[10px] px-2 py-0.5 rounded font-medium"
          >
            <span className="text-gray-400 font-bold capitalize">{key.replace(/_/g, " ")}:</span>
            <span>{String(value)}</span>
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Producto", "Variante (SKU)", "Color", "Talla", "Cantidad", "Especificaciones"].map(h => (
                <th 
                  key={h} 
                  className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 py-3 text-left"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3.5">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">
                      {item.productos?.nombre ?? "—"}
                    </p>
                    {item.productos?.sku && (
                      <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                        {item.productos.sku}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-xs text-gray-500 font-mono">
                  {item.variantes_producto?.sku ?? "—"}
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-xs font-semibold text-gray-700 capitalize">
                    {item.variantes_producto?.color ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                    {item.variantes_producto?.talla ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm font-black text-gray-900">
                    {item.cantidad}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  {renderEspecificaciones(item.especificaciones)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}