  'use client';

  import { useMateriales } from '@/lib/hooks/useMateriales';
  import { Button } from '@/components/ui/button';
  import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter,
  } from '@/components/ui/dialog';
  import { ShieldOff, AlertTriangle, Loader2 } from 'lucide-react';
  import { tienePermiso, type RolUsuario } from '@/lib/constants/roles';

  interface Props {
    isOpen:     boolean;
    material:   any;
    onClose:    () => void;
    onSuccess:  () => void;
    rolUsuario: RolUsuario | null;
  }

  export default function DescontinuarMaterialDialog({
    isOpen, material, onClose, onSuccess, rolUsuario
  }: Props) {
    const { remove, isDeleting } = useMateriales();

    if (!isOpen || !material) return null; 
    if (!rolUsuario || !tienePermiso(rolUsuario, 'descontinuar_materiales')) return null;

    async function handleDescontinuar() {
      try {
        await remove(String(material.id));
        onSuccess();
        onClose();
      } catch {
        // useMateriales maneja el toast de error internamente
      }
    }

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-none rounded-[28px] shadow-2xl bg-white">
          <div className="h-2 bg-amber-500 w-full" />

          <div className="p-8 space-y-6">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <ShieldOff className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-black text-gray-900">
                    Descontinuar Material
                  </DialogTitle>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                    El material quedará inactivo
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                ¿Estás seguro de descontinuar{' '}
                <span className="font-bold text-amber-600">{material?.nombre}</span>?
              </p>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 space-y-1">
                {material?.stock_actual > 0 && (
                  <p className="text-xs text-amber-700 font-semibold">
                    ⚠ Este material tiene{' '}
                    <strong>{material.stock_actual} {material.unidad_medida ?? 'm'}</strong> en stock.
                  </p>
                )}
                <div className="flex gap-2 items-start">
                  <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={12} />
                  <p className="text-[11px] text-amber-700 font-bold leading-tight italic">
                    Pasará a estado inactivo. Puedes reactivarlo en cualquier momento.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={onClose} disabled={isDeleting}>
                Cancelar
              </Button>
              <Button
                onClick={handleDescontinuar}
                disabled={isDeleting}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 shadow-lg shadow-amber-100"
              >
                {isDeleting
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Descontinuando...</>
                  : 'Descontinuar'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    );
  }