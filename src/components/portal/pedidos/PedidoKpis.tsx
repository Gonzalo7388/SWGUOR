import { cn } from '@/lib/utils';

interface Props {
  total: number; activos: number; listos: number; entregados: number;
}

export function PedidoKpis({ total, activos, listos, entregados }: Props) {
  const items = [
    { label: 'Total',      value: total,      accent: '#b5854b' },
    { label: 'Activos',    value: activos,    accent: '#3b82f6' },
    { label: 'Listos',     value: listos,     accent: '#10b981' },
    { label: 'Entregados', value: entregados, accent: '#14b8a6' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map(({ label, value, accent }) => (
        <div
          key={label}
          className="flex flex-col justify-between p-5 rounded-2xl border bg-white transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ borderColor: `${accent}30` }}
        >
          <p className="text-4xl font-black tabular-nums leading-none mb-2" style={{ color: accent }}>
            {value}
          </p>
          <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: `${accent}80` }}>
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}