'use client';

import { useMateriales } from '@/lib/hooks/useMateriales';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface Props {
  isOpen:    boolean;
  material:  any;
  onClose:   () => void;
  onSuccess: () => void;
}

export default function DeleteMaterialDialog({ isOpen, material, onClose, onSuccess }: Props) {
  const { remove, isDeleting } = useMateriales();

  function handleDelete() {
    remove(String(material.id));
    onSuccess();
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <DialogTitle className="text-lg font-black text-gray-900">Eliminar Material</DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-2 space-y-3">
          <p className="text-sm text-gray-600">
            ¿Estás seguro de que deseas eliminar{' '}
            <span className="font-bold text-gray-900">{material?.nombre}</span>?
          </p>
          <div className="bg-red-50 border border-red-100 rounded-lg p-3 space-y-1">
            {material?.stock_actual > 0 && (
              <p className="text-xs text-red-700 font-semibold">
                ⚠ Este material tiene <strong>{material.stock_actual} {material.unidad_medida ?? 'm'}</strong> en stock.
              </p>
            )}
            <p className="text-xs text-red-600">Esta acción no se puede deshacer.</p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6"
          >
            {isDeleting
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Eliminando...</>
              : 'Sí, eliminar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}