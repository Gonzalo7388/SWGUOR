import { Clock } from "lucide-react";
import { ETAPA_LABELS } from "@/lib/schemas/ordenes-produccion";
import { SectionCard } from "./shared/SectionCard";
import { Badge } from "./shared/Badge";

interface Props {
    orden: any;
}

export function VistaLectura({ orden }: Props) {
    return (
        <SectionCard>
            <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-bold text-slate-700">
                    Esta etapa está a cargo de otro equipo
                </p>
                <p className="text-xs text-slate-400 max-w-xs">
                    Puedes ver el progreso pero no tienes acciones disponibles aquí.
                    La orden avanzará automáticamente cuando el responsable la complete.
                </p>
                <Badge
                    label={ETAPA_LABELS[orden.etapa as keyof typeof ETAPA_LABELS] ?? orden.etapa}
                    color="bg-slate-100 text-slate-600"
                />
            </div>
        </SectionCard>
    );
}