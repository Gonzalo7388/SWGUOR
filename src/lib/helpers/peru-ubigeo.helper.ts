import { ubigeoINEI } from 'peru-utils';

export interface UbigeoOption {
  code: string;
  name: string;
}

export function listarDepartamentosPeru(): UbigeoOption[] {
  return ubigeoINEI.getDepartments().map((d) => ({
    code: d.code,
    name: d.name,
  }));
}

export function listarProvinciasPeru(departamentoCode: string): UbigeoOption[] {
  if (!departamentoCode) return [];
  return ubigeoINEI.getProvince(departamentoCode).map((p) => ({
    code: p.code,
    name: p.name,
  }));
}

export function listarDistritosPeru(provinciaCode: string): UbigeoOption[] {
  if (!provinciaCode) return [];
  return ubigeoINEI.getDistrict(provinciaCode).map((d) => ({
    code: d.code,
    name: d.name,
  }));
}

export function buscarCodigoPorNombre(
  opciones: UbigeoOption[],
  nombre: string,
): string | undefined {
  const objetivo = normalizarUbigeoTexto(nombre);
  if (!objetivo) return undefined;

  return opciones.find((o) => normalizarUbigeoTexto(o.name) === objetivo)?.code;
}

export function normalizarUbigeoTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
