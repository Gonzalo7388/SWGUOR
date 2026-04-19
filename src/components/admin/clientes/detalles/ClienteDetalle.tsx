"use client";

import { useState }       from "react";
import { useRouter }      from "next/navigation";
import Link               from "next/link";
import { toast }          from "sonner";
import {
  ArrowLeft, Building2, Phone, Mail, MapPin,
  ShoppingBag, FileText, Clock, Edit2, Ban,
  UserCheck, ChevronRight,
} from "lucide-react";
import { Button }         from "@/components/ui/button";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { desactivarCliente, updateCliente } from "@/lib/helpers/clientes-helpers";

const ESTADO_COLORS: Record<string, string> = {
  activo:    "bg-emerald-100 text-emerald-700 border-emerald-200",
  inactivo:  "bg-orange-100  text-orange-700  border-orange-200",
  suspendido: "bg-red-100    text-red-700     border-red-200",
  potencial: "bg-blue-100   text-blue-700    border-blue-200",
};

const PEDIDO_ESTADO_COLORS: Record<string, string> = {
  pendiente:           "bg-amber-100  text-amber-700",
  en_produccion:       "bg-blue-100   text-blue-700",
  listo_para_despacho: "bg-emerald-100 text-emerald-700",
  entregado:           "bg-gray-100   text-gray-600",
  cancelado:           "bg-red-100    text-red-700",
};

export default function ClienteDetalle({ cliente }: { cliente: any }) {
  const router                        = useRouter();
  const { can }                       = usePermissions();
  const [activo, setActivo]           = useState(cliente.activo);
  const [loadingEstado, setLoadingEstado] = useState(false);

  const canEdit   = can('edit',   'clientes');
  const canDelete = can('delete', 'clientes');

  const handleToggleEstado = async () => {
    if (!canEdit) { toast.error("Sin permisos"); return; }
    setLoadingEstado(true);
    try {
      const nuevoEstado = activo === 'activo' ? 'inactivo' : 'activo';
      const res = await updateCliente(cliente.id, { activo: nuevoEstado } as any);
      if (!res.success) throw new Error(res.error);
      setActivo(nuevoEstado);
      toast.success(`Cliente ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoadingEstado(false);
    }
  };

  const handleDesactivar = async () => {
    if (!canDelete) { toast.error("Sin permisos"); return; }
    if (!confirm("¿Desactivar este cliente permanentemente?")) return;
    try {
      const res = await desactivarCliente(cliente.id);
      if (!res.success) throw new Error(res.error);
      toast.success("Cliente desactivado");
      router.push("/admin/Panel-Administrativo/clientes");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Breadcrumb */}
        <div>
          <Link
            href="/admin/Panel-Administrativo/clientes"
            className="inline-flex items-center gap-1.5 text-pink-600 hover:text-pink-700 text-xs font-bold uppercase tracking-widest mb-3 transition-colors"
          >
            <ArrowLeft size={13} />
            Volver a Clientes
          </Link>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-pink-600 flex items-center justify-center shadow-lg shadow-pink-100">
                <Building2 className="text-white w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {cliente.nombre_comercial ?? cliente.razon_social ?? "—"}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400 font-mono">RUC: {cliente.ruc}</span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${ESTADO_COLORS[activo] ?? "bg-gray-100 text-gray-600"}`}>
                    {activo}
                  </span>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-2">
              {canEdit && (
                <Button
                  onClick={handleToggleEstado}
                  disabled={loadingEstado}
                  variant="outline"
                  className={`h-9 px-4 font-bold text-xs gap-2 ${
                    activo === 'activo'
                      ? "border-orange-200 text-orange-600 hover:bg-orange-50"
                      : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                  }`}
                >
                  {activo === 'activo'
                    ? <><Ban size={13} /> Desactivar</>
                    : <><UserCheck size={13} /> Activar</>
                  }
                </Button>
              )}
              {canEdit && (
                <Link href={`/admin/Panel-Administrativo/clientes/${cliente.id}/editar`}>
                  <Button variant="outline" className="h-9 px-4 font-bold text-xs gap-2 border-pink-200 text-pink-600 hover:bg-pink-50">
                    <Edit2 size={13} /> Editar
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Pedidos",      value: cliente._count?.pedidos      ?? 0, icon: ShoppingBag, color: "pink"    },
            { label: "Cotizaciones", value: cliente._count?.cotizaciones ?? 0, icon: FileText,    color: "blue"    },
            { label: "Tipo",         value: cliente.tipo_cliente ?? "—",       icon: Building2,   color: "emerald" },
            { label: "Estado",       value: activo,                             icon: UserCheck,   color: "orange"  },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${
                color === "pink"    ? "bg-pink-50 text-pink-600"    :
                color === "blue"    ? "bg-blue-50 text-blue-600"    :
                color === "emerald" ? "bg-emerald-50 text-emerald-600" :
                "bg-orange-50 text-orange-600"
              }`}>
                <Icon size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
                <p className="text-lg font-black text-gray-900 capitalize">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Info de contacto */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pb-3 border-b border-gray-100">
              Información de contacto
            </p>
            <div className="space-y-3">
              {[
                { icon: Building2, label: "Razón social",    value: cliente.razon_social    },
                { icon: Building2, label: "Nombre comercial", value: cliente.nombre_comercial },
                { icon: Mail,      label: "Email",            value: cliente.email           },
                { icon: Phone,     label: "Teléfono",         value: cliente.telefono        },
                { icon: MapPin,    label: "Dirección fiscal",  value: cliente.direccion_fiscal },
              ].map(({ icon: Icon, label, value }) => value ? (
                <div key={label} className="flex items-start gap-3">
                  <Icon size={14} className="text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className="text-sm text-gray-700 font-medium">{value}</p>
                  </div>
                </div>
              ) : null)}
            </div>
          </div>

          {/* Direcciones */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pb-3 border-b border-gray-100">
              Direcciones registradas
            </p>
            {cliente.direcciones_cliente?.length > 0 ? (
              <div className="space-y-3">
                {cliente.direcciones_cliente.map((dir: any) => (
                  <div key={dir.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <MapPin size={14} className="text-pink-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-gray-700">{dir.alias}</p>
                        {dir.es_principal && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-pink-100 text-pink-600 rounded-full">
                            Principal
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{dir.direccion}</p>
                      {(dir.ciudad || dir.departamento) && (
                        <p className="text-[11px] text-gray-400">
                          {[dir.ciudad, dir.departamento].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-6">Sin direcciones registradas</p>
            )}
          </div>
        </div>

        {/* Últimos pedidos */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Últimos pedidos
            </p>
            <Link
              href={`/admin/Panel-Administrativo/pedidos?cliente_id=${cliente.id}`}
              className="text-[11px] font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1"
            >
              Ver todos <ChevronRight size={12} />
            </Link>
          </div>

          {cliente.pedidos?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["#", "Estado", "Prioridad", "Unidades", "Total", "Fecha"].map(h => (
                      <th key={h} className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 py-3 text-left">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {cliente.pedidos.map((pedido: any) => (
                    <tr
                      key={pedido.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/Panel-Administrativo/pedidos/${pedido.id}`)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">#{pedido.id}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${PEDIDO_ESTADO_COLORS[pedido.estado] ?? "bg-gray-100 text-gray-600"}`}>
                          {pedido.estado?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 capitalize">{pedido.prioridad}</td>
                      <td className="px-4 py-3 text-xs font-bold text-gray-700">{pedido.total_unidades?.toLocaleString("es-PE")}</td>
                      <td className="px-4 py-3 text-xs font-bold text-gray-700">
                        S/. {Number(pedido.total_estimado ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {new Date(pedido.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <ShoppingBag className="mx-auto text-gray-200 mb-3" size={32} />
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Sin pedidos registrados</p>
            </div>
          )}
        </div>

        {/* Zona de peligro */}
        {canDelete && (
          <div className="bg-white rounded-xl border border-red-100 shadow-sm p-5">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-3">Zona de riesgo</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-700">Desactivar cliente</p>
                <p className="text-xs text-gray-400 mt-0.5">El cliente no podrá acceder al portal ni generar nuevos pedidos.</p>
              </div>
              <Button
                onClick={handleDesactivar}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs h-9 px-4"
              >
                <Ban size={13} className="mr-1.5" />
                Desactivar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}