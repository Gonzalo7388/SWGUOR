export const runtime = 'nodejs';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

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

export interface ProveedorRow {
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
  _count?: {
    insumo: number;         //  CORREGIDO: 'insumos' -> 'insumo'
    ordenes_compra: number; //  CORREGIDO: 'ordenes' -> 'ordenes_compra'
  };
}

//CORRECCIÓN ts(2322): Los nombres de relaciones deben coincidir con el schema
const COUNT_INCLUDE = {
  _count: {
    select: {
      insumo: true,         //  Coincide con 'insumo' en priisma
      ordenes_compra: true, //  Coincide con 'ordenes_compra' en priisma
    },
  },
} as const;

// ─────────────────────────────────────────────────────────────
// getProveedores
// ─────────────────────────────────────────────────────────────
export async function getProveedores(
  filters: ProveedorFilters = {}
): Promise<ProveedorResult> {
  const page  = Math.max(filters.page  ?? 1, 1);
  const limit = Math.min(Math.max(filters.limit ?? 20, 1), 100);
  const skip  = (page - 1) * limit;
  const where: Prisma.proveedoresWhereInput = {};

  if (filters.estado)               where.estado               = filters.estado;
  if (filters.categoria_suministro) where.categoria_suministro = filters.categoria_suministro;

  if (filters.busqueda) {
    const q = filters.busqueda;
    where.OR = [
      { razon_social: { contains: q, mode: 'insensitive' } },
      { ruc:          { contains: q } },
      { email:        { contains: q, mode: 'insensitive' } },
      { contacto:     { contains: q, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.proveedores.findMany({
      where,
      include: COUNT_INCLUDE,
      orderBy: { razon_social: 'asc' },
      skip,
      take: limit,
    }),
    prisma.proveedores.count({ where }),
  ]);

  return {
    data: data as unknown as ProveedorRow[],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// ─────────────────────────────────────────────────────────────
// upsertProveedor
// ─────────────────────────────────────────────────────────────
export async function upsertProveedor(
  input: ProveedorUpsert
): Promise<ProveedorRow> {
  const sharedData = {
    ruc: input.ruc.trim(),
    razon_social: input.razon_social.trim(),
    contacto: input.contacto.trim(),
    telefono: input.telefono.trim(),
    email: input.email.trim().toLowerCase(),
    direccion: input.direccion.trim(),
    categoria_suministro: input.categoria_suministro.trim(),
    estado: input.estado ?? 'activo',
  };

  if (input.id) {
    return prisma.proveedores.update({
      where:   { id: BigInt(input.id) },
      data:    sharedData,
      include: COUNT_INCLUDE,
    }) as unknown as Promise<ProveedorRow>;
  }

  return prisma.proveedores.create({
    data:    sharedData,
    include: COUNT_INCLUDE,
  }) as unknown as Promise<ProveedorRow>;
}

// ─────────────────────────────────────────────────────────────
// getHistorialOrdenes
// ─────────────────────────────────────────────────────────────
export async function getHistorialOrdenes(
  proveedorId: bigint | number,
  limit = 50
) {

  return prisma.ordenes_compra.findMany({
    where: { proveedor_id: BigInt(proveedorId) },
    include: {
      ordenes_compra_items: true, 
      proveedores: { select: { razon_social: true } }
    },
    orderBy: { created_at: 'desc' },
    take: limit,
  });
}

// ─────────────────────────────────────────────────────────────
// getProveedorById
// ─────────────────────────────────────────────────────────────
export async function getProveedorById(id: bigint | number) {
  return prisma.proveedores.findUnique({
    where: { id: BigInt(id) },
    include: {
      insumo: {                                      
        select: {
          id:              true,
          nombre:          true,
          stock_actual:    true,
          stock_minimo:    true,
          precio_unitario: true,
        },
        take: 10,
      },
      ...COUNT_INCLUDE,
    },
  });
}