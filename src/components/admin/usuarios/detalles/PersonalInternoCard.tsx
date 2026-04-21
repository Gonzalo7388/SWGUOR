"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, User as UserIcon, Calendar, Phone, Fingerprint, MapPin } from "lucide-react";
import InfoItem from "./InfoItem";

interface PersonalInternoCardProps {
  personal: {
    dni: string | number;
    nombre_completo: string;
    cargo: string;
    area?: string;
    telefono?: string | number;
    fecha_ingreso?: string | Date;
    estado?: boolean;
  } | null;
}

export default function PersonalInternoCard({ personal }: PersonalInternoCardProps) {
  if (!personal) return null;

  return (
    <Card className="rounded-[1.5rem] border-none shadow-sm overflow-hidden bg-white group transition-all hover:shadow-md">
      {/* Línea de acento en Rosa para Personal Interno */}
      <div className="h-1.5 bg-pink-600 w-full" />
      
      <CardHeader>
        <CardTitle className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-pink-600" /> 
          Información Laboral
        </CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
        {/* Nombre completo con UserIcon */}
        <InfoItem 
          label="Nombre Completo" 
          value={personal.nombre_completo} 
          icon={<UserIcon className="w-3.5 h-3.5" />} 
        />

        {/* DNI con un icono extra de referencia (Fingerprint) o UserIcon si prefieres */}
        <InfoItem 
          label="Documento (DNI)" 
          value={personal.dni} 
          icon={<Fingerprint className="w-3.5 h-3.5" />} 
        />

        {/* Cargo con Briefcase (reutilizado o similar) */}
        <InfoItem 
          label="Cargo Actual" 
          value={personal.cargo} 
          icon={<Briefcase className="w-3.5 h-3.5" />} 
        />

        {/* Teléfono con Phone */}
        <InfoItem 
          label="Teléfono Móvil" 
          value={personal.telefono} 
          icon={<Phone className="w-3.5 h-3.5" />} 
        />

        {/* Fecha de Ingreso con Calendar */}
        <InfoItem 
          label="Fecha de Ingreso" 
          value={personal.fecha_ingreso ? new Date(personal.fecha_ingreso).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : 'No registrada'} 
          icon={<Calendar className="w-3.5 h-3.5" />} 
        />

        {/* Área con MapPin o similar */}
        <InfoItem 
          label="Área / Sede" 
          value={personal.area || "Oficina Central"} 
          icon={<MapPin className="w-3.5 h-3.5" />} 
        />
      </CardContent>
    </Card>
  );
}