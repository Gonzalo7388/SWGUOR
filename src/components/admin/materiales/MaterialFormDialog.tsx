'use client';

import { useEffect, useState } from 'react';
import { Layers } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TIPOS_MATERIAL, LISTA_TIPOS_MATERIAL } from '@/lib/constants/materiales';
import { UNIDADES_MEDIDA } from '@/lib/constants/estados';
import { fetchProveedores } from '@/lib/helpers/proveedores-helpers';
import type { MaterialCompraRow } from '@/lib/helpers/materiales-compras-helpers';
import type { TipoMaterial, UnidadMedida } from '@prisma/client';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<{ success?: boolean; error?: string }>;
  material?: MaterialCompraRow | null;
  isSaving?: boolean;
}

const UNIDADES = Object.keys(UNIDADES_MEDIDA) as UnidadMedida[];

const fieldInputClass =
  'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 h-11 focus:bg-white';
const fieldLabelClass = 'text-xs font-semibold text-slate-600 uppercase tracking-wide';
const fieldSelectClass =
  'w-full h-11 bg-slate-50 border-slate-200 text-slate-900 [&_svg]:text-slate-500';
const selectContentClass = 'bg-white text-slate-900 border-slate-200';
const selectItemClass = 'text-slate-900 focus:bg-violet-50 focus:text-slate-900';

export default function MaterialFormDialog({ isOpen, onClose, onSave, material, isSaving }: Props) {
  const isEdit = !!material;
  const [proveedores, setProveedores] = useState<{ id: string; razon_social: string }[]>([]);
  const [form, setForm] = useState({
    nombre: '',
    tipo: 'plano' as TipoMaterial,
    descripcion: '',
    composicion: '',
    gramaje: '',
    ancho_total: '',
    ancho_util: '',
    color: '',
    codigo_color: '',
    unidad_medida: 'metros' as UnidadMedida,
    stock_actual: '0',
    stock_minimo: '10',
    precio_unitario: '',
    proveedor_id: '',
    ubicacion_almacen: '',
  });

  useEffect(() => {
    if (!isOpen) return;
    fetchProveedores(1, 200, '', 'activo')
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setProveedores(list as { id: string; razon_social: string }[]);
      })
      .catch(() => toast.error('Error al cargar proveedores'));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (material) {
      setForm({
        nombre: material.nombre,
        tipo: material.tipo as TipoMaterial,
        descripcion: material.descripcion ?? '',
        composicion: material.composicion ?? '',
        gramaje: material.gramaje != null ? String(material.gramaje) : '',
        ancho_total: '',
        ancho_util: '',
        color: material.color ?? '',
        codigo_color: '',
        unidad_medida: material.unidad_medida as UnidadMedida,
        stock_actual: String(material.stock_actual),
        stock_minimo: String(material.stock_minimo),
        precio_unitario: material.precio_unitario != null ? String(material.precio_unitario) : '',
        proveedor_id: material.proveedor_id ? String(material.proveedor_id) : '',
        ubicacion_almacen: '',
      });
    } else {
      setForm({
        nombre: '',
        tipo: 'plano',
        descripcion: '',
        composicion: '',
        gramaje: '',
        ancho_total: '',
        ancho_util: '',
        color: '',
        codigo_color: '',
        unidad_medida: 'metros',
        stock_actual: '0',
        stock_minimo: '10',
        precio_unitario: '',
        proveedor_id: '',
        ubicacion_almacen: '',
      });
    }
  }, [isOpen, material]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, unknown> = {
      nombre: form.nombre.trim(),
      tipo: form.tipo,
      descripcion: form.descripcion.trim() || null,
      composicion: form.composicion.trim() || null,
      gramaje: form.gramaje ? parseInt(form.gramaje, 10) : null,
      ancho_total: form.ancho_total ? parseFloat(form.ancho_total) : null,
      ancho_util: form.ancho_util ? parseFloat(form.ancho_util) : null,
      color: form.color.trim() || null,
      codigo_color: form.codigo_color.trim() || null,
      unidad_medida: form.unidad_medida,
      stock_minimo: parseFloat(form.stock_minimo || '0'),
      precio_unitario: form.precio_unitario ? parseFloat(form.precio_unitario) : null,
      proveedor_id: form.proveedor_id || null,
      ubicacion_almacen: form.ubicacion_almacen.trim() || null,
    };

    if (!isEdit) {
      payload.stock_actual = parseFloat(form.stock_actual || '0');
    }

    const res = await onSave(payload);
    if (res?.success !== false && !res?.error) {
      onClose();
    } else if (res?.error) {
      toast.error(res.error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] border border-slate-200 shadow-2xl bg-white text-slate-900 p-0 overflow-hidden max-h-[90vh] [&_[data-slot=dialog-close]]:text-slate-500 [&_[data-slot=dialog-close]]:hover:text-slate-800">
        <div className="h-2 bg-violet-500 w-full" />
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8px)] bg-white">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-50 rounded-lg">
                <Layers className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900">
                  {isEdit ? 'Editar material' : 'Nuevo material'}
                </DialogTitle>
                <DialogDescription className="text-slate-500">
                  Telas y materiales vinculados a órdenes de compra.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className={fieldLabelClass}>Nombre</Label>
              <Input
                className={fieldInputClass}
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
                disabled={isSaving}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={fieldLabelClass}>Tipo</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v as TipoMaterial })} disabled={isSaving}>
                  <SelectTrigger className={fieldSelectClass}><SelectValue /></SelectTrigger>
                  <SelectContent className={selectContentClass}>
                    {LISTA_TIPOS_MATERIAL.map((k) => (
                      <SelectItem key={k} value={k} className={selectItemClass}>{TIPOS_MATERIAL[k].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className={fieldLabelClass}>Unidad de medida</Label>
                <Select
                  value={form.unidad_medida}
                  onValueChange={(v) => setForm({ ...form, unidad_medida: v as UnidadMedida })}
                  disabled={isSaving}
                >
                  <SelectTrigger className={fieldSelectClass}><SelectValue /></SelectTrigger>
                  <SelectContent className={selectContentClass}>
                    {UNIDADES.map((k) => (
                      <SelectItem key={k} value={k} className={selectItemClass}>{UNIDADES_MEDIDA[k].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={fieldLabelClass}>Composición</Label>
                <Input
                  className={fieldInputClass}
                  value={form.composicion}
                  onChange={(e) => setForm({ ...form, composicion: e.target.value })}
                  placeholder="Ej: 100% algodón"
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label className={fieldLabelClass}>Gramaje (g/m²)</Label>
                <Input
                  className={fieldInputClass}
                  type="number"
                  value={form.gramaje}
                  onChange={(e) => setForm({ ...form, gramaje: e.target.value })}
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={fieldLabelClass}>Color</Label>
                <Input className={fieldInputClass} value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} disabled={isSaving} />
              </div>
              <div className="space-y-2">
                <Label className={fieldLabelClass}>Precio referencial (S/)</Label>
                <Input
                  className={fieldInputClass}
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.precio_unitario}
                  onChange={(e) => setForm({ ...form, precio_unitario: e.target.value })}
                  disabled={isSaving}
                />
              </div>
            </div>

            {!isEdit && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={fieldLabelClass}>Stock inicial</Label>
                  <Input
                    className={fieldInputClass}
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.stock_actual}
                    onChange={(e) => setForm({ ...form, stock_actual: e.target.value })}
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={fieldLabelClass}>Stock mínimo</Label>
                  <Input
                    className={fieldInputClass}
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.stock_minimo}
                    onChange={(e) => setForm({ ...form, stock_minimo: e.target.value })}
                    disabled={isSaving}
                  />
                </div>
              </div>
            )}

            {isEdit && (
              <div className="space-y-2">
                <Label className={fieldLabelClass}>Stock mínimo</Label>
                <Input
                  className={fieldInputClass}
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.stock_minimo}
                  onChange={(e) => setForm({ ...form, stock_minimo: e.target.value })}
                  disabled={isSaving}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className={fieldLabelClass}>Proveedor habitual</Label>
              <Select
                value={form.proveedor_id || 'none'}
                onValueChange={(v) => setForm({ ...form, proveedor_id: v === 'none' ? '' : v })}
                disabled={isSaving}
              >
                <SelectTrigger className={fieldSelectClass}><SelectValue placeholder="Opcional" /></SelectTrigger>
                <SelectContent className={selectContentClass}>
                  <SelectItem value="none" className={selectItemClass}>Sin proveedor</SelectItem>
                  {proveedores.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)} className={selectItemClass}>
                      {p.razon_social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100 gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSaving}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-violet-600 hover:bg-violet-700 text-white">
                {isSaving ? 'Guardando...' : isEdit ? 'Actualizar' : 'Registrar'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
