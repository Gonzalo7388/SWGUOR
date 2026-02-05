"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Plus, ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/lib/hooks/usePermissions';


const ConfeccionesTable = dynamic(() => import('@/components/admin/confecciones/ConfeccionesTable').then(mod => mod.ConfeccionesTable), { loading: () => <SkeletonTable /> });
const ConfeccionesFiltros = dynamic(() => import('@/components/admin/confecciones/ConfeccionesFiltros').then(mod => mod.ConfeccionesFiltros));
const ConfeccionesStats = dynamic(() => import('@/components/admin/confecciones/ConfeccionesStats').then(mod => mod.ConfeccionesStats));
const NuevaOrdenModal = dynamic(() => import('@/components/admin/confecciones/NuevaOrdenModal').then(mod => mod.NuevaOrdenModal));
export default function ConfeccionesPage() {
  const { can, isLoading: authLoading } = usePermissions();
  
  const [confecciones, setConfecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroTaller, setFiltroTaller] = useState('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(filtroEstado !== 'todos' && { estado: filtroEstado }),
        ...(filtroTaller !== 'todos' && { taller: filtroTaller })
      });
      const response = await fetch(`/api/admin/confecciones?${params}`);
      const { data } = await response.json();
      setConfecciones(data.map((item: any) => ({
        ...item,
        fecha_entrega: new Date(item.fechaFin || item.fechaInicio).toISOString().split('T')[0]
      })));
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && can('view', 'confecciones')) cargarDatos();
  }, [authLoading, filtroEstado, filtroTaller]);

  if (authLoading) return <LoadingState />;
  if (!can('view', 'confecciones')) return <AccessDenied />;

  const stats = {
    enProceso: confecciones.filter((c: any) => ['corte', 'confeccionando', 'remallado'].includes(c.estado)).length,
    completadas: confecciones.filter((c: any) => c.estado === 'terminado').length,
    promedio: confecciones.length > 0 
      ? Math.round(confecciones.reduce((sum: number, c: any) => sum + c.progreso, 0) / confecciones.length) 
      : 0
  };

  return (
    <div className="space-y-8 p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Gestión de Confecciones</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Control de producción en talleres</p>
        </div>
        
        {can('create', 'confecciones') && (
          <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase gap-2 shadow-lg rounded-xl">
            <Plus size={18} /> Nueva Orden
          </Button>
        )}
      </div>

      <ConfeccionesStats {...stats} />

      <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <h3 className="font-black uppercase text-slate-800 tracking-tight text-xl italic">Órdenes Activas</h3>
          <ConfeccionesFiltros 
            filtroEstado={filtroEstado} setFiltroEstado={setFiltroEstado}
            filtroTaller={filtroTaller} setFiltroTaller={setFiltroTaller}
          />
        </div>

        <ConfeccionesTable data={confecciones} loading={loading} />
        <NuevaOrdenModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={cargarDatos} // Recarga la tabla automáticamente al crear
            />
      </div>
    </div>
  );
}

// --- SUB-COMPONENTE SKELETON PARA LA CARGA DINÁMICA ---
const SkeletonTable = () => (
  <div className="w-full space-y-4 animate-pulse">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="h-16 bg-slate-100 rounded-2xl w-full" />
    ))}
  </div>
);

const LoadingState = () => (
  <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
    <Loader2 className="w-10 h-10 text-slate-900 animate-spin mb-4" />
    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Verificando Credenciales...</p>
  </div>
);

const AccessDenied = () => (
  <div className="h-[80vh] flex flex-col items-center justify-center p-6 text-center">
    <div className="bg-red-50 p-6 rounded-full mb-6"><ShieldAlert className="w-16 h-16 text-red-600" /></div>
    <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Acceso Denegado</h2>
    <p className="text-slate-500 max-w-sm mt-2 font-medium">Tu rol no tiene permisos para este módulo.</p>
  </div>
);