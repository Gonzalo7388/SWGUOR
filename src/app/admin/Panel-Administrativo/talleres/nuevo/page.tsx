// app/admin/talleres/nuevo/page.tsx

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Esquema de validación
const tallerSchema = z.object({
  nombre: z.string().min(3, "Mínimo 3 caracteres"),
  ruc: z.string().length(11, "El RUC debe tener 11 dígitos"),
  contacto: z.string().min(3, "Nombre de contacto obligatorio"),
  telefono: z.string().min(9, "Teléfono inválido"),
  direccion: z.string().min(5, "Dirección detallada requerida"),
  especialidad: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
});

export default function NuevoTallerPage() {
  const form = useForm<z.infer<typeof tallerSchema>>({
    resolver: zodResolver(tallerSchema),
    defaultValues: { nombre: "", ruc: "", contacto: "", telefono: "", direccion: "", email: "" },
  });

  async function onSubmit(values: z.infer<typeof tallerSchema>) {
    // Lógica para guardar en Supabase/PostgreSQL
    console.log(values);
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registrar Nuevo Taller</h1>
          <p className="text-gray-500">Completa los datos del colaborador externo para GUOR SAC.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Columna 1 */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Taller</FormLabel>
                    <FormControl><Input placeholder="Ej. Confecciones Sur" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ruc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RUC</FormLabel>
                    <FormControl><Input placeholder="10XXXXXXXXX" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contacto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Persona de Contacto</FormLabel>
                    <FormControl><Input placeholder="Nombre del encargado" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Columna 2 */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono / WhatsApp</FormLabel>
                    <FormControl><Input placeholder="999 999 999" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="especialidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Especialidad</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Selecciona especialidad" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="punto">Tejido de Punto</SelectItem>
                        <SelectItem value="plano">Tejido Plano</SelectItem>
                        <SelectItem value="acabados">Solo Acabados</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="direccion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección Física</FormLabel>
                    <FormControl><Input placeholder="Av. Gamarra 123..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button variant="outline" type="button">Cancelar</Button>
            <Button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white px-8">Guardar Taller</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}