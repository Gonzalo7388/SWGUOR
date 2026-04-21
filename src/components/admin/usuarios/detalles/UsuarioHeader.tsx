"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Mail, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  usuario: any;
}

export default function UsuarioHeader({ usuario }: Props) {
  const router = useRouter();
  const nombre = usuario.personal_interno?.nombre_completo || usuario.clientes?.razon_social || "Usuario Sin Nombre";

  return (
    <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full -mr-16 -mt-16 opacity-50" />
      
      <div className="h-28 w-28 rounded-3xl bg-slate-900 flex items-center justify-center text-white text-3xl font-black shadow-xl z-10">
        {nombre.substring(0, 2).toUpperCase()}
      </div>

      <div className="flex-1 text-center md:text-left z-10">
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
            {nombre}
          </h1>
          <Badge className={`${usuario.estado === 'activo' ? 'bg-emerald-500' : 'bg-slate-400'} uppercase font-black text-[10px]`}>
            {usuario.estado}
          </Badge>
        </div>
        <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-3">
          <span className="flex items-center text-slate-500 font-bold text-sm">
            <Mail className="w-4 h-4 mr-2 text-pink-600" /> {usuario.email}
          </span>
          <span className="flex items-center text-slate-500 font-bold text-sm">
            <Shield className="w-4 h-4 mr-2 text-blue-600" /> {usuario.rol.replace('_', ' ')}
          </span>
        </div>
      </div>

      <Button variant="outline" onClick={() => router.back()} className="rounded-xl font-bold border-slate-200 hover:bg-slate-50 transition-all">
        <ChevronLeft className="w-4 h-4 mr-2" /> Volver al listado
      </Button>
    </div>
  );
}