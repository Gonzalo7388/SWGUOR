'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, Loader2, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface PdfExtractionResult {
  success: boolean;
  data?: any;
  error?: string;
}

interface PdfUploadExtractorProps {
  onExtract: (data: any) => void;
  extractType: 'cotizacion' | 'ficha_tecnica';
  label?: string;
  description?: string;
  disabled?: boolean;
}

export default function PdfUploadExtractor({
  onExtract,
  extractType,
  label = 'Cargar PDF',
  description = 'Arrastra un PDF o haz clic para seleccionar',
  disabled = false,
}: PdfUploadExtractorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const endpoint = extractType === 'cotizacion'
    ? '/api/ai/extract-cotizacion'
    : '/api/ai/extract-ficha-tecnica';

  const handleFileSelect = (selectedFile: File) => {
    // Validar que sea PDF
    if (!selectedFile.type.includes('pdf')) {
      setError('Por favor selecciona un archivo PDF válido');
      toast.error('Solo se aceptan archivos PDF');
      return;
    }

    // Validar tamaño (máx 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('El archivo es demasiado grande (máximo 10MB)');
      toast.error('Archivo demasiado grande');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setExtracted(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles[0]);
    }
  };

  const handleExtract = async () => {
    if (!file) {
      toast.error('Por favor selecciona un archivo primero');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json() as PdfExtractionResult;

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al procesar el PDF');
      }

      setExtracted(true);
      toast.success('Información extraída correctamente');
      onExtract(result.data);
    } catch (err: any) {
      const errorMsg = err.message || 'Error al procesar el PDF';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    setExtracted(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {/* Input file oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
        className="hidden"
        disabled={disabled || loading}
      />

      {/* Área de drop */}
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && !loading && fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center cursor-pointer transition-all hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">{label}</p>
          <p className="text-xs text-slate-400 mt-1">{description}</p>
          <p className="text-[11px] text-slate-300 font-semibold mt-2 uppercase tracking-wider">
            Máximo 10 MB
          </p>
        </div>
      ) : (
        <div className="border-2 border-slate-200 rounded-2xl p-6 bg-slate-50 space-y-4">
          {/* Archivo seleccionado */}
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-slate-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-700 truncate">{file.name}</p>
              <p className="text-xs text-slate-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            {extracted ? (
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : (
              <button
                onClick={clearFile}
                disabled={loading}
                type="button"
                className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Error si existe */}
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Extrayendo información...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Extraer información
                </>
              )}
            </Button>
          )}

          {/* Mensaje de éxito */}
          {extracted && (
            <div className="flex gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-700 font-semibold">
                <p>Información extraída correctamente</p>
                <p className="text-emerald-600 opacity-75">
                  Revisa los campos que se completaron automáticamente
                </p>
              </div>
            </div>
          )}

          {/* Botón para cargar otro archivo */}
          {extracted && (
            <Button
              onClick={clearFile}
              variant="outline"
              className="w-full border-slate-300"
              type="button"
            >
              Cargar otro archivo
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
