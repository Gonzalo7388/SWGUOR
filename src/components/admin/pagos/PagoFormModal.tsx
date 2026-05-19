'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, DollarSign, Hash, CreditCard, FileText, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const METODOS_PAGO = [
  { value: 'efectivo',          label: 'Efectivo' },
  { value: 'transferencia_bcp', label: 'Transferencia BCP' },
  { value: 'yape',              label: 'Yape' },
  { value: 'plin',              label: 'Plin' },
  { value: 'visa',              label: 'Visa' },
  { value: 'mastercard',        label: 'Mastercard' },
];

const TIPOS_PAGO = [
  { value: 'adelanto',      label: 'Adelanto' },
  { value: 'cuota',         label: 'Cuota' },
  { value: 'saldo_final',   label: 'Saldo Final' },
  { value: 'pago_completo', label: 'Pago Completo' },
];

interface PagoFormData {
  pedido_id: string;
  monto: string;
  metodo_pago: string;
  tipo: string;
  notas: string;
}

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const EMPTY: PagoFormData = {
  pedido_id: '',
  monto: '',
  metodo_pago: '',
  tipo: 'pago_completo',
  notas: '',
};

export default function PagoFormModal({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState<PagoFormData>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof PagoFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const c = { ...prev }; delete c[field]; return c; });
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.pedido_id.trim()) e.pedido_id = 'El ID del pedido es requerido';
    if (!form.monto.trim() || parseFloat(form.monto) <= 0) e.monto = 'El monto debe ser mayor a 0';
    if (!form.metodo_pago) e.metodo_pago = 'Seleccione un método de pago';
    if (!form.tipo) e.tipo = 'Seleccione el tipo de pago';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);

    try {
      const res = await fetch('/api/admin/pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedido_id: parseInt(form.pedido_id),
          monto: parseFloat(form.monto),
          metodo_pago: form.metodo_pago,
          tipo: form.tipo,
          notas: form.notas || null,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Error al registrar pago');
      }

      toast.success('Pago registrado exitosamente');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? 'Error al registrar pago');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Gradient strip */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-t-2xl" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Registrar Pago</h2>
              <p className="text-xs text-slate-400 mt-0.5">Asocia un pago a un pedido existente</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Pedido ID */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5 mb-1.5">
              <Hash className="w-3.5 h-3.5" /> N.° de Pedido *
            </label>
            <Input
              type="number"
              value={form.pedido_id}
              onChange={e => handleChange('pedido_id', e.target.value)}
              placeholder="Ej: 1042"
              className={errors.pedido_id ? 'border-red-400 focus:ring-red-400' : 'bg-slate-50 border-slate-200 focus:bg-white focus-visible:ring-emerald-400'}
            />
            {errors.pedido_id && <p className="text-xs text-red-500 mt-1">{errors.pedido_id}</p>}
          </div>

          {/* Monto */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5 mb-1.5">
              <DollarSign className="w-3.5 h-3.5" /> Monto (S/) *
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.monto}
              onChange={e => handleChange('monto', e.target.value)}
              placeholder="0.00"
              className={errors.monto ? 'border-red-400 focus:ring-red-400' : 'bg-slate-50 border-slate-200 focus:bg-white focus-visible:ring-emerald-400'}
            />
            {errors.monto && <p className="text-xs text-red-500 mt-1">{errors.monto}</p>}
          </div>

          {/* Método de Pago & Tipo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5 mb-1.5">
                <CreditCard className="w-3.5 h-3.5" /> Método de Pago *
              </label>
              <select
                value={form.metodo_pago}
                onChange={e => handleChange('metodo_pago', e.target.value)}
                className={`w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all cursor-pointer ${
                  errors.metodo_pago
                    ? 'border-red-400 focus:ring-red-400'
                    : 'bg-slate-50 border-slate-200 focus:bg-white focus:ring-emerald-400'
                }`}
              >
                <option value="">Seleccionar…</option>
                {METODOS_PAGO.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              {errors.metodo_pago && <p className="text-xs text-red-500 mt-1">{errors.metodo_pago}</p>}
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5 mb-1.5">
                <FileText className="w-3.5 h-3.5" /> Tipo de Pago *
              </label>
              <select
                value={form.tipo}
                onChange={e => handleChange('tipo', e.target.value)}
                className={`w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all cursor-pointer ${
                  errors.tipo
                    ? 'border-red-400 focus:ring-red-400'
                    : 'bg-slate-50 border-slate-200 focus:bg-white focus:ring-emerald-400'
                }`}
              >
                <option value="">Seleccionar…</option>
                {TIPOS_PAGO.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {errors.tipo && <p className="text-xs text-red-500 mt-1">{errors.tipo}</p>}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5 mb-1.5">
              <StickyNote className="w-3.5 h-3.5" /> Notas (opcional)
            </label>
            <Textarea
              value={form.notas}
              onChange={e => handleChange('notas', e.target.value)}
              placeholder="N.° operación, referencia bancaria, etc."
              className="resize-none bg-slate-50 border-slate-200 focus:bg-white focus-visible:ring-emerald-400"
              rows={2}
            />
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11 rounded-xl font-bold" disabled={isSaving}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11 rounded-xl font-black uppercase text-[11px] tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100 transition-all active:scale-95"
              disabled={isSaving}
            >
              {isSaving ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />Registrando…</>
              ) : 'Registrar Pago'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
