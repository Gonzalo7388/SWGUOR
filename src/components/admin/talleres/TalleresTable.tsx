"use client";

import { Edit2, Trash2, Phone, Mail, MapPin, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TalleresTableProps {
  data: any[];
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (taller: any) => void;
  onDelete: (taller: any) => void;
}

export default function TalleresTable({ data, canEdit, canDelete, onEdit, onDelete }: TalleresTableProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-12 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Award className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No hay talleres registrados</h3>
          <p className="text-sm text-gray-500 max-w-md">
            Comienza agregando talleres externos para gestionar la producción de prendas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-black text-gray-700 uppercase text-xs">RUC</TableHead>
              <TableHead className="font-black text-gray-700 uppercase text-xs">Taller</TableHead>
              <TableHead className="font-black text-gray-700 uppercase text-xs">Contacto</TableHead>
              <TableHead className="font-black text-gray-700 uppercase text-xs">Teléfono</TableHead>
              <TableHead className="font-black text-gray-700 uppercase text-xs">Especialidad</TableHead>
              <TableHead className="font-black text-gray-700 uppercase text-xs">Estado</TableHead>
              {(canEdit || canDelete) && (
                <TableHead className="font-black text-gray-700 uppercase text-xs text-right">Acciones</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((taller: any) => (
              <TableRow key={taller.id} className="hover:bg-gray-50 transition-colors">
                <TableCell className="font-mono text-sm text-gray-600">{taller.ruc}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">{taller.nombre}</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {taller.direccion}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-900">{taller.contacto}</span>
                    {taller.email && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {taller.email}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {taller.telefono}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm px-2 py-1 bg-purple-50 text-purple-700 rounded-md font-medium inline-flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {taller.especialidad || "General"}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge estado={taller.estado} />
                </TableCell>
                {(canEdit || canDelete) && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(taller)}
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(taller)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function StatusBadge({ estado }: { estado: string }) {
  const estadoLower = estado?.toLowerCase() || "inactivo";
  
  const styles: any = {
    activo: "bg-green-50 text-green-700 border-green-200",
    inactivo: "bg-gray-50 text-gray-700 border-gray-200",
    suspendido: "bg-red-50 text-red-700 border-red-200"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${styles[estadoLower] || styles.inactivo}`}>
      {estado?.toUpperCase() || "INACTIVO"}
    </span>
  );
}
