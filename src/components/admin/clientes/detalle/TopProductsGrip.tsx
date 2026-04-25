import { Package, TrendingUp } from "lucide-react";
import { ProductoTopCard } from "./ProductoTopCard";

export function TopProductsGrid({ productos }: { productos: any[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50 bg-slate-50/30">
        <div className="p-1.5 bg-amber-50 rounded-lg">
          <TrendingUp size={14} className="text-amber-600" />
        </div>
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-600">Preferencias de Compra</h2>
      </div>
      <div className="p-5">
        {productos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {productos.slice(0, 4).map((prod, idx) => (
              <ProductoTopCard key={prod.producto_id} producto={prod} rank={idx + 1} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <Package className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-medium">Sin datos de productos</p>
          </div>
        )}
      </div>
    </div>
  );
}