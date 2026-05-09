"use client";

import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogTitle,
  DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Building2, Phone, MapPin, FileText, Trash2, Plus,
  Star, Loader2, PencilLine, X, Briefcase, Globe, Info,
  Navigation
} from "lucide-react";
import type { TipoCliente } from "@prisma/client";
import type { ClienteEditable, DireccionCliente } from "@/lib/services/clientes-services";
import { cn } from "@/lib/utils";

const TIPOS_CLIENTE: { value: TipoCliente; label: string }[] = [
  { value: "corporativo", label: "Corporativo" },
  { value: "minorista", label: "Minorista" },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cliente: ClienteEditable | null;
}

const EMPTY_DIR = { alias: "", direccion: "", ciudad: "", departamento: "", es_principal: false };

export default function EditClienteDialog({ isOpen, onClose, onSuccess, cliente }: Props) {
  const [loading, setLoading] = useState(false);
  const [dirLoading, setDirLoading] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<ClienteEditable>>({});
  const [addingDir, setAddingDir] = useState(false);
  const [newDir, setNewDir] = useState(EMPTY_DIR);
  const [direcciones, setDirecciones] = useState<DireccionCliente[]>([]);

  useEffect(() => {
    if (cliente) {
      setForm({
        ruc: cliente.ruc,
        razon_social: cliente.razon_social ?? "",
        nombre_comercial: cliente.nombre_comercial ?? "",
        telefono: cliente.telefono ?? "",
        direccion_fiscal: cliente.direccion_fiscal ?? "",
        tipo_cliente: cliente.tipo_cliente ?? "corporativo",
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
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cliente.id, ...form }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? "Error al actualizar");
      toast.success("Perfil corporativo actualizado correctamente");
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDir),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? "Error al agregar dirección");
      toast.success("Dirección de despacho registrada");
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
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dir_id: dir.id, es_principal: true }),
      });
      if (!res.ok) throw new Error("Error al actualizar dirección");
      setDirecciones(prev =>
        prev.map(d => ({ ...d, es_principal: d.id === dir.id }))
      );
      toast.success("Ubicación principal actualizada");
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
      toast.success("Punto de despacho eliminado");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDirLoading(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-2xl border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] p-0 overflow-hidden rounded-[48px] max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-500">

        {/* HEADER PREMIUM */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 px-10 py-10 text-white relative shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
                <Building2 className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <DialogTitle className="text-3xl font-black tracking-tighter uppercase">
                    Ficha Cliente
                  </DialogTitle>
                  <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Editor Pro
                  </Badge>
                </div>
                <DialogDescription className="text-slate-400 font-bold text-sm mt-1">
                  Gestión avanzada de perfiles corporativos y logística.
                </DialogDescription>
              </div>
            </div>
            <button onClick={handleClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">

          {/* SECCIÓN 1: IDENTIDAD */}
          <form id="edit-cliente-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="col-span-full">
                <SectionLabel icon={<Info className="w-4 h-4" />} label="Identidad Corporativa" />
              </div>

              <Field icon={<FileText className="w-4 h-4" />} label="RUC / Identificación">
                <Input
                  value={form.ruc ?? ""}
                  onChange={e => setForm(p => ({ ...p, ruc: e.target.value }))}
                  maxLength={11}
                  inputMode="numeric"
                  className={inputCls}
                  placeholder="10XXXXXXXXX"
                />
              </Field>

              <Field icon={<Briefcase className="w-4 h-4" />} label="Segmento de Cliente">
                <Select value={form.tipo_cliente ?? "corporativo"}
                  onValueChange={v => setForm(p => ({ ...p, tipo_cliente: v as TipoCliente }))}>
                  <SelectTrigger className={cn(inputCls, "bg-white")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-3xl border-none shadow-2xl p-2 bg-white/95 backdrop-blur-xl">
                    {TIPOS_CLIENTE.map(t => (
                      <SelectItem key={t.value} value={t.value} className="rounded-2xl py-3 px-4 font-bold focus:bg-indigo-50 transition-colors">
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <div className="col-span-full">
                <Field icon={<Building2 className="w-4 h-4" />} label="Razón Social Completa">
                  <Input
                    value={form.razon_social ?? ""}
                    onChange={e => setForm(p => ({ ...p, razon_social: e.target.value }))}
                    className={inputCls}
                    placeholder="Nombre legal de la empresa"
                  />
                </Field>
              </div>

              <Field icon={<Globe className="w-4 h-4" />} label="Nombre Comercial">
                <Input
                  value={form.nombre_comercial ?? ""}
                  onChange={e => setForm(p => ({ ...p, nombre_comercial: e.target.value }))}
                  className={inputCls}
                  placeholder="Marca o nombre público"
                />
              </Field>

              <Field icon={<Phone className="w-4 h-4" />} label="Línea de Contacto">
                <Input
                  value={form.telefono ?? ""}
                  onChange={e => setForm(p => ({ ...p, telefono: e.target.value.replace(/\D/g, "") }))}
                  inputMode="numeric"
                  className={inputCls}
                  placeholder="9XXXXXXXX"
                />
              </Field>

              <div className="col-span-full">
                <Field icon={<Navigation className="w-4 h-4" />} label="Dirección Fiscal Registrada">
                  <Input
                    value={form.direccion_fiscal ?? ""}
                    onChange={e => setForm(p => ({ ...p, direccion_fiscal: e.target.value }))}
                    className={inputCls}
                    placeholder="Calle, Número, Urbanización..."
                  />
                </Field>
              </div>
            </div>
          </form>

          {/* SECCIÓN 2: LOGÍSTICA */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <SectionLabel icon={<MapPin className="w-4 h-4" />} label="Puntos de Despacho" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddingDir(v => !v)}
                className="rounded-2xl border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-black text-[10px] uppercase tracking-widest gap-2"
              >
                {addingDir ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                {addingDir ? "Cerrar" : "Nuevo Punto"}
              </Button>
            </div>

            {/* Formulario Nueva Dirección Premium */}
            {addingDir && (
              <div className="bg-slate-50/50 backdrop-blur-sm border border-indigo-100 rounded-[32px] p-8 space-y-6 animate-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400">Alias de Ubicación</Label>
                    <Input placeholder="Ej. Almacén Principal" value={newDir.alias}
                      onChange={e => setNewDir(p => ({ ...p, alias: e.target.value }))}
                      className={cn(inputCls, "bg-white")} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400">Referencia / Dirección</Label>
                    <Input placeholder="Av. Los Pinos 123" value={newDir.direccion}
                      onChange={e => setNewDir(p => ({ ...p, direccion: e.target.value }))}
                      className={cn(inputCls, "bg-white")} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400">Ciudad / Distrito</Label>
                    <Input placeholder="Lima" value={newDir.ciudad}
                      onChange={e => setNewDir(p => ({ ...p, ciudad: e.target.value }))}
                      className={cn(inputCls, "bg-white")} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400">Departamento</Label>
                    <Input placeholder="Lima" value={newDir.departamento}
                      onChange={e => setNewDir(p => ({ ...p, departamento: e.target.value }))}
                      className={cn(inputCls, "bg-white")} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-indigo-50">
                  <div className="flex items-center gap-3">
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" id="principal" checked={newDir.es_principal}
                        onChange={e => setNewDir(p => ({ ...p, es_principal: e.target.checked }))}
                        className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      <span className="ms-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Establecer como Principal</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="ghost" size="sm" onClick={() => { setAddingDir(false); setNewDir(EMPTY_DIR); }} className="rounded-xl font-bold">
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={handleAddDir}
                      disabled={!newDir.alias || !newDir.direccion || dirLoading === "new"}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-100 px-6 font-black uppercase text-[10px]">
                      {dirLoading === "new" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Registrar Punto"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de Direcciones con Tarjetas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {direcciones.length === 0 && !addingDir ? (
                <div className="col-span-full py-12 flex flex-col items-center justify-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 opacity-50">
                  <MapPin className="w-10 h-10 text-slate-300 mb-3" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sin puntos de despacho</p>
                </div>
              ) : (
                direcciones.map(dir => (
                  <div key={dir.id}
                    className="group relative bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-500">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-[18px] flex items-center justify-center shrink-0 border transition-colors",
                          dir.es_principal ? "bg-indigo-50 border-indigo-100 text-indigo-600" : "bg-slate-50 border-slate-100 text-slate-400"
                        )}>
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-black text-slate-800">{dir.alias}</span>
                            {dir.es_principal && (
                              <div className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">
                                <Star className="w-2.5 h-2.5 fill-indigo-600" />
                                <span className="text-[8px] font-black uppercase tracking-tighter">Matriz</span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">{dir.direccion}</p>
                          <p className="text-[10px] text-slate-300 font-bold uppercase mt-1 tracking-widest">
                            {[dir.ciudad, dir.departamento].filter(Boolean).join(" • ")}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        {!dir.es_principal && (
                          <Button variant="ghost" size="icon"
                            onClick={() => handleSetPrincipal(dir)}
                            disabled={dirLoading === dir.id}
                            className="h-10 w-10 bg-slate-50 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl">
                            {dirLoading === dir.id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <Star className="w-4 h-4" />}
                          </Button>
                        )}
                        <Button variant="ghost" size="icon"
                          onClick={() => handleDeleteDir(dir.id)}
                          disabled={dirLoading === dir.id}
                          className="h-10 w-10 bg-slate-50 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* FOOTER GLASS */}
        <DialogFooter className="px-10 py-8 bg-slate-50/80 backdrop-blur-md border-t border-slate-100/50 shrink-0 flex items-center justify-between gap-6">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
            className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-600 rounded-2xl h-14 px-8"
          >
            Cancelar Edición
          </Button>
          <Button
            type="submit"
            form="edit-cliente-form"
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-white shadow-2xl shadow-slate-200 rounded-[20px] h-14 px-10 font-black uppercase text-xs tracking-widest group"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin" />
                Sincronizando...
              </div>
            ) : (
              <div className="flex items-center gap-3">
                Guardar Cambios
                <PencilLine className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── UI helpers Premium ────────────────────────────────────────────────
const inputCls = "bg-slate-50 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-200 focus:shadow-xl focus:shadow-indigo-50/50 focus-visible:ring-0 transition-all h-14 px-6 text-sm font-bold text-slate-700 placeholder:text-slate-300";

function SectionLabel({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
        {icon}
      </div>
      <span className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-900">{label}</span>
      <div className="h-px flex-1 bg-slate-100" />
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <Label className="text-[11px] uppercase font-black text-slate-400 flex items-center gap-2 tracking-[0.1em] ml-1">
        {icon}{label}
      </Label>
      {children}
    </div>
  );
}
