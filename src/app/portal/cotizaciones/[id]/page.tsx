'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { exportCotizacionIndividualToPDF, buildCotizacionPDFData } from '@/lib/utils/export-utils';

import { DetalleCotizacionHeader } from '@/components/portal/cotizaciones/detalle/DetalleCotizacionHeader';
import { DetalleCotizacionProductos } from '@/components/portal/cotizaciones/detalle/DetalleCotizacionProducto';
import { DetalleCotizacionResumen } from '@/components/portal/cotizaciones/detalle/DetalleCotizacionesResumen';

// ── Tipos inferidos de la API ─────────────────────────────────────────────────

interface ProductoInfo {
  nombre: string;
  sku: string;
  imagen: string | null;
}

interface CotizacionItem {
  id: number;
  cantidad: number;
  precio_unitario_snapshot: number;
  subtotal: number;
  color_snapshot: string;
  talla_snapshot: string;
  productos: ProductoInfo | null;
}

interface CotizacionDetalle {
  id: number;
  numero: string;
  estado: string;
  created_at: string;
  valida_hasta: string;
  subtotal: number;
  monto_descuento: number;
  igv: number;
  costo_envio: number | null;
  zona_envio: string | null;
  total: number;
  notas_internas: string | null;
  cotizacion_items: CotizacionItem[];
  clientes: {
    razon_social?: string;
    ruc?: string | number;
    telefono?: string;
    email?: string;
    direccion_fiscal?: string;
  } | null;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function DetalleCotizacionPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [cot, setCot] = useState<CotizacionDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [descargando, setDescargando] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // ── Carga inicial ───────────────────────────────────────────────────────────
  useEffect(() => {
    setIsMounted(true);
    if (!id) return;

    const fetchDetalle = async () => {
      try {
        const res = await fetch(`/api/portal/cotizaciones/${id}`);
        if (!res.ok) throw new Error('No se pudo cargar el detalle');
        const { data } = await res.json();
        setCot(data);
      } catch (e) {
        console.error(e);
        toast.error('No se pudo cargar la cotización');
        router.push('/portal/cotizaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchDetalle();
  }, [id, router]);

  // ── Exportar PDF ────────────────────────────────────────────────────────────
  const handleDescargarPDF = async () => {
    if (!cot) return;
    setDescargando(true);
    const tid = toast.loading('Generando PDF...');
    try {
      const pdfData = buildCotizacionPDFData(
        {
          ...cot,
          costo_envio: cot.costo_envio ?? undefined,
          zona_envio: cot.zona_envio ?? undefined,
          notas_internas: cot.notas_internas ?? undefined,
        },
        cot.cotizacion_items,
      );
      await exportCotizacionIndividualToPDF(pdfData);
      toast.success('PDF descargado', { id: tid });
    } catch {
      toast.error('Error al generar PDF', { id: tid });
    } finally {
      setDescargando(false);
    }
  };

  // ── Guards ──────────────────────────────────────────────────────────────────
  if (!isMounted) return null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="animate-spin text-amber-500" size={40} />
        <p className="text-sm font-bold uppercase tracking-widest text-slate-400">
          Obteniendo detalles...
        </p>
      </div>
    );
  }

  if (!cot) return null;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 animate-in fade-in duration-300">

      {/* Header con acciones */}
      <DetalleCotizacionHeader
        cotizacionId={cot.id}
        numero={cot.numero}
        estado={cot.estado}
        fechaCreacion={cot.created_at}
        total={cot.total}
        clienteNombre={cot.clientes?.razon_social ?? 'Cliente General'}
        clienteRUC={cot.clientes?.ruc ? String(cot.clientes.ruc) : undefined}
        onVolver={() => router.push('/portal/cotizaciones')}
        onDescargarPDF={handleDescargarPDF}
        descargandoPDF={descargando}
        onConvertida={(_pedidoId, numeroPedido) => {
          toast.success(`Pedido ${numeroPedido} creado. Redirigiendo...`);
          router.push('/portal/pedidos');
        }}
        onRecotizada={(nuevaId) => {
          router.push(`/portal/cotizaciones/nueva?recotizar=${nuevaId}`);
        }}
      />

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Tabla de productos — ocupa 2/3 */}
        <div className="lg:col-span-2">
          <DetalleCotizacionProductos
            numero={cot.numero}
            estado={cot.estado}
            fechaCreacion={cot.created_at}
            items={cot.cotizacion_items}
          />
        </div>

        {/* Resumen financiero — ocupa 1/3 */}
        <div className="lg:col-span-1">
          <DetalleCotizacionResumen
            subtotal={cot.subtotal}
            descuento={cot.monto_descuento}
            igv={cot.igv}
            costoEnvio={cot.costo_envio}
            total={cot.total}
            notasInternas={cot.notas_internas}
          />
        </div>

      </div>
    </div>
  );
}