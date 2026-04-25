"use client";

import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Props {
  isOpen:    boolean;
  ficha:     any;
  onClose:   () => void;
  onSuccess: () => void;
}

const ESTADOS = [
  { value: "borrador", label: "Borrador" },
  { value: "activo",   label: "Activo"   },
  { value: "revision", label: "Revisión" },
  { value: "obsoleto", label: "Obsoleto" },
];

export default function EditFichaDialog({ isOpen, ficha, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    version:               "",
    descripcion_detallada: "",
    sam_total:             "",
    costo_estimado:        "",
    ficha_url:             "",
    imagen_geometral:      "",
    estado:                "borrador",
  });

  useEffect(() => {
    if (ficha) {
      setForm({
        version:               ficha.version               ?? "",
        descripcion_detallada: ficha.descripcion_detallada ?? "",
        sam_total:             ficha.sam_total             != null ? String(ficha.sam_total)      : "",
        costo_estimado:        ficha.costo_estimado        != null ? String(ficha.costo_estimado) : "",
        ficha_url:             ficha.ficha_url             ?? "",
        imagen_geometral:      ficha.imagen_geometral      ?? "",
        estado:                ficha.estado                ?? "borrador",
      });
    }
  }, [ficha]);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/fichas-tecnicas/${ficha.id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          version:               form.version               || undefined,
          descripcion_detallada: form.descripcion_detallada || undefined,
          sam_total:             form.sam_total             ? Number(form.sam_total)      : undefined,
          costo_estimado:        form.costo_estimado        ? Number(form.costo_estimado) : undefined,
          ficha_url:             form.ficha_url             || undefined,
          imagen_geometral:      form.imagen_geometral      || undefined,
          estado:                form.estado,
        }),
      });
      if (res.ok) onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-800">
            <FileText className="w-5 h-5 text-pink-600" />
            Editar Ficha Técnica
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Versión</Label>
              <Input value={form.version} onChange={(e) => set("version", e.target.value)}
                placeholder="1.0" className="h-10 border-slate-200 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Estado</Label>
              <Select value={form.estado} onValueChange={(v) => set("estado", v)}>
                <SelectTrigger className="h-10 border-slate-200 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS.map((e) => (
                    <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">SAM total (min)</Label>
              <Input type="number" value={form.sam_total}
                onChange={(e) => set("sam_total", e.target.value)}
                placeholder="0" className="h-10 border-slate-200 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Costo estimado (S/)</Label>
              <Input type="number" value={form.costo_estimado}
                onChange={(e) => set("costo_estimado", e.target.value)}
                placeholder="0.00" className="h-10 border-slate-200 text-sm" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Descripción detallada</Label>
            <Textarea value={form.descripcion_detallada}
              onChange={(e) => set("descripcion_detallada", e.target.value)}
              placeholder="Descripción del producto..." rows={3}
              className="resize-none border-slate-200 text-sm" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">URL Ficha PDF</Label>
            <Input value={form.ficha_url} onChange={(e) => set("ficha_url", e.target.value)}
              placeholder="https://..." className="h-10 border-slate-200 text-sm" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">URL Imagen geometral</Label>
            <Input value={form.imagen_geometral} onChange={(e) => set("imagen_geometral", e.target.value)}
              placeholder="https://..." className="h-10 border-slate-200 text-sm" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-slate-200">Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading}
            className="bg-pink-600 hover:bg-pink-700 text-white font-bold">
            {loading ? "Guardando…" : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}