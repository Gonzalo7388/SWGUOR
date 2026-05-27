import { AlertCircle, CheckCircle, X } from "lucide-react";
import { CreditCard, Receipt } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { pedidos } from "@prisma/client";

interface MetodoPago {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  bg: string;
  tag?: string; // El signo '?' significa que es opcional
}

const METODOS_PAGO: MetodoPago[] = [
  {
    id: 'tarjeta',
    nombre: 'Tarjeta de crédito/débito',
    descripcion: 'Visa, MasterCard, American Express',
    imagen: '/metodos_pago/tarjeta.png',
    bg: 'bg-blue-50',
  },
  {
    id: 'paypal',
    nombre: 'PayPal',
    descripcion: 'Paga con tu cuenta PayPal',
    imagen: '/metodos_pago/paypal.png',
    bg: 'bg-yellow-50',
    tag: 'Recomendado',
  },
  {
    id: 'yape',
    nombre: 'Yape',
    descripcion: 'Paga con Yape a nuestro número 987654321',
    imagen: '/metodos_pago/yape.png',
    bg: 'bg-green-50',
  },
  {
    id: 'plin',
    nombre: 'Plin',
    descripcion: 'Paga con Plin a nuestro número 987654321',
    imagen: '/metodos_pago/plin.png',
    bg: 'bg-purple-50',
  },
];


type PasosPago = 'seleccion' | 'confirmacion' | 'procesando' | 'exito' | 'error';

export function ModalPago({
  pedido,
  onClose,
}: {
  pedido: pedidos;
  onClose: () => void;
}) {
  const [paso, setPaso]         = useState<PasosPago>('seleccion');
  const [metodo, setMetodo]     = useState<string | null>(null);

  const total = Number(pedido.total ?? 0).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const metodoSeleccionado = METODOS_PAGO.find(m => m.id === metodo);

  const handleConfirmar = async () => {
    setPaso('procesando');
    // Aquí iría la lógica real de pago — simulamos 2s de procesamiento
    await new Promise(r => setTimeout(r, 2000));
    // Simular éxito (reemplazar con lógica real)
    setPaso('exito');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
        style={{ animation: 'modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}
      >

        {/* ── PASO 1: Selección de método ─────────────────────────────── */}
        {paso === 'seleccion' && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <p className="text-[10px] font-bold text-[#b5854b] uppercase tracking-widest">Pasarela de pago</p>
                <h2 className="text-xl font-black text-[#231e1d]">Selecciona método</h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            {/* Resumen */}
            <div className="mx-6 mt-4 p-4 rounded-2xl bg-[#fff4e2] border border-[#e4c28a]/40 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-[#b5854b]/60 uppercase tracking-wider">Pedido #{pedido.id}</p>
                <p className="font-black text-[#231e1d] text-lg">{pedido.moneda ?? 'PEN'} {total}</p>
              </div>
              <Receipt size={20} className="text-[#b5854b]/40" />
            </div>

            {/* Métodos */}
            <div className="p-6 space-y-3">
              {METODOS_PAGO.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMetodo(m.id)}
                  className={cn(
                    'w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-center gap-4 relative',
                    metodo === m.id
                      ? 'border-[#b5854b] bg-[#fff4e2] shadow-md shadow-[#b5854b]/10'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50',
                  )}
                >
                  {/* Logo */}
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', m.bg)}>
                    <Image
                      src={m.imagen}
                      alt={m.nombre}
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#231e1d] text-sm">{m.nombre}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{m.descripcion}</p>
                  </div>

                  {/* Tag */}
                  {m.tag && (
                    <span className="text-[9px] font-black uppercase tracking-widest bg-[#b5854b] text-white px-2 py-1 rounded-full">
                      {m.tag}
                    </span>
                  )}

                  {/* Check */}
                  {metodo === m.id && (
                    <div className="w-5 h-5 rounded-full bg-[#b5854b] flex items-center justify-center flex-shrink-0">
                      <CheckCircle size={12} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Botones */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                disabled={!metodo}
                onClick={() => setPaso('confirmacion')}
                className="flex-1 py-3 rounded-2xl bg-[#231e1d] hover:bg-[#b5854b] text-[#e4c28a] text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CreditCard size={14} />
                Continuar
              </button>
            </div>
          </>
        )}

        {/* ── PASO 2: Confirmación ────────────────────────────────────── */}
        {paso === 'confirmacion' && metodoSeleccionado && (
          <>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <p className="text-[10px] font-bold text-[#b5854b] uppercase tracking-widest">Confirmar pago</p>
                <h2 className="text-xl font-black text-[#231e1d]">Resumen</h2>
              </div>
              <button onClick={() => setPaso('seleccion')} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Monto */}
              <div className="text-center py-6 bg-gradient-to-br from-[#fff4e2] to-[#fde8c0] rounded-2xl border border-[#e4c28a]/40">
                <p className="text-xs font-bold text-[#b5854b]/60 uppercase tracking-widest mb-1">Monto a pagar</p>
                <p className="text-4xl font-black text-[#231e1d]">{pedido.moneda ?? 'PEN'} {total}</p>
                <p className="text-xs text-[#b5854b]/60 mt-1">Pedido #{pedido.id}</p>
              </div>

              {/* Método elegido */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', metodoSeleccionado.bg)}>
                  <Image src={metodoSeleccionado.imagen} alt={metodoSeleccionado.nombre} width={28} height={28} className="object-contain" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Método de pago</p>
                  <p className="font-bold text-[#231e1d] text-sm">{metodoSeleccionado.nombre}</p>
                </div>
                <button onClick={() => setPaso('seleccion')} className="ml-auto text-xs text-[#b5854b] font-bold hover:underline">
                  Cambiar
                </button>
              </div>

              <p className="text-xs text-slate-400 text-center">
                Al confirmar aceptas los términos de pago. El pedido se procesará una vez verificado el pago.
              </p>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setPaso('seleccion')} className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold transition-colors">
                Volver
              </button>
              <button
                onClick={handleConfirmar}
                className="flex-1 py-3 rounded-2xl bg-[#231e1d] hover:bg-[#b5854b] text-[#e4c28a] text-sm font-bold transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle size={14} />
                Confirmar pago
              </button>
            </div>
          </>
        )}

        {/* ── PASO 3: Procesando ──────────────────────────────────────── */}
        {paso === 'procesando' && (
          <div className="p-12 flex flex-col items-center justify-center gap-5 text-center">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-[#e4c28a]/20" />
              <div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#b5854b]"
                style={{ animation: 'spin 0.8s linear infinite' }}
              />
            </div>
            <div>
              <p className="font-black text-[#231e1d] text-lg">Procesando pago</p>
              <p className="text-sm text-slate-400 mt-1">Por favor espera un momento...</p>
            </div>
          </div>
        )}

        {/* ── PASO 4: Éxito ───────────────────────────────────────────── */}
        {paso === 'exito' && (
          <div className="p-12 flex flex-col items-center justify-center gap-5 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center" style={{ animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
              <CheckCircle size={36} className="text-emerald-500" />
            </div>
            <div>
              <p className="font-black text-[#231e1d] text-xl">¡Pago registrado!</p>
              <p className="text-sm text-slate-400 mt-2">
                Tu pago con{' '}
                <strong className="text-[#b5854b]">{metodoSeleccionado?.nombre}</strong>{' '}
                ha sido registrado y está pendiente de verificación.
              </p>
            </div>
            <div className="w-full mt-2 p-4 rounded-2xl bg-[#fff4e2] border border-[#e4c28a]/40 text-left">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">Pedido</span>
                <span className="font-bold text-[#b5854b]">#{pedido.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Monto</span>
                <span className="font-black text-[#231e1d]">{pedido.moneda ?? 'PEN'} {total}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-[#231e1d] hover:bg-[#b5854b] text-[#e4c28a] text-sm font-bold transition-all"
            >
              Listo
            </button>
          </div>
        )}

        {/* ── PASO 5: Error ───────────────────────────────────────────── */}
        {paso === 'error' && (
          <div className="p-12 flex flex-col items-center justify-center gap-5 text-center">
            <div className="w-20 h-20 rounded-full bg-rose-50 border-2 border-rose-200 flex items-center justify-center">
              <AlertCircle size={36} className="text-rose-500" />
            </div>
            <div>
              <p className="font-black text-[#231e1d] text-xl">Error al procesar</p>
              <p className="text-sm text-slate-400 mt-2">
                No se pudo procesar el pago. Por favor intenta nuevamente.
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={onClose} className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold transition-colors">
                Cancelar
              </button>
              <button onClick={() => setPaso('seleccion')} className="flex-1 py-3 rounded-2xl bg-[#231e1d] hover:bg-[#b5854b] text-[#e4c28a] text-sm font-bold transition-all">
                Reintentar
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}