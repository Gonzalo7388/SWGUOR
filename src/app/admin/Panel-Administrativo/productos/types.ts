export interface Categoria {
  id: bigint | number | string;
  nombre: string;
}

// Ficha Tecnica
export interface FichaTecnica {
  id: bigint | number;
  id_producto?: bigint | number | null;
  version?: string | null;
  descripcion_detallada?: string | null;
  sam_total?: number | null;
  costo_estimado?: number | null;
  imagen_geometral?: string | null;
  estado?: string | null; // o el enum estado_ficha si lo tienes exportado
  created_at?: Date;
}

// Nueva interfaz para la variante
export interface VarianteProducto {
  id: bigint | number;
  color: string;
  talla: string;
  stock: number;
  producto_id: bigint | number;
}

export interface ProductoConRelaciones {
  id: bigint | number;
  sku: string;
  nombre: string;
  precio: number;
  stock: number;
  estado: string;
  imagen?: string | null;
  categoria_id?: bigint | number | null;

  // Relaciones según tu modelo Prisma:
  categorias?: Categoria;
  ficha_tecnica_rel?: FichaTecnica | null;
  variantes_producto?: {
    id: bigint | number;
    color: string;
    talla: string;
    stock: number;
  }[];

  // Otros campos opcionales que vi en tu modelo
  colores_disponibles?: string[];
  tallas_disponibles?: string[];
}