'use client';

import { useState } from 'react';
import { X, Plus, Minus, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePortal } from '@/app/portal/_contexts/PortalContext';

const BRAND = { ocre: '#b5854b', negro: '#231e1d', ocreLight: '#fff4e2' };

// Definimos interfaces claras en lugar de usar 'any'
interface VarianteProducto {
  id: string | number;
  color: string;
  talla: string;
}

interface Producto {
  id: string | number;
  nombre: string;
  precio: number;
  variantes_producto?: VarianteProducto[];
}

interface Props {
  producto: Producto;
  onClose: () => void;
}

export function ModalCrearPedidoDirecto({ producto, onClose }: Props) {
  const { cliente } = usePortal();
  const variantes = producto.variantes_producto ?? [];
  const colores = [...new Set<string>(variantes.map((v) => v.color))];

  const [color, setColor] = useState<string>(colores[0] ?? '');
  const [talla, setTalla] = useState<string>('');
  const [cantidad, setCantidad] = useState(400);
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);

  const tallasDisp = variantes.filter((v) => v.color === color).map((v) => v.talla);
  const varianteSel = variantes.find((v) => v.color === color && v.talla === (talla || tallasDisp[0]));

  const handleCrear = async () => {
    if (!varianteSel || !cliente?.id) return;
    setLoading(true);
    try {
      const res = await fetch('/api/portal/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: cliente.id,
          items: [
            {
              producto_id: producto.id,
              variante_id: varianteSel.id,
              cantidad,
              precio_unitario: producto.precio,
              color_snapshot: color,
              talla_snapshot: talla || tallasDisp[0],
              subtotal: producto.precio * cantidad,
            },
          ],
        }),
      });
      if (!res.ok) throw new Error();
      setExito(true);
      toast.success('Pedido registrado correctamente');
    } catch {
      toast.error('Error al registrar el pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: BRAND.ocre }}>
              Nuevo pedido directo
            </p>
            <h2 className="text-base font-black text-slate-900 mt-0.5">{producto.nombre}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {exito ? (
          <div className="p-8 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
              <CheckCircle size={28} className="text-emerald-500" />
            </div>
            <div>
              <p className="font-black text-slate-900 text-lg">¡Pedido registrado!</p>
              <p className="text-sm text-slate-400 mt-1">Puedes verlo en la sección de pedidos.</p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all"
              style={{ backgroundColor: BRAND.negro }}
            >
              Cerrar
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Selectores */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Color</p>
                <select
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value);
                    setTalla('');
                  }}
                  className="w-full h-9 text-sm border border-slate-200 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-amber-200"
                >
                  {colores.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Talla</p>
                <select
                  value={talla || tallasDisp[0]}
                  onChange={(e) => setTalla(e.target.value)}
                  className="w-full h-9 text-sm border border-slate-200 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-amber-200"
                >
                  {tallasDisp.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cantidad */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Cantidad</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCantidad((c) => Math.max(1, c - 50))}
                  className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <input
                  type="number"
                  min={1}
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 h-9 text-center text-sm font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
                <button
                  onClick={() => setCantidad((c) => c + 50)}
                  className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Total estimado */}
            <div className="p-4 rounded-2xl flex items-center justify-between" style={{ backgroundColor: BRAND.ocreLight }}>
              <p className="text-xs font-bold text-slate-500">Total estimado</p>
              <p className="text-lg font-black" style={{ color: BRAND.negro }}>
                S/ {(producto.precio * cantidad).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCrear}
                disabled={loading || !varianteSel}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ backgroundColor: BRAND.ocre }}
              >
                {loading && <Loader2 size={13} className="animate-spin" />}
                Registrar pedido
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}