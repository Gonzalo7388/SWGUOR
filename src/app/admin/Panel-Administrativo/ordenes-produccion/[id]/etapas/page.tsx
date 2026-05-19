"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { useOrdenesProduccion } from "@/lib/hooks/useOrdenProduccion";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { ETAPAS_PRODUCCION, ETAPA_LABELS } from "@/lib/schemas/ordenes-produccion";
import OrdenStepper from "@/components/admin/ordenes/OrdenStepper";
import { FormSelector, Badge } from "@/components/admin/ordenes/etapas";

type Rol =
    | "gerente" | "administrador" | "recepcionista"
    | "disenador" | "cortador" | "ayudante"
    | "representante_taller" | "cliente" | "almacenero";

export default function OrdenEtapasPage() {
    const params = useParams();
    const router = useRouter();
    const targetId = params?.id ? String(params.id) : "";

    const { ordenes, isLoading, refetch } = useOrdenesProduccion({ page: 1, limit: 100 });
    const orden = ordenes?.find((o: any) => o.id.toString() === targetId);

    const [rolActual, setRolActual] = useState<Rol | null>(null);

    useEffect(() => {
        const fetchRol = async () => {
            const supabase = getSupabaseBrowserClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data } = await supabase
                .from("usuarios")
                .select("rol")
                .eq("auth_id", user.id)
                .single();
            if (data?.rol) setRolActual(data.rol as Rol);
        };
        fetchRol();
    }, []);

    if (isLoading || !rolActual) return (
        <div className="p-8 flex items-center justify-center gap-2 text-slate-400">
            <Loader2 className="animate-spin w-5 h-5" />
            <span className="text-sm">Cargando...</span>
        </div>
    );

    if (!orden) return (
        <div className="p-8 text-center text-sm text-slate-500">Orden no encontrada</div>
    );

    return (
        <div className="p-8 space-y-6 max-w-4xl mx-auto">
            {/* Back */}
            <button
                onClick={() => router.push("/admin/Panel-Administrativo/produccion")}
                className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 hover:text-slate-700 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Volver a producción
            </button>

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                        Control de Etapas
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Orden <span className="font-bold text-slate-600">#{orden.id}</span>
                        {" · "}{orden.producto?.nombre || "Producto no especificado"}
                    </p>
                </div>
                <Badge
                    label={ETAPA_LABELS[orden.etapa as keyof typeof ETAPA_LABELS] ?? orden.etapa}
                    color="bg-rose-50 text-rose-600"
                />
            </div>

            {/* Stepper */}
            <OrdenStepper etapas={ETAPAS_PRODUCCION} etapaActual={orden.etapa} />

            {/* Formulario según rol activo */}
            <FormSelector
                orden={orden}
                rol={rolActual}
                onComplete={() => refetch?.()}
            />
        </div>
    );
}