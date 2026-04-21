"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ShieldCheck, Calendar, Key, Fingerprint } from "lucide-react";
import InfoItem from "./InfoItem";

interface CuentaInfoCardProps {
  usuario: {
    id: string | number;
    ultimo_acceso?: string | Date;
    creado_en: string | Date;
    auth_id?: string;
  };
}

export default function CuentaInfoCard({ usuario }: CuentaInfoCardProps) {
  return (
    <Card className="rounded-[1.5rem] border-none shadow-sm bg-white overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
          {/* USO DE ShieldCheck para el título principal */}
          <ShieldCheck className="w-4 h-4 text-pink-500" /> 
          Seguridad y Acceso
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-5 pt-4">
        {/* Identificador único con Fingerprint o Key */}
        <InfoItem 
          label="ID de Sistema" 
          value={`#${usuario.id}`} 
          icon={<Fingerprint className="w-3.5 h-3.5" />}
        />

        {/* USO DE Activity para el último acceso */}
        <InfoItem 
          label="Actividad Reciente" 
          value={usuario.ultimo_acceso 
            ? new Date(usuario.ultimo_acceso).toLocaleString('es-PE', {
                dateStyle: 'short',
                timeStyle: 'short'
              }) 
            : 'Sin registros de sesión'
          } 
          icon={<Activity className="w-3.5 h-3.5 text-emerald-500" />} 
        />

        {/* USO DE Calendar para la fecha de registro */}
        <InfoItem 
          label="Fecha de Registro" 
          value={new Date(usuario.creado_en).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })} 
          icon={<Calendar className="w-3.5 h-3.5" />} 
        />

        {/* Opcional: Auth ID truncado para referencia técnica */}
        {usuario.auth_id && (
          <InfoItem 
            label="ID de Autenticación" 
            value={`${usuario.auth_id.substring(0, 15)}...`} 
            icon={<Key className="w-3.5 h-3.5" />}
          />
        )}
      </CardContent>
    </Card>
  );
}