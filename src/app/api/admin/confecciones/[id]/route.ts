import { createClient } from "@/lib/supabase/server";
import { NextResponse }  from "next/server";
import { ESTADO_CONFECCION, PRIORIDAD_CONFECCION } from "@/lib/schemas/confecciones";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

// ── GET /api/admin/confecciones/[id] ────────────────────────────────────────
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("confecciones")
    .select(`
      *,
      taller:talleres ( id, nombre ),
      pedido:pedidos  ( id, numero_orden ),
      seguimiento:seguimiento_confeccion (
        id, estado_anterior, estado_nuevo, nota, created_at
      )
    `)
    .eq("id", Number(id))
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

// ── PATCH /api/admin/confecciones/[id] ───────────────────────────────────────

const patchSchema = z.object({
  estado:         z.enum(ESTADO_CONFECCION).optional(),
  prioridad:      z.enum(PRIORIDAD_CONFECCION).optional(),
  notas:          z.string().optional(),
  costo_unitario: z.number().min(0.01).optional(),
  fecha_entrega:  z.string().optional(),
  responsable_id: z.number().optional(),
});

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Body inválido" }, { status: 400 }); }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  // Si el estado cambia a completado, registrar fecha_fin
  const extra: Record<string, unknown> = {};
  if (parsed.data.estado === "completado") extra.fecha_fin = new Date().toISOString();
  if (parsed.data.estado === "en_corte")   extra.fecha_inicio = new Date().toISOString();

  const { data, error } = await supabase
    .from("confecciones")
    .update({ ...parsed.data, ...extra })
    .eq("id", Number(id))
    .select()
    .single();

  if (error) {
    console.error("[PATCH /confecciones/:id]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// ── DELETE /api/admin/confecciones/[id] ──────────────────────────────────────
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();

  const { error } = await supabase
    .from("confecciones")
    .delete()
    .eq("id", Number(id));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}