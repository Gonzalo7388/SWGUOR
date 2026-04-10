"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, DollarSign, Clock, CheckCircle2, XCircle, RefreshCw, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { usePermissions } from "@/lib/hooks/usePermissions";

interface Cotizacion {
  id: number;
  cotizacion_id: string;
  cliente: string;
  descripcion: string;
  monto: number;
  estado: "pendiente" | "aceptada" | "rechazada" | "expirada";
  fecha_vencimiento: string;
  fecha_creacion: string;
}

export default function CotizacionesPage() {
  const { can, isLoading: authLoading } = usePermissions();
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const [stats, setStats] = useState({ 
    total: 0, 
    pendientes: 0, 
    aceptadas: 0, 
    totalValor: 0 
  });

  const canView = can("view", "cotizaciones");
  const canCreate = can("create", "cotizaciones");

  const cargarDatos = useCallback(async () => {
    if (!canView) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtroEstado !== "todos") params.append("estado", filtroEstado);

      const response = await fetch(`/api/admin/cotizaciones?${params}`);
      if (!response.ok) throw new Error("Error al cargar cotizaciones");

      const { data } = await response.json();
      const datosFormateados = data.map((item: any) => ({
        id: item.id,
        cotizacion_id: item.cotizacion_id,
        cliente: item.cliente,
        descripcion: item.descripcion,
        monto: item.monto,
        estado: item.estado,
        fecha_vencimiento: new Date(item.vencimiento).toISOString().split("T")[0],
        fecha_creacion: new Date(item.fechaCreacion).toISOString().split("T")[0]
      }));

      setCotizaciones(datosFormateados);

      setStats({
        total: datosFormateados.length,
        pendientes: datosFormateados.filter(c => c.estado === "pendiente").length,
        aceptadas: datosFormateados.filter(c => c.estado === "aceptada").length,
        totalValor: datosFormateados.filter(c => c.estado !== "rechazada").reduce((sum, c) => sum + c.monto, 0)
      });
    } catch (error) {
      console.error("Error cargando cotizaciones:", error);
      toast.error("Error al sincronizar cotizaciones");
    } finally {
      setLoading(false);
    }
  }, [canView, filtroEstado]);

  useEffect(() => {
    if (!authLoading) {
      cargarDatos();
    }
  }, [authLoading, cargarDatos]);

  const filteredCotizaciones = useMemo(() => {
    return cotizaciones.filter(c =>
      c.cotizacion_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cliente?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cotizaciones, searchTerm]);

  const currentTotalForPagination = stats.total;
  const totalPages = Math.ceil(currentTotalForPagination / pageSize);

  if (authLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Verificando permisos...</p>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
        <p className="text-gray-500">No tienes permisos para ver cotizaciones</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Cotizaciones
            </h1>
            <p className="text-gray-500 text-sm">Presupuestos y propuestas de venta</p>
          </div>

          <div className="flex items-center gap-3">
            {canCreate && (
              <Button className="bg-pink-600 hover:bg-pink-700 shadow-lg font-bold gap-2 h-11 px-6 text-white transition-all active:scale-95">
                <Plus className="w-5 h-5" /> Nueva Cotización
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard 
            title="TOTAL" 
            value={stats.total} 
            icon={<DollarSign className="w-5 h-5" />} 
            isActive={filtroEstado === "todos"} 
            color="pink" 
            onClick={() => {setFiltroEstado("todos"); setCurrentPage(0);}} 
          />
          <StatCard 
            title="PENDIENTES" 
            value={stats.pendientes} 
            icon={<Clock className="w-5 h-5" />} 
            isActive={filtroEstado === "pendiente"} 
            color="orange" 
            onClick={() => {setFiltroEstado("pendiente"); setCurrentPage(0);}} 
          />
          <StatCard 
            title="ACEPTADAS" 
            value={stats.aceptadas} 
            icon={<CheckCircle2 className="w-5 h-5" />} 
            isActive={filtroEstado === "aceptada"} 
            color="emerald" 
            onClick={() => {setFiltroEstado("aceptada"); setCurrentPage(0);}} 
          />
          <StatCard 
            title="VALOR TOTAL" 
            value={`S/ ${stats.totalValor.toLocaleString()}`} 
            icon={<DollarSign className="w-5 h-5" />} 
            isActive={false} 
            color="blue" 
            onClick={() => {}} 
          />
        </div>

        {/* Buscador */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Buscar por cotización o cliente..." 
              className="pl-10 h-11 border-gray-200 focus:ring-pink-500"
              value={searchTerm}
              onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(0);}}
            />
          </div>
          <Button variant="outline" className="h-11 border-gray-200" onClick={cargarDatos}>
            <RefreshCw className={`w-4 h-4 ${loading && 'animate-spin'}`} />
          </Button>
        </div>

        {/* Tabla */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center bg-white rounded-xl border animate-pulse">
            <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Sincronizando cotizaciones...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 text-[10px] font-bold text-gray-500 uppercase">Cotización</th>
                      <th className="text-left py-3 px-4 text-[10px] font-bold text-gray-500 uppercase">Cliente</th>
                      <th className="text-left py-3 px-4 text-[10px] font-bold text-gray-500 uppercase">Descripción</th>
                      <th className="text-right py-3 px-4 text-[10px] font-bold text-gray-500 uppercase">Monto</th>
                      <th className="text-left py-3 px-4 text-[10px] font-bold text-gray-500 uppercase">Estado</th>
                      <th className="text-left py-3 px-4 text-[10px] font-bold text-gray-500 uppercase">Vencimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCotizaciones.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-400">
                          No hay cotizaciones para mostrar
                        </td>
                      </tr>
                    ) : (
                      filteredCotizaciones.map(cot => {
                        const estadoStyle: any = {
                          pendiente: "bg-yellow-50 text-yellow-700",
                          aceptada: "bg-emerald-50 text-emerald-700",
                          rechazada: "bg-red-50 text-red-700",
                          expirada: "bg-gray-50 text-gray-700"
                        };
                        const labels: any = {
                          pendiente: "Pendiente",
                          aceptada: "Aceptada",
                          rechazada: "Rechazada",
                          expirada: "Expirada"
                        };
                        return (
                          <tr key={cot.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4 font-bold text-gray-900">{cot.cotizacion_id}</td>
                            <td className="py-4 px-4 text-gray-700">{cot.cliente}</td>
                            <td className="py-4 px-4 text-gray-700 text-sm">{cot.descripcion}</td>
                            <td className="py-4 px-4 text-right font-bold text-gray-900">S/ {cot.monto.toLocaleString()}</td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${estadoStyle[cot.estado]}`}>
                                {labels[cot.estado]}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-gray-700 text-sm">{cot.fecha_vencimiento}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Paginación */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-xs text-gray-500">
                Mostrando <span className="font-bold text-gray-900">{cotizaciones.length}</span> de <span className="font-bold text-gray-900">{currentTotalForPagination}</span>
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="px-4 py-1.5 text-xs font-bold bg-gray-50 border rounded-lg flex items-center">
                  Página {currentPage + 1} de {totalPages || 1}
                </div>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage + 1 >= totalPages}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, isActive, color, onClick }: any) {
  const styles: any = {
    pink: { active: "border-pink-500 ring-pink-50 bg-white", iconActive: "bg-pink-600 text-white", iconInactive: "bg-gray-100 text-gray-600", textActive: "text-pink-600", textInactive: "text-gray-800" },
    orange: { active: "border-orange-500 ring-orange-50 bg-white", iconActive: "bg-orange-600 text-white", iconInactive: "bg-gray-100 text-gray-600", textActive: "text-orange-600", textInactive: "text-gray-800" },
    emerald: { active: "border-emerald-500 ring-emerald-50 bg-white", iconActive: "bg-emerald-600 text-white", iconInactive: "bg-gray-100 text-gray-600", textActive: "text-emerald-600", textInactive: "text-gray-800" },
    blue: { active: "border-blue-500 ring-blue-50 bg-white", iconActive: "bg-blue-600 text-white", iconInactive: "bg-gray-100 text-gray-600", textActive: "text-blue-600", textInactive: "text-gray-800" }
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
      <div className={`p-2 rounded-lg transition-all duration-300 ${
        isActive ? `${currentStyle.iconActive} rotate-3` : `${currentStyle.iconInactive} group-hover:rotate-3`
      }`}>
        {icon}
      </div>
      <div className="text-left overflow-hidden"> 
        <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest truncate">{title}</p>
        <p className={`text-xl font-black tracking-tight ${isActive ? currentStyle.textActive : currentStyle.textInactive}`}>
          {value}
        </p>
      </div>
    </button>
  );
}
