"use client";

import { memo } from "react";
import { Mail, Edit, ShieldOff, User, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { usuarios } from "@prisma/client";

// ─── Props ────────────────────────────────────────────────────
interface Props {
  usuarios:     usuarios[];
  loading?:     boolean;
  onEdit?:      (user: usuarios) => void;
  onSuspender?: (user: usuarios) => void;
}

// ─── Helpers ─────────────────────────────────────────────────
function Iniciales({ email }: { email: string }) {
  return <>{email.substring(0, 2).toUpperCase()}</>;
}

function EstadoBadge({ estado }: { estado: string }) {
  const activo = estado.toLowerCase() === "activo";
  return (
    <Badge
      variant="outline"
      className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase border ${
        activo
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-orange-50 text-orange-600 border-orange-200"
      }`}
    >
      {estado}
    </Badge>
  );
}

// ─── Componente ───────────────────────────────────────────────
function UsuariosTable({ usuarios, loading, onEdit, onSuspender }: Props) {
  const showActions = !!onEdit || !!onSuspender;
  const colSpan     = 4 + (showActions ? 1 : 0);

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent border-none">
          <TableHead className={thCls}>Usuario</TableHead>
          <TableHead className={`${thCls} text-center`}>Rol</TableHead>
          <TableHead className={`${thCls} text-center`}>Último acceso</TableHead>
          <TableHead className={`${thCls} text-center`}>Estado</TableHead>
          {showActions && (
            <TableHead className={`${thCls} text-right pr-6`}>Acciones</TableHead>
          )}
        </TableRow>
      </TableHeader>

      <TableBody>

        {/* ── Skeleton ── */}
        {loading && Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={`sk-${i}`} className={rowCls}>
            <TableCell className="py-4 px-6 rounded-l-xl">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                <Skeleton className="h-3 w-24" />
              </div>
            </TableCell>
            <TableCell className="text-center"><Skeleton className="h-6 w-20 mx-auto rounded-lg" /></TableCell>
            <TableCell className="text-center"><Skeleton className="h-4 w-28 mx-auto" /></TableCell>
            <TableCell className="text-center"><Skeleton className="h-5 w-16 mx-auto rounded-full" /></TableCell>
            {showActions && (
              <TableCell className="text-right px-6 rounded-r-xl">
                <div className="flex justify-end gap-1.5">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}

        {/* ── Sin datos ── */}
        {!loading && usuarios.length === 0 && (
          <TableRow>
            <TableCell colSpan={colSpan} className="py-16 text-center">
              <div className="flex flex-col items-center gap-2">
                <User className="w-10 h-10 text-slate-200" />
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">
                  No hay usuarios
                </p>
              </div>
            </TableCell>
          </TableRow>
        )}

        {/* ── Filas ── */}
        {!loading && usuarios.map((user) => {
          const activo = user.estado?.toLowerCase() === "activo";

          return (
            <TableRow key={String(user.id)} className={`${rowCls} group`}>

              {/* Usuario */}
              <TableCell className="py-4 px-6 rounded-l-xl">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-pink-50 border border-pink-100 text-pink-600 flex items-center justify-center font-black text-xs uppercase shrink-0 group-hover:scale-105 transition-transform">
                    <Iniciales email={user.email} />
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1 truncate">
                    <Mail size={11} className="shrink-0 text-slate-300" />
                    {user.email}
                  </span>
                </div>
              </TableCell>

              {/* Rol */}
              <TableCell className="text-center">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg capitalize">
                  <ShieldCheck size={11} className="text-slate-400" />
                  {user.rol ?? "—"}
                </span>
              </TableCell>

              {/* Último acceso */}
              <TableCell className="text-center">
                <span className="text-xs text-slate-400">
                  {user.ultimo_acceso
                    ? new Date(user.ultimo_acceso).toLocaleDateString("es-PE", {
                        day: "2-digit", month: "short", year: "numeric",
                      })
                    : <span className="text-slate-300">Sin registro</span>
                  }
                </span>
              </TableCell>

              {/* Estado */}
              <TableCell className="text-center">
                <EstadoBadge estado={user.estado ?? "inactivo"} />
              </TableCell>

              {/* Acciones */}
              {showActions && (
                <TableCell className="text-right px-6 rounded-r-xl">
                  <div className="flex justify-end items-center gap-1.5">
                    {onEdit && (
                      <ActionBtn title="Editar" color="emerald" onClick={() => onEdit(user)}>
                        <Edit size={15} />
                      </ActionBtn>
                    )}
                    {onSuspender && (
                      <ActionBtn
                        title={activo ? "Suspender" : "Reactivar"}
                        color={activo ? "amber" : "blue"}
                        onClick={() => onSuspender(user)}
                      >
                        <ShieldOff size={15} />
                      </ActionBtn>
                    )}
                  </div>
                </TableCell>
              )}

            </TableRow>
          );
        })}

      </TableBody>
    </Table>
  );
}

// ─── Micro-componente botón de acción ─────────────────────────
type ColorKey = "pink" | "emerald" | "amber" | "blue" | "red";

const COLOR_MAP: Record<ColorKey, string> = {
  pink:    "hover:text-pink-600 hover:border-pink-200 hover:bg-pink-50",
  emerald: "hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50",
  amber:   "hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50",
  blue:    "hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50",
  red:     "hover:text-red-600 hover:border-red-200 hover:bg-red-50",
};

function ActionBtn({ children, onClick, title, color }: {
  children: React.ReactNode;
  onClick:  () => void;
  title:    string;
  color:    ColorKey;
}) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      title={title}
      className={`h-8 w-8 rounded-lg border-slate-200 text-slate-400 transition-all ${COLOR_MAP[color]}`}
    >
      {children}
    </Button>
  );
}

// ─── Clases compartidas ───────────────────────────────────────
const thCls  = "font-bold text-[10px] tracking-widest text-slate-400 uppercase py-3 px-4";
const rowCls = "bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-150";

export default memo(UsuariosTable);