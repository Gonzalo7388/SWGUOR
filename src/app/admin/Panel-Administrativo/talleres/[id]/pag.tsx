"use client";

import TallerForm, { TallerFormValues } from "@/components/admin/talleres/TallerForm";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function EditarTallerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const supabase = getSupabaseBrowserClient();
  const tallerId = parseInt(id);

  const [taller, setTaller] = useState<TallerFormValues>({
    nombre: "",
    ruc: "",
    contacto: "",
    telefono: "",
    direccion: "",
    email: "",
    especialidad: "corte",
    estado: "activo",
  });
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchTaller = async () => {
      try {
        const { data, error } = await supabase
          .from("talleres")
          .select("*")
          .eq("id", tallerId)
          .single();

        if (error) throw error;
        
        // Mapeo forzando los tipos (casting) para que coincidan con los Enums de Zod
        setTaller({
          nombre: data.nombre || "",
          ruc: data.ruc || "",
          contacto: data.contacto || "",
          telefono: data.telefono || "",
          direccion: data.direccion || "",
          email: data.email || "",
          especialidad: data.especialidad as TallerFormValues["especialidad"],
          estado: data.estado as TallerFormValues["estado"],
        });
      } catch (error) {
        console.error("Error:", error);
        toast.error("No se pudo cargar la información del taller");
      } finally {
        setLoading(false);
      }
    };

    fetchTaller();
  }, [tallerId, supabase]);

  const handleUpdate = async (values: TallerFormValues) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("talleres")
        .update(values)
        .eq("id", tallerId);

      if (error) throw error;

      toast.success("Taller actualizado correctamente");
      router.push("/admin/Panel-Administrativo/talleres");
      router.refresh();
    } catch (error) {
      toast.error("Error al actualizar los datos");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Cargando datos...</div>;

  return (
    <div className="container mx-auto py-10 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">
        Editar Taller: <span className="text-pink-600">{taller?.nombre}</span>
      </h1>
      
      <TallerForm 
        initialData={taller} 
        onSubmit={handleUpdate} 
        isLoading={isUpdating}
        readOnly={true} 
      />
    </div>
  );
}