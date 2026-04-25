import { Package, ChevronRight } from "lucide-react";

interface Variante {
  color: string | null;
  talla: string | null;
  sku: string | null;
  cantidad: number;
}

interface ProductoTop {
  producto_id: string;
  nombre: string;
  sku: string | null;
  imagen: string | null;
  total_cantidad: number;
  total_pedidos: number;
  variantes: Variante[];
}

export function ProductoTopCard({ producto, rank }: { producto: ProductoTop; rank: number }) {
  // Colores para los medallones de ranking
  const RANK_COLORS: Record<number, string> = {
    1: "bg-yellow-500 text-white shadow-yellow-100",
    2: "bg-slate-400 text-white shadow-slate-100",
    3: "bg-orange-600 text-white shadow-orange-100",
  };

  const rankCls = RANK_COLORS[rank] ?? "bg-slate-100 text-slate-500";
  const topVariantes = producto.variantes?.slice(0, 3) ?? [];

  return (
    <div className="group bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200">
      <div className="flex items-start gap-3">
        {/* Badge de Ranking e Imagen */}
        <div className="relative shrink-0">
          <span className={`absolute -top-2 -left-2 text-[10px] font-black w-6 h-6 rounded-lg flex items-center justify-center shadow-lg z-10 border-2 border-white ${rankCls}`}>
            {rank}
          </span>
          {producto.imagen ? (
            <img 
              src={producto.imagen} 
              alt={producto.nombre}
              className="w-14 h-14 rounded-xl object-cover border border-slate-100 group-hover:scale-105 transition-transform" 
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
              <Package size={20} />
            </div>
          )}
        </div>

        {/* Info de Producto */}
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-slate-800 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
            {producto.nombre}
          </h4>
          <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-tight">
            {producto.sku || "Sin SKU"}
          </p>
        </div>
      </div>

      {/* Stats Rápidos */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <div className="bg-slate-50 rounded-xl p-2 border border-transparent group-hover:border-slate-100 transition-colors text-center">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Unidades</p>
          <p className="text-sm font-black text-slate-700">{producto.total_cantidad.toLocaleString()}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-2 border border-transparent group-hover:border-slate-100 transition-colors text-center">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Pedidos</p>
          <p className="text-sm font-black text-slate-700">{producto.total_pedidos}</p>
        </div>
      </div>

      {/* Desglose de Variantes */}
      {topVariantes.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-50 space-y-1.5">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Mix más vendido</p>
          {topVariantes.map((v, i) => (
            <div key={i} className="flex items-center justify-between text-[10px] bg-white px-2 py-1 rounded-md border border-slate-50">
              <span className="text-slate-600 font-medium flex items-center gap-1.5 truncate">
                {v.color && (
                  <span 
                    className="w-2 h-2 rounded-full border border-slate-200 shrink-0" 
                    style={{ backgroundColor: v.color.toLowerCase() }} 
                  />
                )}
                <span className="truncate">
                  {[v.talla, v.color].filter(Boolean).join(" / ") || "Estándar"}
                </span>
              </span>
              <span className="font-bold text-slate-800 shrink-0 ml-2">{v.cantidad} ud.</span>
            </div>
          ))}
        </div>
      )}

      {/* Botón Detalle (Opcional) */}
      <button className="w-full mt-3 py-1.5 text-[10px] font-bold text-blue-500 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        Ver rendimiento completo <ChevronRight size={12} />
      </button>
    </div>
  );
}