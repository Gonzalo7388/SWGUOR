'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma';


// Tipos derivados del schema real
interface InsumoFormData {
  nombre: string;
  tipo: string;           // TipoInsumo enum
  unidad_medida: string;  // UnidadMedida enum
  categoria_insumo?: string; // CategoriaInsumo enum
  stock_actual: number | string;
  stock_minimo: number | string;
  stock_maximo?: number | string | null;
  precio_unitario?: number | string | null;
  proveedor_id?: number | string | null; // ← era "proveedor", campo correcto es proveedor_id
  ubicacion_almacen?: string | null;
}
export async function saveInsumo(data: InsumoFormData, id?: number | null) {
  const insumoData = {
    nombre: data.nombre,
    tipo: data.tipo as any,             // cast al enum TipoInsumo
    unidad_medida: data.unidad_medida as any, // cast al enum UnidadMedida
    categoria_insumo: (data.categoria_insumo ?? 'otro') as any,
    stock_actual: Number(data.stock_actual),
    stock_minimo: Number(data.stock_minimo),
    stock_maximo: data.stock_maximo ? Number(data.stock_maximo) : null,
    precio_unitario: data.precio_unitario ? Number(data.precio_unitario) : null,
    proveedor_id: data.proveedor_id ? BigInt(data.proveedor_id) : null,
    ubicacion_almacen: data.ubicacion_almacen ?? null,
  };

  if (id) {
    await prisma.insumo.update({
      where: { id: BigInt(id) },
      data: insumoData,
    });
  } else {
    await prisma.insumo.create({
      data: insumoData,
    });
  }

  revalidatePath('/admin/Panel-Administrativo/inventario');
}

export async function deleteInsumo(id: number) {
  await prisma.insumo.delete({
    where: { id: BigInt(id) },
  });

  revalidatePath('/admin/Panel-Administrativo/inventario');
}

export async function getInsumos(search?: string) {
  const where = search
    ? {
        OR: [
          { nombre: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : undefined;

  const data = await prisma.insumo.findMany({
    where,
    include: { proveedores: { select: { razon_social: true } } },
    orderBy: { nombre: 'asc' },
  });

  return data.map((i) => ({
    id: Number(i.id),
    nombre: i.nombre,
    tipo: i.tipo,
    categoria_insumo: i.categoria_insumo,
    unidad_medida: i.unidad_medida,
    stock_actual: i.stock_actual,
    stock_minimo: i.stock_minimo,
    stock_maximo: i.stock_maximo,
    precio_unitario: i.precio_unitario ? Number(i.precio_unitario) : null,
    proveedor_id: i.proveedor_id ? Number(i.proveedor_id) : null,
    proveedor_nombre: i.proveedores?.razon_social ?? null,
    ubicacion_almacen: i.ubicacion_almacen,
    alerta_bajo_stock: i.alerta_bajo_stock,
    created_at: i.created_at.toISOString(),
  }));
}
