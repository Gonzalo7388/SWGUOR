"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button }  from "@/components/ui/button";
import { Badge }   from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, Building2, Mail, Phone, MapPin, FileText,
  ShoppingBag, Package, Clock, TrendingUp, Star,
  XCircle, CreditCard, Hash, CalendarDays, ShieldCheck, BarChart2,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────
interface Direccion {
  id:           string;
  alias:        string;
  direccion:    string;
  ciudad:       string | null;
  departamento: string | null;
  es_principal: boolean;
}

interface Pedido {
  id:             string;
  estado:         string;
  prioridad:      string;
  total_estimado: string;
  total_unidades: number;
  moq_aplicado:   number;
  notas_cliente:  string | null;
  created_at:     string;
  pedido_items:   { id: string; cantidad: number }[];
}

interface Variante {
  color:    string | null;
  talla:    string | null;
  sku:      string | null;
  cantidad: number;
}

interface ProductoTop {
  producto_id:    string;
  nombre:         string;
  sku:            string | null;
  imagen:         string | null;
  total_cantidad: number;
  total_pedidos:  number;
  variantes:      Variante[];
}

interface Metricas {
  totalPedidos:             number;
  pedidosActivos:           number;
  ultimoPedido:             string | null;
  diasDesdeUltimo:          number | null;
  totalUnidades:            number;
  totalEstimado:            number;
  totalProductosDistintos:  number;
}

interface ClienteDetalle {
  id:               string;
  ruc:              string;
  razon_social:     string | null;
  nombre_comercial: string | null;
  email:            string | null;
  telefono:         string | null;
  direccion_fiscal: string | null;
  tipo_cliente:     string | null;
  activo:           string;
  created_at:       string;
  usuarios:         { email: string; estado: string; ultimo_acceso: string | null } | null;
  direcciones_cliente: Direccion[];
  pedidos:          Pedido[];
  productosTop:     ProductoTop[];
  metricas:         Metricas;
}

// ─── Helpers ─────────────────────────────────────────────────
const ESTADO_PEDIDO: Record<string, { label: string; cls: string }> = {
  pendiente:    { label: "Pendiente",    cls: "bg-slate-100   text-slate-600  border-slate-200"  },
  en_revision:  { label: "En revisión",  cls: "bg-blue-50     text-blue-700   border-blue-200"   },
  aprobado:     { label: "Aprobado",     cls: "bg-emerald-50  text-emerald-700 border-emerald-200"},
  en_produccion:{ label: "Producción",   cls: "bg-amber-50    text-amber-700  border-amber-200"  },
  entregado:    { label: "Entregado",    cls: "bg-teal-50     text-teal-700   border-teal-200"   },
  cancelado:    { label: "Cancelado",    cls: "bg-red-50      text-red-600    border-red-200"    },
};

const PRIORIDAD: Record<string, { label: string; cls: string }> = {
  normal:   { label: "Normal",   cls: "bg-slate-100  text-slate-600" },
  urgente:  { label: "Urgente",  cls: "bg-red-50     text-red-600"   },
  alta:     { label: "Alta",     cls: "bg-orange-50  text-orange-600"},
};

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(n);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

function timeAgo(days: number | null) {
  if (days === null) return "Sin pedidos";
  if (days === 0)    return "Hoy";
  if (days === 1)    return "Ayer";
  if (days < 30)     return `Hace ${days} días`;
  if (days < 60)     return "Hace ~1 mes";
  return `Hace ${Math.floor(days / 30)} meses`;
}

// ─── Página ────────────────────────────────────────────────────
export default function DetalleClientePage() {
  const { id }    = useParams<{ id: string }>();
  const router    = useRouter();
  const [cliente, setCliente] = useState<ClienteDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/clientes/${id}`)
      .then(r => r.json())
      .then(body => {
        if (!body.success) throw new Error(body.error);
        setCliente(body.data);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSkeleton />;
  if (error || !cliente) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-3">
        <XCircle className="w-12 h-12 text-red-400 mx-auto" />
        <p className="text-slate-500 font-medium">{error ?? "Cliente no encontrado"}</p>
        <Button variant="outline" onClick={() => router.back()}>Volver</Button>
      </div>
    </div>
  );

  const { metricas } = cliente;
  const iniciales = (cliente.razon_social ?? cliente.email ?? "??").substring(0, 2).toUpperCase();
  const activo    = cliente.activo?.toLowerCase() === "activo";

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* 1. Breadcrumb */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}
            className="gap-1.5 text-slate-500 hover:text-slate-800 -ml-2">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Button>
          <span className="text-slate-300">/</span>
          <span className="text-xs text-slate-400 font-medium">Clientes</span>
          <span className="text-slate-300">/</span>
          <span className="text-xs text-slate-600 font-bold truncate">
            {cliente.razon_social ?? cliente.ruc}
          </span>
        </div>

        {/* 2. Hero */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className={`h-2 w-full ${activo ? "bg-gradient-to-r from-blue-500 to-blue-600" : "bg-slate-300"}`} />
          <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="h-16 w-16 rounded-2xl bg-blue-50 border-2 border-blue-100 text-blue-600 flex items-center justify-center font-black text-xl uppercase shrink-0">
              {iniciales}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight truncate">
                  {cliente.razon_social ?? "Sin razón social"}
                </h1>
                <Badge variant="outline" className={`text-[10px] font-bold uppercase px-2 py-0.5 ${activo ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-orange-50 text-orange-600 border-orange-200"}`}>
                  {activo ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Hash size={11} /> RUC: <span className="font-mono font-bold text-slate-600 ml-1">{cliente.ruc}</span></span>
                <span className="flex items-center gap-1"><Mail size={11} /> {cliente.email || cliente.usuarios?.email}</span>
                <span className="flex items-center gap-1"><CalendarDays size={11} /> Cliente desde {formatDate(cliente.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard icon={<ShoppingBag />} label="Total Pedidos" value={metricas.totalPedidos} sub="histórico" color="blue" />
          <MetricCard icon={<ShoppingBag />} label="Activos" value={metricas.pedidosActivos} sub="en proceso" color="amber" />
          <MetricCard icon={<Clock />} label="Último" value={timeAgo(metricas.diasDesdeUltimo)} sub={metricas.ultimoPedido ? formatDate(metricas.ultimoPedido) : "—"} color="pink" isText />
          <MetricCard icon={<TrendingUp />} label="Total Invertido" value={formatMoney(metricas.totalEstimado)} sub={`${metricas.totalUnidades} unidades`} color="emerald" isText />
          <MetricCard icon={<BarChart2 />} label="Mix Productos" value={metricas.totalProductosDistintos} sub="SKUs únicos" color="violet" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda */}
          <div className="space-y-5">
            <Section title="Información de la Empresa" icon={<Building2 className="w-4 h-4" />}>
               <InfoRow icon={<Hash size={13} />} label="RUC" value={cliente.ruc} mono />
               <InfoRow icon={<Building2 size={13} />} label="Razón Social" value={cliente.razon_social} />
               <InfoRow icon={<Mail size={13} />} label="Email" value={cliente.email ?? cliente.usuarios?.email} />
               <InfoRow icon={<MapPin size={13} />} label="Dir. Fiscal" value={cliente.direccion_fiscal} />
               <InfoRow icon={<ShieldCheck size={13} />} label="Estado Cuenta" value={activo ? "Activa" : "Suspendida"} valueColor={activo ? "text-emerald-600" : "text-orange-500"} />
            </Section>

            <Section title="Direcciones de Envío" icon={<MapPin className="w-4 h-4" />} badge={cliente.direcciones_cliente.length}>
              {cliente.direcciones_cliente.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Sin direcciones registradas</p>
              ) : (
                <div className="space-y-2.5">
                  {cliente.direcciones_cliente.map(dir => (
                    <div key={dir.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-700">{dir.alias} {dir.es_principal && <Star size={10} className="fill-yellow-400 text-yellow-400"/>}</div>
                      <p className="text-xs text-slate-500 mt-1">{dir.direccion}</p>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>

          {/* Columna Derecha */}
          <div className="lg:col-span-2 space-y-6">
            <Section title="Productos más Pedidos" icon={<TrendingUp className="w-4 h-4" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cliente.productosTop?.slice(0, 4).map((prod, idx) => (
                  <ProductoTopCard key={prod.producto_id} producto={prod} rank={idx + 1} />
                ))}
              </div>
            </Section>

            <Section title="Historial de Pedidos" icon={<ShoppingBag className="w-4 h-4" />} badge={metricas.totalPedidos}>
              <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-2">
                {cliente.pedidos.map((pedido) => (
                   <div key={pedido.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className="text-xs font-black font-mono text-slate-700">#{String(pedido.id).padStart(5, "0")}</div>
                        <Badge variant="outline" className="text-[9px] uppercase">{pedido.estado}</Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-slate-800">{formatMoney(Number(pedido.total_estimado))}</div>
                        <div className="text-[10px] text-slate-400">{formatDate(pedido.created_at)}</div>
                      </div>
                   </div>
                ))}
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────

function Section({ title, icon, badge, children }: {
  title:    string;
  icon:     React.ReactNode;
  badge?:   number;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100">
        <span className="text-slate-400">{icon}</span>
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-600 flex-1">{title}</h2>
        {badge !== undefined && badge > 0 && (
          <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function InfoRow({ icon, label, value, mono, capitalize, valueColor }: {
  icon:        React.ReactNode;
  label:       string;
  value?:      string | null;
  mono?:       boolean;
  capitalize?: boolean;
  valueColor?: string;
}) {
  return (
    <div className="flex items-start gap-2.5 py-2 border-b border-slate-50 last:border-0">
      <span className="text-slate-300 mt-0.5 shrink-0">{icon}</span>
      <span className="text-[11px] font-bold text-slate-400 w-28 shrink-0">{label}</span>
      <span className={`text-xs flex-1 min-w-0 ${
        valueColor ?? "text-slate-700"
      } ${mono ? "font-mono" : ""} ${capitalize ? "capitalize" : ""}`}>
        {value ?? <span className="text-slate-300">—</span>}
      </span>
    </div>
  );
}

function MetricCard({ icon, label, value, sub, color, isText }: {
  icon:    React.ReactNode;
  label:   string;
  value:   number | string;
  sub:     string;
  color:   "blue" | "amber" | "emerald" | "pink" | "slate" | "violet";
  isText?: boolean;
}) {
  const COLORS = {
    blue:    { bg: "bg-blue-50    border-blue-100",    icon: "text-blue-400",    val: "text-blue-700"    },
    amber:   { bg: "bg-amber-50   border-amber-100",   icon: "text-amber-400",   val: "text-amber-700"   },
    emerald: { bg: "bg-emerald-50 border-emerald-100", icon: "text-emerald-400", val: "text-emerald-700" },
    pink:    { bg: "bg-pink-50    border-pink-100",    icon: "text-pink-400",    val: "text-pink-700"    },
    slate:   { bg: "bg-slate-50   border-slate-100",   icon: "text-slate-300",   val: "text-slate-600"   },
    violet:  { bg: "bg-violet-50  border-violet-100",  icon: "text-violet-400",  val: "text-violet-700"  },
  };
  const c = COLORS[color];
  return (
    <div className={`rounded-xl border p-4 flex items-center justify-between gap-3 ${c.bg}`}>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">{label}</span>
        <span className={`${isText ? "text-base" : "text-3xl"} font-black leading-tight mt-1 ${c.val} truncate`}>
          {value}
        </span>
        <span className="text-[11px] text-slate-400 mt-0.5 truncate">{sub}</span>
      </div>
      <div className={`shrink-0 opacity-40 ${c.icon}`}>{icon}</div>
    </div>
  );
}

function ProductoTopCard({ producto, rank }: { producto: ProductoTop; rank: number }) {
  const RANK_COLORS = [
    "bg-yellow-400 text-white",   // 1
    "bg-slate-400  text-white",   // 2
    "bg-amber-600  text-white",   // 3
  ];
  const rankCls = RANK_COLORS[rank - 1] ?? "bg-slate-100 text-slate-500";
  const topVariantes = producto.variantes.slice(0, 3);

  return (
    <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all flex flex-col gap-2.5">
      {/* Rank + imagen */}
      <div className="flex items-start gap-2">
        <span className={`text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${rankCls}`}>
          {rank}
        </span>
        {producto.imagen ? (
          <img src={producto.imagen} alt={producto.nombre}
            className="w-10 h-10 rounded-lg object-cover border border-slate-100 shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
            <Package size={14} className="text-slate-300" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-800 leading-tight line-clamp-2">{producto.nombre}</p>
          {producto.sku && (
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{producto.sku}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-1.5">
        <div className="bg-blue-50 rounded-lg p-2 text-center">
          <p className="text-[9px] text-blue-400 font-bold uppercase tracking-wider">Unidades</p>
          <p className="text-base font-black text-blue-700 leading-none mt-0.5">
            {producto.total_cantidad.toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Pedidos</p>
          <p className="text-base font-black text-slate-600 leading-none mt-0.5">
            {producto.total_pedidos}
          </p>
        </div>
      </div>

      {/* Top variantes */}
      {topVariantes.length > 0 && (
        <div className="space-y-1">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Variantes</p>
          {topVariantes.map((v, i) => (
            <div key={i} className="flex items-center justify-between text-[10px]">
              <span className="text-slate-500 truncate flex items-center gap-1">
                {v.color && (
                  <span className="inline-block w-2 h-2 rounded-full bg-slate-300 shrink-0"
                    style={{ backgroundColor: v.color.toLowerCase() }} />
                )}
                {[v.color, v.talla].filter(Boolean).join(" / ") || v.sku || "—"}
              </span>
              <span className="font-bold text-slate-700 shrink-0 ml-1">{v.cantidad} uds.</span>
            </div>
          ))}
          {producto.variantes.length > 3 && (
            <p className="text-[9px] text-slate-400">+{producto.variantes.length - 3} más</p>
          )}
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-4">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
          <div className="col-span-2">
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    </div>
  );
}