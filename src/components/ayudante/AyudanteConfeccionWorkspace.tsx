'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ESTADO_LABELS } from '@/lib/schemas/confecciones';

export interface ConfeccionAyudanteData {
  id: string;
  estado: string;
  prenda: string;
  cantidad: number;
  notas: string | null;
  taller: { nombre: string; especialidad: string | null } | null;
  pedido: { id: string; estado: string; cliente: string } | null;
  conformidadAprobada: boolean;
}

interface Props {
  confeccion: ConfeccionAyudanteData;
}

export function AyudanteConfeccionWorkspace({ confeccion }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAprobar = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ayudante/confecciones/${confeccion.id}/conformidad`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'No se pudo aprobar');
      toast.success(
        json.data?.ya_aprobada
          ? 'La conformidad ya estaba registrada'
          : 'Conformidad aprobada — pedido listo para despacho',
      );
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al aprobar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div>
        <Link
          href="/admin/Panel-Administrativo/confecciones"
          className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-teal-600 hover:opacity-80 mb-3"
        >
          <ArrowLeft size={13} /> Volver a confecciones
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-600 text-white shadow-sm">
            <ClipboardCheck size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              Confección #{confeccion.id}
            </h1>
            <p className="text-sm text-stone-500 font-medium">{confeccion.prenda}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-black text-stone-900">{confeccion.prenda}</span>
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
            {ESTADO_LABELS[confeccion.estado as keyof typeof ESTADO_LABELS] ??
              confeccion.estado}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <Building2 size={16} className="text-stone-400 mt-0.5" />
            <div>
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                Taller
              </p>
              <p className="font-bold text-stone-800">
                {confeccion.taller?.nombre ?? '—'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Package size={16} className="text-stone-400 mt-0.5" />
            <div>
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                Cantidad
              </p>
              <p className="font-bold text-stone-800">{confeccion.cantidad} u.</p>
            </div>
          </div>
        </div>

        {confeccion.pedido && (
          <p className="text-xs text-stone-500">
            Pedido #{confeccion.pedido.id} · {confeccion.pedido.cliente} · Estado:{' '}
            <strong>{confeccion.pedido.estado}</strong>
          </p>
        )}

        {confeccion.notas && (
          <p className="text-sm text-stone-600 border-t border-stone-100 pt-3">
            {confeccion.notas}
          </p>
        )}
      </div>

      {confeccion.conformidadAprobada ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 flex items-center gap-2 text-emerald-800">
          <CheckCircle2 size={20} />
          <p className="text-sm font-bold">Conformidad del taller ya aprobada</p>
        </div>
      ) : (
        <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-5">
          <p className="text-sm text-stone-700 mb-4">
            Verifique la calidad del trabajo del taller antes de liberar el pedido a despacho.
          </p>
          <Button
            type="button"
            disabled={loading}
            onClick={handleAprobar}
            className="bg-teal-600 hover:bg-teal-700 font-black uppercase text-xs tracking-widest"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin mr-2" />
            ) : (
              <ClipboardCheck size={16} className="mr-2" />
            )}
            Aprobar conformidad del taller
          </Button>
        </div>
      )}
    </div>
  );
}
