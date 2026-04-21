"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, User } from "lucide-react";
import { toast } from "sonner";

// Importaciones de tus componentes modulares
import UsuarioHeader from "@/components/admin/usuarios/detalles/UsuarioHeader";
import CuentaInfoCard from "@/components/admin/usuarios/detalles/CuentaInfoCard";
import PersonalInternoCard from "@/components/admin/usuarios/detalles/PersonalInternoCard";
import ClienteVinculadoBadge from "@/components/admin/usuarios/detalles/ClienteVinculadoBadge";

export default function UsuarioDetallePage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/usuarios/${id}`);
        if (!res.ok) throw new Error();
        const result = await res.json();
        setData(result);
      } catch {
        toast.error("No se pudo cargar el perfil");
        router.push("/admin/Panel-Administrativo/usuarios");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, router]);

  if (loading) {
    return (
      <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-slate-300">
        Cargando Perfil...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Cabecera: El botón "Volver" y los iconos Mail/Shield ya están DENTRO de este componente */}
        <UsuarioHeader usuario={data} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Lateral */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                Registro de Sistema
              </h2>
            </div>
            <CuentaInfoCard usuario={data} />
          </div>

          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 px-2">
              <User className="w-4 h-4 text-slate-400" />
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                Información de Identidad
              </h2>
            </div>

            {/* Los iconos Briefcase, Building2, MapPin, etc., están DENTRO de estos componentes */}
            {data.personal_interno && (
              <PersonalInternoCard personal={data.personal_interno} />
            )}

            {data.clientes && (
              <ClienteVinculadoBadge cliente={data.clientes} />
            )}
            
            {!data.personal_interno && !data.clientes && (
              <div className="bg-white p-10 rounded-[2rem] border border-dashed border-slate-200 text-center">
                <User className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                  Este usuario no tiene un perfil vinculado
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}