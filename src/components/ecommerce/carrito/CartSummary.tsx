'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useCarrito, CartItem } from '@/app/ecommerce/_contexts/CartContext';
import { getSupabaseImageUrl } from '@/lib/utils/supabase-image-utils';
import Link from 'next/link';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  // Extraemos subtotal para mostrar el desglose mayorista también aquí
  const { items, total, subtotal, removerDelCarrito } = useCarrito();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          >
            <div className="p-6 border-b flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="bg-rose-100 p-2 rounded-xl text-rose-600">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight">Tu Carrito</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pedido Mayorista</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="text-center py-20">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag size={32} className="text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Tu carrito está vacío</p>
                </div>
              ) : (
                items.map((item: CartItem) => (
                  <div key={`${item.id}-${item.color}-${item.talla}`} className="flex gap-4 group">
                    <div className="w-24 h-28 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 relative border border-slate-50">
                      <img 
                        src={item.imagenIA || getSupabaseImageUrl(item.imagen || '') || '/placeholder.png'} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        alt={item.nombre}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h4 className="font-black text-sm text-slate-900 leading-tight mb-1">{item.nombre}</h4>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-black uppercase">T: {item.talla}</span>
                          <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-black uppercase">C: {item.color}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Cant: {item.cantidad}</p>
                          <p className="font-black text-slate-900 text-base">S/ {(item.precio * item.cantidad).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <button 
                          // CORRECCIÓN CLAVE: Pasamos id, talla y color para identificar la variante única
                          onClick={() => removerDelCarrito(item.id, item.talla, item.color)}
                          className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-8 bg-slate-50 border-t rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Subtotal Neto</span>
                    <span>S/ {subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>IGV (18%)</span>
                    <span>S/ {(subtotal * 0.18).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="pt-3 border-t border-slate-200 flex justify-between items-end">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-900">Total Estimado</span>
                    <span className="text-2xl font-black text-rose-600">S/ {(subtotal * 1.18).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <Link 
                  href="/ecommerce/carrito" 
                  onClick={onClose}
                  className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-rose-600 transition-all shadow-xl flex items-center justify-center gap-2 group"
                >
                  Ver Detalle del Pedido
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}