import { Skeleton } from "@/components/ui/skeleton";

const S = ({ className }: { className?: string }) => (
  <Skeleton className={`bg-pink-200 ${className ?? ""}`} />
);

export default function PersonalPageSkeleton() {
  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <S className="w-4 h-4 rounded" />
              <S className="w-20 h-3 rounded" />
            </div>
            <S className="w-64 h-9 rounded-xl" />
          </div>
          <S className="w-36 h-12 rounded-2xl" />
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
              <S className="w-12 h-12 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1">
                <S className="w-20 h-3 rounded" />
                <S className="w-10 h-6 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* ── Filtros ── */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex flex-wrap gap-2">
              <S className="h-9 flex-1 min-w-[200px] rounded-lg" />
              <S className="h-9 w-[130px] rounded-lg" />
              <S className="h-9 w-[150px] rounded-lg" />
            </div>
          </div>
          <S className="h-10 w-10 rounded-xl shrink-0" />
        </div>

        {/* ── Tabla ── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Thead */}
          <div className="border-b border-slate-100 px-4 py-3 grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <S key={i} className="h-3 w-20 rounded" />
            ))}
          </div>

          {/* Filas */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-4 py-4 grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-4 items-center border-b border-slate-50 last:border-0">
              {/* Personal — avatar + nombre + email */}
              <div className="flex items-center gap-3">
                <S className="w-9 h-9 rounded-xl shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <S className="h-3.5 w-36 rounded" />
                  <S className="h-3 w-28 rounded" />
                </div>
              </div>
              {/* Cargo badge */}
              <S className="h-6 w-24 rounded-full" />
              {/* DNI */}
              <S className="h-3.5 w-20 rounded" />
              {/* Fecha ingreso */}
              <S className="h-3.5 w-24 rounded" />
              {/* Estado badge */}
              <S className="h-6 w-16 rounded-full" />
              {/* Acciones */}
              <div className="flex justify-end gap-1.5">
                <S className="h-8 w-8 rounded-lg" />
                <S className="h-8 w-8 rounded-lg" />
                <S className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}