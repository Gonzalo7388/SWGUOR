import { notFound }        from "next/navigation";
import { createClient }    from "@/lib/supabase/server";
import ConfeccionDetalle   from "@/components/admin/confecciones/detalles/ConfeccionDetalle";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ConfeccionDetallePage({ params }: PageProps) {
  const { id }   = await params;
  const supabase = await createClient();

  const { data: confeccion, error } = await supabase
    .from("confecciones")
    .select(`
      *,
      taller:talleres ( id, nombre, contacto, email, telefono, especialidad ),
      pedido:pedidos  ( id, estado, total_unidades, cliente:clientes ( id, razon_social, nombre_comercial ) ),
      seguimientos:seguimiento_confeccion (
        id, estado_anterior, estado_nuevo, notas, responsable_id, created_at
      )
    `)
    .eq("id", Number(id))
    .single();

  if (error || !confeccion) notFound();

  return <ConfeccionDetalle confeccion={confeccion} />;
}