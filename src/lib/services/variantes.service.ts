// ─── Interfaces ───────────────────────────────────────────────────────────────
export interface VarianteProducto {
    id: number;
    producto_id: number;
    nombre: string;
    color: string;
    talla: string;
    sku: string;
    stock: number;
    precio_adicional?: number;
    imagen_url?: string | null;
    estado?: string;
    created_at?: string;
}

export type VarianteCreateInput = Omit<VarianteProducto, 'id' | 'created_at'>;
export type VarianteUpdateInput = Partial<VarianteCreateInput> & { id: number };

interface VariantesResponse {
    success: boolean;
    data: VarianteProducto[];
}

// ─── Service ──────────────────────────────────────────────────────────────────
export class VariantesService {
    private static baseUrl = '/api/ecommerce/variantes';

    static async getByProducto(productoId: number): Promise<VarianteProducto[]> {
        try {
            const response = await fetch(`${this.baseUrl}?producto_id=${productoId}`, {
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const result: VariantesResponse = await response.json();
            return result.success ? result.data : [];
        } catch (error) {
            console.error('[VariantesService] Error fetching:', error);
            return [];
        }
    }

    static async crear(data: VarianteCreateInput): Promise<VarianteProducto | null> {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const result = await response.json();
            return result.success ? result.data : null;
        } catch (error) {
            console.error('[VariantesService] Error creating:', error);
            return null;
        }
    }

    static async actualizar(id: number, data: VarianteUpdateInput): Promise<VarianteProducto | null> {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const result = await response.json();
            return result.success ? result.data : null;
        } catch (error) {
            console.error('[VariantesService] Error updating:', error);
            return null;
        }
    }
}