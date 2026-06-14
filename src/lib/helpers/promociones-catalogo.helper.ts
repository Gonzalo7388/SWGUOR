import { ENTIDAD_DESCUENTO } from '@/lib/constants/promociones';

type ReglaAlcance = {
  id?: bigint;
  descuento_aplicaciones?: Array<{
    aplicable_tipo: string;
    aplicable_id: bigint;
    estado: string;
  }>;
};

export function reglaAplicaProductoCatalogo(
  regla: ReglaAlcance,
  productoId: bigint,
  categoriaId: bigint | null,
): boolean {
  return reglaAplicaEnCompra(regla, productoId, categoriaId);
}

/** CUS_27 — alcance por producto, categoría o catálogo (global) vía descuento_aplicaciones */
export function reglaAplicaEnCompra(
  regla: ReglaAlcance,
  productoId: bigint,
  categoriaId: bigint | null,
): boolean {
  const apps =
    regla.descuento_aplicaciones?.filter((a) => a.estado !== 'anulado') ?? [];

  const productApps = apps.filter(
    (a) => a.aplicable_tipo === ENTIDAD_DESCUENTO.PRODUCTO,
  );
  if (productApps.length > 0) {
    return productApps.some((a) => a.aplicable_id === productoId);
  }

  const catApps = apps.filter(
    (a) => a.aplicable_tipo === ENTIDAD_DESCUENTO.CATEGORIA,
  );
  if (catApps.length > 0) {
    if (!categoriaId) return false;
    return catApps.some((a) => a.aplicable_id === categoriaId);
  }

  const globalApps = apps.filter(
    (a) =>
      a.aplicable_tipo === ENTIDAD_DESCUENTO.GLOBAL ||
      a.aplicable_tipo === ENTIDAD_DESCUENTO.CATALOGO,
  );
  if (globalApps.length > 0) return true;

  return apps.length === 0;
}
