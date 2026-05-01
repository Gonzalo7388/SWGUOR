"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

/**
 * Componente patrón para diálogos de formularios rápidos (sin íconos en header)
 * 
 * Uso:
 * <QuickFormDialog
 *   isOpen={true}
 *   onClose={() => {}}
 *   title="Nuevo Usuario"
 *   description="Crea una nueva cuenta"
 *   primaryColor="pink"
 *   onSubmit={handleSubmit}
 *   submitLabel="Crear"
 *   isLoading={false}
 * >
 *   <FormField ... />
 * </QuickFormDialog>
 */

interface QuickFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  submitLabel?: string;
  isLoading?: boolean;
  disabled?: boolean;
  primaryColor?: "pink" | "blue" | "emerald" | "amber" | "slate";
  formId?: string;
}

const COLOR_CONFIG: Record<string, {
  gradient: string;
  submit: string;
  label: string;
}> = {
  pink:    { gradient: "bg-gradient-to-r from-pink-500 via-pink-600 to-rose-600",    submit: "bg-pink-600 hover:bg-pink-700",    label: "text-pink-600" },
  blue:    { gradient: "bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-600",    submit: "bg-blue-600 hover:bg-blue-700",    label: "text-blue-600" },
  emerald: { gradient: "bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600", submit: "bg-emerald-600 hover:bg-emerald-700", label: "text-emerald-600" },
  amber:   { gradient: "bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600",  submit: "bg-amber-600 hover:bg-amber-700",  label: "text-amber-600" },
  slate:   { gradient: "bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800",   submit: "bg-slate-700 hover:bg-slate-800",  label: "text-slate-600" },
};

export default function QuickFormDialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  onSubmit,
  submitLabel = "Guardar",
  isLoading = false,
  disabled = false,
  primaryColor = "pink",
  formId,
}: QuickFormDialogProps) {
  const colors = COLOR_CONFIG[primaryColor] || COLOR_CONFIG.pink;
  const _formId = formId || `form-${title.replace(/\s+/g, "-").toLowerCase()}`;

  const handleClose = () => {
    if (!isLoading) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px] border-none shadow-2xl bg-white p-0 overflow-hidden [&>button]:hidden">

        {/* Franja superior coloreada */}
        <div className={`h-1.5 ${colors.gradient} w-full`} />

        {/* Header (SIN ICONOS) */}
        <div className="px-6 pt-5 pb-0 flex items-start justify-between">
          <div>
            <DialogTitle className="text-lg font-bold text-slate-800 tracking-tight leading-tight">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                {description}
              </DialogDescription>
            )}
          </div>
          {/* Botón cerrar custom */}
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 mt-0.5 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={onSubmit} id={_formId} className="px-6 pt-5 pb-2 space-y-5">
          {children}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 mt-2 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isLoading || disabled}
            className="text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form={_formId}
            disabled={isLoading || disabled}
            className={`${colors.submit} text-white shadow-md px-7 transition-all disabled:opacity-50`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {submitLabel}…
              </span>
            ) : submitLabel}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}

/**
 * Componente Field reutilizable para usar dentro de QuickFormDialog
 * Patrón del CreateUsuarioDialog.tsx
 */
export function QuickField({ label, children }: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] uppercase font-bold text-slate-400">
        {label}
      </Label>
      {children}
    </div>
  );
}
