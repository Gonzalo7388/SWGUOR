'use client';

import { useState, useRef } from 'react';
import { Image, Loader2, AlertCircle, CheckCircle, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface GeometralExtractionResult {
  success: boolean;
  data?: {
    descripcion?: string;
    sam_total?: number;
    costo_estimado?: number;
    tallas_disponibles: string[];
    colores_disponibles: string[];
    medidas: Array<{
      punto_medida: string;
      talla: string;
      valor_cm: number;
      tolerancia?: number;
    }>;
    materiales?: Array<{
      nombre: string;
      composicion: string;
      porcentaje?: number;
    }>;
  };
  imagen_geometral_url?: string;
  error?: string;
}

interface ImagenGeometralExtractorProps {
  onExtract: (data: GeometralExtractionResult['data'], imagenUrl?: string) => void;
  productoId?: string | number;
  fichaId?: string;
  label?: string;
  disabled?: boolean;
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const ALLOWED_EXT   = '.png,.jpg,.jpeg,.webp';

export default function ImagenGeometralExtractor({
  onExtract,
  productoId,
  fichaId,
  label    = 'Cargar imagen geometral',
  disabled = false,
}: ImagenGeometralExtractorProps) {
  const [file, setFile]           = useState<File | null>(null);
  const [preview, setPreview]     = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);
  const [extracted, setExtracted] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const fileInputRef              = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('Solo se aceptan imágenes PNG, JPG o WEBP');
      toast.error('Formato no válido');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('El archivo es demasiado grande (máximo 10MB)');
      toast.error('Archivo demasiado grande');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setExtracted(false);

    // preview local
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(selectedFile);
  };

  const handleDragOver  = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-pink-400', 'bg-pink-50');
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('border-pink-400', 'bg-pink-50');
  };
  const handleDrop      = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-pink-400', 'bg-pink-50');
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleExtract = async () => {
    if (!file) { toast.error('Por favor selecciona una imagen primero'); return; }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (fichaId)    formData.append('ficha_id',    fichaId);
      if (productoId) formData.append('producto_id', String(productoId));

      const response = await fetch('/api/ai/extract-ficha-tecnica', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json() as GeometralExtractionResult;
      if (!response.ok || !result.success) throw new Error(result.error || 'Error al procesar la imagen');

      setExtracted(true);
      toast.success('Imagen analizada correctamente');
      onExtract(result.data, result.imagen_geometral_url);
    } catch (err: any) {
      const msg = err.message || 'Error al procesar la imagen';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setExtracted(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_EXT}
        onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }}
        className="hidden"
        disabled={disabled || loading}
      />

      {/* ── Sin archivo seleccionado ── */}
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && !loading && fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center cursor-pointer transition-all hover:border-pink-300 hover:bg-pink-50"
        >
          <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Image className="w-6 h-6 text-pink-400" />
          </div>
          <p className="text-sm font-bold text-slate-700">{label}</p>
          <p className="text-xs text-slate-400 mt-1">
            La IA extraerá medidas, materiales, SAM y costo estimado
          </p>
          <p className="text-[11px] text-slate-300 font-semibold mt-2 uppercase tracking-wider">
            PNG · JPG · WEBP · Máximo 10 MB
          </p>
        </div>
      ) : (
        <div className="border-2 border-slate-200 rounded-2xl overflow-hidden bg-slate-50">

          {/* Preview de la imagen */}
          <div className="relative bg-white">
            {preview && (
              <img
                src={preview}
                alt="Imagen geometral"
                className="w-full max-h-64 object-contain p-4"
              />
            )}
            {!extracted && (
              <button
                onClick={clearFile}
                disabled={loading}
                type="button"
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow border border-slate-200 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {extracted && (
              <div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-1 shadow">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          <div className="p-4 space-y-3">
            {/* Info del archivo */}
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4 text-slate-400 shrink-0" />
              <p className="text-xs text-slate-500 truncate flex-1">{file.name}</p>
              <p className="text-xs text-slate-400 shrink-0">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 font-semibold">{error}</p>
              </div>
            )}

            {/* Botón extraer */}
            {!extracted && (
              <Button
                onClick={handleExtract}
                disabled={loading || !file}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Analizando imagen...</>
                ) : (
                  <><Sparkles className="w-4 h-4" />Analizar con IA</>
                )}
              </Button>
            )}

            {/* Éxito */}
            {extracted && (
              <>
                <div className="flex gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-700 font-semibold">
                    <p>Imagen analizada correctamente</p>
                    <p className="opacity-75">
                      Se completaron: medidas, materiales, tallas y colores
                    </p>
                  </div>
                </div>
                <Button
                  onClick={clearFile}
                  variant="outline"
                  className="w-full border-slate-300"
                  type="button"
                >
                  Cargar otra imagen
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}