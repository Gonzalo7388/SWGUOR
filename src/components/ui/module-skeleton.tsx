import { Skeleton } from "@/components/ui/skeleton";

interface ModuleSkeletonProps {
  hasStats?: boolean;
  gridCols?: number;
  rows?: number;
}

export function ModuleSkeleton({ 
  hasStats = true, 
  gridCols = 4, 
  rows = 6 
}: ModuleSkeletonProps) {
  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header: Título y Botones */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 bg-gray-200" />
            <Skeleton className="h-4 w-80 bg-gray-200" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-24 bg-gray-200 rounded-xl" />
            <Skeleton className="h-11 w-40 bg-pink-100 rounded-xl" />
          </div>
        </div>

        {/* Stats Dinámicas */}
        {hasStats && (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${gridCols} gap-4`}>
            {Array.from({ length: gridCols }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl border bg-white flex items-center gap-4 shadow-sm">
                <Skeleton className="h-12 w-12 rounded-lg bg-gray-100" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16 bg-gray-100" />
                  <Skeleton className="h-7 w-10 bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Barra de Filtros */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border shadow-sm">
          <Skeleton className="h-11 flex-1 bg-gray-50 rounded-lg" />
          <Skeleton className="h-11 w-full md:w-48 bg-gray-50 rounded-lg" />
          <Skeleton className="h-11 w-12 bg-gray-50 rounded-lg" />
        </div>

        {/* Contenedor de Tabla/Contenido Principal */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {/* Fila de Cabecera */}
          <div className="grid grid-cols-5 p-4 border-b bg-gray-50/50">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-20 bg-gray-200" />
            ))}
          </div>
          
          {/* Filas de Datos */}
          {Array.from({ length: rows }).map((_, row) => (
            <div key={row} className="grid grid-cols-5 p-5 border-b items-center">
              <div className="col-span-1 flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full bg-gray-100" />
                <Skeleton className="h-4 w-24 bg-gray-100" />
              </div>
              <Skeleton className="h-4 w-20 bg-gray-100" />
              <Skeleton className="h-4 w-16 bg-gray-100" />
              <Skeleton className="h-6 w-20 rounded-full bg-gray-100" />
              <div className="flex gap-2 justify-end">
                <Skeleton className="h-8 w-8 rounded-md bg-gray-100" />
                <Skeleton className="h-8 w-8 rounded-md bg-gray-100" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer / Paginación */}
        <div className="flex items-center justify-between px-2">
          <Skeleton className="h-4 w-32 bg-gray-200" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 bg-gray-200 rounded-lg" />
            <Skeleton className="h-9 w-24 bg-gray-200 rounded-lg" />
            <Skeleton className="h-9 w-9 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}