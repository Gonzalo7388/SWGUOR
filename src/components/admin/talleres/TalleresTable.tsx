"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Edit, 
  Trash2, 
  Eye, 
  MoreHorizontal, 
  Phone, 
  MapPin 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface TalleresTableProps {
  data: any[];
  canEdit: boolean;
  canDelete: boolean;
  onDelete: (taller: any) => void;
  onEdit: (t: any) => void;
}

export default function TalleresTable({ data, canEdit, canDelete, onDelete, onEdit }: TalleresTableProps) {
  const router = useRouter();

  const statusStyles: any = {
    activo: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
    inactivo: "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100",
    suspendido: "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100",
  };

  if (data.length === 0) {
    return (
      <div className="bg-white p-10 text-center rounded-2xl border border-dashed">
        <p className="text-gray-400 font-medium">No se encontraron talleres con los filtros aplicados.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow>
            <TableHead className="font-bold text-gray-900">Taller / RUC</TableHead>
            <TableHead className="font-bold text-gray-900">Contacto</TableHead>
            <TableHead className="font-bold text-gray-900">Especialidad</TableHead>
            <TableHead className="font-bold text-gray-900">Estado</TableHead>
            <TableHead className="text-right font-bold text-gray-900">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((taller) => (
            <TableRow key={taller.id} className="hover:bg-gray-50/50 transition-colors">
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 uppercase italic tracking-tighter">
                    {taller.nombre}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">{taller.ruc}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center text-xs text-gray-600">
                    <Phone className="w-3 h-3 mr-1 text-pink-500" /> {taller.telefono}
                  </div>
                  <div className="flex items-center text-[10px] text-gray-400">
                    <MapPin className="w-3 h-3 mr-1" /> {taller.direccion?.substring(0, 25)}...
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-100 capitalize">
                  {taller.especialidad}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={`${statusStyles[taller.estado?.toLowerCase()] || ""} capitalize border shadow-none`}>
                  {taller.estado}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => router.push(`/admin/Panel-Administrativo/talleres/${taller.id}`)}>
                      <Eye className="mr-2 h-4 w-4" /> Ver taller
                    </DropdownMenuItem>
                    
                    {canEdit && (
                      <DropdownMenuItem onClick={() => router.push(`/admin/Panel-Administrativo/talleres/${taller.id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    
                    {canDelete && (
                      <DropdownMenuItem 
                        onClick={() => onDelete(taller)}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                      </DropdownMenuItem>
                    )}
                    {onEdit && (
                      <Button onClick={() => onEdit(taller)}>Editar</Button>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}