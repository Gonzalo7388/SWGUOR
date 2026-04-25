"use client";

import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button }  from "@/components/ui/button";
import { Input }   from "@/components/ui/input";
import { Label }   from "@/components/ui/label";
import { Badge }   from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast }  from "sonner";
import {
  Building2, Phone, MapPin, FileText, Trash2, Plus,
  Star, Loader2, PencilLine,
} from "lucide-react";
import type { TipoCliente } from "@prisma/client";
import type { ClienteEditable, DireccionCliente } from "@/lib/services/clientes-services";

const TIPOS_CLIENTE: { value: TipoCliente; label: string }[] = [
  { value: "corporativo", label: "Corporativo" },
  { value: "minorista",   label: "Minorista"   },
];

interface Props {
  isOpen:    boolean;
  onClose:   () => void;
  onSuccess: () => void;
  cliente:   ClienteEditable | null;
}

const EMPTY_DIR = { alias: "", direccion: "", ciudad: "", departamento: "", es_principal: false };

export default function EditClienteDialog({ isOpen, onClose, onSuccess, cliente }: Props) {
  const [loading,    setLoading]    = useState(false);
  const [dirLoading, setDirLoading] = useState<string | null>(null);
  const [form,       setForm]       = useState<Partial<ClienteEditable>>({});
  const [addingDir,  setAddingDir]  = useState(false);
  const [newDir,     setNewDir]     = useState(EMPTY_DIR);
  const [direcciones, setDirecciones] = useState<DireccionCliente[]>([]);

  useEffect(() => {
    if (cliente) {
      setForm({
        ruc:              cliente.ruc,
        razon_social:     cliente.razon_social     ?? "",
        nombre_comercial: cliente.nombre_comercial ?? "",
        telefono:         cliente.telefono          ?? "",
        direccion_fiscal: cliente.direccion_fiscal  ?? "",
        tipo_cliente:     cliente.tipo_cliente      ?? "corporativo",
      });
      setDirecciones(cliente.direcciones_cliente ?? []);
    }
  }, [cliente]);

  const handleClose = () => { setAddingDir(false); setNewDir(EMPTY_DIR); onClose(); };

  // ── Guardar datos generales ──────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/clientes", {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ id: cliente.id, ...form }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? "Error al actualizar");
      toast.success("Cliente actualizado");
      onSuccess();
      handleClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Agregar dirección ────────────────────────────────────────
  const handleAddDir = async () => {
    if (!cliente || !newDir.alias || !newDir.direccion) return;
    setDirLoading("new");
    try {
      const res = await fetch(`/api/admin/clientes/${cliente.id}/direcciones`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(newDir),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? "Error al agregar dirección");
      toast.success("Dirección agregada");
      setDirecciones(prev => [...prev, body.data]);
      setNewDir(EMPTY_DIR);
      setAddingDir(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDirLoading(null);
    }
  };

  // ── Marcar como principal ────────────────────────────────────
  const handleSetPrincipal = async (dir: DireccionCliente) => {
    if (!cliente || dir.es_principal) return;
    setDirLoading(dir.id);
    try {
      const res = await fetch(`/api/admin/clientes/${cliente.id}/direcciones`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ dir_id: dir.id, es_principal: true }),
      });
      if (!res.ok) throw new Error("Error al actualizar dirección");
      setDirecciones(prev =>
        prev.map(d => ({ ...d, es_principal: d.id === dir.id }))
      );
      toast.success("Dirección principal actualizada");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDirLoading(null);
    }
  };

  // ── Eliminar dirección ───────────────────────────────────────
  const handleDeleteDir = async (dirId: string) => {
    if (!cliente) return;
    setDirLoading(dirId);
    try {
      const res = await fetch(
        `/api/admin/clientes/${cliente.id}/direcciones?dir_id=${dirId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Error al eliminar");
      setDirecciones(prev => prev.filter(d => d.id !== dirId));
      toast.success("Dirección eliminada");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDirLoading(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[560px] border-none shadow-2xl bg-white p-0 overflow-hidden max-h-[95vh] flex flex-col">
        <div className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 w-full shrink-0" />

        <div className="p-6 overflow-y-auto space-y-6">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                <PencilLine className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-800">Editar Cliente</DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Actualiza los datos de la empresa y gestiona sus direcciones.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* ── Datos generales ── */}
          <form id="edit-cliente-form" onSubmit={handleSubmit} className="space-y-4">
            <SectionLabel label="Datos de la Empresa" />

            <div className="grid grid-cols-2 gap-3">
              <Field icon={<FileText className="w-3.5 h-3.5" />} label="RUC">
                <Input value={form.ruc ?? ""} onChange={e => setForm(p => ({ ...p, ruc: e.target.value }))}
                  maxLength={11} inputMode="numeric" className={inputCls} />
              </Field>
              <Field icon={<Building2 className="w-3.5 h-3.5" />} label="Tipo">
                <Select value={form.tipo_cliente ?? "corporativo"}
                  onValueChange={v => setForm(p => ({ ...p, tipo_cliente: v as TipoCliente }))}>
                  <SelectTrigger className={`${inputCls} cursor-pointer`}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIPOS_CLIENTE.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field icon={<Building2 className="w-3.5 h-3.5" />} label="Razón Social">
              <Input value={form.razon_social ?? ""} onChange={e => setForm(p => ({ ...p, razon_social: e.target.value }))}
                className={inputCls} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field icon={<Building2 className="w-3.5 h-3.5" />} label="Nombre Comercial">
                <Input value={form.nombre_comercial ?? ""}
                  onChange={e => setForm(p => ({ ...p, nombre_comercial: e.target.value }))}
                  className={inputCls} />
              </Field>
              <Field icon={<Phone className="w-3.5 h-3.5" />} label="Teléfono">
                <Input value={form.telefono ?? ""}
                  onChange={e => setForm(p => ({ ...p, telefono: e.target.value.replace(/\D/g, "") }))}
                  inputMode="numeric" className={inputCls} />
              </Field>
            </div>

            <Field icon={<MapPin className="w-3.5 h-3.5" />} label="Dirección Fiscal">
              <Input value={form.direccion_fiscal ?? ""}
                onChange={e => setForm(p => ({ ...p, direccion_fiscal: e.target.value }))}
                className={inputCls} />
            </Field>
          </form>

          {/* ── Direcciones de envío ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <SectionLabel label="Direcciones de Envío" />
              <Button variant="ghost" size="sm" onClick={() => setAddingDir(v => !v)}
                className="h-7 text-xs text-blue-600 hover:bg-blue-50 gap-1">
                <Plus className="w-3.5 h-3.5" /> Agregar
              </Button>
            </div>

            {/* Formulario nueva dirección */}
            {addingDir && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Alias (ej. Almacén Central)" value={newDir.alias}
                    onChange={e => setNewDir(p => ({ ...p, alias: e.target.value }))}
                    className={inputCls} />
                  <Input placeholder="Dirección completa" value={newDir.direccion}
                    onChange={e => setNewDir(p => ({ ...p, direccion: e.target.value }))}
                    className={inputCls} />
                  <Input placeholder="Ciudad" value={newDir.ciudad}
                    onChange={e => setNewDir(p => ({ ...p, ciudad: e.target.value }))}
                    className={inputCls} />
                  <Input placeholder="Departamento" value={newDir.departamento}
                    onChange={e => setNewDir(p => ({ ...p, departamento: e.target.value }))}
                    className={inputCls} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="principal" checked={newDir.es_principal}
                    onChange={e => setNewDir(p => ({ ...p, es_principal: e.target.checked }))}
                    className="rounded border-slate-300 text-blue-600" />
                  <label htmlFor="principal" className="text-xs text-slate-500">Marcar como principal</label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setAddingDir(false); setNewDir(EMPTY_DIR); }}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleAddDir}
                    disabled={!newDir.alias || !newDir.direccion || dirLoading === "new"}
                    className="bg-blue-600 hover:bg-blue-700 text-white">
                    {dirLoading === "new" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Guardar"}
                  </Button>
                </div>
              </div>
            )}

            {/* Lista de direcciones */}
            {direcciones.length === 0 && !addingDir && (
              <p className="text-xs text-slate-400 text-center py-4">Sin direcciones registradas</p>
            )}
            {direcciones.map(dir => (
              <div key={dir.id}
                className="flex items-start justify-between bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700">{dir.alias}</span>
                      {dir.es_principal && (
                        <Badge className="text-[9px] bg-blue-50 text-blue-600 border-blue-200 px-1.5 py-0">
                          Principal
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{dir.direccion}</p>
                    {(dir.ciudad || dir.departamento) && (
                      <p className="text-[11px] text-slate-300">
                        {[dir.ciudad, dir.departamento].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!dir.es_principal && (
                    <Button variant="ghost" size="icon"
                      onClick={() => handleSetPrincipal(dir)}
                      disabled={dirLoading === dir.id}
                      title="Marcar como principal"
                      className="h-7 w-7 text-slate-300 hover:text-blue-500 hover:bg-blue-50">
                      {dirLoading === dir.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Star className="w-3.5 h-3.5" />}
                    </Button>
                  )}
                  <Button variant="ghost" size="icon"
                    onClick={() => handleDeleteDir(dir.id)}
                    disabled={dirLoading === dir.id}
                    title="Eliminar dirección"
                    className="h-7 w-7 text-slate-300 hover:text-red-500 hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 shrink-0 flex gap-2">
          <Button variant="ghost" onClick={handleClose} disabled={loading}
            className="text-slate-500 hover:bg-slate-100">Cancelar</Button>
          <Button type="submit" form="edit-cliente-form" disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md px-7">
            {loading
              ? <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando…
                </span>
              : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── UI helpers ────────────────────────────────────────────────
const inputCls = "bg-slate-50 border-slate-200 focus:bg-white focus-visible:ring-blue-400 transition-all h-10 text-sm";

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-px flex-1 bg-slate-100" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2">{label}</span>
      <div className="h-px flex-1 bg-slate-100" />
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
        {icon}{label}
      </Label>
      {children}
    </div>
  );
}