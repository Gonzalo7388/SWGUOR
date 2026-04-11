'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Building2, Search, Plus, RefreshCw, X, Pencil, Trash2,
  ChevronLeft, ChevronRight, Eye, Loader2
} from 'lucide-react';
import { usePermissions } from '@/lib/hooks/usePermissions';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface Proveedor {
  id: string;
  ruc: string;
  razon_social: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  categoria_suministro: string;
  estado: 'activo' | 'inactivo';
  created_at: string;
  updated_at: string;
  _count?: { insumos: number; ordenes_compra: number };
}

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  pagination?: { total: number; page: number; totalPages: number };
  error?: string;
  message?: string;
  campo?: string;
}

// ─────────────────────────────────────────────────────────────
// API HELPERS
// ─────────────────────────────────────────────────────────────

const API = '/api/admin/proveedores';

async function fetchProveedores(page: number, limit: number, busqueda: string, estado: string) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(busqueda && { busqueda }),
    ...(estado && { estado }),
  });
  const res = await fetch(`${API}?${params}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar proveedores');
  return res.json() as Promise<ApiResponse>;
}

async function saveProveedor(data: ProveedorForm) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json() as Promise<ApiResponse<Proveedor>>;
}

async function deactivateProveedor(id: string) {
  const res = await fetch(`${API}?id=${id}`, { method: 'DELETE' });
  return res.json() as Promise<ApiResponse>;
}

// ─────────────────────────────────────────────────────────────
// FORM TYPE & VALIDATION
// ─────────────────────────────────────────────────────────────

interface ProveedorForm {
  id?: string;
  ruc: string;
  razon_social: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  categoria_suministro: string;
}

const CATEGORIAS = ['Telas', 'Avíos', 'Empaque', 'Hilos', 'Etiquetas', 'Forro', 'Maquinaria', 'Otros'];

function validateForm(data: ProveedorForm): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!/^\d{11}$/.test(data.ruc.trim())) {
    errors.ruc = 'El RUC debe tener exactamente 11 dígitos numéricos';
  }
  if (!data.razon_social.trim()) {
    errors.razon_social = 'La razón social es obligatoria';
  }
  if (!data.contacto.trim()) {
    errors.contacto = 'El nombre de contacto es obligatorio';
  }
  if (!data.telefono.trim()) {
    errors.telefono = 'El teléfono es obligatorio';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'Formato de email inválido';
  }
  if (!data.direccion.trim()) {
    errors.direccion = 'La dirección es obligatoria';
  }
  if (!data.categoria_suministro.trim()) {
    errors.categoria_suministro = 'La categoría de suministro es obligatoria';
  }

  return errors;
}

// ─────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

export default function ProveedoresPage() {
  const { can, isLoading: authLoading } = usePermissions();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [debouncedBusqueda, setDebouncedBusqueda] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Proveedor | null>(null);
  const [viewDetail, setViewDetail] = useState<Proveedor | null>(null);

  // Debounce búsqueda
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedBusqueda(busqueda), 400);
    return () => clearTimeout(timer);
  }, [busqueda]);

  // ── Query: Listado ──
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['proveedores', page, debouncedBusqueda, estadoFilter],
    queryFn: () => fetchProveedores(page, PAGE_SIZE, debouncedBusqueda, estadoFilter),
    refetchOnWindowFocus: false,
  });

  const proveedores: Proveedor[] = data?.data ?? [];
  const pagination = data?.pagination;

  // ── Mutation: Guardar ──
  const saveMutation = useMutation({
    mutationFn: saveProveedor,
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.error || 'Error al guardar');
        return;
      }
      toast.success(editingProveedor ? 'Proveedor actualizado correctamente' : 'Proveedor creado correctamente');
      setShowForm(false);
      setEditingProveedor(null);
      queryClient.invalidateQueries({ queryKey: ['proveedores'] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  // ── Mutation: Desactivar ──
  const deactivateMutation = useMutation({
    mutationFn: deactivateProveedor,
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.error || 'Error al desactivar');
        return;
      }
      toast.success(res.message || 'Proveedor desactivado correctamente');
      setDeleteConfirm(null);
      queryClient.invalidateQueries({ queryKey: ['proveedores'] });
    },
    onError: () => toast.error('Error de conexión'),
  });

  // ── Handlers ──
  const handleNew = () => {
    setEditingProveedor(null);
    setShowForm(true);
  };

  const handleEdit = (p: Proveedor) => {
    setEditingProveedor(p);
    setShowForm(true);
  };

  const handleDelete = (p: Proveedor) => {
    if (p.estado === 'inactivo') {
      toast.info('Este proveedor ya está desactivado');
      return;
    }
    setDeleteConfirm(p);
  };

  const handleSave = (formData: ProveedorForm) => {
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      toast.error(Object.values(errors)[0]);
      return;
    }
    saveMutation.mutate(formData);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      deactivateMutation.mutate(deleteConfirm.id);
    }
  };

  // ── Permisos ──
  const canView = can('view', 'proveedores') || can('view', 'produccion');
  const canCreate = can('create', 'proveedores') || can('edit', 'proveedores');
  const canDelete = can('delete', 'proveedores');

  if (authLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Verificando permisos...</p>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg font-semibold">No tienes permisos para ver esta sección</p>
      </div>
    );
  }

  // ── Render ──
  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 rounded-xl">
              <Building2 className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Proveedores</h1>
              <p className="text-gray-500 text-sm">Gestión de abastecimiento y suministros</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {canCreate && (
              <Button
                onClick={handleNew}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold gap-2 h-11 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Agregar Proveedor
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <StatCard
            label="TOTAL"
            value={pagination?.total ?? 0}
            color="rose"
            isActive={!estadoFilter}
            onClick={() => setEstadoFilter('')}
          />
          <StatCard
            label="ACTIVOS"
            value={(proveedores ?? []).filter((p: Proveedor) => p.estado === 'activo').length}
            color="emerald"
            isActive={estadoFilter === 'activo'}
            onClick={() => setEstadoFilter('activo')}
          />
          <StatCard
            label="INACTIVOS"
            value={(proveedores ?? []).filter((p: Proveedor) => p.estado === 'inactivo').length}
            color="orange"
            isActive={estadoFilter === 'inactivo'}
            onClick={() => setEstadoFilter('inactivo')}
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por razón social o RUC..."
              className="pl-10 h-11 border-gray-200 focus:ring-rose-500"
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPage(1); }}
            />
          </div>
          <Button variant="outline" className="h-11 border-gray-200" onClick={() => refetch()}>
            <RefreshCw className={`w-4 h-4 ${isLoading && 'animate-spin'}`} />
          </Button>
        </div>

        {/* Tabla */}
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center bg-white rounded-xl border animate-pulse">
            <Loader2 className="w-10 h-10 text-rose-500 animate-spin mb-4" />
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Cargando proveedores...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <ProveedorTable
              data={proveedores}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewDetail={setViewDetail}
              canEdit={canCreate}
              canDelete={canDelete}
            />

            {/* Paginación */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
                <p className="text-xs text-gray-500">
                  Mostrando <span className="font-bold text-gray-900">{proveedores.length}</span> de{' '}
                  <span className="font-bold text-gray-900">{pagination.total}</span>
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="px-4 py-1.5 text-xs font-bold bg-gray-50 border rounded-lg flex items-center">
                    Página {page} de {pagination.totalPages}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= pagination.totalPages}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <ProveedorFormModal
          proveedor={editingProveedor}
          onClose={() => { setShowForm(false); setEditingProveedor(null); }}
          onSave={handleSave}
          isSaving={saveMutation.isPending}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <DeleteConfirmModal
          proveedor={deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleConfirmDelete}
          isDeleting={deactivateMutation.isPending}
        />
      )}

      {/* Detail Modal */}
      {viewDetail && (
        <ProveedorDetailModal
          proveedor={viewDetail}
          onClose={() => setViewDetail(null)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────

function StatCard({ label, value, color, isActive, onClick }: {
  label: string; value: number; color: string; isActive: boolean; onClick: () => void;
}) {
  const colorMap: Record<string, { border: string; ring: string; text: string; bg: string; iconBg: string }> = {
    rose: { border: 'border-rose-500', ring: 'ring-rose-50', text: 'text-rose-600', bg: 'bg-rose-50', iconBg: 'bg-rose-600' },
    emerald: { border: 'border-emerald-500', ring: 'ring-emerald-50', text: 'text-emerald-600', bg: 'bg-emerald-50', iconBg: 'bg-emerald-600' },
    orange: { border: 'border-orange-500', ring: 'ring-orange-50', text: 'text-orange-600', bg: 'bg-orange-50', iconBg: 'bg-orange-600' },
  };
  const c = colorMap[color] ?? colorMap.rose;

  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-xl border transition-all duration-300 flex items-center gap-3 cursor-pointer ${
        isActive
          ? `${c.border} ring-4 shadow-xl scale-[1.02] z-10 ${c.bg}`
          : 'bg-white border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-95'
      }`}
    >
      <div className={`p-2 rounded-lg transition-all duration-300 ${
        isActive ? `${c.iconBg} text-white rotate-3` : 'bg-gray-100 text-gray-600 group-hover:rotate-3'
      }`}>
        <Building2 className="w-5 h-5" />
      </div>
      <div className="text-left overflow-hidden">
        <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest truncate">{label}</p>
        <p className={`text-xl font-black tracking-tight ${isActive ? c.text : 'text-gray-800'}`}>
          {value}
        </p>
      </div>
    </button>
  );
}

function ProveedorTable({ data, onEdit, onDelete, onViewDetail, canEdit, canDelete }: {
  data: Proveedor[];
  onEdit: (p: Proveedor) => void;
  onDelete: (p: Proveedor) => void;
  onViewDetail: (p: Proveedor) => void;
  canEdit: boolean;
  canDelete: boolean;
}) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border shadow-sm p-12 text-center">
        <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-semibold">No se encontraron proveedores</p>
        <p className="text-gray-400 text-sm mt-1">Intenta ajustar los filtros de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Razón Social</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">RUC</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden md:table-cell">Contacto</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden lg:table-cell">Categoría</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Estado</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3">
                  <button onClick={() => onViewDetail(p)} className="font-semibold text-gray-900 hover:text-rose-600 transition-colors text-left">
                    {p.razon_social}
                  </button>
                </td>
                <td className="px-4 py-3 font-mono text-gray-600">{p.ruc}</td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{p.contacto}</td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="inline-flex px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full">
                    {p.categoria_suministro}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                    p.estado === 'activo'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                  }`}>
                    {p.estado === 'activo' ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600"
                      onClick={() => onViewDetail(p)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {canEdit && (
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-amber-600"
                        onClick={() => onEdit(p)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                    {canDelete && p.estado === 'activo' && (
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600"
                        onClick={() => onDelete(p)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FORM MODAL
// ─────────────────────────────────────────────────────────────

function ProveedorFormModal({ proveedor, onClose, onSave, isSaving }: {
  proveedor: Proveedor | null;
  onClose: () => void;
  onSave: (data: ProveedorForm) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<ProveedorForm>({
    id: proveedor?.id ?? '',
    ruc: proveedor?.ruc ?? '',
    razon_social: proveedor?.razon_social ?? '',
    contacto: proveedor?.contacto ?? '',
    telefono: proveedor?.telefono ?? '',
    email: proveedor?.email ?? '',
    direccion: proveedor?.direccion ?? '',
    categoria_suministro: proveedor?.categoria_suministro ?? '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof ProveedorForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSave({ ...form, id: proveedor?.id });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {proveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {proveedor ? 'Actualiza los datos del proveedor' : 'Registra un nuevo proveedor de suministro'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* RUC */}
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">RUC *</label>
              <Input
                value={form.ruc}
                onChange={(e) => handleChange('ruc', e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="20123456789"
                className={errors.ruc ? 'border-red-400 focus:ring-red-400' : ''}
                maxLength={11}
              />
              {errors.ruc && <p className="text-xs text-red-500 mt-1">{errors.ruc}</p>}
            </div>

            {/* Categoría */}
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Categoría *</label>
              <select
                value={form.categoria_suministro}
                onChange={(e) => handleChange('categoria_suministro', e.target.value)}
                className={`w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                  errors.categoria_suministro ? 'border-red-400' : 'border-gray-200'
                }`}
              >
                <option value="">Seleccionar...</option>
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.categoria_suministro && <p className="text-xs text-red-500 mt-1">{errors.categoria_suministro}</p>}
            </div>
          </div>

          {/* Razón Social */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Razón Social *</label>
            <Input
              value={form.razon_social}
              onChange={(e) => handleChange('razon_social', e.target.value)}
              placeholder="Empresa S.A.C."
              className={errors.razon_social ? 'border-red-400' : ''}
            />
            {errors.razon_social && <p className="text-xs text-red-500 mt-1">{errors.razon_social}</p>}
          </div>

          {/* Contacto */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Persona de Contacto *</label>
            <Input
              value={form.contacto}
              onChange={(e) => handleChange('contacto', e.target.value)}
              placeholder="Nombre completo"
              className={errors.contacto ? 'border-red-400' : ''}
            />
            {errors.contacto && <p className="text-xs text-red-500 mt-1">{errors.contacto}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Teléfono */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Teléfono *</label>
              <Input
                value={form.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                placeholder="+51 999 999 999"
                className={errors.telefono ? 'border-red-400' : ''}
              />
              {errors.telefono && <p className="text-xs text-red-500 mt-1">{errors.telefono}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email *</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="contacto@empresa.com"
                className={errors.email ? 'border-red-400' : ''}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Dirección *</label>
            <Input
              value={form.direccion}
              onChange={(e) => handleChange('direccion', e.target.value)}
              placeholder="Av. Principal 123, Lima"
              className={errors.direccion ? 'border-red-400' : ''}
            />
            {errors.direccion && <p className="text-xs text-red-500 mt-1">{errors.direccion}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11" disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 h-11 bg-rose-600 hover:bg-rose-700 text-white" disabled={isSaving}>
              {isSaving ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Guardando...</>
              ) : proveedor ? (
                'Actualizar'
              ) : (
                'Crear Proveedor'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DELETE CONFIRMATION MODAL
// ─────────────────────────────────────────────────────────────

function DeleteConfirmModal({ proveedor, onClose, onConfirm, isDeleting }: {
  proveedor: Proveedor;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Desactivar Proveedor</h3>
        <p className="text-sm text-gray-500 mt-2">
          ¿Estás seguro de desactivar a <span className="font-semibold text-gray-900">{proveedor.razon_social}</span>?
          Esta acción es un borrado lógico y se puede revertir.
        </p>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1 h-11" disabled={isDeleting}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white" disabled={isDeleting}>
            {isDeleting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Desactivando...</> : 'Desactivar'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DETAIL MODAL
// ─────────────────────────────────────────────────────────────

function ProveedorDetailModal({ proveedor, onClose }: {
  proveedor: Proveedor;
  onClose: () => void;
}) {
  const fields = [
    { label: 'RUC', value: proveedor.ruc },
    { label: 'Razón Social', value: proveedor.razon_social },
    { label: 'Contacto', value: proveedor.contacto },
    { label: 'Teléfono', value: proveedor.telefono },
    { label: 'Email', value: proveedor.email },
    { label: 'Dirección', value: proveedor.direccion },
    { label: 'Categoría', value: proveedor.categoria_suministro },
    { label: 'Estado', value: proveedor.estado === 'activo' ? 'Activo' : 'Inactivo' },
    { label: 'Insumos asociados', value: String(proveedor._count?.insumos ?? 0) },
    { label: 'Órdenes de compra', value: String(proveedor._count?.ordenes_compra ?? 0) },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 rounded-xl">
              <Building2 className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{proveedor.razon_social}</h3>
              <p className="text-xs text-gray-500">RUC: {proveedor.ruc}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-6 space-y-3">
          {fields.map((f) => (
            <div key={f.label} className="flex justify-between items-center py-2 border-b last:border-0">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{f.label}</span>
              <span className="text-sm font-medium text-gray-900">{f.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
