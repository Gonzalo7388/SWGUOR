'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Download, RefreshCw, Eye, Edit3, FileText, Search, Loader2 } from 'lucide-react';
import { usePortal } from '../_contexts/PortalContext';
import { EstadoBadge } from '@/components/portal/EstadoBadge';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { formatCurrency, formatDateLong } from '@/lib/helpers/format-helpers';
import { toast } from 'sonner';

const BRAND_COLORS = {
  naranjaClaro: '#fff4e2',
  naranjaPastel: '#fbddd3',
  naranjaApagado: '#e4c28a',
  ocre: '#b5854b',
  negroFondo: '#231e1d'
};

type EstadoFiltro = 'todas' | 'borrador' | 'enviada' | 'aprobada' | 'rechazada' | 'expirada' | 'convertida';

interface Cot {
  id: number; 
  numero: string; 
  total: number; 
  estado: string;
  created_at: string; 
  valida_hasta: string;
}

// Definimos la interfaz para la respuesta de la DB para evitar 'as any'
interface RawCotDB {
  id: number;
  numero: string | null;
  total: number | null;
  estado: string | null;
  created_at: string | null;
  valida_hasta: string | null;
}

const FILTROS: { value: EstadoFiltro; label: string }[] = [
  { value: 'todas',      label: 'Todas' },
  { value: 'borrador',   label: 'Borradores' },
  { value: 'enviada',    label: 'En Revisión' },
  { value: 'aprobada',   label: 'Aceptadas'   },
  { value: 'convertida', label: 'En Orden' },
];

export default function HistorialCotizacionesPage() {
  const router = useRouter();
  const { cliente } = usePortal();
  const [cots, setCots] = useState<Cot[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<EstadoFiltro>('todas');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    if (!cliente?.id) return;
    const fetchCotizaciones = async () => {
      setLoading(true);
      const supabase = getSupabaseBrowserClient();
      
      let query = supabase
        .from('cotizaciones')
        .select('id, numero, total, estado, created_at, valida_hasta')
        .eq('cliente_id', cliente.id)
        .order('created_at', { ascending: false });

      if (filtro !== 'todas') query = query.eq('estado', filtro);

      const { data, error } = await query;

      if (!error && data) {
        const dataFormateada: Cot[] = (data as RawCotDB[]).map(c => ({
          id: c.id,
          numero: c.numero ?? `COT-${c.id}`,
          total: Number(c.total) || 0,
          estado: c.estado ?? 'borrador',
          created_at: c.created_at ?? new Date().toISOString(),
          valida_hasta: c.valida_hasta ?? ''
        }));
        setCots(dataFormateada);
      }
      setLoading(false);
    };
    fetchCotizaciones();
  }, [cliente, filtro]);

  const handleRecotizar = async (cotId: number) => {
    const loadingToast = toast.loading('Duplicando cotización...');
    try {
      const res = await fetch(`/api/portal/cotizaciones/${cotId}/duplicar`, { method: 'POST' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success('Cotización duplicada como borrador', { id: loadingToast });
      router.push(`/portal/cotizaciones/${data.id}`);
    } catch (error) {
      toast.error('Error al duplicar la cotización.', { id: loadingToast });
    }
  };

  const filtered = cots.filter(c =>
    !busqueda || c.numero.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 text-white rounded-2xl shadow-lg" style={{ backgroundColor: BRAND_COLORS.ocre }}>
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
          style={{ backgroundColor: BRAND_COLORS.ocre }}
        >
          <Plus size={18} /> Nueva Cotización
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          {FILTROS.map(f => (
            <button
              key={f.value}
              onClick={() => setFiltro(f.value)}
              className="px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all border"
              style={{
                backgroundColor: filtro === f.value ? BRAND_COLORS.negroFondo : '#f8fafc',
                color: filtro === f.value ? 'white' : '#64748b',
                borderColor: filtro === f.value ? BRAND_COLORS.negroFondo : '#f1f5f9'
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
            className="h-11 w-full lg:w-72 border border-slate-200 rounded-xl pl-10 pr-4 text-sm focus:ring-4 focus:ring-ocre/10 outline-none transition-all"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-ocre" size={32} style={{ color: BRAND_COLORS.ocre }} />
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Cargando...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Documento</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Emisión</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5 font-black text-slate-900">{c.numero}</td>
                    <td className="px-6 py-5 text-sm text-slate-600 font-medium">{formatDateLong(c.created_at)}</td>
                    <td className="px-6 py-5">
                      <EstadoBadge estado={c.estado} tipo="cotizacion" />
                    </td>
                    <td className="px-6 py-5 font-black text-slate-900 text-lg">{formatCurrency(c.total)}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/portal/cotizaciones/${c.id}`}
                          className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-all"
                        >
                          <Eye size={18} />
                        </Link>

                        {c.estado === 'borrador' && (
                          <Link 
                            href={`/portal/cotizaciones/${c.id}/editar`}
                            className="p-2.5 text-slate-400 hover:text-white rounded-xl transition-all hover:bg-[var(--bg-hover)]"
                            style={{ '--bg-hover': BRAND_COLORS.ocre } as React.CSSProperties}
                          >
                            <Edit3 size={18} />
                          </Link>
                        )}

                        {(c.estado === 'aprobada' || c.estado === 'convertida') && (
                          <a 
                            href={`/api/portal/cotizaciones/${c.id}/pdf`} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 text-slate-400 hover:text-white hover:bg-red-500 rounded-xl transition-all"
                          >
                            <Download size={18} />
                          </a>
                        )}

                        {(c.estado === 'expirada' || c.estado === 'rechazada') && (
                          <button
                            onClick={() => handleRecotizar(c.id)}
                            className="p-2.5 text-slate-400 hover:text-white rounded-xl transition-all hover:bg-[var(--bg-hover)]"
                            style={{ '--bg-hover': BRAND_COLORS.ocre } as React.CSSProperties}
                          >
                            <RefreshCw size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}