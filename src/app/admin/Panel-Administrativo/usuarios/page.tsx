"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient }        from "@tanstack/react-query";
import { Button }     from "@/components/ui/button";
import { toast }      from "sonner";
import {
  RefreshCw, Users, Briefcase, Building2, UserPlus,
  FileSpreadsheet, FileText,
  CheckCircle2, XCircle, ShieldOff,
} from "lucide-react";
import dynamic from "next/dynamic";
import { usePermissions } from "@/lib/hooks/usePermissions";
import {
  exportPersonalToExcel, exportPersonalToPDF,
  exportClientesToExcel, exportClientesToPDF,
} from "@/lib/utils/export-utils";

import UsuariosTable  from "@/components/admin/usuarios/UsuarioTable";
import UsuarioFilters, { EMPTY_FILTERS, type UsuarioFiltrosState }
                      from "@/components/admin/usuarios/UsuarioFilter";
import PersonalTable, { type PersonalRow }
                      from "@/components/admin/usuarios/personal/PersonalTable";
import PersonalFilters, { EMPTY_PERSONAL_FILTERS, type PersonalFiltrosState }
                      from "@/components/admin/usuarios/personal/FiltersPersonal";
import ClientesTable  from "@/components/admin/usuarios/clientes/ClientesTable";
import ClienteFilters, { EMPTY_CLIENTE_FILTERS, type ClienteFiltrosState }
                      from "@/components/admin/usuarios/clientes/FiltersClientes";
import type { UsuarioConRelaciones } from "@/lib/services/usuarios-services";

const CreateUsuarioDialog = dynamic(() => import("@/components/admin/usuarios/CreateUsuarioDialog"));
const EditUsuarioDialog   = dynamic(() => import("@/components/admin/usuarios/EditUsuarioDialog"));
const SuspenderDialog     = dynamic(() => import("@/components/admin/usuarios/SuspenderUsuarioDialog"));
const EditClienteDialog   = dynamic(() => import("@/components/admin/usuarios/clientes/EditClienteDialog"));
const EditPersonalDialog  = dynamic(() => import("@/components/admin/usuarios/personal/EditPersonalDialog"));

async function fetchUsuarios(): Promise<UsuarioConRelaciones[]> {
  const res = await fetch("/api/admin/usuarios"); const body = await res.json();
  if (!res.ok) throw new Error(body.error); return body.data ?? body;
}
async function fetchPersonal(): Promise<PersonalRow[]> {
  const res = await fetch("/api/admin/personal"); const body = await res.json();
  if (!res.ok) throw new Error(body.error); return body.data ?? [];
}
async function fetchClientes(): Promise<UsuarioConRelaciones[]> {
  const res = await fetch("/api/admin/usuarios"); const body = await res.json();
  if (!res.ok) throw new Error(body.error);
  return (body.data ?? body).filter((u: UsuarioConRelaciones) => u.clientes != null);
}

type Tab = "usuarios" | "personal" | "clientes";
type StatColor = "pink" | "emerald" | "blue" | "red" | "amber";

const STAT_COLOR: Record<StatColor, { border: string; ring: string; icon: string; label: string }> = {
  pink:    { border: "border-pink-500",    ring: "ring-pink-50",    icon: "bg-pink-600",    label: "text-pink-600"    },
  emerald: { border: "border-emerald-500", ring: "ring-emerald-50", icon: "bg-emerald-600", label: "text-emerald-600" },
  blue:    { border: "border-blue-500",    ring: "ring-blue-50",    icon: "bg-blue-600",    label: "text-blue-600"    },
  red:     { border: "border-red-500",     ring: "ring-red-50",     icon: "bg-red-500",     label: "text-red-600"     },
  amber:   { border: "border-amber-500",   ring: "ring-amber-50",   icon: "bg-amber-500",   label: "text-amber-600"   },
};

export default function UsuariosPage() {
  const { can, isLoading: authLoading } = usePermissions();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("usuarios");

  const usuariosQ = useQuery({ queryKey: ["usuarios"], queryFn: fetchUsuarios, refetchOnWindowFocus: false });
  const personalQ = useQuery({ queryKey: ["personal"], queryFn: fetchPersonal, refetchOnWindowFocus: false });
  const clientesQ = useQuery({ queryKey: ["clientes"], queryFn: fetchClientes, refetchOnWindowFocus: false });

  const [usuFiltros, setUsuFiltros] = useState<UsuarioFiltrosState>(EMPTY_FILTERS);
  const [perFiltros, setPerFiltros] = useState<PersonalFiltrosState>(EMPTY_PERSONAL_FILTERS);
  const [cliFiltros, setCliFiltros] = useState<ClienteFiltrosState>(EMPTY_CLIENTE_FILTERS);

  const [createUsuOpen, setCreateUsuOpen] = useState(false);
  const [selectedUser,  setSelectedUser]  = useState<UsuarioConRelaciones | null>(null);
  const [selectedPer,   setSelectedPer]   = useState<PersonalRow | null>(null);
  const [selectedCli,   setSelectedCli]   = useState<any | null>(null);
  const [dialogMode, setDialogMode] = useState<
    "edit-usu"|"suspender-usu"|"edit-per"|"suspender-per"|"edit-cli"|"suspender-cli"|null
  >(null);

  const canCreate = can("create", "usuarios");
  const canEdit   = can("edit",   "usuarios");
  const canExport = can("export", "usuarios");

  const usuariosFiltrados = useMemo(() => (usuariosQ.data ?? []).filter(u => {
    const nombre = u.personal_interno?.nombre_completo ?? "";
    const q = usuFiltros.q.toLowerCase();
    return (!q || nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
      (!usuFiltros.estado || u.estado === usuFiltros.estado) &&
      (!usuFiltros.rol    || u.rol    === usuFiltros.rol)    &&
      (!usuFiltros.cargo  || u.personal_interno?.cargo === usuFiltros.cargo);
  }), [usuariosQ.data, usuFiltros]);

  const personalFiltrado = useMemo(() => (personalQ.data ?? []).filter(p => {
    const q = perFiltros.q.toLowerCase();
    return (!q || (p.nombre_completo ?? "").toLowerCase().includes(q) || (p.usuarios?.email ?? "").toLowerCase().includes(q)) &&
      (!perFiltros.cargo  || p.cargo === perFiltros.cargo) &&
      (!perFiltros.estado || String(p.estado === true) === (perFiltros.estado === "activo" ? "true" : "false"));
  }), [personalQ.data, perFiltros]);

  const clientesFiltrados = useMemo(() => (clientesQ.data ?? []).filter(u => {
    const q = cliFiltros.q.toLowerCase(); const c = u.clientes;
    return (!q || (c?.razon_social ?? "").toLowerCase().includes(q) || (c?.ruc ?? "").includes(q) || u.email.toLowerCase().includes(q)) &&
      (!cliFiltros.estado || u.estado === cliFiltros.estado);
  }), [clientesQ.data, cliFiltros]);

  const usuStats = useMemo(() => {
    const l = usuariosQ.data ?? [];
    return { total: l.length, activos: l.filter(u => u.estado === "activo").length, inactivos: l.filter(u => u.estado !== "activo").length };
  }, [usuariosQ.data]);

  const perStats = useMemo(() => {
    const l = personalQ.data ?? [];
    return { total: l.length, activos: l.filter(p => p.estado !== false).length, inactivos: l.filter(p => p.estado === false).length };
  }, [personalQ.data]);

  const cliStats = useMemo(() => {
    const l = clientesQ.data ?? [];
    return { total: l.length, activos: l.filter(u => u.estado === "activo").length, inactivos: l.filter(u => u.estado !== "activo").length };
  }, [clientesQ.data]);

  const refresh = useCallback((key: "usuarios"|"personal"|"clientes") =>
    qc.invalidateQueries({ queryKey: [key] }), [qc]);

  if (authLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Verificando permisos…</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Módulo de Usuarios</h1>
            <p className="text-gray-500 text-sm">Gestión de accesos, personal interno y clientes</p>
          </div>
          {canCreate && (activeTab === "usuarios" || activeTab === "personal") && (
            <Button onClick={() => setCreateUsuOpen(true)}
              className={`${activeTab === "personal" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-pink-600 hover:bg-pink-700"} text-white font-bold gap-2 h-11 px-5 active:scale-95`}>
              <UserPlus className="w-4 h-4" />
              {activeTab === "personal" ? "Nuevo Personal" : "Nuevo Usuario"}
            </Button>
          )}
        </div>

        {/* StatCards como tabs */}
        <div className="grid grid-cols-3 gap-4">
          <TabStatCard active={activeTab === "usuarios"} onClick={() => setActiveTab("usuarios")}
            color="pink" icon={<Users className="w-5 h-5" />} label="USUARIOS DEL SISTEMA"
            stats={[
              { label: "Total",     value: usuStats.total,     icon: <Users        size={12} /> },
              { label: "Activos",   value: usuStats.activos,   icon: <CheckCircle2 size={12} />, color: "emerald" },
              { label: "Inactivos", value: usuStats.inactivos, icon: <XCircle      size={12} />, color: "red"     },
            ]} />
          <TabStatCard active={activeTab === "personal"} onClick={() => setActiveTab("personal")}
            color="emerald" icon={<Briefcase className="w-5 h-5" />} label="PERSONAL INTERNO"
            stats={[
              { label: "Total",     value: perStats.total,     icon: <Briefcase    size={12} /> },
              { label: "Activos",   value: perStats.activos,   icon: <CheckCircle2 size={12} />, color: "emerald" },
              { label: "Inactivos", value: perStats.inactivos, icon: <XCircle      size={12} />, color: "red"     },
            ]} />
          <TabStatCard active={activeTab === "clientes"} onClick={() => setActiveTab("clientes")}
            color="blue" icon={<Building2 className="w-5 h-5" />} label="CLIENTES REGISTRADOS"
            stats={[
              { label: "Total",     value: cliStats.total,     icon: <Building2    size={12} /> },
              { label: "Activos",   value: cliStats.activos,   icon: <CheckCircle2 size={12} />, color: "emerald" },
              { label: "Inactivos", value: cliStats.inactivos, icon: <ShieldOff    size={12} />, color: "amber"   },
            ]} />
        </div>

        {/* TAB: USUARIOS */}
        {activeTab === "usuarios" && (
          <TabSection loading={usuariosQ.isLoading} onRefresh={() => refresh("usuarios")}
            filters={<UsuarioFilters filters={usuFiltros} onChange={setUsuFiltros} totalCount={usuariosFiltrados.length} />}>
            <UsuariosTable usuarios={usuariosFiltrados} loading={usuariosQ.isLoading}
              onEdit={canEdit ? (u) => { setSelectedUser(u); setDialogMode("edit-usu"); } : undefined}
              onSuspender={canEdit ? (u) => { setSelectedUser(u); setDialogMode("suspender-usu"); } : undefined} />
          </TabSection>
        )}

        {/* TAB: PERSONAL */}
        {activeTab === "personal" && (
          <TabSection loading={personalQ.isLoading} onRefresh={() => refresh("personal")}
            exportButtons={canExport ? (
              <>
                <ExportBtn label="PDF"   icon={<FileText        className="w-4 h-4" />} color="red"
                  onClick={() => { if (!personalFiltrado.length) return toast.error("Sin datos"); exportPersonalToPDF(personalFiltrado).then(() => toast.success("PDF generado")); }} />
                <ExportBtn label="Excel" icon={<FileSpreadsheet className="w-4 h-4" />} color="emerald"
                  onClick={() => { if (!personalFiltrado.length) return toast.error("Sin datos"); exportPersonalToExcel(personalFiltrado).then(() => toast.success("Excel generado")); }} />
              </>
            ) : undefined}
            filters={<PersonalFilters filters={perFiltros} onChange={setPerFiltros} totalCount={personalFiltrado.length} />}>
            <PersonalTable data={personalFiltrado} loading={personalQ.isLoading}
              onEdit={canEdit ? (p) => { setSelectedPer(p); setDialogMode("edit-per"); } : undefined}
              onSuspender={canEdit ? (p) => { setSelectedPer(p); setDialogMode("suspender-per"); } : undefined} />
          </TabSection>
        )}

        {/* TAB: CLIENTES — solo editar y suspender, NO crear */}
        {activeTab === "clientes" && (
          <TabSection loading={clientesQ.isLoading} onRefresh={() => refresh("clientes")}
            exportButtons={canExport ? (
              <>
                <ExportBtn label="PDF"   icon={<FileText        className="w-4 h-4" />} color="red"
                  onClick={() => { if (!clientesFiltrados.length) return toast.error("Sin datos"); exportClientesToPDF(clientesFiltrados).then(() => toast.success("PDF generado")); }} />
                <ExportBtn label="Excel" icon={<FileSpreadsheet className="w-4 h-4" />} color="emerald"
                  onClick={() => { if (!clientesFiltrados.length) return toast.error("Sin datos"); exportClientesToExcel(clientesFiltrados).then(() => toast.success("Excel generado")); }} />
              </>
            ) : undefined}
            filters={<ClienteFilters filters={cliFiltros} onChange={setCliFiltros} totalCount={clientesFiltrados.length} />}>
            <ClientesTable usuarios={clientesFiltrados} loading={clientesQ.isLoading}
              onEdit={canEdit ? (u) => { setSelectedCli(u.clientes); setDialogMode("edit-cli"); } : undefined}
              onSuspender={canEdit ? (u) => { setSelectedUser(u); setDialogMode("suspender-cli"); } : undefined} />
          </TabSection>
        )}

      </div>

      {/* Diálogos */}
      <CreateUsuarioDialog isOpen={createUsuOpen} onClose={() => setCreateUsuOpen(false)}
        onSuccess={() => { refresh("usuarios"); refresh("personal"); }} />
      {selectedUser && dialogMode === "edit-usu" && (
        <EditUsuarioDialog isOpen usuario={selectedUser as any}
          onClose={() => { setDialogMode(null); setSelectedUser(null); }}
          onSuccess={() => { refresh("usuarios"); refresh("personal"); }} />
      )}
      {selectedUser && (dialogMode === "suspender-usu" || dialogMode === "suspender-cli") && (
        <SuspenderDialog isOpen usuario={selectedUser}
          onClose={() => { setDialogMode(null); setSelectedUser(null); }}
          onSuccess={() => { refresh("usuarios"); refresh("clientes"); }} />
      )}
      {selectedPer && dialogMode === "edit-per" && (
        <EditPersonalDialog isOpen persona={selectedPer}
          onClose={() => { setDialogMode(null); setSelectedPer(null); }}
          onSuccess={() => refresh("personal")} />
      )}
      {selectedCli && dialogMode === "edit-cli" && (
        <EditClienteDialog isOpen cliente={selectedCli}
          onClose={() => { setDialogMode(null); setSelectedCli(null); }}
          onSuccess={() => { refresh("clientes"); refresh("usuarios"); }} />
      )}
    </div>
  );
}

// ─── TabStatCard ─────────────────────────────────────────────
function TabStatCard({ active, onClick, color, icon, label, stats }: {
  active: boolean; onClick: () => void; color: StatColor;
  icon: React.ReactNode; label: string;
  stats: { label: string; value: number; icon: React.ReactNode; color?: StatColor }[];
}) {
  const s = STAT_COLOR[color];
  return (
    <button onClick={onClick}
      className={`group w-full p-4 rounded-xl border-2 transition-all duration-300 text-left space-y-3 cursor-pointer ${
        active ? `bg-white ${s.border} ring-4 ${s.ring} shadow-xl scale-[1.02]`
               : "bg-white border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
      }`}>
      <div className="flex items-center gap-2.5">
        <div className={`p-2 rounded-lg transition-all ${active ? `${s.icon} text-white rotate-3` : "bg-gray-100 text-gray-500 group-hover:rotate-3"}`}>
          {icon}
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest ${active ? s.label : "text-gray-400"}`}>
          {label}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {stats.map((stat, i) => {
          const sc = STAT_COLOR[stat.color ?? color];
          return (
            <div key={i} className="rounded-lg p-2 text-center bg-slate-50">
              <div className={`flex items-center justify-center gap-1 mb-0.5 ${active && stat.color ? sc.label : "text-gray-400"}`}>
                {stat.icon}
                <span className="text-[9px] font-bold uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className={`text-xl font-black tracking-tight ${
                active && stat.color ? sc.label : active ? s.label : "text-gray-700"
              }`}>{stat.value}</p>
            </div>
          );
        })}
      </div>
    </button>
  );
}

// ─── TabSection ───────────────────────────────────────────────
function TabSection({ loading, onRefresh, filters, exportButtons, children }: {
  loading: boolean; onRefresh: () => void; filters: React.ReactNode;
  exportButtons?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <div className="flex-1">{filters}</div>
        {exportButtons && <div className="flex gap-1.5 shrink-0 mt-0.5">{exportButtons}</div>}
        <Button variant="outline" size="icon" onClick={onRefresh} className="h-9 w-9 border-slate-200 shrink-0 mt-0.5">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {children}
      </div>
    </div>
  );
}

// ─── ExportBtn ────────────────────────────────────────────────
function ExportBtn({ label, icon, color, onClick }: {
  label: string; icon: React.ReactNode; color: "red"|"emerald"; onClick: () => void;
}) {
  const cls = { red: "border-red-200 text-red-600 hover:bg-red-50", emerald: "border-emerald-200 text-emerald-600 hover:bg-emerald-50" }[color];
  return (
    <Button variant="outline" size="sm" onClick={onClick}
      className={`h-9 gap-1.5 font-bold text-xs border ${cls} transition-all active:scale-95`}>
      {icon}<span className="hidden sm:inline">{label}</span>
    </Button>
  );
}