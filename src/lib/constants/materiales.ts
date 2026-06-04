import type { TipoMaterial } from '@prisma/client';

export const TIPOS_MATERIAL: Record<TipoMaterial, { label: string }> = {
  punto:     { label: 'Punto' },
  plano:     { label: 'Plano' },
  no_tejido: { label: 'No tejido' },
  especial:  { label: 'Especial' },
};

export const LISTA_TIPOS_MATERIAL = Object.keys(TIPOS_MATERIAL) as TipoMaterial[];
