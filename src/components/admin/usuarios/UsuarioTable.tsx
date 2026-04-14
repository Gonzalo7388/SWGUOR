"use client";

import { Mail, Edit, Trash2, ShieldAlert, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow
} from "@/components/ui/table";

interface Props {
  usuarios: any[];
  onEdit?: (user: any) => void;
  onDelete?: (user: any) => void;
  onToggleStatus?: (user: any) => void;
}

export function UsuariosTable({ usuarios, onEdit, onDelete, onToggleStatus }: Props) {
  const showActions = !!onEdit || !!onDelete || !!onToggleStatus;

  return (
    <div className="space-y-3">
      <Table>
        <TableHeader className="bg-transparent border-none">
          <TableRow className="hover:bg-transparent border-none">
            <TableHead className="font-black text-[11px] tracking-widest text-slate-400 uppercase py-4 px-6">
              Usuario
            </TableHead>
            <TableHead className="font-black text-[11px] tracking-widest text-slate-400 uppercase text-center">
              Rol / Cargo
            </TableHead>
            <TableHead className="font-black text-[11px] tracking-widest text-slate-400 uppercase text-center">
              Estado
            </TableHead>
            {showActions && (
              <TableHead className="font-black text-[11px] tracking-widest text-slate-400 uppercase text-right px-8">
                Acciones
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody className="space-y-3">
          {usuarios.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showActions ? 4 : 3} className="text-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <User className="w-12 h-12 text-slate-200" />
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">
                    No hay usuarios registrados
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            usuarios.map((user: any) => {
              // ── Datos unificados: personal_interno tiene prioridad ──
              const nombreCompleto =
                user.personal_interno?.nombre_completo ?? null;
              const cargo =
                user.personal_interno?.cargo ?? null;
              const iniciales = (nombreCompleto ?? user.email ?? "??")
                .substring(0, 2)
                .toUpperCase();

              return (
                <TableRow
                  key={user.id}
                  className="group bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200"
                  style={{ display: "table-row" }}
                >
                  {/* Columna Usuario */}
                  <TableCell className="py-5 px-6 rounded-l-2xl">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="h-11 w-11 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-black text-sm border border-pink-100 uppercase group-hover:scale-110 transition-transform shrink-0">
                        {iniciales}
                      </div>

                      <div className="flex flex-col text-left min-w-0">
                        {/* Nombre completo (o "Sin nombre" si aún no tiene personal_interno) */}
                        <span className="font-black text-slate-800 text-sm uppercase tracking-tight truncate">
                          {nombreCompleto ?? (
                            <span className="text-slate-400 normal-case font-medium">
                              Sin nombre registrado
                            </span>
                          )}
                        </span>

                        {/* Email */}
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5 truncate">
                          <Mail size={13} className="text-slate-300 shrink-0" />
                          {user.email}
                        </span>

                        {/* DNI — solo si existe */}
                        {user.personal_interno?.dni && (
                          <span className="text-[10px] text-slate-300 font-medium mt-0.5">
                            DNI: {user.personal_interno.dni}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Columna Rol / Cargo */}
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      {/* Rol del sistema */}
                      <span className="text-[13px] font-bold text-slate-600 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 capitalize">
                        {user.rol ?? "—"}
                      </span>
                      {/* Cargo interno (si difiere del rol) */}
                      {cargo && cargo !== user.rol && (
                        <span className="text-[10px] text-slate-400 font-medium capitalize">
                          {cargo}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Columna Estado */}
                  <TableCell className="text-center">
                    <Badge
                      className={`rounded-full px-4 py-1 text-[10px] font-black border-2 uppercase ${
                        String(user.estado).toLowerCase() === "activo"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-orange-50 text-orange-600 border-orange-100"
                      }`}
                      variant="outline"
                    >
                      {user.estado}
                    </Badge>
                  </TableCell>

                  {/* Columna Acciones */}
                  {showActions && (
                    <TableCell className="text-right px-6 rounded-r-2xl">
                      <div className="flex justify-end items-center gap-2">
                        {onToggleStatus && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onToggleStatus(user)}
                            className="h-9 w-9 rounded-xl border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all"
                            title="Cambiar Estado"
                          >
                            <ShieldAlert size={16} />
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onEdit(user)}
                            className="h-9 w-9 rounded-xl border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onDelete(user)}
                            className="h-9 w-9 rounded-xl border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default UsuariosTable;