interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

interface CategoriasResponse {
  success: boolean;
  data: Categoria[];
  count: number;
  cached_at?: string;
}

export class CategoriasService {
  private static baseUrl = '/api/ecommerce/categorias';
  private static cache: CategoriasResponse | null = null;
  private static cacheExpiry: number = 0;
  private static CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  static async getCategorias(forceRefresh = false): Promise<Categoria[]> {
    const now = Date.now();
    
    // Verificar cache local
    if (!forceRefresh && this.cache && now < this.cacheExpiry) {
      console.log('[SERVICE] Returning cached categorias');
      return this.cache.data;
    }

    try {
      console.log('[SERVICE] Fetching categorias from API');
      
      const response = await fetch(this.baseUrl, {
        next: { revalidate: 300 }, // Next.js cache
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: CategoriasResponse = await response.json();

      if (result.success) {
        // Actualizar cache local
        this.cache = result;
        this.cacheExpiry = now + this.CACHE_TTL;
        
        console.log(`Cached ${result.data.length} categorias`);
        return result.data;
      }

      throw new Error('API returned success: false');
    } catch (error) {
      console.error('Error fetching categorias:', error);
      
      // Fallback al cache si existe
      if (this.cache) {
        console.warn('Using stale cache due to error');
        return this.cache.data;
      }

      return [];
    }
  }

  static clearCache(): void {
    this.cache = null;
    this.cacheExpiry = 0;
  }
}