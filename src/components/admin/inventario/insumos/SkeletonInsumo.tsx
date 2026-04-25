import { Skeleton } from "@/components/ui/skeleton";

const S = ({ className }: { className?: string }) => (
  <Skeleton className={`bg-pink-200 ${className ?? ""}`} />
);

export default function SkeletonInsumosTable() {
  return (
    <div className="space-y-6">

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex justify-between items-start">
            <div className="space-y-2">
              <S className="w-16 h-2.5 rounded" />
              <S className="w-10 h-7 rounded" />
              <S className="w-20 h-2.5 rounded" />
            </div>
            <S className="w-10 h-10 rounded-xl shrink-0" />
          </div>
        ))}
      </div>

      {/* ── Barra de búsqueda ── */}
      <div className="flex flex-col md:flex-row gap-2 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        <S className="h-10 flex-1 rounded-xl" />
        <div className="flex gap-2">
          <S className="h-10 w-48 rounded-xl" />
          <S className="h-10 w-10 rounded-xl shrink-0" />
        </div>
      </div>

      {/* ── Tabla ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Thead */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-4 px-6 py-3 border-b border-slate-100">
          {Array.from({ length: 6 }).map((_, i) => (
            <S key={i} className="h-2.5 w-16 rounded" />
          ))}
        </div>

        {/* Filas */}
        <div className="border-separate border-spacing-y-3 p-4 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-4 items-center bg-white border border-slate-100 rounded-2xl px-6 py-4 shadow-sm">
              {/* Nombre + unidad */}
              <div className="space-y-1.5">
                <S className="h-3.5 w-36 rounded" />
                <S className="h-2.5 w-20 rounded" />
              </div>
              {/* Tipo badge */}
              <S className="h-6 w-20 rounded-lg" />
              {/* Precio */}
              <div className="flex justify-center">
                <S className="h-7 w-24 rounded-lg" />
              </div>
              {/* Stock */}
              <div className="flex flex-col items-center gap-1">
                <S className="h-4 w-10 rounded" />
                <S className="h-2.5 w-16 rounded" />
              </div>
              {/* Estado badge */}
              <div className="flex justify-center">
                <S className="h-6 w-20 rounded-full" />
              </div>
              {/* Acciones */}
              <div className="flex justify-end gap-2">
                <S className="h-10 w-10 rounded-xl" />
                <S className="h-10 w-10 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Paginación ── */}
      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-gray-100 shadow-sm">
        <S className="h-3 w-40 rounded" />
        <div className="flex items-center gap-2">
          <S className="h-8 w-8 rounded-xl" />
          <S className="h-3 w-12 rounded" />
          <S className="h-8 w-8 rounded-xl" />
        </div>
      </div>

    </div>
  );
}