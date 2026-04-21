"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, Globe, Info, Hash, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import InfoItem from "./InfoItem";

interface ClienteVinculadoProps {
  cliente: {
    razon_social: string;
    ruc: string;
    telefono?: string;
    tipo_cliente?: string;
    direcciones_cliente?: Array<{
      id: string;
      direccion: string;
      distrito: string;
      es_principal: boolean;
    }>;
  } | null;
}

export default function ClienteVinculadoBadge({ cliente }: ClienteVinculadoProps) {
  if (!cliente) return null;

  const direccionPrincipal = cliente.direcciones_cliente?.find(d => d.es_principal) 
    || cliente.direcciones_cliente?.[0];

  return (
    <Card className="rounded-[1.5rem] border-none shadow-sm overflow-hidden bg-white group transition-all hover:shadow-md">
      <div className="h-1.5 bg-blue-600 w-full" />
      
      <CardHeader className="pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600" /> 
          Cliente Vinculado
        </CardTitle>
        {/* USO DE BADGE para el tipo de cliente */}
        <Badge variant="outline" className="border-blue-100 text-blue-600 bg-blue-50/30 uppercase text-[10px] font-black">
          {cliente.tipo_cliente || 'Corporativo'}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Banner de Identidad */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex justify-between items-center relative overflow-hidden">
          <div className="z-10">
            <h3 className="text-lg font-black text-slate-900 leading-tight uppercase tracking-tighter">
              {cliente.razon_social}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID Tributario</span>
              <span className="text-sm font-black text-blue-600 tracking-tight">{cliente.ruc}</span>
            </div>
          </div>
          <Globe className="w-12 h-12 text-slate-200 absolute -right-2 -bottom-2 rotate-12 group-hover:text-blue-100 transition-colors" />
        </div>

        {/* USO DE INFOITEM para datos complementarios */}
        <div className="grid grid-cols-2 gap-4">
          <InfoItem 
            label="RUC / Identificación" 
            value={cliente.ruc} 
            icon={<Hash className="w-3 h-3" />} 
          />
          <InfoItem 
            label="Teléfono Corporativo" 
            value={cliente.telefono} 
            icon={<Phone className="w-3 h-3" />} 
          />
        </div>

        {/* Ubicación */}
        <div className="space-y-3 pt-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Dirección Fiscal / Principal
          </p>
          {direccionPrincipal ? (
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm group-hover:border-blue-100 transition-colors">
              <p className="text-xs font-bold text-slate-700 leading-snug">
                {direccionPrincipal.direccion}
              </p>
              <p className="text-[10px] font-medium text-slate-400 uppercase mt-0.5">
                {direccionPrincipal.distrito}
              </p>
            </div>
          ) : (
            <p className="text-xs italic text-slate-400">Sin direcciones registradas</p>
          )}
        </div>

        {/* Pie de página informativo */}
        <div className="pt-2 flex items-start gap-2 border-t border-slate-50">
          <Info className="w-3.5 h-3.5 text-slate-300 mt-0.5" />
          <p className="text-[10px] font-medium text-slate-400 italic leading-tight">
            Información de contexto para gestión de pedidos. Los cambios deben realizarse en el maestro de clientes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}