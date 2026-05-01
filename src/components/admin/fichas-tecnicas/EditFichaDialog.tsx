"use client";

import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast }   from "sonner";
import { FilePen, X } from "lucide-react";

interface Props {
  isOpen:    boolean;
  ficha:     any;
  onClose:   () => void;
  onSuccess: () => void;
}

const ESTADOS = [
  { value: "borrador", label: "Borrador",  dot: "bg-slate-400"   },
  { value: "activo",   label: "Activo",    dot: "bg-emerald-500" },
  { value: "revision", label: "Revisión",  dot: "bg-amber-400"   },
  { value: "obsoleto", label: "Obsoleto",  dot: "bg-red-500"     },
];

export default function EditFichaDialog({ isOpen, ficha, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    version:               "",
    estado:                "borrador",
    sam_total:             "",
    costo_estimado:        "",
    descripcion_detallada: "",
    ficha_url:             "",
    imagen_geometral:      "",
  });

  useEffect(() => {
    if (ficha) setForm({
      version:               ficha.version               ?? "",
      estado:                ficha.estado                ?? "borrador",
      sam_total:             ficha.sam_total      != null ? String(ficha.sam_total)      : "",
      costo_estimado:        ficha.costo_estimado != null ? String(ficha.costo_estimado) : "",
      descripcion_detallada: ficha.descripcion_detallada ?? "",
      ficha_url:             ficha.ficha_url             ?? "",
      imagen_geometral:      ficha.imagen_geometral      ?? "",
    });
  }, [ficha]);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/fichas-tecnicas/${ficha.id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version:               form.version               || undefined,
          estado:                form.estado,
          sam_total:             form.sam_total      ? Number(form.sam_total)      : undefined,
          costo_estimado:        form.costo_estimado ? Number(form.costo_estimado) : undefined,
          descripcion_detallada: form.descripcion_detallada || undefined,
          ficha_url:             form.ficha_url             || undefined,
          imagen_geometral:      form.imagen_geometral      || undefined,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? "Error al guardar");
      toast.success("Ficha técnica actualizada");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message ?? "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const estadoActual = ESTADOS.find((e) => e.value === form.estado);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 border border-slate-200 shadow-xl rounded-2xl overflow-hidden [&>button]:hidden">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-50 border-[1.5px] border-pink-100 rounded-xl flex items-center justify-center shrink-0">
              <FilePen className="w-4 h-4 text-pink-600" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-800 leading-tight">
                Editar Ficha Técnica
              </DialogTitle>
              <DialogDescription className="text-[11px] text-slate-400 mt-0.5">
                {ficha?.productos?.nombre
                  ? `Modificando ficha de ${ficha.productos.nombre}`
                  : "Modifica los datos de la ficha técnica"}
              </DialogDescription>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Formulario ─────────────────────────────────────── */}
        <form id="edit-ficha-form" onSubmit={handleSubmit}>

          {/* Sección: Identificación */}
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
            <SectionTitle>Identificación</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Versión">
                <Input
                  value={form.version}
                  onChange={(e) => set("version", e.target.value)}
                  placeholder="1.0"
                  className={inputCls}
                />
              </Field>
              <Field label="Estado">
                <Select value={form.estado} onValueChange={(v) => set("estado", v)}>
                  <SelectTrigger className={inputCls + " cursor-pointer"}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${estadoActual?.dot ?? "bg-slate-400"}`} />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS.map((e) => (
                      <SelectItem key={e.value} value={e.value}>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${e.dot}`} />
                          {e.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>

          {/* Sección: Costos y Tiempos */}
          <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100">
            <SectionTitle>Costos y tiempos</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <Field label="SAM Total (min)">
                <Input
                  type="number"
                  value={form.sam_total}
                  onChange={(e) => set("sam_total", e.target.value)}
                  placeholder="0"
                  className={inputCls}
                />
              </Field>
              <Field label="Costo Estimado (S/)">
                <Input
                  type="number"
                  value={form.costo_estimado}
                  onChange={(e) => set("costo_estimado", e.target.value)}
                  placeholder="0.00"
                  className={inputCls}
                />
              </Field>
            </div>
          </div>

          {/* Sección: Descripción */}
          <div className="bg-white px-6 py-4 border-b border-slate-100">
            <SectionTitle>Descripción</SectionTitle>
            <Field label="Descripción Detallada">
              <Textarea
                value={form.descripcion_detallada}
                onChange={(e) => set("descripcion_detallada", e.target.value)}
                placeholder="Descripción del producto..."
                rows={3}
                className={inputCls + " resize-none h-auto"}
              />
            </Field>
          </div>

          {/* Sección: Recursos */}
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
            <SectionTitle>Recursos</SectionTitle>
            <div className="space-y-3">
              <Field label="URL Ficha PDF">
                <Input
                  value={form.ficha_url}
                  onChange={(e) => set("ficha_url", e.target.value)}
                  placeholder="https://..."
                  className={inputCls}
                />
              </Field>
              <Field label="URL Imagen Geometral">
                <Input
                  value={form.imagen_geometral}
                  onChange={(e) => set("imagen_geometral", e.target.value)}
                  placeholder="https://..."
                  className={inputCls}
                />
              </Field>
            </div>
          </div>

          {/* ── Footer ───────────────────────────────────────── */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 bg-white">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="text-slate-500 hover:bg-slate-100"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="edit-ficha-form"
              disabled={loading}
              className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-7 shadow-sm shadow-pink-200 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando…
                </span>
              ) : "Guardar cambios"}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Helpers ──────────────────────────────────────────────────
const inputCls = "bg-white border-slate-200 focus:bg-white focus-visible:ring-pink-400 transition-all h-9 text-sm";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-3 h-0.5 bg-pink-500 rounded-full" />
      <span className="text-[10px] font-black text-pink-600 uppercase tracking-widest">
        {children}
      </span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
        {label}
      </Label>
      {children}
    </div>
  );
}