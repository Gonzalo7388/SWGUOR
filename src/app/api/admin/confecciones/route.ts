import { createClient } from "@/lib/supabase/server";
import { NextResponse }  from "next/server";
import { confeccionOutputSchema } from "@/lib/schemas/confecciones";
import { z } from "zod";

// ── GET /api/admin/confecciones ──────────────────────────────────────────────
export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  let query = supabase
    .from("confecciones")
    .select(`
      id, pedido_id, prenda, cantidad, costo_unitario,
      fecha_entrega, prioridad, estado, notas, created_at,
      taller:talleres ( id, nombre ),
      pedido:pedidos  ( id, numero_orden )
    `)
    .order("created_at", { ascending: false });

  // Filtros opcionales via query params
  const estado    = searchParams.get("estado");
  const taller_id = searchParams.get("taller_id");
  const pedido_id = searchParams.get("pedido_id");

  if (estado)    query = query.eq("estado",    estado);
  if (taller_id) query = query.eq("taller_id", Number(taller_id));
  if (pedido_id) query = query.eq("pedido_id", Number(pedido_id));

  const { data, error } = await query;

  if (error) {
    console.error("[GET /confecciones]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// ── POST /api/admin/confecciones ─────────────────────────────────────────────
export async function POST(request: Request) {
  const supabase = await createClient();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  // Validar con el schema de output (transforma fecha y taller_id)
  const parsed = confeccionOutputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { data, error } = await supabase
    .from("confecciones")
    .insert({
      pedido_id:      parsed.data.pedido_id,
      taller_id:      parsed.data.taller_id,
      prenda:         parsed.data.prenda,
      cantidad:       parsed.data.cantidad,
      costo_unitario: parsed.data.costo_unitario ?? null,
      fecha_entrega:  parsed.data.fecha_entrega,
      prioridad:      parsed.data.prioridad,
      estado:         parsed.data.estado,
      notas:          parsed.data.notas ?? null,
      // fecha_inicio se puede setear cuando estado cambia de pendiente → en_corte
      fecha_inicio:   new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("[POST /confecciones]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}