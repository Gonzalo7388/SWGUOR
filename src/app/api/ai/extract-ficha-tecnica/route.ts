export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { extraerFichaTecnica } from '@/lib/helpers/ai-extraction';

/**
 * POST /api/ai/extract-ficha-tecnica
 * Procesa un PDF de ficha técnica y extrae medidas y especificaciones
 * 
 * Body: FormData con archivo 'file'
 * Response: JSON con medidas, materiales y datos técnicos extraídos
 */
export async function POST(req: Request) {
  let tempFilePath: string | null = null;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó archivo' },
        { status: 400 }
      );
    }

    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'El archivo debe ser un PDF' },
        { status: 400 }
      );
    }

    // Guardar archivo temporalmente
    const buffer = await file.arrayBuffer();
    tempFilePath = join(tmpdir(), `ficha-${Date.now()}.pdf`);
    await writeFile(tempFilePath, Buffer.from(buffer));

    // Extraer información
    const extracted = await extraerFichaTecnica(tempFilePath);

    return NextResponse.json({
      success: true,
      data: extracted,
    });
  } catch (error: any) {
    console.error('[POST /api/ai/extract-ficha-tecnica]', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar PDF' },
      { status: 500 }
    );
  } finally {
    // Limpiar archivo temporal
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch {}
    }
  }
}
