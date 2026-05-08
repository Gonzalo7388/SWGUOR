"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { XCircle } from "lucide-react";

// Hooks y Utilidades
import { usePermissions } from "@/lib/hooks/usePermissions";

// Componentes Fragmentados
import { DespachoStats } from "@/components/admin/despachos/DespachoStats";
import { DespachoFilters } from "@/components/admin/despachos/DespachoFilters";
import { DespachoTable } from "@/components/admin/despachos/DespachoTable";
import { DespachoPagination } from "@/components/admin/despachos/DespachoPaginacion";

// Tipado para consistencia
export interface Despacho {
  id: number;
  despacho_id: string;
  pedido_id: string;
  cliente: string;
  direccion: string;
  estado: "preparando" | "en_ruta" | "entregado" | "incidencia";
  tracking: string;
  fecha_despacho: string;
  fecha_entrega: string;
}

export default function DespachosPage() {
  const { can, isLoading: authLoading } = usePermissions();
  const [despachos, setDespachos] = useState<Despacho[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const canView = can("view", "despachos");

  // 1. Carga de Datos desde la API
  const cargarDatos = useCallback(async () => {
    if (!canView) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/despachos`);
      if (!response.ok) throw new Error("Error al cargar despachos");

      const { data } = await response.json();
      
      // Mapeo seguro de datos según la estructura del backend (snake_case)
      const datosFormateados = data.map((item: any) => ({
        id: item.id,
        despacho_id: item.despacho_id,
        pedido_id: String(item.pedido_id),
        cliente: item.cliente,
        direccion: item.direccion,
        estado: item.estado,
        tracking: item.tracking || "S/N",
        fecha_despacho: item.fecha_despacho ? new Date(item.fecha_despacho).toLocaleDateString() : "---",
        fecha_entrega: item.fecha_entrega ? new Date(item.fecha_entrega).toLocaleDateString() : "Pendiente"
      }));

      setDespachos(datosFormateados);
    } catch (error) {
      console.error("Error:", error);
      toast.error("No se pudieron sincronizar los despachos");
    } finally {
      setLoading(false);
    }
  }, [canView]);

  useEffect(() => {
    if (!authLoading) cargarDatos();
  }, [authLoading, cargarDatos]);

  // 2. Lógica de Filtrado (Estado + Buscador)
  const filteredDespachos = useMemo(() => {
    return despachos.filter((d) => {
      const matchesEstado = filtroEstado === "todos" || d.estado === filtroEstado;
      const matchesSearch = 
        d.despacho_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.tracking.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesEstado && matchesSearch;
    });
  }, [despachos, filtroEstado, searchTerm]);

  // 3. Cálculos de Estadísticas dinámicas
  const stats = useMemo(() => ({
    total: despachos.length,
    preparando: despachos.filter(d => d.estado === "preparando").length,
    transito: despachos.filter(d => d.estado === "en_ruta").length,
    entregados: despachos.filter(d => d.estado === "entregado").length,
  }), [despachos]);

  // 4. Paginación
  const totalPages = Math.ceil(filteredDespachos.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = currentPage * pageSize;
    return filteredDespachos.slice(start, start + pageSize);
  }, [filteredDespachos, currentPage, pageSize]);

  // Estados de Carga y Permisos
  if (authLoading) return <LoadingSpinner label="Verificando permisos..." />;
  if (!canView) return <AccessDenied />;

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Encabezado */}
        <header>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestión de Despachos</h1>
          <p className="text-gray-500 text-sm">Monitoreo de logística y última milla en tiempo real.</p>
        </header>

        {/* Componente 1: Resumen de Estadísticas */}
        <DespachoStats 
          stats={stats} 
          filtroActual={filtroEstado} 
          setFiltro={(f) => { setFiltroEstado(f); setCurrentPage(0); }} 
        />

        {/* Componente 2: Filtros y Buscador */}
        <DespachoFilters 
          searchTerm={searchTerm} 
          setSearchTerm={(t) => { setSearchTerm(t); setCurrentPage(0); }} 
          onRefresh={cargarDatos} 
          loading={loading} 
        />

        {/* Componente 3: Tabla de Datos */}
        <DespachoTable 
          despachos={paginatedData} 
          loading={loading} 
        />

        {/* Componente 4: Control de Paginación */}
        <DespachoPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredDespachos.length}
          onPageChange={setCurrentPage}
        />

      </div>
    </div>
  );
}

// Sub-componentes locales de apoyo
function LoadingSpinner({ label }: { label: string }) {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">{label}</p>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6">
      <XCircle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900">Acceso Restringido</h2>
      <p className="text-gray-500 max-w-sm">No cuentas con los permisos necesarios para visualizar el módulo de logística.</p>
    </div>
  );
}