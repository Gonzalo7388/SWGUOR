"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { ConfeccionRow_T } from "./ConfeccionesTable";

type AccionCierre = "rechazada" | "cancelada";

interface CerrarConfeccionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orden: ConfeccionRow_T | null;
    onSuccess: () => void;
}

export function CerrarConfeccionModal({
    open,
    onOpenChange,
    orden,
    onSuccess,
}: CerrarConfeccionModalProps) {
    const [accion, setAccion] = useState<AccionCierre>("rechazada");
    const [motivo, setMotivo] = useState("");
    const [loading, setLoading] = useState(false);

    function handleClose() {
        if (loading) return;
        setMotivo("");
        setAccion("rechazada");
        onOpenChange(false);
    }

    async function handleConfirmar() {
        if (!orden) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/confecciones/${orden.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    estado: accion,
                    notas: motivo.trim() || null,
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error ?? "Error al actualizar");
            }

            toast.success(
                accion === "rechazada" ? "Orden rechazada" : "Orden cancelada"
            );
            handleClose();
            onSuccess();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error inesperado");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-base font-black uppercase text-rose-600">
                        Cerrar orden #{orden?.id} — {orden?.prenda}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Selector rechazar / cancelar */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setAccion("rechazada")}
                            className={`py-3 px-4 rounded-xl border-2 text-[11px] font-black uppercase tracking-widest transition-colors ${accion === "rechazada"
                                    ? "border-rose-500 bg-rose-50 text-rose-700"
                                    : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"
                                }`}
                        >
                            Rechazar
                        </button>
                        <button
                            onClick={() => setAccion("cancelada")}
                            className={`py-3 px-4 rounded-xl border-2 text-[11px] font-black uppercase tracking-widest transition-colors ${accion === "cancelada"
                                    ? "border-zinc-500 bg-zinc-50 text-zinc-700"
                                    : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"
                                }`}
                        >
                            Cancelar
                        </button>
                    </div>

                    <p className="text-sm text-slate-500">
                        {accion === "rechazada"
                            ? "La orden quedará rechazada. El taller no procederá con la producción."
                            : "La orden quedará cancelada por decisión interna."}
                    </p>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Motivo <span className="normal-case font-normal">(opcional)</span>
                        </label>
                        <Textarea
                            placeholder="Ej: Taller sin capacidad disponible para la fecha requerida..."
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            rows={3}
                            className="resize-none text-sm"
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleClose} disabled={loading}>
                        Volver
                    </Button>
                    <Button
                        onClick={handleConfirmar}
                        disabled={loading}
                        className={`text-white font-black uppercase text-[11px] tracking-widest ${accion === "rechazada"
                                ? "bg-rose-600 hover:bg-rose-700"
                                : "bg-zinc-600 hover:bg-zinc-700"
                            }`}
                    >
                        {loading
                            ? "Procesando..."
                            : accion === "rechazada"
                                ? "Confirmar rechazo"
                                : "Confirmar cancelación"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}