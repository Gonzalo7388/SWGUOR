import type { EstadoDespacho } from '@/lib/services/despachosServices';
import { ESTADO_CONFIG } from '@/lib/constants/estados';

interface BadgeEstadoProps {
  estado: EstadoDespacho;
}

export default function BadgeEstado({ estado }: BadgeEstadoProps) {
  const cfg = ESTADO_CONFIG[estado];
  return (
    <span
      className="text-[11px] uppercase tracking-wider font-bold px-3 py-1 rounded-full border"
      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
    >
      {cfg.label}
    </span>
  );
}