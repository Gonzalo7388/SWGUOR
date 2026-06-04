'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { CreditCard, Package, ChevronRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import CheckoutImplement from '@/components/portal/CheckoutImplement';
import YapeForm from '@/components/portal/YapeForm';
import { getSupabaseBrowserClient } from '@/lib/supabase';

// ─── Tipos locales ────────────────────────────────────────────────────────────

interface ItemPedido {
  id: number;
  cantidad: number;
  especificaciones: {
    precio_congelado: number;
    color_snapshot: string | null;
    talla_snapshot: string | null;
  } | null;
  productos: {
    nombre: string;
    sku: string;
    imagen: string | null;
  } | null;
}

interface ResumenPedido {
  id: number;
  total: number;
  moneda: string;
  total_unidades: number;
  items: ItemPedido[];
}

const PAISES_SUDAMERICA = [
  'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia',
  'Ecuador', 'Guyana', 'Paraguay', 'Perú', 'Surinam',
  'Uruguay', 'Venezuela',
];

type MetodoPago = 'tarjeta' | 'yape';

// ─── Skeleton del panel de productos ─────────────────────────────────────────

function ItemSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3 animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-[#e4c28a]/15 flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-[#e4c28a]/15 rounded-lg w-3/4" />
        <div className="h-2.5 bg-[#e4c28a]/10 rounded-lg w-1/2" />
      </div>
      <div className="h-3 bg-[#e4c28a]/15 rounded-lg w-16" />
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function PagoPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Los searchParams se usan como fallback mientras carga el pedido
  const totalFallback = Number(searchParams.get('total')) || 0;
  const unidadesFallback = Number(searchParams.get('unidades')) || 0;

  // ─── Estado ──────────────────────────────────────────────────────────────
  const [pedido, setPedido] = useState<ResumenPedido | null>(null);
  const [loadingPedido, setLoadingPedido] = useState(true);
  const [errorPedido, setErrorPedido] = useState<string | null>(null);

  const [cupon, setCupon] = useState('');
  const [descuento, setDescuento] = useState(0);
  const [metodo, setMetodo] = useState<MetodoPago>('tarjeta');

  const [datosEntrega, setDatosEntrega] = useState({
    pais: 'Perú',
    departamento: '',
    distrito: '',
    direccion: '',
    referencia: '',
  });

  const [toast, setToast] = useState({
    show: false, message: '', type: 'success' as 'success' | 'error',
  });

  // ─── Fetch de ítems del pedido ────────────────────────────────────────────
  const fetchPedido = useCallback(async () => {
    setLoadingPedido(true);
    setErrorPedido(null);

    try {
      const supabase = getSupabaseBrowserClient();

      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          id,
          total,
          moneda,
          total_unidades,
          pedido_items (
            id,
            cantidad,
            especificaciones,
            productos (
              nombre,
              sku,
              imagen
            )
          )
        `)
        .eq('id', Number(params.id))
        .single();

      if (error) throw error;
      if (!data) throw new Error('Pedido no encontrado');

      // Normalizar la respuesta de Supabase al tipo local
      const items: ItemPedido[] = ((data as any).pedido_items ?? []).map((it: any) => ({
        id: Number(it.id),
        cantidad: Number(it.cantidad),
        especificaciones: it.especificaciones
          ? {
            precio_congelado: Number(it.especificaciones.precio_congelado ?? 0),
            color_snapshot: it.especificaciones.color_snapshot ?? null,
            talla_snapshot: it.especificaciones.talla_snapshot ?? null,
          }
          : null,
        productos: it.productos
          ? {
            nombre: it.productos.nombre ?? '—',
            sku: it.productos.sku ?? '—',
            imagen: it.productos.imagen ?? null,
          }
          : null,
      }));

      setPedido({
        id: Number(data.id),
        total: Number(data.total),
        moneda: (data as any).moneda ?? 'PEN',
        total_unidades: Number((data as any).total_unidades ?? 0),
        items,
      });
    } catch (err) {
      console.error('[PAGO_PAGE] fetchPedido:', err);
      setErrorPedido('No se pudieron cargar los productos del pedido.');
    } finally {
      setLoadingPedido(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchPedido();
  }, [fetchPedido]);

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const mostrarToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2500);
  };

  const handleAplicarCupon = () => {
    if (cupon.toLowerCase() === 'fifi10') {
      setDescuento(10);
      mostrarToast('Cupón aplicado', 'success');
    } else {
      setDescuento(0);
      mostrarToast('Cupón inválido', 'error');
    }
  };

  const handlePagoExitoso = (chargeId: string) => {
    mostrarToast(`Pago exitoso · ${chargeId}`, 'success');
    setTimeout(() => router.push('/portal/pedidos'), 2500);
  };

  const handlePagoError = (msg: string) => mostrarToast(msg, 'error');

  // Totales: usa datos reales si ya cargaron, fallback si no
  const totalBase = pedido?.total ?? totalFallback;
  const totalFinal = totalBase - descuento;
  const totalCents = Math.round(totalFinal * 100);
  const moneda = pedido?.moneda ?? 'PEN';

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100 p-8">

      {/* TOAST */}
      {toast.show && (
        <div className={cn(
          'fixed top-6 right-6 z-50 px-6 py-3 rounded-xl text-white font-bold shadow-lg transition-all',
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500',
        )}>
          {toast.message}
        </div>
      )}

      <div className="grid grid-cols-3 gap-8 max-w-6xl mx-auto">

        {/* ── IZQUIERDA ──────────────────────────────────────────────────── */}
        <div className="col-span-2 space-y-6">

          {/* DIRECCIÓN */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="font-black text-lg mb-4 text-slate-500">Dirección de entrega</h2>

            <select
              value={datosEntrega.pais}
              onChange={e => setDatosEntrega(p => ({ ...p, pais: e.target.value }))}
              className="w-full mb-3 p-3 border rounded-xl text-slate-500"
            >
              {PAISES_SUDAMERICA.map(pais => (
                <option key={pais}>{pais}</option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Departamento"
                value={datosEntrega.departamento}
                onChange={e => setDatosEntrega(p => ({ ...p, departamento: e.target.value }))}
                className="p-3 border rounded-xl text-slate-500"
              />
              <input
                placeholder="Distrito"
                value={datosEntrega.distrito}
                onChange={e => setDatosEntrega(p => ({ ...p, distrito: e.target.value }))}
                className="p-3 border rounded-xl text-slate-500"
              />
            </div>

            <input
              placeholder="Dirección"
              value={datosEntrega.direccion}
              onChange={e => setDatosEntrega(p => ({ ...p, direccion: e.target.value }))}
              className="w-full mt-3 p-3 border rounded-xl text-slate-500"
            />
            <input
              placeholder="Referencia"
              value={datosEntrega.referencia}
              onChange={e => setDatosEntrega(p => ({ ...p, referencia: e.target.value }))}
              className="w-full mt-3 p-3 border rounded-xl text-slate-500"
            />
          </div>

          {/* PROMOCIONES */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="font-black text-lg mb-4 text-slate-500">Promociones</h2>
            <div className="flex gap-3">
              <input
                value={cupon}
                onChange={e => setCupon(e.target.value)}
                placeholder="Ingresa tu cupón"
                className="flex-1 p-3 border rounded-xl text-slate-500"
              />
              <button
                onClick={handleAplicarCupon}
                className="px-4 rounded-xl bg-[#231e1d] text-[#e4c28a] font-bold"
              >
                Aplicar
              </button>
            </div>
          </div>

          {/* MÉTODO DE PAGO */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="font-black text-lg mb-4 text-slate-500">Método de pago</h2>

            <div className="flex gap-3 mb-4">
              <button
                onClick={() => setMetodo('tarjeta')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold transition-all text-sm',
                  metodo === 'tarjeta'
                    ? 'border-[#231e1d] bg-[#231e1d] text-[#e4c28a]'
                    : 'border-gray-200 text-slate-400 hover:border-gray-300',
                )}
              >
                <CreditCard size={18} />
                Tarjeta
              </button>

              <button
                onClick={() => setMetodo('yape')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold transition-all text-sm',
                  metodo === 'yape'
                    ? 'border-[#6C2DD3] bg-[#6C2DD3] text-white'
                    : 'border-gray-200 text-slate-400 hover:border-gray-300',
                )}
              >
                <Image src="/images/yape.png" alt="Yape" width={24} height={24} />
              </button>
            </div>

            <div className="border rounded-xl p-4">
              {metodo === 'tarjeta' && (
                <CheckoutImplement
                  amount={totalCents}
                  description={`Pedido #${params.id}`}
                  orderId={params.id}
                  onSuccess={handlePagoExitoso}
                  onError={handlePagoError}
                />
              )}
              {metodo === 'yape' && (
                <YapeForm
                  amount={totalCents}
                  orderId={params.id}
                  onSuccess={handlePagoExitoso}
                  onError={handlePagoError}
                />
              )}
            </div>
          </div>
        </div>

        {/* ── DERECHA — Resumen del pedido ──────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow h-fit sticky top-8 overflow-hidden">

          {/* Header del panel */}
          <div className="px-5 py-4 border-b border-[#e4c28a]/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#e4c28a]/20 flex items-center justify-center">
                <Package size={14} className="text-[#b5854b]" />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#b5854b]/60 uppercase tracking-widest">
                  Pedido #{params.id}
                </p>
                <p className="text-xs font-black text-[#231e1d]">Mis prendas</p>
              </div>
            </div>
            {!loadingPedido && pedido && (
              <span className="text-[10px] font-bold text-[#b5854b]/50">
                {pedido.total_unidades} uds
              </span>
            )}
          </div>

          {/* Lista de ítems */}
          <div className="px-5 py-3 max-h-80 overflow-y-auto divide-y divide-[#e4c28a]/10">

            {loadingPedido ? (
              // Skeleton mientras carga
              <>
                <ItemSkeleton />
                <ItemSkeleton />
                <ItemSkeleton />
              </>

            ) : errorPedido ? (
              // Estado de error
              <div className="py-6 flex flex-col items-center gap-2 text-center">
                <AlertCircle size={18} className="text-amber-400" />
                <p className="text-[11px] text-slate-400">{errorPedido}</p>
                <button
                  onClick={fetchPedido}
                  className="text-[10px] font-bold text-[#b5854b] underline underline-offset-2"
                >
                  Reintentar
                </button>
              </div>

            ) : pedido?.items && pedido.items.length > 0 ? (
              // Ítems reales del pedido
              pedido.items.map((item) => {
                const precio = item.especificaciones?.precio_congelado ?? 0;
                const subtotal = precio * item.cantidad;
                const imagen = item.productos?.imagen;
                const nombre = item.productos?.nombre ?? '—';
                const sku = item.productos?.sku ?? '';
                const color = item.especificaciones?.color_snapshot;
                const talla = item.especificaciones?.talla_snapshot;

                return (
                  <div key={item.id} className="flex items-center gap-3 py-3">
                    {/* Imagen / placeholder */}
                    <div className="w-12 h-12 rounded-xl bg-[#e4c28a]/10 flex-shrink-0 overflow-hidden border border-[#e4c28a]/20">
                      {imagen ? (
                        <Image
                          src={imagen}
                          alt={nombre}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={16} className="text-[#b5854b]/30" />
                        </div>
                      )}
                    </div>

                    {/* Descripción */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-[#231e1d] truncate">{nombre}</p>
                      <p className="text-[10px] text-[#b5854b]/50 font-mono">{sku}</p>
                      {(talla || color) && (
                        <div className="flex items-center gap-1 mt-0.5">
                          {talla && (
                            <span className="text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded-full">
                              T/{talla}
                            </span>
                          )}
                          {color && (
                            <span className="text-[9px] font-bold bg-slate-50 text-slate-500 border border-slate-100 px-1.5 py-0.5 rounded-full">
                              {color}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Precio */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-[10px] text-[#b5854b]/40">{item.cantidad} uds</p>
                      <p className="text-xs font-black text-[#231e1d] tabular-nums">
                        {moneda} {subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                );
              })

            ) : (
              // Pedido cargado pero sin ítems registrados
              <div className="py-6 flex flex-col items-center gap-2 text-center">
                <Package size={18} className="text-[#b5854b]/20" />
                <p className="text-[11px] text-[#231e1d]/25 font-bold">
                  Sin productos detallados
                </p>
              </div>
            )}
          </div>

          {/* Totales */}
          <div className="px-5 py-4 bg-[#fff8f0] border-t border-[#e4c28a]/20 space-y-2">

            <div className="flex justify-between text-xs text-slate-500">
              <span>Subtotal</span>
              <span className="tabular-nums">
                {moneda} {totalBase.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {descuento > 0 && (
              <div className="flex justify-between text-xs text-emerald-600 font-bold">
                <span>Descuento cupón</span>
                <span className="tabular-nums">
                  -{moneda} {descuento.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-2 border-t border-[#e4c28a]/20">
              <span className="text-sm font-black text-[#231e1d]">Total a pagar</span>
              <span className="text-lg font-black text-[#231e1d] tabular-nums">
                {moneda} {totalFinal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Footer método */}
          <div className="px-5 py-3 bg-white flex items-center justify-center gap-1.5 border-t border-[#e4c28a]/10">
            <span className="text-[10px] text-slate-400">
              {metodo === 'tarjeta' ? ' Pago seguro vía Culqi' : ' Pago con Yape vía Culqi'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}