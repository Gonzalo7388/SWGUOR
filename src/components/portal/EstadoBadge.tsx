import { cn } from '@/lib/utils';
// Importamos la función de información de estados que centraliza las etiquetas y colores
import { getEstadoInfo } from '@/lib/constants/estados';

type TipoEstado = 'cotizacion' | 'orden' | 'despacho' | 'cliente' | 'pago';

interface EstadoBadgeProps {
  estado: string;
  tipo: TipoEstado;
  className?: string;
}

export function EstadoBadge({ estado, tipo, className }: EstadoBadgeProps) {
  // Obtenemos la configuración centralizada (etiqueta, color de texto y color de fondo)
  const info = getEstadoInfo(estado, tipo as any);

  // Mapeo manual de colores de bordes basados en el bgColor para dar profundidad
  const borderStyles: Record<string, string> = {
    'bg-slate-100': 'border-slate-200',
    'bg-amber-100': 'border-amber-200',
    'bg-green-100': 'border-green-200',
    'bg-red-100': 'border-red-200',
    'bg-blue-100': 'border-blue-200',
    'bg-purple-100': 'border-purple-200',
    'bg-emerald-100': 'border-emerald-200',
    'bg-indigo-100': 'border-indigo-200',
    'bg-teal-100': 'border-teal-200',
    'bg-orange-100': 'border-orange-200',
  };

  const borderColor = borderStyles[info.bgColor] || 'border-gray-200';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-bold transition-colors shadow-sm',
        info.bgColor,
        info.color,
        borderColor,
        className
      )}
    >
      {/* Punto decorativo para mayor realismo de Dashboard */}
      <span className={cn('w-1.5 h-1.5 rounded-full fill-current', info.color.replace('text-', 'bg-'))} />
      {info.label}
    </span>
  );
}