// app/api/admin/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!   // service role para bypass de RLS en storage
);

const BUCKET = "productos";               // nombre de tu bucket en Supabase Storage
const MAX_SIZE = 2 * 1024 * 1024;        // 2 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ message: "No se recibió ningún archivo." }, { status: 400 });
    }

    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { message: "Formato no permitido. Usa JPG, PNG o WEBP." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { message: "El archivo supera el límite de 2 MB." },
        { status: 400 }
      );
    }

    // Nombre único para evitar colisiones
    const ext = file.name.split(".").pop();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const path = `imagenes/${filename}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("[upload] Supabase error:", error);
      return NextResponse.json(
        { message: "Error al subir la imagen al almacenamiento." },
        { status: 500 }
      );
    }

    // URL pública
    const { data: publicData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path);

    return NextResponse.json({ url: publicData.publicUrl }, { status: 200 });
  } catch (err) {
    console.error("[upload] Unexpected error:", err);
    return NextResponse.json({ message: "Error interno del servidor." }, { status: 500 });
  }
}