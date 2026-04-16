
export interface Categoria {
  id: bigint | number | string;
  nombre: string;
}

export interface ProductoConRelaciones {
  id: bigint | number;
  sku: string;
  nombre: string;
  precio: number | any;
  stock: number;
  estado: string;
  imagen?: string | null;
  categoria_id?: bigint | number | null;
  ficha_tecnica?: any; // El JSON de la ficha técnica
  categorias?: Categoria; // Para la relación de Prisma
}

export interface ExcelExportConfig {
  filename: string;
}