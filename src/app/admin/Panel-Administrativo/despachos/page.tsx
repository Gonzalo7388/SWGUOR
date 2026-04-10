"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Truck, MapPin, CheckCircle2, Clock, XCircle, RefreshCw, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { usePermissions } from "@/lib/hooks/usePermissions";

interface Despacho {
  id: number;
  despacho_id: string;
  orden_id: number;
  cliente: string;
  direccion: string;
  estado: "preparando" | "enviado" | "transito" | "entregado";
  transportista: string;
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

  const [stats, setStats] = useState({ 
    total: 0, 
    preparando: 0, 
    transito: 0, 
    entregados: 0 
  });

  const canView = can("view", "despachos");
  const canCreate = can("create", "despachos");

  const cargarDatos = useCallback(async () => {
    if (!canView) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtroEstado !== "todos") params.append("estado", filtroEstado);

      const response = await fetch(`/api/admin/despachos?${params}`);
      if (!response.ok) throw new Error("Error al cargar despachos");

      const { data } = await response.json();
      const datosFormateados = data.map((item: any) => ({
        id: item.id,
        despacho_id: item.despacho_id,
        orden_id: item.orden,
        cliente: item.cliente,
        direccion: item.direccion,
        estado: item.estado,
        transportista: item.transportista,
        tracking: item.tracking,
        fecha_despacho: new Date(item.fechaDespacho).toISOString().split("T")[0],
        fecha_entrega: item.fechaEntrega ? new Date(item.fechaEntrega).toISOString().split("T")[0] : "Pendiente"
      }));

      setDespachos(datosFormateados);

      setStats({
        total: datosFormateados.length,
        preparando: datosFormateados.filter(d => d.estado === "preparando").length,
        transito: datosFormateados.filter(d => d.estado === "transito").length,
        entregados: datosFormateados.filter(d => d.estado === "entregado").length
      });
    } catch (error) {
      console.error("Error cargando despachos:", error);
      toast.error("Error al sincronizar despachos");
    } finally {
      setLoading(false);
    }
  }, [canView, filtroEstado]);

  useEffect(() => {
    if (!authLoading) {
      cargarDatos();
    }
  }, [authLoading, cargarDatos]);

  const filteredDespachos = useMemo(() => {
    return despachos.filter(d =>
      d.despacho_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.tracking?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [despachos, searchTerm]);

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
        <p className="text-gray-500">No tienes permisos para ver despachos</p>
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
              Gestión de Despachos
            </h1>
            <p className="text-gray-500 text-sm">Control de envíos y entregas</p>
          </div>

          <div className="flex items-center gap-3">
            {canCreate && (
              <Button className="bg-pink-600 hover:bg-pink-700 shadow-lg font-bold gap-2 h-11 px-6 text-white transition-all active:scale-95">
                <Plus className="w-5 h-5" /> Nuevo Despacho
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard 
            title="TOTAL" 
            value={stats.total} 
            icon={<Truck className="w-5 h-5" />} 
            isActive={filtroEstado === "todos"} 
            color="pink" 
            onClick={() => {setFiltroEstado("todos"); setCurrentPage(0);}} 
          />
          <StatCard 
            title="PREPARANDO" 
            value={stats.preparando} 
            icon={<Clock className="w-5 h-5" />} 
            isActive={filtroEstado === "preparando"} 
            color="orange" 
            onClick={() => {setFiltroEstado("preparando"); setCurrentPage(0);}} 
          />
          <StatCard 
            title="EN TRÁNSITO" 
            value={stats.transito} 
            icon={<MapPin className="w-5 h-5" />} 
            isActive={filtroEstado === "transito"} 
            color="blue" 
            onClick={() => {setFiltroEstado("transito"); setCurrentPage(0);}} 
          />
          <StatCard 
            title="ENTREGADOS" 
            value={stats.entregados} 
            icon={<CheckCircle2 className="w-5 h-5" />} 
            isActive={filtroEstado === "entregado"} 
            color="emerald" 
            onClick={() => {setFiltroEstado("entregado"); setCurrentPage(0);}} 
          />
        </div>

        {/* Buscador */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Buscar por despacho, cliente o tracking..." 
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
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Sincronizando despachos...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 text-[10px] font-bold text-gray-500 uppercase">Despacho</th>
                      <th className="text-left py-3 px-4 text-[10px] font-bold text-gray-500 uppercase">Cliente</th>
                      <th className="text-left py-3 px-4 text-[10px] font-bold text-gray-500 uppercase">Dirección</th>
                      <th className="text-left py-3 px-4 text-[10px] font-bold text-gray-500 uppercase">Estado</th>
                      <th className="text-left py-3 px-4 text-[10px] font-bold text-gray-500 uppercase">Tracking</th>
                      <th className="text-left py-3 px-4 text-[10px] font-bold text-gray-500 uppercase">Entrega</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDespachos.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-400">
                          No hay despachos para mostrar
                        </td>
                      </tr>
                    ) : (
                      filteredDespachos.map(desp => {
                        const estadoStyle: any = {
                          preparando: "bg-yellow-50 text-yellow-700",
                          enviado: "bg-blue-50 text-blue-700",
                          transito: "bg-purple-50 text-purple-700",
                          entregado: "bg-emerald-50 text-emerald-700"
                        };
                        const labels: any = {
                          preparando: "Preparando",
                          enviado: "Enviado",
                          transito: "En Tránsito",
                          entregado: "Entregado"
                        };
                        return (
                          <tr key={desp.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4 font-bold text-gray-900">{desp.despacho_id}</td>
                            <td className="py-4 px-4 text-gray-700">{desp.cliente}</td>
                            <td className="py-4 px-4 text-gray-700 text-sm">{desp.direccion}</td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${estadoStyle[desp.estado]}`}>
                                {labels[desp.estado]}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-gray-700 text-sm">{desp.tracking}</td>
                            <td className="py-4 px-4 text-gray-700 text-sm">{desp.fecha_entrega}</td>
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
                Mostrando <span className="font-bold text-gray-900">{despachos.length}</span> de <span className="font-bold text-gray-900">{currentTotalForPagination}</span>
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
    blue: { active: "border-blue-500 ring-blue-50 bg-white", iconActive: "bg-blue-600 text-white", iconInactive: "bg-gray-100 text-gray-600", textActive: "text-blue-600", textInactive: "text-gray-800" },
    emerald: { active: "border-emerald-500 ring-emerald-50 bg-white", iconActive: "bg-emerald-600 text-white", iconInactive: "bg-gray-100 text-gray-600", textActive: "text-emerald-600", textInactive: "text-gray-800" }
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
