"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
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

interface Props {
  isOpen:    boolean;
  ficha:     any;
  onClose:   () => void;
  onSuccess: () => void;
}

const ESTADOS = [
  { value: "borrador", label: "Borrador", dot: "bg-slate-400" },
  { value: "activo",   label: "Activo",   dot: "bg-emerald-500" },
  { value: "revision", label: "Revisión", dot: "bg-amber-400" },
  { value: "obsoleto", label: "Obsoleto", dot: "bg-red-500" },
] as const;

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
      <DialogContent className="sm:max-w-[460px] p-0 gap-0 overflow-hidden rounded-lg border border-slate-200 shadow-xl [&>button]:hidden dark:border-slate-800">

        {/* ── Header oscuro ─────────────────────────────────── */}
        <div className="bg-slate-900 flex flex-col">
          <div className="flex items-center justify-between px-[18px] pt-[14px]">
            <div className="flex items-center gap-2">
              <span className="bg-pink-700 text-white text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-[3px]">
                Fichas técnicas
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {ficha?.codigo ?? "FT-2024-001"}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-6 h-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[4px] flex items-center justify-center text-slate-400 hover:text-slate-300 transition-colors text-[13px] leading-none"
            >
              ×
            </button>
          </div>
          <div className="px-[18px] pt-2.5 pb-3.5">
            <DialogTitle className="text-[15px] font-semibold text-slate-50 tracking-tight">
              Editar ficha técnica
            </DialogTitle>
            <DialogDescription className="text-[11px] text-slate-500 mt-0.5">
              {ficha?.productos?.nombre
                ? <>Modificando ficha de <span className="text-slate-400 italic">{ficha.productos.nombre}</span></>
                : "Modifica los datos de la ficha técnica"}
            </DialogDescription>
          </div>
          <div className="flex border-t border-white/[0.07] mt-3">
            <div className={tabCls(true)}>Datos generales</div>
            <div className={tabCls(false)}>Medidas</div>
            <div className={tabCls(false)}>Materiales</div>
          </div>
        </div>

        {/* ── Formulario ─────────────────────────────────────── */}
        <form id="edit-ficha-form" onSubmit={handleSubmit}>

          {/* 01 · Identificación */}
          <Section num="01" title="Identificación">
            <div className="grid grid-cols-2 gap-2.5">
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
          </Section>

          {/* 02 · Costos y tiempos */}
          <Section num="02" title="Costos y tiempos">
            <div className="grid grid-cols-2 gap-2.5 mb-2.5">
              <Field label="SAM total (min)">
                <Input
                  type="number"
                  value={form.sam_total}
                  onChange={(e) => set("sam_total", e.target.value)}
                  placeholder="0"
                  className={inputCls}
                />
              </Field>
              <Field label="Costo estimado (S/)">
                <Input
                  type="number"
                  value={form.costo_estimado}
                  onChange={(e) => set("costo_estimado", e.target.value)}
                  placeholder="0.00"
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Descripción detallada">
              <Textarea
                value={form.descripcion_detallada}
                onChange={(e) => set("descripcion_detallada", e.target.value)}
                placeholder="Descripción del producto..."
                rows={3}
                className={inputCls + " resize-none h-auto"}
              />
            </Field>
          </Section>

          {/* 03 · Recursos */}
          <Section num="03" title="Recursos" last>
            <div className="space-y-2.5">
              <Field label="URL ficha PDF">
                <Input
                  value={form.ficha_url}
                  onChange={(e) => set("ficha_url", e.target.value)}
                  placeholder="https://..."
                  className={inputCls}
                />
              </Field>
              <Field label="URL imagen geometral">
                <Input
                  value={form.imagen_geometral}
                  onChange={(e) => set("imagen_geometral", e.target.value)}
                  placeholder="https://..."
                  className={inputCls}
                />
              </Field>
            </div>
          </Section>

          {/* ── Footer ───────────────────────────────────────── */}
          <div className="flex items-center justify-between px-[18px] py-2.5 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
              <span className="w-[5px] h-[5px] rounded-full bg-emerald-500" />
              Sistema GUOR ERP · v2.4
            </div>
            <div className="flex gap-1.5">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={loading}
                className="h-7 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-[4px]"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="edit-ficha-form"
                disabled={loading}
                className="h-7 px-4 text-[10px] font-bold uppercase tracking-wider bg-slate-900 hover:bg-pink-700 text-white rounded-[4px] transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Guardando…
                  </span>
                ) : "Guardar cambios →"}
              </Button>
            </div>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls =
  "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus-visible:ring-pink-400 transition-all h-[30px] text-xs rounded-[4px]";

const tabCls = (active: boolean) =>
  [
    "px-4 py-2 text-[10px] font-semibold uppercase tracking-wider border-b-2 cursor-pointer",
    active
      ? "text-slate-50 border-pink-600"
      : "text-slate-500 border-transparent",
  ].join(" ");

function Section({
  num, title, children, last,
}: {
  num: string; title: string; children: React.ReactNode; last?: boolean;
}) {
  return (
    <div className={["px-[18px] py-3.5", !last ? "border-b border-slate-100 dark:border-slate-800" : ""].join(" ")}>
      <div className="flex items-center gap-1.5 mb-2.5">
        <span className="w-4 h-4 bg-slate-900 dark:bg-slate-700 rounded-[3px] text-[8px] font-black text-white flex items-center justify-center">
          {num}
        </span>
        <span className="text-[9px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function Field({
  label, required, children,
}: {
  label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
        {label}{required && <span className="text-pink-600 ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}