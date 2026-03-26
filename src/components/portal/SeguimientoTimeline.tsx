import { Check, Package, ClipboardCheck, Truck, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const PASOS = [
  { id: 'preparacion', label: 'Preparación', icon: Package, desc: 'Corte y confección' },
  { id: 'calidad',     label: 'Calidad',     icon: ClipboardCheck, desc: 'Revisión técnica' },
  { id: 'en_ruta',     label: 'En Ruta',     icon: Truck, desc: 'Hacia su destino' },
  { id: 'entregado',   label: 'Entregado',   icon: Home, desc: 'Recibido conforme' },
];

export function SeguimientoTimeline({ estadoActual }: { estadoActual: string }) {
  const indiceActual = PASOS.findIndex(p => p.id === estadoActual);

  return (
    <div className="relative flex flex-col md:flex-row justify-between w-full mt-8 mb-4">
      {/* Línea de fondo */}
      <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-200 hidden md:block" />
      
      {PASOS.map((paso, index) => {
        const isCompleted = index <= indiceActual;
        const isCurrent = index === indiceActual;
        const Icon = paso.icon;

        return (
          <div key={paso.id} className="relative flex flex-row md:flex-col items-center flex-1 z-10 mb-6 md:mb-0">
            {/* Círculo del Icono */}
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
              isCompleted ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white border-slate-200 text-slate-400"
            )}>
              {isCompleted && !isCurrent && index < indiceActual ? (
                <Check size={18} strokeWidth={3} />
              ) : (
                <Icon size={18} />
              )}
            </div>

            {/* Texto */}
            <div className="ml-4 md:ml-0 md:mt-3 text-left md:text-center">
              <p className={cn(
                "text-xs font-bold uppercase tracking-tight",
                isCompleted ? "text-slate-900" : "text-slate-400"
              )}>
                {paso.label}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">{paso.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}