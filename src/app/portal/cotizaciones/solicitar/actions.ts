'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireServerAuth } from '@/lib/auth/server';
import { serializePrismaPayload } from '@/lib/serializers';
import { ORIGEN_COTIZACION_SOLICITUD } from '@/lib/constants/portal-b2b';
import type {
  CategoriaCotizar,
  ItemSolicitudCotizacionInput,
  ProductoParaCotizar,
} from './types';

function normalizarImagen(img: string | null | undefined): string | null {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return img;
  return `${base}/storage/v1/object/public/productos/${img}`;
}

function generarNumeroCotizacion(id: number): string {
  const now = new Date();
  const YY = String(now.getFullYear()).slice(2);
  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const DD = String(now.getDate()).padStart(2, '0');
  const HH = String(now.getHours()).padStart(2, '0');
  const Min = String(now.getMinutes()).padStart(2, '0');
  const SS = String(now.getSeconds()).padStart(2, '0');
  return `COT-${YY}${MM}${DD}-${HH}${Min}${SS}-${id}`;
}

function calcularTotalesSolicitud(
  items: { precio_unitario: number; cantidad: number }[],
) {
  const subtotalBruto = items.reduce(
    (acc, i) => acc + i.precio_unitario * i.cantidad,
    0,
  );
  const igv = subtotalBruto * 0.18;
  return {
    subtotalBruto,
    igv,
    total: subtotalBruto + igv,
    montoDescuento: 0,
  };
}

async function obtenerClienteIdUsuario() {
  const auth = await requireServerAuth();
  if (!auth.success) {
    return { error: auth.error as string };
  }

  const cliente = await prisma.clientes.findFirst({
    where: { usuario_id: BigInt(auth.user.id) },
    select: { id: true, activo: true },
  });

  if (!cliente) {
    return { error: 'cliente_no_encontrado' };
  }

  return { clienteId: cliente.id };
}

export async function obtenerProductosParaCotizar(): Promise<
  | { success: true; productos: ProductoParaCotizar[]; categorias: CategoriaCotizar[] }
  | { success: false; error: string }
> {
  const sesion = await obtenerClienteIdUsuario();
  if ('error' in sesion) {
    return { success: false, error: sesion.error as string };
  }

  const [productosRaw, categoriasRaw] = await Promise.all([
    prisma.productos.findMany({
      where: { estado: 'activo' },
      include: {
        categorias: { select: { id: true, nombre: true } },
        variantes_producto: {
          where: { estado: 'activo' },
          select: {
            id: true,
            color: true,
            talla: true,
            stock: true,
            precio_adicional: true,
            sku: true,
          },
          orderBy: [{ talla: 'asc' }, { color: 'asc' }],
        },
      },
      orderBy: { nombre: 'asc' },
      take: 200,
    }),
    prisma.categorias.findMany({
      where: { activo: { not: false } },
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' },
    }),
  ]);

  const productos: ProductoParaCotizar[] = productosRaw
    .filter((p) => p.variantes_producto.length > 0)
    .map((p) => ({
      id: Number(p.id),
      nombre: p.nombre,
      sku: p.sku,
      precio: Number(p.precio),
      stock: p.stock,
      imagen: normalizarImagen(p.imagen),
      descripcion: p.descripcion,
      categoria: p.categorias
        ? { id: Number(p.categorias.id), nombre: p.categorias.nombre }
        : null,
      variantes: p.variantes_producto.map((v) => ({
        id: Number(v.id),
        color: v.color,
        talla: v.talla,
        stock: v.stock,
        precio_adicional: Number(v.precio_adicional),
        sku: v.sku,
      })),
    }));

  const categorias: CategoriaCotizar[] = categoriasRaw.map((c) => ({
    id: Number(c.id),
    nombre: c.nombre,
  }));

  return serializePrismaPayload({
    success: true as const,
    productos,
    categorias,
  });
}

export async function crearSolicitudCotizacion(input: {
  mensaje: string;
  items: ItemSolicitudCotizacionInput[];
}): Promise<
  | { success: true; id: number; numero: string }
  | { success: false; error: string }
> {
  const sesion = await obtenerClienteIdUsuario();
  if ('error' in sesion) {
    return { success: false, error: sesion.error };
  }

  const mensaje = input.mensaje?.trim() ?? '';
  if (!mensaje) {
    return { success: false, error: 'mensaje_requerido' };
  }

  const items = input.items ?? [];
  if (items.length === 0) {
    return { success: false, error: 'items_requeridos' };
  }

  for (const item of items) {
    if (!item.variante_id || item.cantidad < 1) {
      return { success: false, error: 'item_invalido' };
    }
  }

  const totales = calcularTotalesSolicitud(items);
  const validaHasta = new Date();
  validaHasta.setDate(validaHasta.getDate() + 7);

  try {
    const cotizacion = await prisma.$transaction(async (tx) => {
      const nueva = await tx.cotizaciones.create({
        data: {
          numero: 'PENDIENTE',
          cliente_id: sesion.clienteId,
          estado: 'enviada',
          origen: ORIGEN_COTIZACION_SOLICITUD,
          subtotal: new Prisma.Decimal(totales.subtotalBruto),
          igv: new Prisma.Decimal(totales.igv),
          total: new Prisma.Decimal(totales.total),
          valida_hasta: validaHasta,
          expira_at: validaHasta,
          monto_descuento: new Prisma.Decimal(0),
          costo_envio: new Prisma.Decimal(0),
          costo_total_estimado: new Prisma.Decimal(totales.total),
          moneda: 'PEN',
          notas_internas: mensaje,
          cotizacion_items: {
            create: items.map((item) => ({
              producto_id: BigInt(item.producto_id),
              variante_id: BigInt(item.variante_id),
              cantidad: Number(item.cantidad),
              precio_unitario_snapshot: new Prisma.Decimal(item.precio_unitario),
              subtotal: new Prisma.Decimal(
                item.cantidad * item.precio_unitario,
              ),
              color_snapshot: item.color_snapshot,
              talla_snapshot: item.talla_snapshot,
            })),
          },
        },
      });

      const numero = generarNumeroCotizacion(Number(nueva.id));
      return tx.cotizaciones.update({
        where: { id: nueva.id },
        data: { numero },
        select: { id: true, numero: true },
      });
    });

    revalidatePath('/portal/cotizaciones');

    return {
      success: true,
      id: Number(cotizacion.id),
      numero: cotizacion.numero,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Error al crear la solicitud';
    console.error('[Portal] crearSolicitudCotizacion:', err);
    return { success: false, error: message };
  }
}
