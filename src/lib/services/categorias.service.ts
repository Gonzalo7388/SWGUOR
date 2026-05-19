// src/lib/services/categorias.service.ts
export type { Categoria } from '@/types/categoria';
import type { Categoria } from '@/types/categoria';

// ─── Interfaces internas ──────────────────────────────────────────────────────

interface CategoriasResponse {
  success: boolean;
  data: Categoria[];
  count: number;
  cached_at?: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class CategoriasService {
  private static baseUrl = '/api/ecommerce/categorias';
  private static cache: CategoriasResponse | null = null;
  private static cacheExpiry = 0;
  private static CACHE_TTL = 5 * 60 * 1000;

  static async getCategorias(forceRefresh = false): Promise<Categoria[]> {
    const now = Date.now();

    if (!forceRefresh && this.cache && now < this.cacheExpiry) {
      return this.cache.data;
    }

    try {
      const response = await fetch(this.baseUrl, {
        next: { revalidate: 300 },
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      const result: CategoriasResponse = await response.json();

      if (result.success) {
        this.cache = result;
        this.cacheExpiry = now + this.CACHE_TTL;
        return result.data;
      }

      throw new Error('API returned success: false');
    } catch (error) {
      console.error('[CategoriasService] Error fetching:', error);
      return this.cache?.data ?? [];
    }
  }

  static clearCache(): void {
    this.cache = null;
    this.cacheExpiry = 0;
  }
}