'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, FileText, Layers } from 'lucide-react';

export interface FichaCorteData {
  id: string;
  version: string | null;
  estado: string | null;
  ficha_url: string | null;
  imagen_geometral: string | null;
  descripcionTexto: string | null;
  detalle: Array<{
    id: string;
    cantidad_consumo: number;
    material: {
      nombre: string;
      tipo: string;
      composicion: string | null;
      color: string | null;
      unidad: string;
    } | null;
    insumo: {
      nombre: string;
      tipo: string;
      unidad: string;
    } | null;
    observaciones: string | null;
  }>;
}

interface Props {
  ficha: FichaCorteData | null;
  productoNombre: string;
}

export function FichaTecnicaCortePanel({ ficha, productoNombre }: Props) {
  if (!ficha) {
    return (
      <div className="rounded-xl border border-dashed border-stone-200 p-8 text-center text-sm text-stone-500">
        No hay ficha técnica para {productoNombre}. Solicite al diseñador que la apruebe.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-stone-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-orange-600" />
          <div>
            <h3 className="font-black text-stone-900 text-sm">{productoNombre}</h3>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
              Ficha v{ficha.version ?? '—'} · {ficha.estado ?? '—'}
            </p>
          </div>
        </div>
        {ficha.ficha_url && (
          <Link
            href={ficha.ficha_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-black text-orange-600 hover:underline uppercase tracking-wide"
          >
            Ver ficha PDF <ExternalLink size={12} />
          </Link>
        )}
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {ficha.imagen_geometral && (
          <div className="relative aspect-square max-h-80 rounded-lg border border-stone-100 overflow-hidden bg-stone-50">
            <Image
              src={ficha.imagen_geometral}
              alt="Geometral"
              fill
              className="object-contain p-2"
              unoptimized
            />
          </div>
        )}

        <div className="space-y-4">
          {ficha.descripcionTexto && (
            <p className="text-sm text-stone-600 whitespace-pre-wrap">{ficha.descripcionTexto}</p>
          )}

          <div>
            <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <Layers size={12} /> Materiales e insumos
            </h4>
            {ficha.detalle.length === 0 ? (
              <p className="text-xs text-stone-400">Sin detalle de consumo.</p>
            ) : (
              <ul className="space-y-2">
                {ficha.detalle.map((d) => (
                  <li
                    key={d.id}
                    className="text-sm border border-stone-100 rounded-lg px-3 py-2 bg-stone-50/50"
                  >
                    {d.material ? (
                      <span className="font-bold text-stone-800">{d.material.nombre}</span>
                    ) : d.insumo ? (
                      <span className="font-bold text-stone-800">{d.insumo.nombre}</span>
                    ) : (
                      <span className="text-stone-400">Ítem sin nombre</span>
                    )}
                    <span className="text-stone-600">
                      {' '}
                      — {d.cantidad_consumo}{' '}
                      {d.material?.unidad ?? d.insumo?.unidad ?? 'u.'}
                    </span>
                    {d.material?.color && (
                      <span className="text-xs text-stone-500 block">
                        Color: {d.material.color}
                      </span>
                    )}
                    {d.observaciones && (
                      <span className="text-xs text-stone-500 block">{d.observaciones}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
