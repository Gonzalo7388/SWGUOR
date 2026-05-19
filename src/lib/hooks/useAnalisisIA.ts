import { useState } from 'react';
import { usePortal } from '@/app/portal/_contexts/PortalContext';

export interface InsightIA {
  mensaje: string;
  sugerencia: string;
  tipo: 'ahorro' | 'stock' | 'estrategico';
  impacto: string;
}

export function useAnalisisIA() {
  const { items, resumen } = usePortal();
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<InsightIA | null>(null);

  const analizarCotizacion = async () => {
    if (items.length === 0) return;
    setLoading(true);

    try {
      const res = await fetch('/api/portal/analizar-cotizacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, resumen }),
      });

      if (!res.ok) throw new Error('Error en el análisis');

      const data = await res.json();
      if (data.success) {
        setInsight(data.insight);
      }
    } catch (error) {
      console.error("Error en IA:", error);
    } finally {
      setLoading(false);
    }
  };

  return { analizarCotizacion, insight, loading, setInsight };
}