export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { extraerCotizacionProveedor } from '@/lib/helpers/ai-extraction';

/**
 * POST /api/ai/extract-cotizacion
 * Procesa un PDF de cotización de proveedor y extrae información
 * 
 * Body: FormData con archivo 'file'
 * Response: JSON con datos extraídos
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
    tempFilePath = join(tmpdir(), `cotizacion-${Date.now()}.pdf`);
    await writeFile(tempFilePath, Buffer.from(buffer));

    // Extraer información
    const extracted = await extraerCotizacionProveedor(tempFilePath);

    return NextResponse.json({
      success: true,
      data: extracted,
    });
  } catch (error: any) {
    console.error('[POST /api/ai/extract-cotizacion]', error);
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
