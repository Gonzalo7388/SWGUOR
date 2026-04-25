"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Ruler, Package2, Edit,
  Clock, RefreshCw, DollarSign, Layers,
} from "lucide-react";
import dynamic from "next/dynamic";

const EditFichaDialog    = dynamic(() => import("@/components/admin/fichas-tecnicas/EditFichaDialog"));
const MedidasEditor      = dynamic(() => import("@/components/admin/fichas-tecnicas/MedidasEditor"));
const DetallesMateriales = dynamic(() => import("@/components/admin/fichas-tecnicas/DetallesMateriales"));

const FICHA_DETALLE_KEY = "ficha-tecnica-detalle";

async function fetchFichaPorId(id: string) {
  const res  = await fetch(`/api/admin/fichas-tecnicas/${id}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error);
  return body.data;
}

type TabKey = "info" | "medidas" | "materiales";

const ESTADOS: Record<string, { label: string; color: string }> = {
  borrador: { label: "Borrador", color: "bg-gray-50    text-gray-600    border-gray-200"    },
  activo:   { label: "Activo",   color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  revision: { label: "Revisión", color: "bg-amber-50   text-amber-700   border-amber-200"   },
  obsoleto: { label: "Obsoleto", color: "bg-red-50     text-red-700     border-red-200"     },
};

export default function FichaTecnicaDetallePage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();
  const qc      = useQueryClient();
  const { can } = usePermissions();

  const [activeTab, setActiveTab] = useState<TabKey>("info");
  const [editOpen, setEditOpen]   = useState(false);

  const canEdit = can("edit", "ficha_tecnica");

  const { data: ficha, isLoading, refetch } = useQuery({
    queryKey: [FICHA_DETALLE_KEY, id],
    queryFn:  () => fetchFichaPorId(id),
    enabled:  !!id,
    refetchOnWindowFocus: false,
  });

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Cargando ficha…</p>
    </div>
  );

  if (!ficha) return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <FileText className="w-16 h-16 text-slate-200" />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Ficha no encontrada</p>
      <Button variant="outline" onClick={() => router.back()}>Volver</Button>
    </div>
  );

  const estadoInfo = ESTADOS[ficha.estado] ?? ESTADOS.borrador;

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon"
              onClick={() => router.push("/admin/Panel-Administrativo/fichas-tecnicas")}
              className="h-9 w-9 border-slate-200 shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-bold text-gray-900">
                  {ficha.productos?.nombre ?? "Ficha Técnica"}
                </h1>
                <span className="text-lg font-mono text-slate-400">v{ficha.version}</span>
                <Badge variant="outline"
                  className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase border ${estadoInfo.color}`}>
                  {estadoInfo.label}
                </Badge>
              </div>
              <p className="text-gray-500 text-sm mt-0.5">
                SKU: <span className="font-mono font-semibold">{ficha.productos?.sku ?? "—"}</span>
                {ficha.descripcion_detallada && (
                  <span className="ml-2 text-slate-400">· {ficha.descripcion_detallada}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => refetch()} className="h-9 w-9 border-slate-200">
              <RefreshCw className="w-4 h-4" />
            </Button>
            {canEdit && (
              <Button onClick={() => setEditOpen(true)}
                className="bg-pink-600 hover:bg-pink-700 text-white font-bold gap-2 h-10 px-5 active:scale-95">
                <Edit className="w-4 h-4" /> Editar ficha
              </Button>
            )}
          </div>
        </div>

        {/* ── Mini stats ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MiniStat icon={<Ruler size={16} />}    label="Medidas"       value={`${ficha.ficha_medidas?.length ?? 0} puntos`}      color="blue"    />
          <MiniStat icon={<Layers size={16} />}   label="Materiales"    value={`${ficha.fichas_tecnicas_detalle?.length ?? 0} items`} color="purple" />
          <MiniStat icon={<Clock size={16} />}    label="SAM total"     value={ficha.sam_total ? `${ficha.sam_total} min` : "—"}  color="orange"  />
          <MiniStat icon={<DollarSign size={16}/>} label="Costo estim." value={ficha.costo_estimado ? `S/ ${Number(ficha.costo_estimado).toFixed(2)}` : "—"} color="emerald" />
        </div>

        {/* ── Tabs ───────────────────────────────────────────── */}
        <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-100 shadow-sm p-1.5 w-fit">
          <TabPill active={activeTab === "info"}      onClick={() => setActiveTab("info")}
            icon={<FileText size={15} />}  label="Info general" />
          <TabPill active={activeTab === "medidas"}   onClick={() => setActiveTab("medidas")}
            icon={<Ruler size={15} />}     label="Medidas" />
          <TabPill active={activeTab === "materiales"} onClick={() => setActiveTab("materiales")}
            icon={<Package2 size={15} />}  label="Materiales e Insumos" />
        </div>

        {/* ── TAB: INFO ──────────────────────────────────────── */}
        {activeTab === "info" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard label="Producto"            value={ficha.productos?.nombre ?? "—"} />
            <InfoCard label="SKU"                 value={ficha.productos?.sku    ?? "—"} mono />
            <InfoCard label="Versión"             value={`v${ficha.version}`}             mono />
            <InfoCard label="Estado"              value={estadoInfo.label} />
            <InfoCard label="SAM total"           value={ficha.sam_total ? `${ficha.sam_total} min` : "No definido"} />
            <InfoCard label="Costo estimado"      value={ficha.costo_estimado ? `S/ ${Number(ficha.costo_estimado).toFixed(2)}` : "No definido"} />
            {ficha.descripcion_detallada && (
              <div className="md:col-span-2">
                <InfoCard label="Descripción detallada" value={ficha.descripcion_detallada} />
              </div>
            )}
            {ficha.ficha_url && (
              <div className="md:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Ficha PDF</p>
                  <p className="text-sm text-slate-600 truncate max-w-xs">{ficha.ficha_url}</p>
                </div>
                <a href={ficha.ficha_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="border-pink-200 text-pink-600 hover:bg-pink-50 font-bold gap-1.5">
                    <FileText size={14} /> Ver PDF
                  </Button>
                </a>
              </div>
            )}
            {ficha.imagen_geometral && (
              <div className="md:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">Imagen geometral</p>
                <img
                  src={ficha.imagen_geometral}
                  alt="Geometral"
                  className="max-h-80 object-contain rounded-lg border border-slate-100 mx-auto"
                />
              </div>
            )}
          </div>
        )}

        {/* ── TAB: MEDIDAS ───────────────────────────────────── */}
        {activeTab === "medidas" && (
          <MedidasEditor fichaId={id} canEdit={canEdit} />
        )}

        {/* ── TAB: MATERIALES ────────────────────────────────── */}
        {activeTab === "materiales" && (
          <DetallesMateriales fichaId={id} canEdit={canEdit} />
        )}

      </div>

      {/* ── Dialog editar ──────────────────────────────────── */}
      {editOpen && ficha && (
        <EditFichaDialog
          isOpen={editOpen}
          ficha={ficha}
          onClose={() => setEditOpen(false)}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: [FICHA_DETALLE_KEY, id] });
            setEditOpen(false);
          }}
        />
      )}
    </div>
  );
}

// ─── MiniStat ─────────────────────────────────────────────────
const MINI_COLORS: Record<string, { bg: string; icon: string; value: string }> = {
  blue:   { bg: "bg-blue-50   border-blue-100",   icon: "text-blue-500",   value: "text-blue-700"   },
  purple: { bg: "bg-purple-50 border-purple-100", icon: "text-purple-500", value: "text-purple-700" },
  orange: { bg: "bg-orange-50 border-orange-100", icon: "text-orange-500", value: "text-orange-700" },
  emerald:{ bg: "bg-emerald-50 border-emerald-100",icon:"text-emerald-500",value: "text-emerald-700"},
};

function MiniStat({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string; color: string;
}) {
  const c = MINI_COLORS[color] ?? MINI_COLORS.blue;
  return (
    <div className={`rounded-xl border p-4 flex items-center gap-3 ${c.bg}`}>
      <div className={`shrink-0 ${c.icon}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <p className={`text-sm font-black truncate ${c.value}`}>{value}</p>
      </div>
    </div>
  );
}

// ─── TabPill ──────────────────────────────────────────────────
function TabPill({ active, onClick, icon, label }: {
  active: boolean; onClick: () => void;
  icon: React.ReactNode; label: string;
}) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 active:scale-95 ${
        active ? "bg-pink-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
      }`}>
      {icon}{label}
    </button>
  );
}

// ─── InfoCard ─────────────────────────────────────────────────
function InfoCard({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-sm font-bold text-slate-800 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}