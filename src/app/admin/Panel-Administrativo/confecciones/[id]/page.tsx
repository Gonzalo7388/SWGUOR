import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { ArrowLeft } from 'lucide-react';
import { ESTADO_LABELS } from '@/lib/schemas/confecciones';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

type ConfeccionDetalle = {
  id: string;
  prenda: string;
  cantidad: number;
  estado: string;
  prioridad: string;
  costo_unitario: string | null;
  fecha_entrega: string | null;
  notas: string | null;
  observaciones: string | null;
  created_at: string;
  talleres: {
    nombre: string;
    contacto: string | null;
    telefono: string | null;
  } | null;
  ordenes_produccion: {
    id: string;
    pedidos: {
      id: string;
      estado: string;
      clientes: {
        razon_social: string | null;
        nombre_comercial: string | null;
      } | null;
    } | null;
  } | null;
  seguimiento_confeccion: {
    id: string;
    estado_anterior: string;
    estado_nuevo: string;
    notas: string | null;
    created_at: string;
  }[];
};

const PRIORIDAD_STYLES: Record<string, string> = {
  baja: 'bg-slate-100 text-slate-600',
  media: 'bg-blue-100 text-blue-700',
  alta: 'bg-orange-100 text-orange-700',
  urgente: 'bg-red-100 text-red-700',
};

const PRIORIDAD_LABELS: Record<string, string> = {
  baja: 'Baja', media: 'Media', alta: 'Alta', urgente: 'Urgente',
};

export default async function ConfeccionDetallePage({ params }: PageProps) {
  const { id } = await params;

  const conf = await prisma.confecciones.findUnique({
    where: { id: BigInt(id) },
    select: {
      id: true,
      prenda: true,
      cantidad: true,
      estado: true,
      prioridad: true,
      costo_unitario: true,
      fecha_entrega: true,
      notas: true,
      observaciones: true,
      created_at: true,
      talleres: {
        select: { id: true, nombre: true, contacto: true, telefono: true },
      },
      ordenes_produccion: {
        select: {
          id: true,
          pedidos: {
            select: {
              id: true,
              estado: true,
              clientes: {
                select: { razon_social: true, nombre_comercial: true },
              },
            },
          },
        },
      },
      seguimiento_confeccion: {
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          estado_anterior: true,
          estado_nuevo: true,
          notas: true,
          created_at: true,
        },
      },
    },
  });

  if (!conf) notFound();

  const data = serializeBigInt(conf) as unknown as ConfeccionDetalle;

  const pedido = data.ordenes_produccion?.pedidos;
  const cliente =
    pedido?.clientes?.razon_social ||
    pedido?.clientes?.nombre_comercial ||
    '—';

  const fechaEntrega = data.fecha_entrega
    ? new Date(data.fecha_entrega).toLocaleDateString('es-PE', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
    : '—';

  const costoUnitario = data.costo_unitario
    ? `S/ ${Number(data.costo_unitario).toFixed(2)}`
    : '—';

  const costoTotal =
    data.costo_unitario
      ? `S/ ${(Number(data.costo_unitario) * data.cantidad).toFixed(2)}`
      : '—';

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Link
        href="/admin/Panel-Administrativo/confecciones"
        className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-pink-600 hover:opacity-80"
      >
        <ArrowLeft size={13} /> Volver a confecciones
      </Link>

      {/* Cabecera */}
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-0.5">
              Orden #{data.id}
            </p>
            <h1 className="text-xl font-black text-stone-900">{data.prenda}</h1>
          </div>
          <span
            className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${PRIORIDAD_STYLES[data.prioridad] ?? 'bg-gray-100 text-gray-600'
              }`}
          >
            {PRIORIDAD_LABELS[data.prioridad] ?? data.prioridad}
          </span>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div>
            <dt className="text-[10px] font-black uppercase text-stone-400 mb-0.5">Taller</dt>
            <dd className="font-bold text-stone-800">{data.talleres?.nombre ?? '—'}</dd>
            {data.talleres?.contacto && (
              <dd className="text-xs text-stone-500">{data.talleres.contacto}</dd>
            )}
            {data.talleres?.telefono && (
              <dd className="text-xs text-stone-500">{data.talleres.telefono}</dd>
            )}
          </div>

          <div>
            <dt className="text-[10px] font-black uppercase text-stone-400 mb-0.5">Estado</dt>
            <dd className="font-bold text-stone-800">
              {ESTADO_LABELS[data.estado as keyof typeof ESTADO_LABELS] ?? data.estado}
            </dd>
          </div>

          <div>
            <dt className="text-[10px] font-black uppercase text-stone-400 mb-0.5">Cantidad</dt>
            <dd className="font-bold text-stone-800">{data.cantidad} u.</dd>
          </div>

          <div>
            <dt className="text-[10px] font-black uppercase text-stone-400 mb-0.5">Costo unitario</dt>
            <dd className="font-bold text-stone-800">{costoUnitario}</dd>
          </div>

          <div>
            <dt className="text-[10px] font-black uppercase text-stone-400 mb-0.5">Costo total</dt>
            <dd className="font-bold text-stone-800">{costoTotal}</dd>
          </div>

          <div>
            <dt className="text-[10px] font-black uppercase text-stone-400 mb-0.5">Fecha de entrega</dt>
            <dd className="font-bold text-stone-800">{fechaEntrega}</dd>
          </div>

          <div>
            <dt className="text-[10px] font-black uppercase text-stone-400 mb-0.5">Pedido</dt>
            <dd className="font-bold text-stone-800">#{pedido?.id ?? '—'}</dd>
          </div>

          <div>
            <dt className="text-[10px] font-black uppercase text-stone-400 mb-0.5">Cliente</dt>
            <dd className="font-bold text-stone-800">{cliente}</dd>
          </div>

          {data.notas && (
            <div className="sm:col-span-2">
              <dt className="text-[10px] font-black uppercase text-stone-400 mb-0.5">Notas</dt>
              <dd className="text-stone-700 text-sm">{data.notas}</dd>
            </div>
          )}

          {data.observaciones && (
            <div className="sm:col-span-2">
              <dt className="text-[10px] font-black uppercase text-stone-400 mb-0.5">Observaciones</dt>
              <dd className="text-stone-700 text-sm">{data.observaciones}</dd>
            </div>
          )}
        </dl>

        {data.estado !== 'completada' && (
          <Link
            href={`/ayudante/confecciones/${data.id}`}
            className="inline-flex items-center justify-center rounded-lg bg-teal-600 text-white px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-teal-700"
          >
            Aprobar conformidad (ayudante)
          </Link>
        )}
      </div>

      {/* Historial de estados */}
      {data.seguimiento_confeccion.length > 0 && (
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-stone-400">
            Historial de estados
          </h2>
          <ol className="relative border-l border-stone-200 space-y-4 pl-5">
            {data.seguimiento_confeccion.map((seg) => (
              <li key={seg.id} className="relative">
                <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-pink-400 border-2 border-white" />
                <p className="text-xs font-bold text-stone-800">
                  {ESTADO_LABELS[seg.estado_anterior as keyof typeof ESTADO_LABELS] ?? seg.estado_anterior}
                  {' → '}
                  {ESTADO_LABELS[seg.estado_nuevo as keyof typeof ESTADO_LABELS] ?? seg.estado_nuevo}
                </p>
                {seg.notas && (
                  <p className="text-xs text-stone-500 mt-0.5">{seg.notas}</p>
                )}
                <p className="text-[10px] text-stone-400 mt-0.5">
                  {new Date(seg.created_at).toLocaleString('es-PE', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}