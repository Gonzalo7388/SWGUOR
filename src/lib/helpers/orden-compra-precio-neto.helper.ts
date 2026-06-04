import {
  TASA_IGV_PEN,
  TIPO_IMPUESTO_OC,
  type TipoImpuestoOc,
} from '@/lib/constants/ordenes-compra';
import type { CotizacionExtraccionIA } from '@/lib/schemas/cotizacion-extraccion-ia';

export interface ContextoIgvExtraccion {
  preciosIncluyenIgv: boolean;
  sujetoIgv: boolean;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function parseBooleanFlag(value: unknown): boolean | null {
  if (value === true || value === 'true' || value === 1 || value === '1') return true;
  if (value === false || value === 'false' || value === 0 || value === '0') return false;
  return null;
}

/** Interpreta flags de IGV del bloque cotización extraído por IA */
export function resolverContextoIgvDocumento(
  cot?: CotizacionExtraccionIA['cotizacion'],
): ContextoIgvExtraccion {
  const exonerado =
    parseBooleanFlag(cot?.documento_exonerado_igv) === true ||
    parseBooleanFlag(cot?.sujeto_igv) === false;

  if (exonerado) {
    return { preciosIncluyenIgv: false, sujetoIgv: false };
  }

  const incluyen = parseBooleanFlag(cot?.precios_incluyen_igv);
  if (incluyen === true) {
    return { preciosIncluyenIgv: true, sujetoIgv: true };
  }
  if (incluyen === false) {
    return { preciosIncluyenIgv: false, sujetoIgv: true };
  }

  // Perú: si no se indica, asumir precios netos + IGV aparte
  return { preciosIncluyenIgv: false, sujetoIgv: true };
}

export function resolverContextoIgvItem(
  documento: ContextoIgvExtraccion,
  item?: {
    precio_incluye_igv?: boolean | null;
    sujeto_igv?: boolean | null;
  },
): ContextoIgvExtraccion {
  const itemIncluye = parseBooleanFlag(item?.precio_incluye_igv);
  const itemSujeto = parseBooleanFlag(item?.sujeto_igv);

  if (itemSujeto === false) {
    return { preciosIncluyenIgv: false, sujetoIgv: false };
  }

  return {
    preciosIncluyenIgv: itemIncluye ?? documento.preciosIncluyenIgv,
    sujetoIgv: itemSujeto ?? documento.sujetoIgv,
  };
}

/** Convierte precio unitario del PDF a valor neto (sin IGV) para la OC */
export function precioUnitarioNetoDesdeExtraccion(
  precioPdf: number,
  ctx: ContextoIgvExtraccion,
): number {
  if (precioPdf <= 0) return 0;
  if (!ctx.sujetoIgv) return roundMoney(precioPdf);
  if (ctx.preciosIncluyenIgv) {
    return roundMoney(precioPdf / (1 + TASA_IGV_PEN));
  }
  return roundMoney(precioPdf);
}

export function tipoImpuestoDesdeContexto(ctx: ContextoIgvExtraccion): TipoImpuestoOc {
  return ctx.sujetoIgv ? TIPO_IMPUESTO_OC.IGV : TIPO_IMPUESTO_OC.SIN_IGV;
}
