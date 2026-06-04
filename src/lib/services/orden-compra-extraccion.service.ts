import { prisma } from '@/lib/prisma';
import { extraerCotizacionProveedorDesdeBuffer } from '@/lib/helpers/cotizacion-gemini-extraction';
import {
  findBestCatalogoMatch,
  type CatalogoProductoEntry,
} from '@/lib/helpers/catalogo-producto-match.helper';
import { scoreTextMatch } from '@/lib/helpers/proveedor-search';
import { encontrarProveedorPorExtraccion } from '@/lib/services/proveedor-cotizacion.service';
import { resolverFechaPrometidaDesdeExtraccion } from '@/lib/helpers/orden-compra-fecha-prometida.helper';
import {
  precioUnitarioNetoDesdeExtraccion,
  resolverContextoIgvDocumento,
  resolverContextoIgvItem,
  tipoImpuestoDesdeContexto,
} from '@/lib/helpers/orden-compra-precio-neto.helper';
import type { CotizacionExtraccionIA } from '@/lib/schemas/cotizacion-extraccion-ia';
import type { OrdenCompraExtraccion } from '@/lib/schemas/orden-compra-extraccion';

function limpiarRuc(ruc?: string | null): string | null {
  if (!ruc) return null;
  const digits = ruc.replace(/\D/g, '');
  return digits.length === 11 ? digits : null;
}

async function loadCatalogoProductos(): Promise<CatalogoProductoEntry[]> {
  const [insumos, materiales] = await Promise.all([
    prisma.insumo.findMany({
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' },
    }),
    prisma.materiales.findMany({
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' },
    }),
  ]);

  return [
    ...insumos.map((i) => ({ id: i.id, nombre: i.nombre, tipo: 'insumo' as const })),
    ...materiales.map((m) => ({ id: m.id, nombre: m.nombre, tipo: 'material' as const })),
  ];
}

async function resolverProveedorExtraccion(extracted: CotizacionExtraccionIA) {
  const razonExtraida = extracted.proveedor?.razon_social?.trim() ?? null;
  const rucExtraido = extracted.proveedor?.ruc?.trim() ?? null;
  const rucLimpio = limpiarRuc(rucExtraido);

  const encontrado = await encontrarProveedorPorExtraccion(extracted);

  if (encontrado) {
    const scoreRazon = razonExtraida
      ? scoreTextMatch(razonExtraida, encontrado.razon_social)
      : 0;
    const scoreRuc =
      rucLimpio && encontrado.ruc === rucLimpio
        ? 100
        : rucExtraido
          ? scoreTextMatch(rucExtraido, encontrado.ruc)
          : 0;

    return {
      proveedor_id: encontrado.id,
      proveedor_nombre: encontrado.razon_social,
      proveedor_ruc: encontrado.ruc,
      proveedor_razon_extraida: razonExtraida,
      proveedor_ruc_extraido: rucExtraido,
      proveedor_match_score: Math.max(scoreRazon, scoreRuc) || 100,
      proveedor_sin_match: false,
    };
  }

  return {
    proveedor_id: null,
    proveedor_nombre: razonExtraida,
    proveedor_ruc: null,
    proveedor_razon_extraida: razonExtraida,
    proveedor_ruc_extraido: rucExtraido,
    proveedor_match_score: 0,
    proveedor_sin_match: Boolean(razonExtraida || rucExtraido),
  };
}

export async function extraerOrdenCompraDesdePdf(
  buffer: Buffer,
): Promise<OrdenCompraExtraccion> {
  const [extracted, catalogo] = await Promise.all([
    extraerCotizacionProveedorDesdeBuffer(buffer),
    loadCatalogoProductos(),
  ]);

  const proveedor = await resolverProveedorExtraccion(extracted);
  const ctxDocumento = resolverContextoIgvDocumento(extracted.cotizacion);

  const items = (extracted.items ?? []).map((item) => {
    const descripcion = (item.descripcion ?? '').trim() || 'Ítem sin descripción';
    const cantidad = Number(item.cantidad) || 0;
    const precioPdf = Number(item.precio_unitario) || 0;
    const ctxItem = resolverContextoIgvItem(ctxDocumento, item);
    const precio_unitario = precioUnitarioNetoDesdeExtraccion(precioPdf, ctxItem);
    const match = findBestCatalogoMatch(descripcion, catalogo);

    return {
      descripcion,
      cantidad: cantidad > 0 ? cantidad : 1,
      precio_unitario,
      unidad: item.unidad ?? null,
      tipo: match?.tipo ?? null,
      ref_id: match?.ref_id ?? null,
      ref_nombre: match?.ref_nombre ?? null,
      match_score: match?.match_score ?? 0,
      sin_match: !match,
      tipo_impuesto: tipoImpuestoDesdeContexto(ctxItem),
    };
  });

  return {
    ...proveedor,
    fecha_prometida: resolverFechaPrometidaDesdeExtraccion(extracted),
    precios_incluyen_igv: ctxDocumento.preciosIncluyenIgv,
    sujeto_igv: ctxDocumento.sujetoIgv,
    notas: extracted.cotizacion?.notas ?? null,
    items,
  };
}
