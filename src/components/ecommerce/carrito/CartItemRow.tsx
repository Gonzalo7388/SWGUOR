'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCarrito, CartItem } from '@/app/ecommerce/_contexts/CartContext';
import { getSupabaseImageUrl } from '@/lib/utils/supabase-image-utils';

export default function CartItemRow({ item }: { item: CartItem }) {
  const { actualizarCantidad, removerDelCarrito } = useCarrito();

  const handleIncrement = () => {
    actualizarCantidad(item.id, item.cantidad + 100, item.talla, item.color);
  };

  const handleDecrement = () => {
    if (item.cantidad > 400) {
      actualizarCantidad(item.id, item.cantidad - 100, item.talla, item.color);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-8 flex flex-col md:grid md:grid-cols-5 items-center gap-6 hover:shadow-xl hover:shadow-slate-100 transition-all group">
      <div className="col-span-2 flex items-center gap-6 w-full">
        <div className="w-24 h-24 bg-slate-100 rounded-3xl overflow-hidden flex-shrink-0">
          <img 
            // Solución al error de src: aseguramos que siempre sea string
            src={getSupabaseImageUrl(item.imagen) || ''} 
            alt={item.nombre} 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="space-y-1">
          <h3 className="font-black text-slate-900 leading-tight">{item.nombre}</h3>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[9px] font-black uppercase text-slate-500">Talla: {item.talla}</span>
            <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[9px] font-black uppercase text-slate-500">Color: {item.color}</span>
          </div>
          <button 
            onClick={() => removerDelCarrito(item.id, item.talla, item.color)}
            className="text-rose-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-all"
          >
            <Trash2 size={12} /> Eliminar
          </button>
        </div>
      </div>

      <div className="flex justify-center w-full">
        <div className="flex items-center bg-slate-50 rounded-2xl border border-slate-100 p-1">
          <button onClick={handleDecrement} className="p-2 hover:bg-white rounded-xl transition-all"><Minus size={14}/></button>
          <span className="w-16 text-center font-black text-sm">{item.cantidad}</span>
          <button onClick={handleIncrement} className="p-2 hover:bg-white rounded-xl transition-all"><Plus size={14}/></button>
        </div>
      </div>

      <div className="text-center w-full text-slate-600 font-bold">
        S/ {Number(item.precio).toFixed(2)}
      </div>

      <div className="text-right w-full font-black text-slate-900 text-lg">
        S/ {(item.precio * item.cantidad).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
      </div>
    </div>
  );
}