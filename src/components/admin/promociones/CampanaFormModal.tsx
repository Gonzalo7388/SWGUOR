'use client';

import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  campanaConEscalasSchema,
  type CampanaConEscalasForm,
  type CampanaRow,
} from '@/lib/schemas/promociones-ofertas';
import {
  fetchOfertaDetalle,
  fetchPromocionDetalle,
} from '@/lib/helpers/promociones-helpers';
import { EscalaDescuentosSection } from './EscalaDescuentosSection';
import {
  emptyCampanaConEscalasForm,
  mapCampanaDetalleToForm,
} from './campana-form.mapper';
import { toInputDateTimeLocal } from './utils';

type TipoCampana = 'promocion' | 'oferta';

interface CategoriaOpt {
  id: number | string;
  nombre: string;
}

interface ProductoOpt {
  id: number | string;
  nombre: string;
}

interface Props {
  tipo: TipoCampana;
  campana: CampanaRow | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (data: CampanaConEscalasForm) => void;
}

export function CampanaFormModal({ tipo, campana, isSaving, onClose, onSave }: Props) {
  const [form, setForm] = useState<CampanaConEscalasForm>(emptyCampanaConEscalasForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [categorias, setCategorias] = useState<CategoriaOpt[]>([]);
  const [productos, setProductos] = useState<ProductoOpt[]>([]);

  const [prevKey, setPrevKey] = useState<{ id: string | number | undefined; tipo: TipoCampana }>({
    id: campana?.id,
    tipo,
  });

  const titulo = tipo === 'promocion' ? 'promoción' : 'oferta';

  if (campana?.id !== prevKey.id || tipo !== prevKey.tipo) {
    setPrevKey({ id: campana?.id, tipo });
    setForm(campana ? mapCampanaDetalleToForm(campana) : emptyCampanaConEscalasForm());
    setErrors({});
  }

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/admin/categorias', { cache: 'no-store', signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data ?? [];
        setCategorias(
          list.map((c: { id: number; nombre: string }) => ({ id: c.id, nombre: c.nombre })),
        );
      })
      .catch(() => setCategorias([]));

    fetch('/api/admin/productos', { cache: 'no-store', signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data?.productos) ? data.productos : [];
        setProductos(
          list.map((p: { id: number | string; nombre: string }) => ({
            id: p.id,
            nombre: p.nombre,
          })),
        );
      })
      .catch(() => setProductos([]));

    return () => controller.abort();
  }, []);

  useEffect(() => {
    let activo = true;
    if (!campana?.id) return;

    const loadDetalle = async () => {
      setLoadingDetalle(true);
      try {
        const res =
          tipo === 'promocion'
            ? await fetchPromocionDetalle(campana.id)
            : await fetchOfertaDetalle(campana.id);

        if (activo && res.success && res.data) {
          setForm(mapCampanaDetalleToForm(res.data));
        } else if (activo) {
          setForm(mapCampanaDetalleToForm(campana));
        }
      } catch {
        if (activo) setForm(mapCampanaDetalleToForm(campana));
      } finally {
        if (activo) setLoadingDetalle(false);
      }
    };

    loadDetalle();
    return () => {
      activo = false;
    };
  }, [campana, tipo]);

  const setField = <K extends keyof CampanaConEscalasForm>(
    key: K,
    value: CampanaConEscalasForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[String(key)];
      return copy;
    });
  };

  const handleDateChange = (key: 'fecha_inicio' | 'fecha_fin', rawValue: string) => {
    if (!rawValue) {
      if (key === 'fecha_fin') setField('fecha_fin', null);
      return;
    }
    const parsedDate = new Date(rawValue);
    if (!Number.isNaN(parsedDate.getTime())) {
      setField(key, parsedDate.toISOString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = campanaConEscalasSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((err) => {
        const key = String(err.path[0]);
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    onSave({ ...parsed.data, id: campana?.id });
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900 capitalize">
              {campana ? `Editar ${titulo}` : `Nueva ${titulo}`}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Define vigencia, alcance y escalas de descuento en un solo paso
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {loadingDetalle ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-amber-700" />
            <span className="text-xs font-medium text-gray-400">Cargando datos...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nombre *</label>
              <Input
                value={form.nombre}
                onChange={(e) => setField('nombre', e.target.value)}
                className={errors.nombre ? 'border-red-400' : ''}
              />
              {errors.nombre && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.nombre}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Descripción</label>
              <textarea
                className="w-full min-h-[72px] rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 bg-white"
                value={form.descripcion ?? ''}
                onChange={(e) => setField('descripcion', e.target.value || null)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Inicio *</label>
                <Input
                  type="datetime-local"
                  value={toInputDateTimeLocal(form.fecha_inicio)}
                  onChange={(e) => handleDateChange('fecha_inicio', e.target.value)}
                  className={errors.fecha_inicio ? 'border-red-400' : ''}
                />
                {errors.fecha_inicio && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{errors.fecha_inicio}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Fin (opcional)
                </label>
                <Input
                  type="datetime-local"
                  value={toInputDateTimeLocal(form.fecha_fin ?? undefined)}
                  onChange={(e) => handleDateChange('fecha_fin', e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center pt-1">
              <label className="flex items-center gap-2 text-sm text-gray-700 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.activo !== false}
                  onChange={(e) => setField('activo', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-amber-700 focus:ring-amber-600"
                />
                Campaña activa
              </label>
            </div>

            <EscalaDescuentosSection
              alcance={form.alcance}
              categoriaId={form.categoria_id ?? null}
              productoId={form.producto_id ?? null}
              escalas={form.escalas}
              categorias={categorias}
              productos={productos}
              errors={errors}
              onAlcanceChange={(alcance) => {
                setField('alcance', alcance);
                if (alcance !== 'categoria') setField('categoria_id', null);
                if (alcance !== 'producto') setField('producto_id', null);
              }}
              onCategoriaChange={(id) => setField('categoria_id', id)}
              onProductoChange={(id) => setField('producto_id', id)}
              onEscalasChange={(escalas) => setField('escalas', escalas)}
            />

            <div className="flex justify-end gap-3 pt-4 border-t mt-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-amber-700 hover:bg-amber-800 text-white min-w-[100px]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando
                  </>
                ) : (
                  'Guardar'
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
