'use client';

import { useState, useTransition, useEffect } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { usePortal } from '@/lib/hooks/usePortal';
import { CatalogoCotizacion } from '@/components/portal/cotizaciones/detalle/CatalogoCotizacion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CotizadorPanel } from '@/components/portal/cotizaciones/panel/CotizadorPanel';
import { ItemCotizacion } from '@/components/portal/_contexts/PortalContext';

export default function NuevaCotizacionPage() {
  // Extraemos las variables específicas y las funciones del nuevo PortalContext
  const {
    itemsBorrador,
    resumenBorrador,
    cliente,
    zonaEnvio,
    limpiarBorrador
  } = usePortal();

  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [cotizacionNumero, setCotizacionNumero] = useState<string | null>(null);

  // Corregido: Mapeamos usando itemsBorrador y añadimos el tipo explícito ItemCotizacion
  const idsAgregados = itemsBorrador.map((i: ItemCotizacion) => i.variante_id);

  useEffect(() => {
    if (!mostrarConfirmacion) return;
    const t = setTimeout(() => router.push('/portal/cotizaciones'), 3000);
    return () => clearTimeout(t);
  }, [mostrarConfirmacion, router]);

  const handleEnviar = (accion: 'borrador' | 'enviar') => {
    if (!itemsBorrador.length) return;
    startTransition(async () => {
      try {
        const res = await fetch('/api/portal/cotizaciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cliente_id: cliente!.id,
            estado: accion === 'borrador' ? 'borrador' : 'enviada',
            costo_envio: resumenBorrador.costo_envio,
            zona_envio: zonaEnvio,
            items: itemsBorrador.map((i: ItemCotizacion) => ({
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
            toast.error(`MOQ incumplido: ${err.detalle?.join(', ')}`);
            return;
          }
          throw new Error(err.error ?? 'Error desconocido');
        }

        const { data } = await res.json();
        limpiarBorrador();
        setCotizacionNumero(data.numero);
        setMostrarConfirmacion(true);
        toast.success(accion === 'borrador' ? 'Borrador guardado' : 'Cotización generada');
      } catch (e: any) {
        toast.error(e.message ?? 'Error al guardar la cotización');
      }
    });
  };

  return (
    <div className="flex flex-col h-screen bg-guor-50">

      {/* ── Topbar ── */}
      <div className="flex items-center justify-between px-6 h-14 border-b border-guor-stone bg-white shrink-0 shadow-subtle">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-black text-guor-dark uppercase tracking-tight">
            Nueva cotización
          </h1>
          {itemsBorrador.length > 0 && (
            <span className="text-[10px] font-bold text-guor-soft bg-guor-100 border border-guor-line-soft px-2.5 py-1 rounded-full">
              {itemsBorrador.length} modelo{itemsBorrador.length > 1 ? 's' : ''} · {resumenBorrador.total_unidades.toLocaleString()} uds
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Guardar borrador */}
          <button
            type="button"
            onClick={() => handleEnviar('borrador')}
            disabled={!itemsBorrador.length || isPending}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-guor-stone-mid text-guor-soft bg-white hover:bg-guor-100 hover:text-guor-dark hover:border-guor-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Guardar borrador
          </button>

          {/* Generar cotización */}
          <button
            type="button"
            onClick={() => handleEnviar('enviar')}
            disabled={!itemsBorrador.length || isPending}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl bg-guor-gold hover:bg-guor-gold-warm transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-gold active:scale-95"
          >
            {isPending && <Loader2 size={12} className="animate-spin" />}
            Generar cotización
          </button>
        </div>
      </div>

      {/* ── Layout 2 paneles ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Panel izquierdo — Catálogo */}
        <div className="w-80 shrink-0 border-r border-guor-stone bg-white overflow-hidden flex flex-col">
          <CatalogoCotizacion idsAgregados={idsAgregados} />
        </div>

        {/* Panel derecho — Resumen Financiero */}
        <div className="flex-1 overflow-hidden flex flex-col bg-guor-50">
          <CotizadorPanel onEnviar={handleEnviar} isSending={isPending} />
        </div>

      </div>

      {/* ── Modal de confirmación ── */}
      {mostrarConfirmacion && (
        <div className="fixed inset-0 bg-guor-dark/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-modal p-8 w-full max-w-sm text-center space-y-5">

            {/* Ícono */}
            <div className="w-16 h-16 mx-auto rounded-full bg-guor-gold-dust border border-guor-gold-pale flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-guor-gold flex items-center justify-center">
                <CheckCircle size={20} className="text-white" />
              </div>
            </div>

            {/* Texto */}
            <div>
              <h2 className="text-xl font-black text-guor-gold tracking-tight">
                ¡Cotización Generada!
              </h2>
              <p className="text-sm text-guor-soft mt-2 leading-relaxed">
                Tu cotización fue enviada a GUOR. La revisaremos y te
                notificaremos el resultado por correo electrónico.
              </p>
            </div>

            {/* Número */}
            <div className="bg-guor-cream-deep border border-guor-gold-pale rounded-2xl px-5 py-4">
              <p className="text-[10px] font-bold text-guor-muted uppercase tracking-widest mb-1">
                Número de cotización
              </p>
              <p className="text-lg font-black text-guor-gold">{cotizacionNumero}</p>
            </div>

            <p className="text-[10px] text-guor-muted">Redirigiendo en 3 segundos…</p>

            {/* Botón */}
            <button
              type="button"
              onClick={() => { setMostrarConfirmacion(false); router.push('/portal/cotizaciones'); }}
              className="w-full py-3 text-sm font-bold text-guor-cream rounded-xl bg-guor-dark hover:bg-guor-dark-80 transition-all active:scale-95"
            >
              Ver mis cotizaciones
            </button>
          </div>
        </div>
      )}
    </div>
  );
}