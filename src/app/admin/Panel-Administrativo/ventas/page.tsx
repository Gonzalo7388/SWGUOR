"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, RefreshCw, ChevronLeft, ChevronRight, 
  ShieldAlert, Receipt, TrendingUp, 
  CheckCircle2, XCircle,
  FileSpreadsheet,
  FileText} from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { exportToExcel, exportToPDF } from "@/lib/utils/export-utils";

// Lazy loading de componentes específicos de ventas
const VentasTable = dynamic(() => import("@/components/admin/ventas/VentasTable"));
const VentaDetalleDialog = dynamic(() => import("@/components/admin/ventas/VentaDetalleDialog"));

export default function VentasPage() {
  const { can, isLoading: authLoading } = usePermissions();
  const [ventas, setVentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVenta, setSelectedVenta] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(0);
  const [quickFilter, setQuickFilter] = useState<"todos" | "pagado" | "cancelado">("todos");
  
  const pageSize = 10;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ventas');
      const data = await res.json();
      setVentas(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Error al cargar ventas");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleExportExcel = () => {
  if (filteredVentas.length === 0) return toast.error("No hay datos para exportar");
  
  const dataToExport = filteredVentas.map(v => ({
    "Fecha": v.created_at ? new Date(v.created_at).toLocaleDateString() : '---',
    "Comprobante": v.numero_comprobante || `ORD-${v.orden_id}`,
    "Cliente": v.ordenes?.clientes?.razon_social || v.ordenes?.clientes?.nombre || "Público General",
    "Doc. Cliente": v.ordenes?.clientes?.dni_ruc || "---",
    "Método de Pago": v.ordenes?.metodo_pago || "Efectivo",
    "Subtotal": v.subtotal,
    "IGV": v.impuestos,
    "Total": v.total,
    "Estado Orden": v.ordenes?.estado
  }));

  exportToExcel(dataToExport, { filename: `Caja_GUOR_${new Date().toISOString().split('T')[0]}` });
  toast.success("Excel financiero generado");
};

const handleExportPDF = () => {
  if (filteredVentas.length === 0) return toast.error("No hay datos para exportar");
  
  // Usamos el exportToPDF que ya tienes, enviando los datos de ventas
  exportToPDF(filteredVentas, [], { 
    title: "REPORTE DE VENTAS Y CAJA - Modas y Estilos GUOR", 
    filename: `Ventas_GUOR_${new Date().toISOString().split('T')[0]}`
  });
  toast.success("PDF generado correctamente"); 
};

  useEffect(() => {
    if (!authLoading && can('view', 'ventas')) loadData();
  }, [authLoading, can, loadData]);

  const stats = useMemo(() => ({
    total: ventas.length,
    ingresos: ventas.filter(v => v.ordenes?.estado !== 'cancelado').reduce((acc, v) => acc + Number(v.total), 0),
    completadas: ventas.filter(v => v.ordenes?.estado === 'pagado').length,
    canceladas: ventas.filter(v => v.ordenes?.estado === 'cancelado').length
  }), [ventas]);

  const filteredVentas = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    return ventas.filter((v: any) => { 
      const cliente = v.ordenes?.clientes?.razon_social || v.ordenes?.clientes?.nombre || "";
      const matchSearch = !search || cliente.toLowerCase().includes(search) || v.numero_comprobante?.toLowerCase().includes(search);
      let matchQuick = true;
      if (quickFilter !== "todos") matchQuick = v.ordenes?.estado === quickFilter;
      return matchSearch && matchQuick;
    });
  }, [ventas, searchTerm, quickFilter]);
  

  const paginatedData = useMemo(() => {
    return filteredVentas.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  }, [filteredVentas, currentPage]);

  if (authLoading) return <LoadingVentas />;
  if (!can('view', 'ventas')) return <AccessDenied />;

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2 uppercase tracking-tighter">
              <Receipt className="text-pink-600 w-8 h-8" /> Control de Caja
            </h1>
            <p className="text-gray-500 text-sm font-medium">Registro de ingresos y comprobantes GUOR</p>
          </div>

          <div className="flex items-center gap-3">
          {/* Botones de Exportación con permisos */}
          {can('export', 'ventas') && (
            <>
              <Button 
                onClick={handleExportPDF} 
                variant="outline" 
                className="bg-white border-red-200 text-red-700 hover:bg-red-50 font-bold gap-2 h-11 transition-all shadow-sm"
              >
                <FileText className="w-5 h-5" />
                <span className="hidden sm:inline">Reporte PDF</span>
              </Button>
              <Button 
                onClick={handleExportExcel} 
                variant="outline" 
                className="bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold gap-2 h-11 transition-all shadow-sm"
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span className="hidden sm:inline">Libro Excel</span>
              </Button>
            </>
          )}
                
          <Button onClick={loadData} variant="outline" className="bg-white border-gray-200 font-bold gap-2 h-11 transition-all">
            <RefreshCw className={`w-5 h-5 ${loading && 'animate-spin'}`} />
            Sincronizar
          </Button>
          </div>
        </div>

        {/* Stats Grid - Reutilizando tu diseño de StatCard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="VENTAS TOTALES" value={stats.total} icon={<Receipt />} isActive={quickFilter === "todos"} color="pink" onClick={() => setQuickFilter("todos")} />
          <StatCard title="INGRESOS S/" value={stats.ingresos.toFixed(2)} icon={<TrendingUp />} color="blue" onClick={() => {}} />
          <StatCard title="COMPLETADAS" value={stats.completadas} icon={<CheckCircle2 />} isActive={quickFilter === "pagado"} color="orange" onClick={() => setQuickFilter("pagado")} />
          <StatCard title="ANULADAS" value={stats.canceladas} icon={<XCircle />} isActive={quickFilter === "cancelado"} color="red" onClick={() => setQuickFilter("cancelado")} />
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-2xl border shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por cliente o comprobante..."
              className="pl-10 h-11 border-gray-100 focus:ring-pink-500 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="space-y-4">
          <VentasTable 
            data={paginatedData} 
            onViewDetail={(v: any) => { setSelectedVenta(v); setIsDetailOpen(true); }} 
          />
          
          {/* Paginación */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border shadow-sm">
             <p className="text-[10px] font-black text-gray-400 uppercase">
              Mostrando {paginatedData.length} registros
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={(currentPage + 1) * pageSize >= filteredVentas.length}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {selectedVenta && (
        <VentaDetalleDialog 
          venta={selectedVenta} 
          isOpen={isDetailOpen} 
          onClose={() => setIsDetailOpen(false)} 
          onUpdate={loadData}
        />
      )}
    </div>
  );
}

// --- Componentes de Apoyo ---

function StatCard({ title, value, icon, isActive, color, onClick }: any) {
  const styles: any = {
    pink: { active: "border-pink-500 ring-pink-50 bg-white", iconActive: "bg-pink-600 text-white", textActive: "text-pink-600" },
    blue: { active: "border-blue-500 ring-blue-50 bg-white", iconActive: "bg-blue-600 text-white", textActive: "text-blue-600" },
    orange: { active: "border-orange-500 ring-orange-50 bg-white", iconActive: "bg-orange-600 text-white", textActive: "text-orange-600" },
    red: { active: "border-red-500 ring-red-50 bg-white", iconActive: "bg-red-600 text-white", textActive: "text-red-600" }
  };
  const currentStyle = styles[color];
  
  return (
    <button 
      onClick={onClick} 
      className={`group p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 cursor-pointer w-full
        ${isActive ? `ring-4 shadow-xl scale-[1.02] z-10 ${currentStyle.active}` : 'bg-white border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-95'}`}
    >
      <div className={`p-3 rounded-lg transition-all duration-300 ${isActive ? `${currentStyle.iconActive} rotate-3` : 'bg-gray-100 text-gray-600 group-hover:rotate-3'}`}>
        {icon}
      </div>
      <div className="text-left">
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{title}</p>
        <p className={`text-xl font-black tracking-tight ${isActive ? currentStyle.textActive : 'text-gray-800'}`}>
          {value}
        </p>
      </div>
    </button>
  );
}

function LoadingVentas() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-3 bg-gray-50">
      <div className="h-16 w-16 rounded-full border-4 border-pink-100 border-t-pink-600 animate-spin" />
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Sincronizando Caja GUOR...</p>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="h-[80vh] flex flex-col items-center justify-center text-center p-6 bg-gray-50">
      <div className="bg-amber-50 p-6 rounded-full mb-6">
        <ShieldAlert className="w-16 h-16 text-amber-600" />
      </div>
      <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">Acceso Restringido</h2>
      <p className="text-gray-500 max-w-sm mt-2 font-medium">
        Solo el personal administrativo puede visualizar los reportes financieros y de caja.
      </p>
    </div>
  );
}