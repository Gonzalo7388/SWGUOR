import { scoreTextMatch } from '@/lib/helpers/proveedor-search';
import { MIN_SCORE_MATCH_CATALOGO_OC } from '@/lib/constants/ordenes-compra';

export type CatalogoProductoTipo = 'material' | 'insumo';

export interface CatalogoProductoEntry {
  id: bigint | number;
  nombre: string;
  tipo: CatalogoProductoTipo;
}

export interface CatalogoMatchResult {
  tipo: CatalogoProductoTipo;
  ref_id: string;
  ref_nombre: string;
  match_score: number;
}

/**
 * Encuentra el insumo o material más parecido (indistinto al tipo).
 * Usa scoreTextMatch — sin IA, solo normalización y coincidencia parcial.
 */
export function findBestCatalogoMatch(
  descripcion: string,
  catalogo: CatalogoProductoEntry[],
  minScore = MIN_SCORE_MATCH_CATALOGO_OC,
): CatalogoMatchResult | null {
  const query = descripcion.trim();
  if (!query || catalogo.length === 0) return null;

  let best: CatalogoMatchResult | null = null;

  for (const entry of catalogo) {
    const score = scoreTextMatch(query, entry.nombre);
    if (score < minScore) continue;
    if (!best || score > best.match_score) {
      best = {
        tipo: entry.tipo,
        ref_id: String(entry.id),
        ref_nombre: entry.nombre,
        match_score: score,
      };
    }
  }

  return best;
}
