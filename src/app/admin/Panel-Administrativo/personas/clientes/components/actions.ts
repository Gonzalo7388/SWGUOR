'use server';

import { prisma } from '@/lib/prisma';
import { serializePrismaPayload } from '@/lib/serializers';

// ============================================================
// INTERFACES
// ============================================================
export interface ClienteStats {
  total: number;
  activo: number;
  inactivo: number;
  prospecto: number;
}

export interface ClienteRow {
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
  created_at: string | null;
}

// ============================================================
// SERVER ACTIONS
// ============================================================

/**
 * Obtener contadores reales de clientes desde la BD
 */
export async function getClienteStats(): Promise<ClienteStats> {
  try {
    const [total, activo, inactivo, prospecto] = await Promise.all([
      prisma.clientes.count(),
      prisma.clientes.count({ where: { activo: 'activo' } }),
      prisma.clientes.count({ where: { activo: 'inactivo' } }),
      prisma.clientes.count({ where: { activo: 'prospecto' } }),
    ]);

    return { total, activo, inactivo, prospecto };
  } catch (err) {
    console.error('Error obteniendo stats de clientes:', err);
    return { total: 0, activo: 0, inactivo: 0, prospecto: 0 };
  }
}

/**
 * Obtener lista de clientes con paginación y filtro opcional
 */
export async function getClientes(
  page: number = 0,
  pageSize: number = 10,
  statusFilter?: string | null,
  search?: string
): Promise<{ data: ClienteRow[]; totalCount: number }> {
  try {
    const where: any = {};

    if (statusFilter) {
      where.activo = statusFilter;
    }

    if (search) {
      where.OR = [
        { razon_social: { contains: search, mode: 'insensitive' as const } },
        { ruc: { contains: search } },
        { nombre: { contains: search, mode: 'insensitive' as const } },
        { apellido_paterno: { contains: search, mode: 'insensitive' as const } },
        { codigo_cliente: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    const [data, totalCount] = await Promise.all([
      prisma.clientes.findMany({
        where,
        orderBy: { razon_social: 'asc' },
        skip: page * pageSize,
        take: pageSize,
      }),
      prisma.clientes.count({ where }),
    ]);

    return {
      data: serializePrismaPayload(
        data.map((c) => ({
          id: Number(c.id),
          tipo_documento: c.tipo_documento,
          ruc: c.ruc,
          nombre: c.nombre,
          apellido_paterno: c.apellido_paterno,
          apellido_materno: c.apellido_materno,
          razon_social: c.razon_social,
          nombre_comercial: c.nombre_comercial,
          email: c.email,
          telefono: c.telefono,
          direccion_fiscal: c.direccion_fiscal,
          estado_comercial: c.estado_comercial,
          codigo_cliente: c.codigo_cliente,
          activo: c.activo,
          created_at: c.created_at?.toISOString() ?? null,
        }))
      ),
      totalCount,
    };
  } catch (err) {
    console.error('Error obteniendo clientes:', err);
    return { data: [], totalCount: 0 };
  }
}
