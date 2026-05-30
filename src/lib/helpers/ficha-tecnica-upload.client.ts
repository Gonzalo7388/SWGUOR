'use client';

import { getSupabaseBrowserClient } from '@/lib/supabase';
import {
  STORAGE_BUCKET_FICHAS_TECNICAS,
  fichaTecnicaStoragePath,
} from '@/lib/constants/storage';

export async function subirArchivoFichaTecnica(params: {
  file: File;
  productoId: string | number;
  tipo: 'pdf' | 'geometral' | 'evidencia';
}): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  const path = fichaTecnicaStoragePath(params.productoId, params.tipo, params.file.name);

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET_FICHAS_TECNICAS)
    .upload(path, params.file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage
    .from(STORAGE_BUCKET_FICHAS_TECNICAS)
    .getPublicUrl(path);

  return data.publicUrl;
}
