'use client';

import { useEffect, useState } from 'react';
import { X, Building2, MapPin, Plus, Loader2, Star, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { TipoCliente } from '@prisma/client';
import type { ClienteEditable, DireccionCliente } from '@/lib/services/clientes.service';
import { cn } from '@/lib/utils';

const TIPOS_CLIENTE: { value: TipoCliente; label: string }[] = [
  { value: 'corporativo', label: 'Corporativo' },
  { value: 'minorista', label: 'Minorista' },
];

const EMPTY_DIR = { alias: '', direccion: '', ciudad: '', departamento: '', es_principal: false };

interface Props {
  cliente?: ClienteEditable | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ClienteFormModal({ cliente, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [dirLoading, setDirLoading] = useState<string | null>(null);

  // Base client data
  const [form, setForm] = useState<Partial<ClienteEditable>>({
    tipo_cliente: 'corporativo',
  });

  // User data for create only
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Directions
  const [addingDir, setAddingDir] = useState(false);
  const [newDir, setNewDir] = useState(EMPTY_DIR);
  const [direcciones, setDirecciones] = useState<DireccionCliente[]>([]);

  useEffect(() => {
    if (cliente) {
      setForm({
        ruc: cliente.ruc,
        razon_social: cliente.razon_social ?? '',
        nombre_comercial: cliente.nombre_comercial ?? '',
        telefono: cliente.telefono ?? '',
        direccion_fiscal: cliente.direccion_fiscal ?? '',
        tipo_cliente: cliente.tipo_cliente ?? 'corporativo',
      });
      setDirecciones(cliente.direcciones_cliente ?? []);
    } else {
      setForm({
        tipo_cliente: 'corporativo',
      });
      setDirecciones([]);
    }
  }, [cliente]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (cliente) {
        // Edit
        const res = await fetch('/api/admin/clientes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: cliente.id, ...form }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body?.error ?? 'Error al actualizar');
        toast.success('Perfil corporativo actualizado correctamente');
      } else {
        // Create
        if (!email || !password || !form.ruc) {
          throw new Error('RUC, email y contraseña son obligatorios');
        }

        const res = await fetch('/api/admin/clientes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, ...form }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body?.error ?? 'Error al crear cliente');
        toast.success('Cliente registrado exitosamente');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Agregar dirección ────────────────────────────────────────
  const handleAddDir = async () => {
    if (!newDir.alias || !newDir.direccion) return;

    if (!cliente) {
      // If we're creating a new client, just add to local state
      setDirecciones(prev => [...prev, { id: Date.now().toString(), cliente_id: 'new', ...newDir }]);
      setNewDir(EMPTY_DIR);
      setAddingDir(false);
      return;
    }

    setDirLoading('new');
    try {
      const res = await fetch(`/api/admin/clientes/${cliente.id}/direcciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDir),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? 'Error al agregar dirección');
      toast.success('Dirección de despacho registrada');
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
    if (dir.es_principal) return;

    if (!cliente) {
      setDirecciones(prev => prev.map(d => ({ ...d, es_principal: d.id === dir.id })));
      return;
    }

    setDirLoading(dir.id);
    try {
      const res = await fetch(`/api/admin/clientes/${cliente.id}/direcciones`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dir_id: dir.id, es_principal: true }),
      });
      if (!res.ok) throw new Error('Error al actualizar dirección');
      setDirecciones(prev => prev.map(d => ({ ...d, es_principal: d.id === dir.id })));
      toast.success('Ubicación principal actualizada');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDirLoading(null);
    }
  };

  // ── Eliminar dirección ───────────────────────────────────────
  const handleDeleteDir = async (dirId: string) => {
    if (!cliente) {
      setDirecciones(prev => prev.filter(d => d.id !== dirId));
      return;
    }

    setDirLoading(dirId);
    try {
      const res = await fetch(`/api/admin/clientes/${cliente.id}/direcciones?dir_id=${dirId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      setDirecciones(prev => prev.filter(d => d.id !== dirId));
      toast.success('Punto de despacho eliminado');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDirLoading(null);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 px-8 py-8 text-white relative shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                <Building2 className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black tracking-tighter uppercase">
                    {cliente ? 'Ficha Cliente' : 'Nuevo Cliente'}
                  </h2>
                  <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                    {cliente ? 'Editor Pro' : 'Registro'}
                  </Badge>
                </div>
                <p className="text-indigo-200/70 font-bold text-xs mt-1">
                  Gestión avanzada de perfiles corporativos.
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">

          <form id="cliente-form" onSubmit={handleSubmit} className="space-y-8">

            {/* Account Info (Create Only) */}
            {!cliente && (
              <div className="space-y-6">
                <SectionLabel label="Acceso de Cliente" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-wider ml-1">Email Acceso *</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="cliente@empresa.com"
                      className="bg-slate-50 border-slate-100 rounded-xl h-12 px-4 focus:bg-white"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-wider ml-1">Contraseña *</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        className="bg-slate-50 border-slate-100 rounded-xl h-12 px-4 focus:bg-white pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <SectionLabel label="Identidad Corporativa" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-wider ml-1">RUC / Identificación *</Label>
                  <Input
                    value={form.ruc ?? ''}
                    onChange={(e) => setForm(p => ({ ...p, ruc: e.target.value }))}
                    maxLength={11}
                    className="bg-slate-50 border-slate-100 rounded-xl h-12 px-4 focus:bg-white"
                    placeholder="10XXXXXXXXX"
                    required
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-wider ml-1">Segmento de Cliente *</Label>
                  <select
                    value={form.tipo_cliente ?? 'corporativo'}
                    onChange={(e) => setForm(p => ({ ...p, tipo_cliente: e.target.value as TipoCliente }))}
                    className="w-full bg-slate-50 border-slate-100 rounded-xl h-12 px-4 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    {TIPOS_CLIENTE.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-full">
                  <Label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-wider ml-1">Razón Social Completa</Label>
                  <Input
                    value={form.razon_social ?? ''}
                    onChange={(e) => setForm(p => ({ ...p, razon_social: e.target.value }))}
                    className="bg-slate-50 border-slate-100 rounded-xl h-12 px-4 focus:bg-white"
                    placeholder="Nombre legal de la empresa"
                  />
                </div>

                <div>
                  <Label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-wider ml-1">Nombre Comercial</Label>
                  <Input
                    value={form.nombre_comercial ?? ''}
                    onChange={(e) => setForm(p => ({ ...p, nombre_comercial: e.target.value }))}
                    className="bg-slate-50 border-slate-100 rounded-xl h-12 px-4 focus:bg-white"
                    placeholder="Marca o nombre público"
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-wider ml-1">Línea de Contacto</Label>
                  <Input
                    value={form.telefono ?? ''}
                    onChange={(e) => setForm(p => ({ ...p, telefono: e.target.value.replace(/\D/g, '') }))}
                    className="bg-slate-50 border-slate-100 rounded-xl h-12 px-4 focus:bg-white"
                    placeholder="9XXXXXXXX"
                  />
                </div>

                <div className="col-span-full">
                  <Label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-wider ml-1">Dirección Fiscal Registrada</Label>
                  <Input
                    value={form.direccion_fiscal ?? ''}
                    onChange={(e) => setForm(p => ({ ...p, direccion_fiscal: e.target.value }))}
                    className="bg-slate-50 border-slate-100 rounded-xl h-12 px-4 focus:bg-white"
                    placeholder="Calle, Número, Urbanización..."
                  />
                </div>
              </div>
            </div>
          </form>

          {/* Logística - only show for editing existing client or once created */}
          {cliente && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <SectionLabel label="Puntos de Despacho" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddingDir(v => !v)}
                  className="rounded-xl border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-black text-[10px] uppercase tracking-widest gap-2"
                >
                  {addingDir ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  {addingDir ? 'Cerrar' : 'Nuevo Punto'}
                </Button>
              </div>

              {addingDir && (
                <div className="bg-slate-50/80 backdrop-blur-sm border border-indigo-100 rounded-2xl p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Alias</Label>
                      <Input placeholder="Almacén Principal" value={newDir.alias} onChange={e => setNewDir(p => ({ ...p, alias: e.target.value }))} className="bg-white" />
                    </div>
                    <div>
                      <Label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Dirección</Label>
                      <Input placeholder="Av. Los Pinos 123" value={newDir.direccion} onChange={e => setNewDir(p => ({ ...p, direccion: e.target.value }))} className="bg-white" />
                    </div>
                    <div>
                      <Label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Ciudad</Label>
                      <Input placeholder="Lima" value={newDir.ciudad} onChange={e => setNewDir(p => ({ ...p, ciudad: e.target.value }))} className="bg-white" />
                    </div>
                    <div>
                      <Label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Departamento</Label>
                      <Input placeholder="Lima" value={newDir.departamento} onChange={e => setNewDir(p => ({ ...p, departamento: e.target.value }))} className="bg-white" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={newDir.es_principal} onChange={e => setNewDir(p => ({ ...p, es_principal: e.target.checked }))} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Establecer Principal</span>
                    </label>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setAddingDir(false); setNewDir(EMPTY_DIR); }}>Cancelar</Button>
                      <Button size="sm" onClick={handleAddDir} disabled={!newDir.alias || !newDir.direccion || dirLoading === 'new'} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
                        {dirLoading === 'new' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Registrar'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {direcciones.length === 0 && !addingDir ? (
                  <div className="col-span-full py-10 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <MapPin className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sin puntos de despacho</p>
                  </div>
                ) : (
                  direcciones.map(dir => (
                    <div key={dir.id} className="group relative bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border", dir.es_principal ? "bg-indigo-50 border-indigo-100 text-indigo-600" : "bg-slate-50 border-slate-100 text-slate-400")}>
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-bold text-slate-800">{dir.alias}</span>
                              {dir.es_principal && <Star className="w-3 h-3 fill-indigo-600 text-indigo-600" />}
                            </div>
                            <p className="text-xs text-slate-500 mb-1">{dir.direccion}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                              {[dir.ciudad, dir.departamento].filter(Boolean).join(" • ")}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!dir.es_principal && (
                            <Button variant="ghost" size="icon" onClick={() => handleSetPrincipal(dir)} disabled={dirLoading === dir.id} className="h-8 w-8 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-lg">
                              {dirLoading === dir.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Star className="w-3 h-3" />}
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteDir(dir.id)} disabled={dirLoading === dir.id} className="h-8 w-8 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-lg">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 shrink-0 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="text-xs font-bold text-slate-500 uppercase tracking-wider hover:bg-slate-200 rounded-xl h-12 px-6"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="cliente-form"
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-200 rounded-xl h-12 px-8 font-black uppercase text-xs tracking-widest"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Guardando...</>
            ) : (
              cliente ? 'Guardar Cambios' : 'Registrar Cliente'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800">{label}</span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}
