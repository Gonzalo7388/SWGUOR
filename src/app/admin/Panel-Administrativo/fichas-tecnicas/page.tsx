"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

interface Props {
  isOpen:    boolean;
  onClose:   () => void;
  onSuccess: () => void;
}

export default function CreateFichaDialog({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    producto_id:           "",
    version:               "1.0",
    descripcion_detallada: "",
    sam_total:             "",
    costo_estimado:        "",
  });

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.producto_id.trim()) {
      toast.error("El ID de producto es requerido");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/fichas-tecnicas", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          producto_id:           form.producto_id,
          version:               form.version               || "1.0",
          descripcion_detallada: form.descripcion_detallada || undefined,
          sam_total:             form.sam_total             ? Number(form.sam_total)      : undefined,
          costo_estimado:        form.costo_estimado        ? Number(form.costo_estimado) : undefined,
        }),
      });
      const body = await res.json();
      if (!res.ok) { toast.error(body.error ?? "Error al crear ficha"); return; }
      toast.success("Ficha técnica creada");
      onSuccess();
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
            Nueva Ficha Técnica
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">ID Producto *</Label>
              <Input value={form.producto_id} onChange={(e) => set("producto_id", e.target.value)}
                placeholder="Ej: 10" className="h-10 border-slate-200 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Versión</Label>
              <Input value={form.version} onChange={(e) => set("version", e.target.value)}
                placeholder="1.0" className="h-10 border-slate-200 text-sm" />
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-slate-200">Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading}
            className="bg-pink-600 hover:bg-pink-700 text-white font-bold">
            {loading ? "Creando…" : "Crear ficha"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}