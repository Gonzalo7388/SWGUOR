import { NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join, extname } from 'path';
import { extraerFichaTecnica } from '@/lib/helpers/ai-extraction';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  let tempFilePath: string | null = null;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 });
    }

    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';

    if (!isImage && !isPdf) {
      return NextResponse.json({ error: 'El archivo debe ser una imagen (PNG, JPG, WEBP) o un PDF' }, { status: 400 });
    }

    // 1. Guardar archivo temporalmente para procesamiento local de Gemini
    const buffer = await file.arrayBuffer();
    const fileExt = extname(file.name) || (isPdf ? '.pdf' : '.png');
    tempFilePath = join(tmpdir(), `geometral-${Date.now()}${fileExt}`);
    await writeFile(tempFilePath, Buffer.from(buffer));

    // 2. Extraer información con Gemini
    const extractedData = await extraerFichaTecnica(tempFilePath);

    // 3. Opcional: Subir a Supabase Storage para tener una URL persistente
    const supabase = await createClient();
    const storagePath = `geometrales/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documentos')
      .upload(storagePath, Buffer.from(buffer), {
        contentType: file.type,
        upsert: true
      });

    let publicUrl = null;
    if (!uploadError) {
      const { data: { publicUrl: url } } = supabase.storage
        .from('documentos')
        .getPublicUrl(storagePath);
      publicUrl = url;
    }

    return NextResponse.json({
      success: true,
      data: extractedData,
      imagen_geometral_url: publicUrl
    });

  } catch (error: any) {
    console.error('[POST /api/ai/extract-ficha-tecnica]', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar el archivo' },
      { status: 500 }
    );
  } finally {
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch {}
    }
  }
}
