export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface ProveedorFilters {
  estado?: 'activo' | 'inactivo';
  categoria_suministro?: string;
  busqueda?: string;
  page?: number;
  limit?: number;
}

export interface ProveedorUpsert {
  id?: bigint | number;
  ruc: string;
  razon_social: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  categoria_suministro: string;
  estado?: 'activo' | 'inactivo';
}

export interface ProveedorResult {
  data: ProveedorRow[];
  total: number;
  page: number;
  totalPages: number;
}

interface ProveedorRow {
  id: bigint;
  ruc: string;
  razon_social: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  categoria_suministro: string;
  estado: string;
  created_at: Date;
  updated_at: Date;
  _count?: { insumos: number; ordenes_compra: number };
}

// ─────────────────────────────────────────────────────────────
// getProveedores — filtros + paginación + conteos
// ─────────────────────────────────────────────────────────────

export async function getProveedores(
  filters: ProveedorFilters = {}
): Promise<ProveedorResult> {
  const page = Math.max(filters.page ?? 1, 1);
  const limit = Math.min(Math.max(filters.limit ?? 20, 1), 100);
  const skip = (page - 1) * limit;

  const where: Prisma.proveedoresWhereInput = {};

  if (filters.estado) where.estado = filters.estado;
  if (filters.categoria_suministro)
    where.categoria_suministro = filters.categoria_suministro;

  if (filters.busqueda) {
    const q = filters.busqueda;
    where.OR = [
      { razon_social: { contains: q, mode: 'insensitive' } },
      { ruc: { contains: q } },
      { email: { contains: q, mode: 'insensitive' } },
      { contacto: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.proveedores.findMany({
      where,
      include: {
        _count: {
          select: { insumos: true, ordenes_compra: true },
        },
      },
      orderBy: { razon_social: 'asc' },
      skip,
      take: limit,
    }),
    prisma.proveedores.count({ where }),
  ]);

  return {
    data: data as ProveedorRow[],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// ─────────────────────────────────────────────────────────────
// upsertProveedor — crear o actualizar
// ─────────────────────────────────────────────────────────────

export async function upsertProveedor(
  input: ProveedorUpsert
): Promise<ProveedorRow> {
  // Normalizar campos
  const ruc = input.ruc.trim();
  const email = input.email.trim().toLowerCase();
  const razon_social = input.razon_social.trim();
  const contacto = input.contacto.trim();
  const telefono = input.telefono.trim();
  const direccion = input.direccion.trim();
  const categoria_suministro = input.categoria_suministro.trim();
  const estado = input.estado ?? 'activo';

  if (input.id) {
    // ── Actualizar ──
    return prisma.proveedores.update({
      where: { id: BigInt(input.id) },
      data: {
        ruc,
        razon_social,
        contacto,
        telefono,
        email,
        direccion,
        categoria_suministro,
        estado,
      },
      include: {
        _count: {
          select: { insumos: true, ordenes_compra: true },
        },
      },
    }) as Promise<ProveedorRow>;
  }

  // ── Crear ──
  return prisma.proveedores.create({
    data: {
      ruc,
      razon_social,
      contacto,
      telefono,
      email,
      direccion,
      categoria_suministro,
      estado,
    },
    include: {
      _count: {
        select: { insumos: true, ordenes_compra: true },
      },
    },
  }) as Promise<ProveedorRow>;
}

// ─────────────────────────────────────────────────────────────
// getHistorialOrdenes — todas las órdenes de compra del proveedor
// ─────────────────────────────────────────────────────────────

export async function getHistorialOrdenes(
  proveedorId: bigint | number,
  limit = 50
) {
  return prisma.ordenes.findMany({
    where: { proveedor_id: BigInt(proveedorId) },
    include: {
      cliente: { select: { id: true, razon_social: true } },
      pagos_orden: {
        select: { id: true, monto: true, fecha_pago: true, metodo_pago: true },
        orderBy: { fecha_pago: 'desc' },
        take: 5,
      },
    },
    orderBy: { created_at: 'desc' },
    take: limit,
  });
}

// ─────────────────────────────────────────────────────────────
// getProveedorById — un solo proveedor con conteos
// ─────────────────────────────────────────────────────────────

export async function getProveedorById(id: bigint | number) {
  return prisma.proveedores.findUnique({
    where: { id: BigInt(id) },
    include: {
      insumos: {
        select: {
          id: true,
          nombre: true,
          stock_actual: true,
          stock_minimo: true,
          precio_unitario: true,
        },
        take: 10,
      },
      _count: {
        select: { insumos: true, ordenes_compra: true },
      },
    },
  });
}
