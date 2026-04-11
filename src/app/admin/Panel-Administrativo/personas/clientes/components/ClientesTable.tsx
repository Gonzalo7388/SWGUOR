'use client';

import { Edit2, Trash2, Mail, Phone, User, Building2, Hash, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ClientesTableProps {
  data: {
    id: number;
    tipo_documento: string | null;
    ruc: string;
    nombre: string | null;
    apellido_paterno: string | null;
    apellido_materno: string | null;
    razon_social: string | null;
    nombre_comercial: string | null;
    email: string | null;
    telefono: string | null;
    direccion_fiscal: string | null;
    estado_comercial: string | null;
    codigo_cliente: string | null;
    activo: string | null;
  }[];
  onEdit?: (c: any) => void;
  onDelete?: (c: any) => void;
  onToggleStatus?: (c: any) => void;
  onRegisterFirstClient?: () => void;
}

/**
 * Construye el nombre a mostrar según tipo de cliente
 */
function getNombreDisplay(c: ClientesTableProps['data'][0]): string {
  if (c.tipo_documento === 'RUC 20' && c.razon_social) {
    return c.razon_social;
  }
  const partes = [c.nombre, c.apellido_paterno, c.apellido_materno].filter(Boolean);
  return partes.join(' ') || c.razon_social || 'Sin nombre';
}

function getSubtitulo(c: ClientesTableProps['data'][0]): string {
  if (c.nombre_comercial) return c.nombre_comercial;
  if (c.direccion_fiscal) return c.direccion_fiscal;
  return 'Sin dirección';
}

function getStatusStyles(status: string | null) {
  switch (status?.toLowerCase()) {
    case 'activo':
      return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'inactivo':
      return 'bg-orange-50 text-orange-600 border-orange-100';
    case 'prospecto':
      return 'bg-blue-50 text-blue-600 border-blue-100';
    default:
      return 'bg-slate-50 text-slate-500 border-slate-100';
  }
}

export default function ClientesTable({
  data,
  onEdit,
  onDelete,
  onToggleStatus,
  onRegisterFirstClient,
}: ClientesTableProps) {
  const showActions = !!onEdit || !!onDelete || !!onToggleStatus;

  // ── Estado vacío con botón de registrar ──
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center shadow-sm">
        <div className="flex flex-col items-center gap-4">
          <User className="w-12 h-12 text-slate-200" />
          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">
            No hay clientes registrados
          </p>
          {onRegisterFirstClient && (
            <Button
              onClick={onRegisterFirstClient}
              className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase rounded-xl text-xs gap-2 mt-2"
            >
              <Building2 size={16} />
              Registrar mi primer cliente
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto pb-4">
        <table className="w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left">
              <th className="px-6 py-2 font-black text-[11px] tracking-widest text-slate-400 uppercase">
                Cliente / Empresa
              </th>
              <th className="px-6 py-2 font-black text-[11px] tracking-widest text-slate-400 uppercase">
                Contacto
              </th>
              <th className="px-6 py-2 font-black text-[11px] tracking-widest text-slate-400 uppercase">
                Documento
              </th>
              <th className="px-6 py-2 font-black text-[11px] tracking-widest text-slate-400 uppercase text-center">
                Estado
              </th>
              {showActions && (
                <th className="px-6 py-2 font-black text-[11px] tracking-widest text-slate-400 uppercase text-right">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((c) => {
              const esEmpresa = c.tipo_documento === 'RUC 20';

              return (
                <tr key={c.id} className="group transition-all duration-200">
                  {/* ── CLIENTE / EMPRESA ── */}
                  <td className="bg-white border-y border-l border-slate-100 py-5 px-6 rounded-l-2xl shadow-sm group-hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-11 w-11 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110 ${
                          esEmpresa
                            ? 'bg-blue-50 text-blue-600 border-blue-100'
                            : c.activo === 'activo'
                              ? 'bg-pink-50 text-pink-600 border-pink-100'
                              : 'bg-slate-50 text-slate-400 border-slate-100'
                        }`}
                      >
                        {esEmpresa ? (
                          <Building2 className="w-5 h-5" />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-slate-900 text-sm tracking-tight uppercase leading-none truncate max-w-50">
                          {getNombreDisplay(c)}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 font-medium truncate max-w-45">
                          {getSubtitulo(c)}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* ── CONTACTO ── */}
                  <td className="bg-white border-y border-slate-100 py-5 px-6 shadow-sm group-hover:shadow-md transition-all">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2 text-[13px] font-bold text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-300" />{' '}
                        {c.email || '---'}
                      </span>
                      <span className="flex items-center gap-2 text-[12px] font-medium text-slate-400">
                        <Phone className="w-3.5 h-3.5 text-slate-300" />{' '}
                        {c.telefono || '---'}
                      </span>
                    </div>
                  </td>

                  {/* ── DOCUMENTO (tipo + número) ── */}
                  <td className="bg-white border-y border-slate-100 py-5 px-6 shadow-sm group-hover:shadow-md transition-all">
                    <div className="flex flex-col gap-1">
                      <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <Hash size={14} className="text-slate-400" />
                        <span className="font-mono text-[13px] font-bold text-slate-700">
                          {c.ruc}
                        </span>
                      </div>
                      {c.tipo_documento && (
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          {c.tipo_documento}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* ── ESTADO ── */}
                  <td
                    className={`bg-white border-y border-slate-100 text-center shadow-sm group-hover:shadow-md transition-all ${
                      !showActions ? 'rounded-r-2xl border-r' : ''
                    }`}
                  >
                    <Badge
                      className={`rounded-full px-4 py-1 text-[10px] font-black border-2 uppercase transition-colors ${getStatusStyles(c.activo)}`}
                      variant="outline"
                    >
                      {c.activo || 'S/E'}
                    </Badge>
                  </td>

                  {/* ── ACCIONES ── */}
                  {showActions && (
                    <td className="bg-white border-y border-r border-slate-100 px-6 rounded-r-2xl text-right shadow-sm group-hover:shadow-md transition-all">
                      <div className="flex justify-end items-center gap-2">
                        {onToggleStatus && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onToggleStatus(c)}
                            className={`h-9 w-9 rounded-xl border-slate-200 transition-all ${
                              c.activo === 'activo'
                                ? 'text-slate-400 hover:text-orange-600 hover:bg-orange-50 hover:border-orange-200'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200'
                            }`}
                            title={c.activo === 'activo' ? 'Desactivar' : 'Activar'}
                          >
                            {c.activo === 'activo' ? (
                              <ShieldAlert size={16} />
                            ) : (
                              <ShieldCheck size={16} />
                            )}
                          </Button>
                        )}

                        {onEdit && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onEdit(c)}
                            className="h-9 w-9 rounded-xl border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all"
                          >
                            <Edit2 size={16} />
                          </Button>
                        )}

                        {onDelete && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onDelete(c)}
                            className="h-9 w-9 rounded-xl border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all"
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
