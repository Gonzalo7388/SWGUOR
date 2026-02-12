import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  totalPaginas: number;
  paginaActual: number;
  setPaginaActual: (pagina: number) => void;
}

export function Paginacion({ totalPaginas, paginaActual, setPaginaActual }: Props) {
  if (totalPaginas <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 py-10">
      <button 
        onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
        disabled={paginaActual === 1}
        className="p-2 border rounded-full disabled:opacity-20 hover:bg-gray-50 transition"
      >
        <ChevronLeft size={20} />
      </button>
      
      {[...Array(totalPaginas)].map((_, i) => (
        <button
          key={i + 1}
          onClick={() => setPaginaActual(i + 1)}
          className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${paginaActual === i + 1 ? 'bg-black text-white' : 'hover:border-black border text-gray-600'}`}
        >
          {i + 1}
        </button>
      ))}

      <button 
        onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
        disabled={paginaActual === totalPaginas}
        className="p-2 border rounded-full disabled:opacity-20 hover:bg-gray-50 transition"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}