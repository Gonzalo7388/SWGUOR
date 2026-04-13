"use client";

import { useState, useEffect, useCallback } from "react";
import { generateSKU } from "@/lib/utils/producto-utils";
import { useProducts } from "@/lib/hooks/useProducts";
import { uploadProductImage } from "@/lib/utils/supabase-image-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Loader2,
  Plus,
  Package, 
  Lock, 
  DollarSign,
  Layers,
  Image as ImageIcon,
  UploadCloud,
  X
} from "lucide-react";

// Estilos constantes para coherencia visual
const ERP_LABEL = "text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest flex items-center gap-2 mb-1.5";
const ERP_INPUT = "bg-[#f1f5f9] border-none h-12 rounded-xl font-medium text-[#334155] focus-visible:ring-1 focus-visible:ring-pink-200 transition-all";

export default function CreateProductoDialog({ isOpen, onClose, onSuccess, categorias }: any) {
  const { productos, refetch } = useProducts();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    sku: "",
    precio: "",
    categoria_id: "",
  });

  useEffect(() => {
    if (formData.nombre && formData.categoria_id) {
      const cat = categorias.find((c: any) => c.id.toString() === formData.categoria_id);
      const nextId = (productos?.length || 0) + 1;
      const newSKU = generateSKU(formData.nombre, cat?.nombre || "CAT", nextId);
      setFormData((prev) => ({ ...prev, sku: newSKU }));
    }
  }, [formData.nombre, formData.categoria_id, productos, categorias]);

  const processFile = (selectedFile: File) => {
    if (selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      toast.error("Por favor, sube solo archivos de imagen");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoria_id) return toast.error("Selecciona una categoría");

    setLoading(true);
    try {
      let finalPath: string | null = null;

      if (file) {
        const uploadResult = await uploadProductImage(file);
        if (uploadResult) {
          const parts = String(uploadResult).split("/");
          finalPath = parts[parts.length - 1];
        }
      }

      const productoData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || null,
        sku: formData.sku,
        precio: parseFloat(formData.precio),
        stock: 0,
        categoria_id: parseInt(formData.categoria_id),
        imagen: finalPath,
        estado: "activo",
        destacado: false,
        updated_at: new Date().toISOString(),
      };

      const response = await fetch("/api/admin/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productoData),
      });

      if (!response.ok) throw new Error("Error al guardar el producto");

      toast.success(`Producto ${formData.sku} creado`);
      refetch();
      onSuccess();
      onClose();
      
      setFile(null);
      setImagePreview(null);
      setFormData({ nombre: "", descripcion: "", sku: "", precio: "", categoria_id: "" });
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white rounded-[32px] overflow-hidden p-0 border-none shadow-2xl">
        
        {/* CABECERA */}
        <div className="p-8 flex items-center gap-4">
          <div className="p-3 bg-[#fff0f6] rounded-2xl">
            <Plus className="w-7 h-7 text-[#e32d6f]" />
          </div>
          <div>
            <DialogTitle className="text-xl font-extrabold text-[#1a2b4b] uppercase tracking-tight">
              Nueva Prenda
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-[13px] font-medium">
              Registra los datos básicos para el catálogo.
            </DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
          
          {/* UPLOAD DE IMAGEN INTEGRADO */}
          <div className="space-y-2">
            <Label className={ERP_LABEL}><ImageIcon className="w-3.5 h-3.5" /> Fotografía de Producto</Label>
            <div 
              className={`relative group h-32 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center overflow-hidden
                ${imagePreview ? 'border-pink-200 bg-white' : 'border-slate-100 bg-[#f8fafc] hover:bg-slate-50'}`}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-2" />
                  <button 
                    onClick={() => {setFile(null); setImagePreview(null);}}
                    className="absolute top-2 right-2 p-1 bg-white/80 rounded-full text-red-500 hover:bg-white shadow-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <label className="flex flex-col items-center gap-2 cursor-pointer w-full h-full justify-center">
                  <UploadCloud className="w-8 h-8 text-slate-300 group-hover:text-pink-400 transition-colors" />
                  <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-500">Subir imagen</span>
                  <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                </label>
              )}
            </div>
          </div>

          {/* NOMBRE */}
          <div className="space-y-1">
            <Label className={ERP_LABEL}>
              <Package className="w-3.5 h-3.5" /> Nombre del Producto
            </Label>
            <Input
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className={ERP_INPUT}
              placeholder="Ej. Blusa Seda Marfil"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* CATEGORÍA */}
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
                <SelectContent className="rounded-xl">
                  {categorias.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* PRECIO */}
            <div className="space-y-1">
              <Label className={ERP_LABEL}>
                <DollarSign className="w-3.5 h-3.5" /> Precio Sugerido
              </Label>
              <Input
                type="number"
                step="0.01"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                className={ERP_INPUT}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* SKU AUTO-GENERADO */}
          <div className="space-y-1">
            <Label className={ERP_LABEL}>
              <Lock className="w-3.5 h-3.5" /> SKU (Generado Automáticamente)
            </Label>
            <div className="h-12 flex items-center px-4 rounded-xl bg-[#f1f5f9] text-[#94a3b8] font-bold text-sm border border-slate-50 italic">
              {formData.sku || "Esperando datos..."}
            </div>
          </div>

          {/* ACCIONES */}
          <div className="flex items-center justify-end gap-6 pt-6 mt-4 border-t border-slate-50">
            <button 
              type="button" 
              onClick={onClose}
              className="text-[#64748b] font-bold text-sm hover:text-slate-800 transition-colors"
            >
              Descartar
            </button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#e32d6f] hover:bg-[#c4235d] h-12 px-10 rounded-xl font-bold text-white shadow-lg shadow-pink-100 transition-all active:scale-95"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Crear Producto"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}