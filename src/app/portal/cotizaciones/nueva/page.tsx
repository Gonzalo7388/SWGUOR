'use client';

import { useState, useEffect, useTransition } from 'react';
import { AlertTriangle, CheckCircle, Loader2, Minus, Plus } from 'lucide-react';
import { usePortal, MOQ_MINIMO } from '../../_contexts/PortalContext';
import { CotizadorPanel }        from '@/components/portal/CotizacionPanel';
import { cn }                    from '@/lib/utils';
import { useRouter }             from 'next/navigation';
import { toast }                 from 'sonner';

// ── Brand colors ──────────────────────────────────────────────────
const BRAND = {
  ocre:       '#b5854b',
  ocreDark:   '#9a6e3a',
  ocreLight:  '#fff4e2',
  negro:      '#231e1d',
  negroHover: '#3a3330',
};

type Variante = {
  id: number;
  color: string;
  talla: string;
  stock: number;
};

// ── Generar número de cotización ──────────────────────────────────
const generateCotizacionNumber = (cotizacionId: number): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `COT-${year}${month}${day}-${hours}${minutes}${seconds}-${cotizacionId}`;
};

export default function NuevaCotizacionPage() {
  const { cliente, items, resumen, zonaEnvio, actualizarItem, limpiarBorrador } = usePortal();
  const router = useRouter();

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [cotizacionId, setCotizacionId] = useState<string | null>(null);

  // Modal
  const [itemDetalle, setItemDetalle] = useState<any>(null);
  const [colorSeleccionado, setColorSeleccionado] = useState('');
  const [tallaSeleccionada, setTallaSeleccionada] = useState('');
  const [itemEditando, setItemEditando] = useState<any>(null);

  const [isPending, startTransition] = useTransition();

  // ── ABRIR MODAL ─────────────────────────────────────────
    // Redirect automático después de crear cotización
    useEffect(() => {
      if (mostrarConfirmacion) {
        const timer = setTimeout(() => {
          router.push('/portal/cotizaciones?nueva=true');
        }, 3000);
        return () => clearTimeout(timer);
      }
    }, [mostrarConfirmacion, router]);

  const handleVerDetalles = (item: any) => {
    setItemDetalle(item);
    const variantes: Variante[] = item.variantes ?? [];
    const colores = [...new Set(variantes.map(v => v.color))];
    const colorInicial = colores[0] ?? '';
    const tallas = variantes
      .filter(v => v.color === colorInicial)
      .map(v => v.talla);
    setColorSeleccionado(colorInicial);
    setTallaSeleccionada(tallas[0] ?? '');
  };

  // ── DERIVADOS ───────────────────────────────────────────
  const variantes: Variante[] = itemDetalle?.variantes ?? [];
  const coloresDisponibles: string[] = [...new Set(variantes.map(v => v.color))];
  const tallasDisponibles: string[] = variantes
    .filter(v => v.color === colorSeleccionado)
    .map(v => v.talla)
    .filter((t, i, arr) => arr.indexOf(t) === i);

  // ── ACTUALIZAR CANTIDAD en borrador ───────────────────────
  const handleCambiarCantidad = (item: any, nuevaCantidad: number) => {
    const cantidad = Math.max(1, nuevaCantidad);
    actualizarItem({
      variante_id: item.variante_id,
      cantidad,
    });
  };

  // ── AGREGAR DESDE MODAL ────────────────────────────────
  const handleAgregarDesdeModal = () => {
    if (!itemDetalle || !itemEditando) return;
    if (!colorSeleccionado || !tallaSeleccionada) {
      toast.error('Selecciona color y talla');
      return;
    }
    const variante = variantes.find(
      v => v.color === colorSeleccionado && v.talla === tallaSeleccionada
    );
    if (!variante) {
      toast.error('Variante no encontrada');
      return;
    }
    actualizarItem({
      variante_id: itemEditando.variante_id,
      nueva_variante_id: variante.id,
      talla: tallaSeleccionada,
      color: colorSeleccionado,
    });
    toast.success('Producto actualizado');
    setItemDetalle(null);
    setItemEditando(null);
  };

  // ── Enviar cotización ─────────────────────────────────────────────
  const handleEnviar = async (accion: 'borrador' | 'enviar') => {
    if (!items.length) return;
    startTransition(async () => {
      try {
        const res = await fetch('/api/portal/cotizaciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cliente_id: cliente!.id,
            estado:     accion === 'borrador' ? 'borrador' : 'enviada',
            costo_envio: resumen.costo_envio,
            zona_envio: zonaEnvio,
            items: items.map(i => ({
              producto_id: i.producto_id,
              variante_id: i.variante_id,
              precio_unitario: i.precio_unitario, 
              cantidad: i.cantidad,
              color_snapshot: i.color,
              talla_snapshot: i.talla,
              subtotal: i.subtotal,
            })),
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          if (err.error === 'moq_insuficiente') {
            toast.error(`MOQ incumplido: ${err.detalle.join(', ')}`);
            return;
          }
          if (err.error === 'stock_insuficiente') {
            toast.error('Stock insuficiente para alguno de los productos');
            return;
          }
          throw new Error(err.error);
        }

        const { data } = await res.json();
        limpiarBorrador();
        const numeroCotizacion = generateCotizacionNumber(data.id);
        setCotizacionId(numeroCotizacion);
        setMostrarConfirmacion(true);
        toast.success(
          accion === 'borrador' ? 'Borrador guardado' : 'Cotización enviada a GUOR'
        );
      } catch (e: any) {
        toast.error(e.message ?? 'Error al guardar la cotización');
      }
    });
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-slate-50">

      {/* ── Topbar ── */}
      <div className="flex items-center justify-between px-6 h-14 bg-white border-b border-slate-200 shrink-0 shadow-sm">
        <h1 className="text-sm font-semibold text-slate-900">
          Nueva cotización
          {items.length > 0 && (
            <span className="ml-2 text-slate-400 font-normal">
              — {items.length} modelo{items.length > 1 ? 's' : ''} · {resumen.total_unidades.toLocaleString()} uds
            </span>
          )}
        </h1>
        <div className="flex items-center gap-2">
          {/* Guardar borrador — tono oscuro neutro */}
          <button
            onClick={() => handleEnviar('borrador')}
            disabled={!items.length || isPending}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg border transition-all disabled:opacity-40"
            style={{
              borderColor: BRAND.negro,
              color: BRAND.negro,
              backgroundColor: 'transparent',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = BRAND.negro;
              (e.currentTarget as HTMLButtonElement).style.color = '#fff';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.color = BRAND.negro;
            }}
          >
            Guardar borrador
          </button>

          {/* Enviar cotización — ocre */}
          <button
            onClick={() => handleEnviar('enviar')}
            disabled={!items.length || isPending}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white rounded-lg transition-all disabled:opacity-40 shadow-sm"
            style={{ backgroundColor: BRAND.ocre, boxShadow: '0 10px 18px rgba(181, 133, 75, 0.18)' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = BRAND.ocreDark}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = BRAND.ocre}
          >
            {isPending && <Loader2 size={12} className="animate-spin" />}
            Enviar cotización
          </button>
        </div>
      </div>

      {/* ── Layout dos columnas ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Panel izquierdo — lista del borrador ── */}
        <div className="flex-1 overflow-auto p-5 space-y-4">

          {/* Tabla de ítems */}
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <Plus size={24} className="opacity-20" />
              </div>
              <p className="text-sm font-medium">Aún no hay productos en la cotización</p>
              <p className="text-xs mt-1">Busca productos en el catálogo y agrégalos al borrador</p>
            </div>
          ) : (
            <div className="space-y-2">

              {/* Cabecera de columnas */}
              <div className="grid grid-cols-[2fr_1fr_1.4fr_1fr_auto] gap-3 px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Producto</span>
                <span>Precio unit.</span>
                <span>Cantidad</span>
                <span>Subtotal</span>
                <span></span>
              </div>

              {items.map((item: any) => {
                const subtotal = Number(item.precio_unitario) * Number(item.cantidad);
                const moqOk = item.cantidad >= MOQ_MINIMO;

                return (
                  <div
                    key={`${item.producto_id}-${item.talla}-${item.color}`}
                    className={cn(
                      'grid grid-cols-[2fr_1fr_1.4fr_1fr_auto] gap-3 px-4 py-3 bg-white border rounded-xl items-center text-sm shadow-sm transition-all',
                      !moqOk ? 'border-amber-300 bg-amber-50/30' : 'border-slate-100'
                    )}
                  >
                    {/* Producto */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                        {item.imagen && (
                          <img src={item.imagen} className="w-full h-full object-cover" alt={item.nombre} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{item.nombre}</p>
                        <p className="text-xs text-slate-400">{item.sku} · <span className="font-medium" style={{ color: BRAND.ocre }}>{item.talla}</span> · {item.color}</p>
                      </div>
                    </div>

                    {/* Precio */}
                    <p className="font-semibold text-slate-700">
                      S/ {Number(item.precio_unitario).toFixed(2)}
                    </p>

                    {/* Stepper de cantidad */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCambiarCantidad(item, item.cantidad - 50)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={item.cantidad}
                          onChange={e => handleCambiarCantidad(item, parseInt(e.target.value) || 1)}
                          className="w-16 h-7 text-center text-sm font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                        />
                        <button
                          onClick={() => handleCambiarCantidad(item, item.cantidad + 50)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      {!moqOk && (
                        <p className="text-[10px] font-semibold text-amber-600 flex items-center gap-1">
                          <AlertTriangle size={10} />
                          Mín. {MOQ_MINIMO} uds
                        </p>
                      )}
                    </div>

                    {/* Subtotal */}
                    <p className="font-bold text-slate-900">
                      S/ {subtotal.toFixed(2)}
                    </p>

                    {/* Acciones */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setItemEditando(item);
                          handleVerDetalles(item);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-all"
                        style={{ backgroundColor: BRAND.ocre }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = BRAND.ocreDark}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = BRAND.ocre}
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Modal detalles ── */}
        {itemDetalle && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">

              <div className="px-5 py-4 border-b bg-slate-50 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800">Editar variante</h2>
                <button
                  onClick={() => setItemDetalle(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg leading-none"
                >×</button>
              </div>

              <div className="p-5 space-y-4">
                <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold">Característica</th>
                      <th className="text-left px-3 py-2 font-semibold">Especificación</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700">
                    <tr className="border-t">
                      <td className="px-3 py-2">Nombre</td>
                      <td className="px-3 py-2 font-medium">{itemDetalle.nombre}</td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-3 py-2">Precio unitario</td>
                      <td className="px-3 py-2 font-medium">S/ {Number(itemDetalle.precio_unitario).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Color */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Color</label>
                  <select
                    value={colorSeleccionado}
                    onChange={e => {
                      const color = e.target.value;
                      setColorSeleccionado(color);
                      const tallas = variantes.filter(v => v.color === color).map(v => v.talla);
                      setTallaSeleccionada(tallas[0] ?? '');
                    }}
                    className="w-full h-9 border border-slate-200 rounded-lg text-sm px-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  >
                    {coloresDisponibles.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>

                {/* Talla */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Talla</label>
                  <select
                    value={tallaSeleccionada}
                    onChange={e => setTallaSeleccionada(e.target.value)}
                    className="w-full h-9 border border-slate-200 rounded-lg text-sm px-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  >
                    {tallasDisponibles.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleAgregarDesdeModal}
                    className="flex-1 py-2.5 text-white text-sm font-semibold rounded-xl transition-all"
                    style={{ backgroundColor: BRAND.ocre }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = BRAND.ocreDark}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = BRAND.ocre}
                  >
                    Guardar cambios
                  </button>
                  <button
                    onClick={() => setItemDetalle(null)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Panel derecho — resumen de cotización (solo precios) ── */}
        <div className="w-72 shrink-0 border-l border-slate-200 bg-white overflow-auto">
          <CotizadorPanel onEnviar={handleEnviar} isSending={isPending} />
        </div>
      </div>

      {/* ── Modal confirmación ── */}
      {mostrarConfirmacion && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-[90%] max-w-sm text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: BRAND.ocreLight }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xl" style={{ backgroundColor: BRAND.ocre }}>
                <CheckCircle size={20} />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black" style={{ color: BRAND.ocre }}>¡Cotización Creada!</h2>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Se ha creado su cotización. Le informaremos del estado de la cotización a través de su correo electrónico.
              </p>
            </div>
            <div className="rounded-xl p-4" style={{ backgroundColor: BRAND.ocreLight }}>
              <p className="text-xs text-slate-500 mb-1">Número de Cotización</p>
              <p className="text-lg font-black" style={{ color: BRAND.ocre }}>{cotizacionId}</p>
            </div>
            <button
              onClick={() => setMostrarConfirmacion(false)}
              className="w-full py-2.5 text-sm font-semibold text-white rounded-xl transition-all"
              style={{ backgroundColor: BRAND.negro }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = BRAND.negroHover}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = BRAND.negro}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}