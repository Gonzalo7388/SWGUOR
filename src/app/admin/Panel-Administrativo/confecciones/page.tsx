"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ConfeccionesTable, type ConfeccionRow } from "@/components/admin/confecciones/ConfeccionesTable";
import { NuevaOrdenModal }  from "@/components/admin/confecciones/NuevaOrdenModal";
import { ESTADO_CONFECCION, ESTADO_LABELS } from "@/lib/schemas/confecciones";
import { toast } from "sonner";

type Taller = { id: number; nombre: string };

export default function ConfeccionesPage() {
  const [confecciones, setConfecciones] = useState<ConfeccionRow[]>([]);
  const [talleres,     setTalleres]     = useState<Taller[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = filtroEstado !== "todos" ? `?estado=${filtroEstado}` : "";
      const [confRes, tallerRes] = await Promise.all([
        fetch(`/api/admin/confecciones${params}`),
        fetch("/api/admin/talleres"),
      ]);
      if (!confRes.ok || !tallerRes.ok) throw new Error();
      const [confData, tallerData] = await Promise.all([
        confRes.json(),
        tallerRes.json(),
      ]);
      setConfecciones(confData);
      setTalleres(tallerData);
    } catch {
      toast.error("Error al cargar las órdenes de confección.");
    } finally {
      setIsLoading(false);
    }
  }, [filtroEstado]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleEstadoChange(id: number, nuevoEstado: ConfeccionRow["estado"]) {
    try {
      const res = await fetch(`/api/admin/confecciones/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Estado actualizado a "${ESTADO_LABELS[nuevoEstado]}"`);
      fetchData();
    } catch {
      toast.error("Error al actualizar el estado.");
    }
  }

  // KPIs rápidos
  const stats = {
    total:      confecciones.length,
    activas:    confecciones.filter(c => !["completado", "cancelado"].includes(c.estado)).length,
    urgentes:   confecciones.filter(c => c.prioridad === "urgente" && c.estado !== "completado").length,
    completadas: confecciones.filter(c => c.estado === "completado").length,
  };

  return (
    <div className="p-6 space-y-6">

      {/* ── Encabezado ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold uppercase italic tracking-tight">
            Órdenes de Confección
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestión de producción con talleres externos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-pink-600 hover:bg-pink-700 font-bold uppercase italic"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Orden
          </Button>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total órdenes",  value: stats.total,       color: "text-foreground" },
          { label: "En producción",  value: stats.activas,     color: "text-blue-600"   },
          { label: "Urgentes",       value: stats.urgentes,    color: "text-red-600"    },
          { label: "Completadas",    value: stats.completadas, color: "text-green-600"  },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border bg-card p-4 space-y-1">
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Filtro de estado ── */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground font-medium">Filtrar por:</span>
        <Select value={filtroEstado} onValueChange={setFiltroEstado}>
          <SelectTrigger className="w-44 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            {ESTADO_CONFECCION.map((e) => (
              <SelectItem key={e} value={e}>{ESTADO_LABELS[e]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Tabla ── */}
      <ConfeccionesTable
        data={confecciones}
        isLoading={isLoading}
        onEstadoChange={handleEstadoChange}
      />

      {/* ── Modal nueva orden ── */}
      <NuevaOrdenModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        talleres={talleres}
        onSuccess={() => { setModalOpen(false); fetchData(); }}
      />
    </div>
  );
}