export interface Categoria {
    id: number;
    nombre: string;
    descripcion?: string | null;
    activo: boolean | null;
    imagen?: string | null;
    orden?: number | null;
    created_at?: string | Date | null;
    updated_at?: string | Date | null;
}