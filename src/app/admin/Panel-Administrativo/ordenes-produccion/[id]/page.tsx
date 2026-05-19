"use client";

import { useParams, useRouter } from "next/navigation";
import { useOrdenesProduccion } from "@/lib/hooks/useOrdenProduccion";
import OrdenDetalleForm from "@/components/admin/ordenes/OrdenDetalleForm";
import { Loader2 } from "lucide-react";
import { OrdenProduccion } from "@/components/admin/ordenes/types";

export default function OrdenDetallePage() {
    const params = useParams();
    const router = useRouter();

    // Forzamos el tipado del hook utilizando la interfaz estructurada
    const { ordenes, isLoading } = useOrdenesProduccion({
        page: 1,
        limit: 100,
    }) as { ordenes: OrdenProduccion[]; isLoading: boolean };

    // Buscamos la orden de manera segura evitando el tipado dinámico
    const targetId = params?.id ? String(params.id) : "";
    const orden = ordenes?.find((o: OrdenProduccion) => o.id.toString() === targetId);

    const handleVolver = () => {
        router.push("/admin/Panel-Administrativo/produccion");
    };

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-slate-50/50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Cargando orden de producción...
                    </p>
                </div>
            </div>
        );
    }

    if (!orden) {
        return (
            <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-slate-50/50 p-4">
                <div className="w-full max-w-md text-center p-8 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <p className="text-sm font-medium text-slate-600">
                        La orden de producción con ID #{targetId || "---"} no existe o no se encuentra disponible.
                    </p>
                    <button
                        onClick={handleVolver}
                        className="text-xs font-black uppercase tracking-wider bg-slate-900 text-white px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
                    >
                        Regresar al listado
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/30">
            <OrdenDetalleForm initialData={orden} onClose={handleVolver} />
        </div>
    );
}