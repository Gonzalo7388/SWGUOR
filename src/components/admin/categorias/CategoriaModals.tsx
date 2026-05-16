'use client';

// GUOR PRO Modal Design — Categorías
import { Loader2, ShieldOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Categoria } from '@/lib/services/categorias.service';

// ─────────────────────────────────────────────────────────────
// DELETE / ARCHIVE MODAL
// ─────────────────────────────────────────────────────────────

interface ArchiveProps {
  categoria: Categoria | null;
  isArchiving: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function CategoriaArchiveModal({ categoria, isArchiving, onClose, onConfirm }: ArchiveProps) {
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldOff className="w-7 h-7 text-amber-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Descontinuar Categoría</h3>
        <p className="text-sm text-gray-500 mt-2">
          ¿Estás seguro de descontinuar{' '}
          <span className="font-semibold text-amber-600">{categoria?.nombre}</span>?
          La categoría pasará a estado inactivo y no aparecerá en el catálogo.
        </p>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1 h-11" disabled={isArchiving}>
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 h-11 bg-amber-500 hover:bg-amber-600 text-white"
            disabled={isArchiving}
          >
            {isArchiving
              ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Descontinuando...</>
              : 'Descontinuar'
            }
          </Button>
        </div>
      </div>
    </div>
  );
}
