'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Plus, Download, RefreshCw, Eye, Edit3,
  FileText, Search, Loader2,
} from 'lucide-react';
import { usePortal } from '../_contexts/PortalContext';
import { exportCotizacionIndividualToPDF, buildCotizacionPDFData } from '@/lib/utils/export-utils';
import { toast } from 'sonner';
import type { EstadoCotizacion } from '@prisma/client';
import { formatCurrency, formatDateLong } from '@/lib/helpers/format-helpers';
import { EstadoBadge } from '@/components/portal/EstadoBadge';

// ── Constantes ──────────────────────────────────────────────────────────────
const OCRE        = '#b5854b';
const NEGRO_FONDO = '#231e1d';

type EstadoFiltro =
  | 'todas' | 'borrador' | 'enviada'
  | 'aprobada' | 'rechazada' | 'expirada' | 'convertida';

interface Cot {
  id: number;
  numero: string;
  total: number;
  estado: EstadoCotizacion;
  created_at: string;
  valida_hasta: string;
}

const FILTROS: { value: EstadoFiltro; label: string }[] = [
  { value: 'todas',      label: 'Todas'      },
  { value: 'borrador',   label: 'Borradores' },
  { value: 'enviada',    label: 'En Revisión' },
  { value: 'aprobada',   label: 'Aceptadas'  },
  { value: 'convertida', label: 'En Orden'   },
];

// ── Sub-componente: barra de filtros ────────────────────────────────────────
function BarraFiltros({
  filtro,
  setFiltro,
  busqueda,
  setBusqueda,
}: {
  filtro: EstadoFiltro;
  setFiltro: (f: EstadoFiltro) => void;
  busqueda: string;
  setBusqueda: (v: string) => void;
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
        {FILTROS.map(f => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            className="px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all border"
            style={{
              backgroundColor: filtro === f.value ? NEGRO_FONDO : '#f8fafc',
              color:           filtro === f.value ? 'white'     : '#64748b',
              borderColor:     filtro === f.value ? NEGRO_FONDO : '#f1f5f9',
            }}
          >
            {f.label.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por N°..."
          className="h-11 w-full lg:w-72 border border-slate-200 rounded-xl pl-10 pr-4 text-sm focus:ring-4 focus:ring-amber-100 outline-none transition-all"
        />
      </div>
    </div>
  );
}

// ── Sub-componente: acciones por fila ───────────────────────────────────────
function AccionesFila({
  cot,
  onRecotizar,
}: {
  cot: Cot;
  onRecotizar: (id: number) => void;
}) {
  const [descargando, setDescargando] = useState(false);
 
  const handleDescargarPDF = async () => {
    setDescargando(true);
    const tid = toast.loading('Generando PDF...');
    try {
      const res = await fetch(`/api/portal/cotizaciones/${cot.id}`);
      if (!res.ok) throw new Error('No se pudo obtener la cotización');
      const { data } = await res.json();
 
      const pdfData = buildCotizacionPDFData(data, data.cotizacion_items ?? []);
      await exportCotizacionIndividualToPDF(pdfData);
 
      toast.success('PDF descargado', { id: tid });
    } catch (e: any) {
      toast.error(e.message ?? 'Error al generar el PDF', { id: tid });
    } finally {
      setDescargando(false);
    }
  };
 
  return (
    <div className="flex items-center justify-end gap-2">
 
      {/* Ver detalle — siempre visible */}
      <Link
        href={`/portal/cotizaciones/${cot.id}`}
        className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-all"
        title="Ver detalle"
      >
        <Eye size={18} />
      </Link>
 
      {/* Editar — solo borradores */}
      {cot.estado === 'borrador' && (
        <Link
          href={`/portal/cotizaciones/${cot.id}/editar`}
          className="p-2.5 text-white rounded-xl transition-all hover:brightness-110"
          style={{ backgroundColor: OCRE }}
          title="Editar borrador"
        >
          <Edit3 size={18} />
        </Link>
      )}
 
      {/* Descargar PDF — todo estado excepto borrador */}
      {cot.estado !== 'borrador' && (
        <button
          onClick={handleDescargarPDF}
          disabled={descargando}
          className="p-2.5 text-white rounded-xl transition-all hover:brightness-110 disabled:opacity-50"
          style={{ backgroundColor: OCRE }}
          title="Descargar PDF"
        >
          {descargando
            ? <Loader2 size={18} className="animate-spin" />
            : <Download size={18} />
          }
        </button>
      )}
 
      {/* Recotizar — expiradas o rechazadas */}
      {(cot.estado === 'expirada' || cot.estado === 'rechazada') && (
        <button
          onClick={() => onRecotizar(cot.id)}
          className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all"
          title="Duplicar como nueva cotización"
        >
          <RefreshCw size={18} />
        </button>
      )}
    </div>
  );
}

function TablaCotizaciones({
  cots,
  loading,
  onRecotizar,
}: {
  cots: Cot[];
  loading: boolean;
  onRecotizar: (id: number) => void;
}) {
  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin" size={32} style={{ color: OCRE }} />
        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Cargando...</p>
      </div>
    );
  }
 
  if (cots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText size={48} className="text-slate-300 mb-4" />
        <p className="font-bold text-slate-500 mb-2">No hay cotizaciones</p>
        <p className="text-sm text-slate-400 mb-6">Crea tu primera cotización para verla aquí</p>
        <Link
          href="/portal/cotizaciones/nueva"
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:brightness-110"
          style={{ backgroundColor: OCRE }}
        >
          <Plus size={16} /> Nueva Cotización
        </Link>
      </div>
    );
  }
 
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100">
            {['Documento', 'Emisión', 'Estado', 'Total', ''].map(col => (
              <th
                key={col}
                className={`px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest ${!col ? 'text-right' : ''}`}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {cots.map(c => (
            <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-5 font-black text-slate-900">{c.numero}</td>
              <td className="px-6 py-5 text-sm text-slate-600 font-medium">
                {formatDateLong(c.created_at)}
              </td>
              <td className="px-6 py-5">
                <EstadoBadge estado={c.estado} tipo="cotizacion" />
              </td>
              <td className="px-6 py-5 font-black text-slate-900 text-lg tabular-nums">
                {formatCurrency(c.total)}
              </td>
              <td className="px-6 py-5">
                <AccionesFila cot={c} onRecotizar={onRecotizar} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Página principal ────────────────────────────────────────────────────────
export default function HistorialCotizacionesPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { cliente }  = usePortal();

  const [cots,     setCots]     = useState<Cot[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filtro,   setFiltro]   = useState<EstadoFiltro>('todas');
  const [busqueda, setBusqueda] = useState('');

  // ── Fetch via API route (tiene auth correcta) ───────────────────────────
  const fetchCotizaciones = useCallback(async () => {
    if (!cliente?.id) return;
    setLoading(true);
    try {
      const params = filtro !== 'todas' ? `?estado=${filtro}` : '';
      const res    = await fetch(`/api/portal/cotizaciones${params}`, { cache: 'no-store' });

      if (!res.ok) throw new Error('Error al cargar cotizaciones');

      const { data } = await res.json();

      const dataFormateada: Cot[] = (data ?? []).map((c: any) => ({
        id:           Number(c.id),
        numero:       c.numero ?? `COT-${c.id}`,
        total:        Number(c.total) || 0,
        estado:       c.estado ?? 'borrador',
        created_at:   c.created_at ?? new Date().toISOString(),
        valida_hasta: c.valida_hasta ?? '',
      }));

      setCots(dataFormateada);
    } catch (e) {
      toast.error('No se pudieron cargar las cotizaciones');
    } finally {
      setLoading(false);
    }
  }, [cliente?.id, filtro]);

  useEffect(() => {
    fetchCotizaciones();
  }, [fetchCotizaciones]);

  // Refresco automático al redirigir desde nueva cotización
  useEffect(() => {
    if (searchParams.get('nueva') !== 'true') return;
    const timer = setTimeout(() => {
      fetchCotizaciones();
      router.replace('/portal/cotizaciones');
    }, 800);
    return () => clearTimeout(timer);
  }, [searchParams, fetchCotizaciones, router]);

  // ── Duplicar cotización ─────────────────────────────────────────────────
  const handleRecotizar = async (cotId: number) => {
    const tid = toast.loading('Duplicando cotización...');
    try {
      const res = await fetch(`/api/portal/cotizaciones/${cotId}/duplicar`, { method: 'POST' });
      if (!res.ok) throw new Error();
      const { data } = await res.json();
      toast.success('Cotización duplicada como borrador', { id: tid });
      router.push(`/portal/cotizaciones/${data.id}`);
    } catch {
      toast.error('Error al duplicar la cotización', { id: tid });
    }
  };

  const filtered = cots.filter(
    c => !busqueda || c.numero.toLowerCase().includes(busqueda.toLowerCase()),
  );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 text-white rounded-2xl shadow-lg" style={{ backgroundColor: OCRE }}>
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Historial Comercial</h1>
            <p className="text-sm text-slate-500">Gestione sus cotizaciones y solicitudes B2B.</p>
          </div>
        </div>
        <Link
          href="/portal/cotizaciones/nueva"
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-lg hover:brightness-110 active:scale-95"
          style={{ backgroundColor: OCRE }}
        >
          <Plus size={18} /> Nueva Cotización
        </Link>
      </div>

      {/* Filtros + búsqueda */}
      <BarraFiltros
        filtro={filtro}
        setFiltro={setFiltro}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
      />

      {/* Tabla */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <TablaCotizaciones
          cots={filtered}
          loading={loading}
          onRecotizar={handleRecotizar}
        />
      </div>
    </div>
  );
}