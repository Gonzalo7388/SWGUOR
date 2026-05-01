"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/lib/supabase";

// Definimos el esquema PRIMERO
const tallerSchema = z.object({
  nombre: z.string().min(3, "El nombre es muy corto"),
  ruc: z.string().length(11, "El RUC debe tener 11 dígitos"),
  contacto: z.string().min(3, "Define un contacto"),
  telefono: z.string().min(9, "Teléfono inválido"),
  direccion: z.string().min(5, "Dirección requerida"),
  email: z.string().email("Email inválido").or(z.literal("")),
  especialidad: z.enum(["corte", "confeccion", "bordado", "estampado", "acabados", "costura", "otro"]),
  estado: z.enum(["activo", "inactivo", "suspendido"]),
});

// Extraemos el tipo AUTOMÁTICAMENTE del esquema
// Esto garantiza que TallerFormValues sea EXACTAMENTE lo que Zod espera
export type TallerFormValues = z.infer<typeof tallerSchema>;

interface TallerFormProps {
  initialData?: TallerFormValues & { id?: string }; 
  onSubmit: (values: TallerFormValues) => void;
  isLoading: boolean;
}

export default function TallerForm({ initialData, onSubmit, isLoading }: TallerFormProps) {
  // Agrega este estado para el chequeo de duplicados
  const [rucExists, setRucExists] = useState(false);
  const [checkingRuc, setCheckingRuc] = useState(false);
  const supabase = getSupabaseBrowserClient();
  // Función para limpiar y validar el RUC (Solo números)
  const handleRucChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 11); // Auto-limpieza: solo números, max 11
    field.onChange(value);
  };

  // Verificación de duplicados en tiempo real para el RUC
  const verifyRucUniqueness = async (ruc: string) => {
    if (ruc.length !== 11) return;
    
    setCheckingRuc(true);
    const { data } = await supabase
        .from("talleres")
        .select("id")
        .eq("ruc", ruc)
        // Si estamos editando, ignorar el RUC del taller actual
        .neq("id", Number(initialData?.id || 0))
        .maybeSingle();

    if (data) {
        setRucExists(true);
        toast.warning("Este RUC ya pertenece a otro taller registrado");
    } else {
        setRucExists(false);
    }
    setCheckingRuc(false);
  };

  // Pasamos el tipo al hook useForm
  const form = useForm<TallerFormValues>({
    resolver: zodResolver(tallerSchema),
    defaultValues: initialData || {
      nombre: "",
      ruc: "",
      contacto: "",
      telefono: "",
      direccion: "",
      email: "",
      especialidad: "corte",
      estado: "activo",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl border shadow-sm">
          
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Nombre del Taller</FormLabel>
                <FormControl><Input placeholder="Ej. Confecciones Guor" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ruc"
            render={({ field }) => (
                <FormItem>
                <FormLabel className="font-bold italic uppercase text-[10px] tracking-widest text-gray-500">
                    RUC (11 dígitos)
                </FormLabel>
                <FormControl>
                    <div className="relative">
                    <Input
                        {...field}
                        placeholder="20123456789"
                        onChange={(e) => {
                        handleRucChange(e, field);
                        if (e.target.value.length === 11) verifyRucUniqueness(e.target.value);
                        }}
                        className={`font-mono font-bold tracking-widest h-11 transition-all ${
                        rucExists ? "border-red-500 bg-red-50 focus-visible:ring-red-500" : ""
                        }`}
                    />
                    {checkingRuc && (
                        <RefreshCw className="absolute right-3 top-3 w-4 h-4 animate-spin text-gray-400" />
                    )}
                    </div>
                </FormControl>
                {rucExists && (
                    <p className="text-[10px] font-bold text-red-600 uppercase mt-1">
                    Error: El RUC ya existe en el sistema.
                    </p>
                )}
                <FormMessage />
                </FormItem>
            )}
            />

          <FormField
            control={form.control}
            name="contacto"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">personal de Contacto</FormLabel>
                <FormControl><Input placeholder="Nombre del responsable" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Teléfono / WhatsApp</FormLabel>
                <FormControl><Input placeholder="999888777" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="especialidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Especialidad Principal</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="¿Qué proceso realizan?" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="corte">Corte</SelectItem>
                    <SelectItem value="confección">Confección</SelectItem>
                    <SelectItem value="bordado">Bordado</SelectItem>
                    <SelectItem value="estampado">Estampado</SelectItem>
                    <SelectItem value="acabados">Acabados</SelectItem>
                    <SelectItem value="costura">Costura</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Email (Opcional)</FormLabel>
                <FormControl><Input type="email" placeholder="taller@ejemplo.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Dirección del Taller</FormLabel>
                  <FormControl><Input placeholder="Dirección completa" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading} className="bg-pink-600 hover:bg-pink-700 text-white min-w-[150px]">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Taller
          </Button>
        </div>
      </form>
    </Form>
  );
}