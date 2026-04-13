"use client";

import { useState, useEffect } from "react";
import type { productos, categorias } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Save, Edit3, Package, Tag, DollarSign, Box, Layers, Power } from "lucide-react";

// Estilos constantes para mantener la coherencia visual
const ERP_LABEL = "text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest flex items-center gap-2 mb-1.5";
const ERP_INPUT = "bg-[#f1f5f9] border-none h-12 rounded-xl font-medium text-[#334155] focus-visible:ring-1 focus-visible:ring-pink-200 transition-all";

interface EditProductoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  producto: productos;
  categorias: categorias[];
}

export default function EditProductoDialog({
  isOpen,
  onClose,
  onSuccess,
  producto,
  categorias,
}: EditProductoDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    sku: "",
    precio: "",
    stock: "",
    categoria_id: "",
    estado: "",
  });

  useEffect(() => {
    if (producto && isOpen) {
      setFormData({
        nombre: producto.nombre || "",
        descripcion: producto.descripcion || "",
        sku: producto.sku || "",
        precio: producto.precio?.toString() || "0",
        stock: producto.stock?.toString() || "0",
        categoria_id: producto.categoria_id?.toString() || "",
        estado: producto.estado || "activo",
      });
    }
  }, [isOpen, producto]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        id: producto.id,
        nombre: formData.nombre,
        descripcion: formData.descripcion || null,
        precio: parseFloat(formData.precio),
        categoria_id: parseInt(formData.categoria_id),
        sku: formData.sku,
        stock: parseInt(formData.stock),
        estado: formData.estado,
        updated_at: new Date().toISOString(),
      };

      const response = await fetch(`/api/admin/productos`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Error al actualizar");

      toast.success("Producto actualizado correctamente");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white rounded-[32px] overflow-hidden p-0 border-none shadow-2xl">
        
        {/* CABECERA ESTILO ERP */}
        <div className="p-8 flex items-center gap-4">
          <div className="p-3 bg-[#fff0f6] rounded-2xl">
            <Edit3 className="w-7 h-7 text-[#e32d6f]" />
          </div>
          <div>
            <DialogTitle className="text-xl font-extrabold text-[#1a2b4b] uppercase tracking-tight">
              Configuración de Producto
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-[13px] font-medium">
              Modifica los detalles del catálogo y stock disponible.
            </DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
          
          {/* NOMBRE DEL PRODUCTO */}
          <div className="space-y-1">
            <Label className={ERP_LABEL}>
              <Package className="w-3.5 h-3.5" /> Nombre del Producto
            </Label>
            <Input
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className={ERP_INPUT}
              placeholder="Ej. Polo Oversize Cotton"
            />
          </div>

          {/* SKU Y CATEGORÍA */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className={ERP_LABEL}>
                <Tag className="w-3.5 h-3.5" /> Código SKU
              </Label>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className={ERP_INPUT}
                placeholder="PROD-001"
              />
            </div>

            <div className="space-y-1">
              <Label className={ERP_LABEL}>
                <Layers className="w-3.5 h-3.5" /> Categoría
              </Label>
              <Select 
                onValueChange={(val) => setFormData({ ...formData, categoria_id: val })} 
                value={formData.categoria_id}
              >
                <SelectTrigger className={ERP_INPUT}>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100">
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* PRECIO, STOCK Y ESTADO */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className={ERP_LABEL}>
                <DollarSign className="w-3.5 h-3.5" /> Precio
              </Label>
              <Input
                type="number"
                step="0.01"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                className={ERP_INPUT}
              />
            </div>

            <div className="space-y-1">
              <Label className={ERP_LABEL}>
                <Box className="w-3.5 h-3.5" /> Stock
              </Label>
              <Input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className={ERP_INPUT}
              />
            </div>

            <div className="space-y-1">
              <Label className={ERP_LABEL}>
                <Power className="w-3.5 h-3.5" /> Estado
              </Label>
              <Select 
                onValueChange={(val) => setFormData({ ...formData, estado: val })} 
                value={formData.estado}
              >
                <SelectTrigger className={ERP_INPUT}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100">
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="agotado">Agotado</SelectItem>
                  <SelectItem value="inactivo">Oculto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* DESCRIPCIÓN */}
          <div className="space-y-1">
            <Label className={ERP_LABEL}>Descripción del Producto</Label>
            <Textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className={`${ERP_INPUT} min-h-[80px] py-3 resize-none`}
              placeholder="Detalles adicionales..."
            />
          </div>

          {/* ACCIONES FOOTER */}
          <div className="flex items-center justify-end gap-6 pt-6 mt-4 border-t border-slate-50">
            <button 
              type="button" 
              onClick={onClose}
              className="text-[#64748b] font-bold text-sm hover:text-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#e32d6f] hover:bg-[#c4235d] h-12 px-10 rounded-xl font-bold text-white shadow-lg shadow-pink-100 transition-all active:scale-95"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}