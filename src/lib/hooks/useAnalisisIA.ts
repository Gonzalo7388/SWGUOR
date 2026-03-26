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
      // Aquí conectarías con tu API Route que llama a Gemini/OpenAI
      // Por ahora, simulamos la lógica de negocio B2B:
      await new Promise(res => setTimeout(res, 1800));

      const totalUnidades = resumen.total_unidades;
      
      // Lógica de recomendación estratégica para la Tesis:
      if (totalUnidades > 0 && totalUnidades < 500) {
        setInsight({
          mensaje: "Tu pedido actual está en el nivel base de precios.",
          sugerencia: `Si incrementas ${500 - totalUnidades} unidades más, desbloqueas el 'Nivel Mayorista Bronze' con un 5% de descuento adicional en todo el carrito.`,
          tipo: 'ahorro',
          impacto: '-S/ 240.00 aprox.'
        });
      } else {
        setInsight({
          mensaje: "Optimización de Mix de Productos detectada.",
          sugerencia: "Has cubierto bien las tallas M y L, pero según la tendencia de reposición de tu zona, la talla S suele agotarse un 20% más rápido. ¿Deseas equilibrar el stock?",
          tipo: 'estrategico',
          impacto: 'Evitar quiebre de stock'
        });
      }
    } catch (error) {
      console.error("Error en IA:", error);
    } finally {
      setLoading(false);
    }
  };

  return { analizarCotizacion, insight, loading, setInsight };
}