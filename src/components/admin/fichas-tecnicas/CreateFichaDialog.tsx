"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast }    from "sonner";
import { FileText, Hash, Tag, Clock, DollarSign, AlignLeft, X } from "lucide-react";

interface Props {
  isOpen:    boolean;
  onClose:   () => void;
  onSuccess: () => void;
}

const INITIAL = {
  producto_id:           "",
  version:               "1.0",
  descripcion_detallada: "",
  sam_total:             "",
  costo_estimado:        "",
};

export default function CreateFichaDialog({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState(INITIAL);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleClose = () => { setForm(INITIAL); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.producto_id.trim()) { toast.error("El ID de producto es requerido"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/fichas-tecnicas", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          producto_id:           form.producto_id,
          version:               form.version               || "1.0",
          descripcion_detallada: form.descripcion_detallada || undefined,
          sam_total:             form.sam_total      ? Number(form.sam_total)      : undefined,
          costo_estimado:        form.costo_estimado ? Number(form.costo_estimado) : undefined,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? "Error al crear ficha");
      toast.success("Ficha técnica creada");
      handleClose();
      onSuccess();
    } catch (err: any) {
      toast.error(err.message ?? "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
    
        {/* Franja superior */}
        <div className="h-1.5 bg-gradient-to-r from-pink-500 via-pink-600 to-rose-600 w-full" />

        {/* Header */}
        <div className="px-6 pt-5 pb-0 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-pink-50 rounded-xl border border-pink-100 shrink-0">
              <FileText className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-800 tracking-tight leading-tight">
                Nueva Ficha Técnica
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                Registra una ficha técnica vinculada a un producto.
              </DialogDescription>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form id="create-ficha-form" onSubmit={handleSubmit} className="px-6 pt-5 pb-2 space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <Field icon={<Hash className="w-3.5 h-3.5" />} label="ID Producto *">
              <Input
                value={form.producto_id}
                onChange={(e) => set("producto_id", e.target.value)}
                placeholder="Ej: 10"
                required
                className={inputCls}
              />
            </Field>
            <Field icon={<Tag className="w-3.5 h-3.5" />} label="Versión">
              <Input
                value={form.version}
                onChange={(e) => set("version", e.target.value)}
                placeholder="1.0"
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field icon={<Clock className="w-3.5 h-3.5" />} label="SAM Total (min)">
              <Input
                type="number"
                value={form.sam_total}
                onChange={(e) => set("sam_total", e.target.value)}
                placeholder="0"
                className={inputCls}
              />
            </Field>
            <Field icon={<DollarSign className="w-3.5 h-3.5" />} label="Costo Estimado (S/)">
              <Input
                type="number"
                value={form.costo_estimado}
                onChange={(e) => set("costo_estimado", e.target.value)}
                placeholder="0.00"
                className={inputCls}
              />
            </Field>
          </div>

          <Field icon={<AlignLeft className="w-3.5 h-3.5" />} label="Descripción Detallada">
            <Textarea
              value={form.descripcion_detallada}
              onChange={(e) => set("descripcion_detallada", e.target.value)}
              placeholder="Descripción del producto..."
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </Field>

        </form>

        {/* Footer */}
        <div className="px-6 py-4 mt-2 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
            className="text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="create-ficha-form"
            disabled={loading}
            className="bg-pink-600 hover:bg-pink-700 text-white shadow-md shadow-pink-100 px-7 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creando…
              </span>
            ) : "Crear ficha"}
          </Button>
        </div>

    </Dialog>
  );
}

// ─── Helpers ──────────────────────────────────────────────────
const inputCls = "bg-slate-50 border-slate-200 focus:bg-white focus-visible:ring-pink-400 transition-all h-10 text-sm";

function Field({ icon, label, children }: {
  icon: React.ReactNode; label: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
        {icon}{label}
      </Label>
      {children}
    </div>
  );
}