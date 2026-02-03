"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Factory } from "lucide-react";

interface CreateTallerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTallerDialog({ isOpen, onClose, onSuccess }: CreateTallerDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    ruc: "",
    contacto: "",
    telefono: "",
    email: "",
    direccion: "",
    especialidad: "",
    estado: "activo"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/talleres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Error al crear taller');

      toast.success("Taller registrado exitosamente");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to create taller:', error);
      toast.error(error.message || "Error al crear taller");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Factory className="w-6 h-6 text-pink-600" />
            Registrar Nuevo Taller
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Taller *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Confecciones Lima SAC"
                required
                disabled={loading}
              />
            </div>

            {/* RUC */}
            <div className="space-y-2">
              <Label htmlFor="ruc">RUC *</Label>
              <Input
                id="ruc"
                value={formData.ruc}
                onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                placeholder="Ej: 20123456789"
                maxLength={11}
                required
                disabled={loading}
              />
            </div>

            {/* Contacto */}
            <div className="space-y-2">
              <Label htmlFor="contacto">Persona de Contacto *</Label>
              <Input
                id="contacto"
                value={formData.contacto}
                onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                placeholder="Ej: Juan Pérez"
                required
                disabled={loading}
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="Ej: 987654321"
                required
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Ej: contacto@taller.com"
                disabled={loading}
              />
            </div>

            {/* Especialidad */}
            <div className="space-y-2">
              <Label htmlFor="especialidad">Especialidad</Label>
              <Input
                id="especialidad"
                value={formData.especialidad}
                onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                placeholder="Ej: Confección de polos"
                disabled={loading}
              />
            </div>
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección *</Label>
            <Textarea
              id="direccion"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              placeholder="Ej: Av. Los Textiles 123, La Victoria, Lima"
              rows={2}
              required
              disabled={loading}
            />
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label htmlFor="estado">Estado Inicial</Label>
            <Select 
              value={formData.estado} 
              onValueChange={(value) => setFormData({ ...formData, estado: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-pink-600 hover:bg-pink-700">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Registrar Taller"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
