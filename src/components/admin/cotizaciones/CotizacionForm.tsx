'use client';

import React, { useId, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
} from '@/components/ui/form';

import {
  createCotizacionSchema,
  type CreateCotizacionInput,
} from '@/lib/schemas/cotizaciones';
import { createCotizacion } from '../../../app/admin/Panel-Administrativo/cotizaciones/actions';
import { DatosGeneralesSection } from './DatosGeneralesSection';
import { ItemsSection } from './ItemsSection';
import { ResumenFinanciero } from './ResumenFinanciero';

interface CotizacionFormProps {
  clientes: { id: number; razon_social: string | null }[];
  productos: { id: number; nombre: string; sku: string }[];
}

export function CotizacionForm({ clientes, productos }: CotizacionFormProps) {
  const router = useRouter();
  const formId = useId();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateCotizacionInput>({
    resolver: zodResolver(createCotizacionSchema),
    defaultValues: {
      cliente_id: '',
      nombre_cliente_manual: '',
      moneda: 'PEN',
      valida_hasta: new Date().toISOString().split('T')[0],
      tasa_impuesto: 'IGV',
      empresa: 'Modas y Estilos Guor S.a.C.',
      contacto: '',
      tipo_destino: '',
      vendedor: '',
      tipo_venta: '',
      unidad_negocio: '',
      forma_pago: '',
      metodo: '',
      direccion_entrega: '',
      direccion_factura: '',
      condicion_entrega: '',
      tiempo_entrega: '',
      tipo_operacion: 'Venta interna',
      idioma: 'Español',
      referencia: '',
      probabilidad: '',
      fecha_cierre: '',
      notas_internas: '',
      items: [],
    },
  });

  // ═══════════════════════════════════════════════════════
  // CÁLCULO EN TIEMPO REAL DE TOTALES
  // ═══════════════════════════════════════════════════════
  const resumenFinanciero = useMemo(() => {
    const items = form.getValues('items') ?? [];

    const subtotalGeneral = items.reduce(
      (sum, item) => sum + (item.cantidad ?? 0) * (item.precio_unitario ?? 0),
      0,
    );

    const tipoOperacion = form.getValues('tipo_operacion');
    const tasaImpuesto = form.getValues('tasa_impuesto');
    const esExportacion = tipoOperacion === 'Exportación';
    const tasa = esExportacion ? 0 : tasaImpuesto === 'IGV' ? 0.18 : 0;

    const igv = subtotalGeneral * tasa;
    const total = subtotalGeneral + igv;

    return {
      subtotalGeneral,
      igv,
      total,
      tasa,
      esExportacion,
    };
  }, [
    form.watch('items'),
    form.watch('tipo_operacion'),
    form.watch('tasa_impuesto'),
  ]);

  const moneda = form.watch('moneda') ?? 'PEN';
  const simboloMoneda = moneda === 'USD' ? '$' : moneda === 'EUR' ? '€' : 'S/';

  // ═══════════════════════════════════════════════════════
  // SUBMIT CON SERIALIZACIÓN DE METADATA ERP
  // ═══════════════════════════════════════════════════════
  const onSubmit = async (data: CreateCotizacionInput) => {
    try {
      setIsSubmitting(true);

      const {
        empresa,
        contacto,
        tipo_destino,
        vendedor,
        tipo_venta,
        unidad_negocio,
        forma_pago,
        metodo,
        direccion_entrega,
        direccion_factura,
        condicion_entrega,
        tiempo_entrega,
        tasa_impuesto,
        tipo_operacion,
        idioma,
        referencia,
        probabilidad,
        fecha_cierre,
        cliente_id,
        valida_hasta,
        moneda,
        notas_internas,
        items,
      } = data;

      const erpMetadata = JSON.stringify({
        empresa: empresa ?? null,
        contacto: contacto ?? null,
        tipo_destino: tipo_destino ?? null,
        vendedor: vendedor ?? null,
        tipo_venta: tipo_venta ?? null,
        unidad_negocio: unidad_negocio ?? null,
        forma_pago: forma_pago ?? null,
        metodo: metodo ?? null,
        direccion_entrega: direccion_entrega ?? null,
        direccion_factura: direccion_factura ?? null,
        condicion_entrega: condicion_entrega ?? null,
        tiempo_entrega: tiempo_entrega ?? null,
        tasa_impuesto: tasa_impuesto ?? 'IGV',
        tipo_operacion: tipo_operacion ?? null,
        idioma: idioma ?? null,
        referencia: referencia ?? null,
        probabilidad: probabilidad ?? null,
        fecha_cierre: fecha_cierre ?? null,
      });

      const notasCompletas = notas_internas
        ? `${notas_internas}\n\n[ERP_META]: ${erpMetadata}`
        : `[ERP_META]: ${erpMetadata}`;

      const payload = {
        cliente_id,
        valida_hasta,
        moneda,
        notas_internas: notasCompletas,
        items,
      };

      const result = await createCotizacion(payload as any);

      if (!result.success) {
        toast.error(result.error ?? 'Error al crear la cotización');
        return;
      }

      toast.success(
        `Cotización ${result.data?.cotizacion_id} creada exitosamente`,
      );
      router.push('/admin/Panel-Administrativo/cotizaciones');
    } catch {
      toast.error('Error inesperado al crear la cotización');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        id={`${formId}-cotizacion-form`}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* ── Datos Generales ── */}
        <DatosGeneralesSection form={form} clientes={clientes} />

        {/* ── Productos / Ítems ── */}
        <ItemsSection
          form={form}
          productos={productos}
          simboloMoneda={simboloMoneda}
        />

        {/* ── Resumen Financiero ── */}
        <ResumenFinanciero
          subtotalGeneral={resumenFinanciero.subtotalGeneral}
          igv={resumenFinanciero.igv}
          total={resumenFinanciero.total}
          tasa={resumenFinanciero.tasa}
          esExportacion={resumenFinanciero.esExportacion}
          simboloMoneda={simboloMoneda}
        />

        {/* ── Botones de Acción ── */}
        <div className="flex items-center justify-end gap-4 sticky bottom-6 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-lg">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="h-11 px-6 font-bold uppercase rounded-xl"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form={`${formId}-cotizacion-form`}
            disabled={isSubmitting}
            className="h-11 px-8 bg-slate-900 hover:bg-slate-800 font-bold uppercase rounded-xl gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <Save size={16} />
                Crear Cotización
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
