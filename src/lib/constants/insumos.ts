import type { CategoriaInsumo, TipoInsumo } from '@prisma/client';

export const TIPOS_INSUMO: Record<TipoInsumo, { label: string }> = {
  tela:      { label: 'Tela' },
  hilo:      { label: 'Hilo' },
  avio:      { label: 'Avío' },
  boton:     { label: 'Botón' },
  cierre:    { label: 'Cierre' },
  empaque:   { label: 'Empaque' },
  otro:      { label: 'Otro' },
  etiqueta:  { label: 'Etiqueta' },
  cinta:     { label: 'Cinta' },
  elastico:  { label: 'Elástico' },
  forro:     { label: 'Forro' },
  accesorio: { label: 'Accesorio' },
};

export const CATEGORIAS_INSUMO: Record<CategoriaInsumo, { label: string }> = {
  tela:       { label: 'Tela' },
  avios:      { label: 'Avíos' },
  empaque:    { label: 'Empaque' },
  hilo:       { label: 'Hilo' },
  etiquetas:  { label: 'Etiquetas' },
  forro:      { label: 'Forro' },
  otro:       { label: 'Otro' },
  accesorios: { label: 'Accesorios' },
};

export const LISTA_TIPOS_INSUMO = Object.keys(TIPOS_INSUMO) as TipoInsumo[];
export const LISTA_CATEGORIAS_INSUMO = Object.keys(CATEGORIAS_INSUMO) as CategoriaInsumo[];
