'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePathname } from 'next/navigation';
import {
  FileSpreadsheet,
  Users,
  UserCheck,
  UserMinus,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Star,
  Search,
  RefreshCw,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { exportToExcel } from '@/lib/utils/export-utils';
import ClientesTable from './ClientesTable';
import { CreateClienteModal } from './CreateClienteModal';
import type { ClienteStats, ClienteRow } from './components/actions';

interface ClientesPageClientProps {
  initialData: ClienteRow[];
  initialStats: ClienteStats;
  initialPage: number;
  initialStatusFilter: string | null;
  initialSearch: string;
  totalCount: number;
  pageSize: number;
}

export default function ClientesPageClient({
  initialData,
  initialStats,
  initialPage,
  initialStatusFilter,
  initialSearch,
  totalCount,
  pageSize,
}: ClientesPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [clientes, setClientes] = useState<ClienteRow[]>(initialData);
  const [stats, setStats] = useState<ClienteStats>(initialStats);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [statusFilter, setStatusFilter] = useState<string | null>(initialStatusFilter);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // ── Navegación con query params ──
  const navigate = useCallback(
    (newPage: number, newStatus: string | null, newSearch: string) => {
      const params = new URLSearchParams();
      if (newPage > 0) params.set('page', String(newPage));
      if (newStatus) params.set('status', newStatus);
      if (newSearch) params.set('search', newSearch);
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router]
  );

  // ── Recargar datos ──
  const refreshData = useCallback(() => {
    router.refresh();
  }, [router]);

  // ── Handle stats refresh after create ──
  const handleModalSuccess = () => {
    setStats((prev) => ({
      ...prev,
      total: prev.total + 1,
      activo: prev.activo + 1,
    }));
    refreshData();
  };

  // ── Toggle status ──
  const handleToggleStatus = async (cliente: ClienteRow) => {
    try {
      // TODO: Implementar con Supabase o Prisma server action
      toast.info('Cambio de estado próximamente');
    } catch {
      toast.error('No se pudo cambiar el estado');
    }
  };

  // ── Edit (placeholder) ──
  const handleEdit = (_cliente: ClienteRow) => {
    toast.info('Edición de clientes próximamente');
  };

  // ── Delete (placeholder) ──
  const handleDelete = (_cliente: ClienteRow) => {
    toast.info('Eliminación de clientes próximamente');
  };

  // ── Export Excel ──
  const handleExportExcel = () => {
    if (clientes.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    const dataToExport = clientes.map((c) => ({
      'Cliente / Empresa':
        c.razon_social ||
        [c.nombre, c.apellido_paterno, c.apellido_materno].filter(Boolean).join(' '),
      'RUC': c.ruc,
      'Tipo Documento': c.tipo_documento,
      'Email': c.email || '---',
      'Teléfono': c.telefono || '---',
      'Dirección Fiscal': c.direccion_fiscal || '---',
      'Estado': c.activo?.toUpperCase() || 'S/E',
      'Código': c.codigo_cliente || '---',
    }));

    exportToExcel(dataToExport, {
      filename: `Clientes_GUOR_${new Date().toISOString().split('T')[0]}`,
    });
    toast.success('Excel generado exitosamente');
  };

  // ── Calcular totalPages ──
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ═══════════════════════════════════════════
            HEADER
            ═══════════════════════════════════════════ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Directorio de Clientes</h1>
            <p className="text-gray-500 text-sm">Gestión de base de datos GUOR</p>
          </div>

          <div className="flex items-center gap-3">
            {/* ── Botón Nuevo Cliente ── */}
            <Button
              onClick={() => setModalOpen(true)}
              className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 rounded-xl transition-all active:scale-95"
            >
              <Building2 className="w-5 h-5" />
              <span className="hidden sm:inline">Nuevo Cliente</span>
            </Button>

            {/* ── Botón Exportar Excel ── */}
            <Button
              onClick={handleExportExcel}
              variant="outline"
              className="bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold gap-2 h-11 transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span className="hidden sm:inline">Exportar Excel</span>
            </Button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            STATS CARDS
            ═══════════════════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="TOTAL"
            value={stats.total}
            icon={<Users className="w-5 h-5" />}
            isActive={statusFilter === null}
            color="pink"
            onClick={() => {
              setStatusFilter(null);
              setCurrentPage(0);
              navigate(0, null, searchTerm);
            }}
          />
          <StatCard
            title="ACTIVOS"
            value={stats.activo}
            icon={<UserCheck className="w-5 h-5" />}
            isActive={statusFilter === 'activo'}
            color="emerald"
            onClick={() => {
              setStatusFilter('activo');
              setCurrentPage(0);
              navigate(0, 'activo', searchTerm);
            }}
          />
          <StatCard
            title="INACTIVOS"
            value={stats.inactivo}
            icon={<UserMinus className="w-5 h-5" />}
            isActive={statusFilter === 'inactivo'}
            color="orange"
            onClick={() => {
              setStatusFilter('inactivo');
              setCurrentPage(0);
              navigate(0, 'inactivo', searchTerm);
            }}
          />
          <StatCard
            title="PROSPECTOS"
            value={stats.prospecto}
            icon={<Star className="w-5 h-5" />}
            isActive={statusFilter === 'prospecto'}
            color="blue"
            onClick={() => {
              setStatusFilter('prospecto');
              setCurrentPage(0);
              navigate(0, 'prospecto', searchTerm);
            }}
          />
        </div>

        {/* ═══════════════════════════════════════════
            BUSCADOR
            ═══════════════════════════════════════════ */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por razón social, RUC o nombre..."
              className="pl-10 h-11 border-gray-200 focus:ring-pink-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(0);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate(0, statusFilter, searchTerm);
                }
              }}
            />
          </div>
          <Button
            variant="outline"
            className="h-11 border-gray-200"
            onClick={() => navigate(0, statusFilter, searchTerm)}
          >
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="outline" className="h-11 border-gray-200" onClick={refreshData}>
            <RefreshCw className={`w-4 h-4 ${loading && 'animate-spin'}`} />
          </Button>
        </div>

        {/* ═══════════════════════════════════════════
            TABLA
            ═══════════════════════════════════════════ */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center bg-white rounded-xl border animate-pulse">
            <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">
              Sincronizando clientes...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <ClientesTable
              data={clientes}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onRegisterFirstClient={() => setModalOpen(true)}
            />

            {/* ── Paginación ── */}
            {totalCount > pageSize && (
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
                <p className="text-xs text-gray-500">
                  Mostrando{' '}
                  <span className="font-bold text-gray-900">{clientes.length}</span> de{' '}
                  <span className="font-bold text-gray-900">{totalCount}</span>
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newPage = currentPage - 1;
                      setCurrentPage(newPage);
                      navigate(newPage, statusFilter, searchTerm);
                    }}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="px-4 py-1.5 text-xs font-bold bg-gray-50 border rounded-lg flex items-center">
                    Página {currentPage + 1} de {totalPages || 1}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newPage = currentPage + 1;
                      setCurrentPage(newPage);
                      navigate(newPage, statusFilter, searchTerm);
                    }}
                    disabled={currentPage + 1 >= totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════
          MODAL DE CREACIÓN
          ═══════════════════════════════════════════ */}
      <CreateClienteModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// STAT CARD COMPONENT
// ═══════════════════════════════════════════════════════
function StatCard({
  title,
  value,
  icon,
  isActive,
  color,
  onClick,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  isActive: boolean;
  color: string;
  onClick: () => void;
}) {
  const styles: Record<string, { active: string; iconActive: string; iconInactive: string; textActive: string; textInactive: string }> = {
    pink: {
      active: 'border-pink-500 ring-pink-50 bg-white',
      iconActive: 'bg-pink-600 text-white',
      iconInactive: 'bg-gray-100 text-gray-600',
      textActive: 'text-pink-600',
      textInactive: 'text-gray-800',
    },
    emerald: {
      active: 'border-emerald-500 ring-emerald-50 bg-white',
      iconActive: 'bg-emerald-600 text-white',
      iconInactive: 'bg-gray-100 text-gray-600',
      textActive: 'text-emerald-600',
      textInactive: 'text-gray-800',
    },
    orange: {
      active: 'border-orange-500 ring-orange-50 bg-white',
      iconActive: 'bg-orange-600 text-white',
      iconInactive: 'bg-gray-100 text-gray-600',
      textActive: 'text-orange-600',
      textInactive: 'text-gray-800',
    },
    blue: {
      active: 'border-blue-500 ring-blue-50 bg-white',
      iconActive: 'bg-blue-600 text-white',
      iconInactive: 'bg-gray-100 text-gray-600',
      textActive: 'text-blue-600',
      textInactive: 'text-gray-800',
    },
  };

  const currentStyle = styles[color] || styles.pink;

  return (
    <button
      onClick={onClick}
      className={`group p-3 rounded-xl border transition-all duration-300 flex items-center gap-3 cursor-pointer ${
        isActive
          ? `ring-4 shadow-xl scale-[1.02] z-10 ${currentStyle.active}`
          : 'bg-white border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-95'
      }`}
    >
      <div
        className={`p-2 rounded-lg transition-all duration-300 ${
          isActive
            ? `${currentStyle.iconActive} rotate-3`
            : `${currentStyle.iconInactive} group-hover:rotate-3`
        }`}
      >
        {icon}
      </div>
      <div className="text-left overflow-hidden">
        <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest truncate">
          {title}
        </p>
        <p
          className={`text-xl font-black tracking-tight ${
            isActive ? currentStyle.textActive : currentStyle.textInactive
          }`}
        >
          {value}
        </p>
      </div>
    </button>
  );
}
