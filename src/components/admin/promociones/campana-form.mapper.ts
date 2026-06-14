import { ENTIDAD_DESCUENTO, type AlcanceCampanaValue } from '@/lib/constants/promociones';
import type {
  CampanaConEscalasForm,
  CampanaRow,
  ReglaDescuentoRow,
} from '@/lib/schemas/promociones-ofertas';

type VinculoDetalle = {
  regla_id: number | string;
  prioridad: number;
  reglas_descuento?: ReglaDescuentoRow;
};

type CampanaDetalle = CampanaRow & {
  promocion_reglas?: VinculoDetalle[];
  oferta_reglas?: VinculoDetalle[];
};

function inferirAlcance(regla?: ReglaDescuentoRow): {
  alcance: AlcanceCampanaValue;
  categoria_id: string | number | null;
  producto_id: string | number | null;
} {
  if (!regla) {
    return { alcance: 'catalogo', categoria_id: null, producto_id: null };
  }

  const apps = regla.descuento_aplicaciones ?? [];
  const productoApp = apps.find(
    (a) =>
      a.aplicable_tipo === ENTIDAD_DESCUENTO.PRODUCTO &&
      a.estado !== 'anulado',
  );

  if (productoApp) {
    return {
      alcance: 'producto',
      categoria_id: null,
      producto_id: productoApp.aplicable_id,
    };
  }

  const categoriaApp = apps.find(
    (a) =>
      a.aplicable_tipo === ENTIDAD_DESCUENTO.CATEGORIA &&
      a.estado !== 'anulado',
  );

  if (categoriaApp) {
    return {
      alcance: 'categoria',
      categoria_id: categoriaApp.aplicable_id,
      producto_id: null,
    };
  }

  return { alcance: 'catalogo', categoria_id: null, producto_id: null };
}

export function emptyCampanaConEscalasForm(): CampanaConEscalasForm {
  return {
    nombre: '',
    descripcion: '',
    activo: true,
    fecha_inicio: new Date().toISOString(),
    fecha_fin: null,
    alcance: 'catalogo',
    categoria_id: null,
    producto_id: null,
    escalas: [{ cantidad_min: 400, valor_descuento: 5 }],
  };
}

export function mapCampanaDetalleToForm(data: CampanaDetalle): CampanaConEscalasForm {
  const vinculos = data.promocion_reglas ?? data.oferta_reglas ?? [];
  const primeraRegla = vinculos[0]?.reglas_descuento;
  const alcanceInfo = inferirAlcance(primeraRegla);

  return {
    id: data.id,
    nombre: data.nombre,
    descripcion: data.descripcion,
    activo: data.activo,
    fecha_inicio: data.fecha_inicio,
    fecha_fin: data.fecha_fin,
    alcance: alcanceInfo.alcance,
    categoria_id: alcanceInfo.categoria_id,
    producto_id: alcanceInfo.producto_id,
    escalas: vinculos.map((v) => ({
      id: v.reglas_descuento?.id ?? v.regla_id,
      cantidad_min: v.reglas_descuento?.cantidad_min ?? 1,
      valor_descuento: Number(v.reglas_descuento?.valor_descuento ?? 0),
    })),
  };
}
