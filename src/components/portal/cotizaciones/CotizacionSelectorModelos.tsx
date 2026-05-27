'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Package, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const BRAND = { ocre: '#b5854b', ocreLight: '#fff4e2', negro: '#231e1d' };

interface Variante { id: number; color: string; talla: string; stock: number; }
interface Producto { id: number; nombre: string; sku: string; imagen: string | null; precio: number; variantes_producto: Variante[]; categoria: string; }

interface Props {
  onAgregar: (varianteId: number, productoId: number, cantidad: number) => void;
  idsAgregados: number[]; // variante_ids ya en cotización
}

export function CotizacionSelectorModelos({ onAgregar, idsAgregados }: Props) {
  const [productos,  setProductos]  = useState<Producto[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [busqueda,   setBusqueda]   = useState('');
  const [seleccion,  setSeleccion]  = useState<Record<number, { varianteId: number; cantidad: number }>>({});

  useEffect(() => {
    fetch('/api/portal/productos')
      .then(r => r.json())
      .then(({ data }) => setProductos(data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtrados = useMemo(() =>
    productos.filter(p =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.sku.toLowerCase().includes(busqueda.toLowerCase())
    ), [productos, busqueda]);

  const handleSeleccionar = (productoId: number, varianteId: number) => {
    setSeleccion(prev => ({
      ...prev,
      [productoId]: { varianteId, cantidad: prev[productoId]?.cantidad ?? 400 },
    }));
  };

  const handleCantidad = (productoId: number, cantidad: number) => {
    setSeleccion(prev => ({
      ...prev,
      [productoId]: { ...prev[productoId], cantidad: Math.max(1, cantidad) },
    }));
  };

  const handleAgregar = (producto: Producto) => {
    const sel = seleccion[producto.id];
    if (!sel) return;
    onAgregar(sel.varianteId, producto.id, sel.cantidad);
    setSeleccion(prev => { const n = { ...prev }; delete n[producto.id]; return n; });
  };

  return (
    <div className="space-y-3">
      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar modelo o SKU..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
      </div>

      {/* Lista */}
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div className="py-12 text-center">
            <Package size={32} className="mx-auto text-slate-200 mb-2" />
            <p className="text-sm text-slate-400">Sin resultados</p>
          </div>
        ) : filtrados.map(prod => {
          const sel       = seleccion[prod.id];
          const colores   = [...new Set(prod.variantes_producto.map(v => v.color))];
          const colorSel  = sel ? prod.variantes_producto.find(v => v.id === sel.varianteId)?.color ?? colores[0] : colores[0];
          const tallas    = prod.variantes_producto.filter(v => v.color === colorSel).map(v => v.talla);
          const varianteSel = sel?.varianteId ?? prod.variantes_producto.find(v => v.color === colorSel)?.id;
          const yaAgregado = idsAgregados.includes(varianteSel ?? 0);

          return (
            <div key={prod.id} className={cn(
              'border rounded-2xl p-4 transition-all',
              sel ? 'border-[#b5854b]/40 bg-[#fff4e2]/50' : 'border-slate-100 bg-white hover:border-slate-200',
            )}>
              {/* Cabecera producto */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                  {prod.imagen && <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate">{prod.nombre}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">SKU: {prod.sku} · S/ {prod.precio.toFixed(2)}</p>
                </div>
                {yaAgregado && (
                  <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full flex items-center gap-1">
                    <Check size={10} /> Agregado
                  </span>
                )}
              </div>

              {/* Selectores color + talla */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Color</p>
                  <select
                    value={colorSel}
                    onChange={e => {
                      const color = e.target.value;
                      const variante = prod.variantes_producto.find(v => v.color === color);
                      if (variante) handleSeleccionar(prod.id, variante.id);
                    }}
                    className="w-full h-8 text-xs border border-slate-200 rounded-lg px-2 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  >
                    {colores.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Talla</p>
                  <select
                    value={prod.variantes_producto.find(v => v.id === varianteSel)?.talla ?? ''}
                    onChange={e => {
                      const talla = e.target.value;
                      const variante = prod.variantes_producto.find(v => v.color === colorSel && v.talla === talla);
                      if (variante) handleSeleccionar(prod.id, variante.id);
                    }}
                    className="w-full h-8 text-xs border border-slate-200 rounded-lg px-2 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  >
                    {tallas.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Cantidad + botón agregar */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={sel?.cantidad ?? 400}
                  onChange={e => handleCantidad(prod.id, parseInt(e.target.value) || 1)}
                  className="w-24 h-8 text-center text-sm font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200"
                  placeholder="Cant."
                />
                <span className="text-[10px] text-slate-400 font-bold">uds.</span>
                <button
                  onClick={() => {
                    if (!sel) handleSeleccionar(prod.id, varianteSel!);
                    handleAgregar({ ...prod });
                  }}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white transition-all hover:brightness-110 active:scale-95"
                  style={{ backgroundColor: BRAND.ocre }}
                >
                  <Plus size={12} /> Agregar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}