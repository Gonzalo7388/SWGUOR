'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle, X, Upload, ChevronDown, CheckCircle2,
} from 'lucide-react';
import type {
  TipoIncidenciaCliente,
  SeveridadIncidencia,
  DespachoFlat,
} from '@/lib/services/despachos.service';
import { TIPO_LABELS, SEVERIDAD_CONFIG } from '@/lib/constants/estados';
import { useIncidencia } from '@/lib/hooks/useDespachos';
import Image from 'next/image';

interface ModalIncidenciaProps {
  despacho: DespachoFlat;
  onClose: () => void;
}

export default function ModalIncidencia({ despacho, onClose }: ModalIncidenciaProps) {
  const [tipo, setTipo]               = useState<TipoIncidenciaCliente>('defecto_confeccion');
  const [severidad, setSeveridad]     = useState<SeveridadIncidencia>('media');
  const [descripcion, setDescripcion] = useState('');
  const [foto, setFoto]               = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [localError, setLocalError]   = useState('');

  const fileRef = useRef<HTMLInputElement>(null);
  const { status, errorMsg, submit, reset } = useIncidencia();

  // ✓ Limpiar estado del hook al montar (por si el modal fue cerrado con error
  //   y React reutiliza la instancia del hook en un remount rápido)
  useEffect(() => {
    reset();
  }, [reset]);

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setLocalError('La foto no debe superar 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFoto(file);
      setFotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setLocalError('');
  }

  // ✓ useCallback evita la recreación en cada render
  const handleSubmit = useCallback(async () => {
    if (!descripcion.trim()) {
      setLocalError('La descripción es obligatoria.');
      return;
    }
    setLocalError('');
    await submit(despacho.pedido_ids[0], { tipo, severidad, descripcion, foto });
  }, [descripcion, despacho.pedido_ids, tipo, severidad, foto, submit]);

  // ✓ localError tiene precedencia visual; errorMsg del hook aparece solo
  //   cuando no hay error local activo
  const displayError = localError || errorMsg;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-0 md:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">

        {/* ── Cabecera ── */}
        <div className="px-6 py-4 border-b border-[#F0E4E4] flex items-start justify-between gap-3 bg-[#FAF5F5]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FCEBEB] border border-[#F09595] flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-[#A32D2D]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#3A2A2A]">Reportar incidencia</h3>
              <p className="text-xs text-[#8A7676]">
                Despacho{' '}
                <span className="font-semibold text-[#B8962D]">{despacho.codigo}</span>
                {despacho.pedido_ids.length === 1
                  ? <>{' · '}Pedido <span className="font-semibold">#{despacho.pedido_ids[0]}</span></>
                  : <>{' · '}{despacho.pedido_ids.length} pedidos agrupados</>
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#F0E4E4] transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4 text-[#8A7676]" />
          </button>
        </div>

        {/* ── Cuerpo ── */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-[#EAF3DE] border border-[#97C459] flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-[#3B6D11]" />
              </div>
              <p className="font-semibold text-[#3A2A2A]">Incidencia registrada</p>
              <p className="text-sm text-[#6D5A5A]">
                Nuestro equipo revisará el reporte y se comunicará a la brevedad.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 rounded-full bg-[#D4AF37] hover:bg-[#B8962D] text-white text-xs uppercase tracking-widest font-bold transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <>
              {/* Tipo */}
              <div>
                <label className="block text-xs font-semibold text-[#4A3737] uppercase tracking-wider mb-2">
                  Tipo de incidencia <span className="text-[#E24B4A]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as TipoIncidenciaCliente)}
                    className="w-full appearance-none bg-[#FAF5F5] border border-[#E7D7D7] rounded-xl px-4 py-3 text-sm text-[#4A3737] focus:outline-none focus:border-[#D4AF37] transition-colors pr-10"
                  >
                    {(Object.entries(TIPO_LABELS) as [TipoIncidenciaCliente, string][]).map(
                      ([v, l]) => <option key={v} value={v}>{l}</option>,
                    )}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#8A7676] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Severidad */}
              <div>
                <label className="block text-xs font-semibold text-[#4A3737] uppercase tracking-wider mb-2">
                  Severidad <span className="text-[#E24B4A]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(SEVERIDAD_CONFIG) as [SeveridadIncidencia, typeof SEVERIDAD_CONFIG[SeveridadIncidencia]][]).map(
                    ([v, cfg]) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setSeveridad(v)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all"
                        style={{
                          borderColor: severidad === v ? cfg.border : '#E7D7D7',
                          background:  severidad === v ? cfg.bg    : 'white',
                        }}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: cfg.color }}
                        />
                        <div>
                          <p
                            className="text-xs font-bold"
                            style={{ color: severidad === v ? cfg.color : '#4A3737' }}
                          >
                            {cfg.label}
                          </p>
                          <p className="text-[10px] text-[#8A7676]">{cfg.desc}</p>
                        </div>
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-semibold text-[#4A3737] uppercase tracking-wider mb-2">
                  Descripción <span className="text-[#E24B4A]">*</span>
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe el problema: qué productos están afectados, cuántas unidades, qué recibiste vs. lo esperado…"
                  rows={4}
                  maxLength={1000}
                  className="w-full bg-[#FAF5F5] border border-[#E7D7D7] rounded-xl px-4 py-3 text-sm text-[#4A3737] placeholder-[#B5A5A5] focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
                />
                <p className="text-[10px] text-[#9A8080] mt-1 text-right">
                  {descripcion.length} / 1000
                </p>
              </div>

              {/* Foto */}
              <div>
                <label className="block text-xs font-semibold text-[#4A3737] uppercase tracking-wider mb-2">
                  Foto de evidencia{' '}
                  <span className="text-[#8A7676] font-normal normal-case">
                    (opcional · máx. 5 MB)
                  </span>
                </label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFoto}
                  className="hidden"
                />
                {fotoPreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-[#E7D7D7] aspect-video bg-[#FAF5F5]">
                    <Image
                      src={fotoPreview}
                      alt="Evidencia"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      onClick={() => { setFoto(null); setFotoPreview(null); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
                      aria-label="Eliminar foto"
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full border-2 border-dashed border-[#D4AF37]/40 hover:border-[#D4AF37] bg-[#FDF9F0] hover:bg-[#FDF6E3] rounded-xl py-5 flex flex-col items-center gap-2 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-full bg-white border border-[#D4AF37]/30 group-hover:border-[#D4AF37] flex items-center justify-center transition-colors">
                      <Upload className="w-4 h-4 text-[#B8962D]" />
                    </div>
                    <p className="text-xs text-[#8A7676] group-hover:text-[#6D5A5A]">
                      Toca para adjuntar foto
                    </p>
                  </button>
                )}
              </div>

              {/* Error */}
              {displayError && (
                <div className="flex items-center gap-2 bg-[#FCEBEB] border border-[#F09595] rounded-xl px-4 py-3">
                  <AlertTriangle className="w-4 h-4 text-[#A32D2D] flex-shrink-0" />
                  <p className="text-xs text-[#A32D2D]">{displayError}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        {status !== 'success' && (
          <div className="px-6 py-4 border-t border-[#F0E4E4] bg-[#FAF5F5] flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full border border-[#D4AF37]/40 text-[#4A3737] hover:border-[#B8962D] hover:text-[#B8962D] text-xs uppercase tracking-widest font-bold transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={status === 'loading'}
              className="flex-1 py-2.5 rounded-full bg-[#A32D2D] hover:bg-[#7A1F1F] disabled:opacity-50 text-white text-xs uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Enviando…
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Reportar incidencia
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}