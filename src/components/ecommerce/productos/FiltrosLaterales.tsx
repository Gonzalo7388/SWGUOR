
import { Categoria } from '@/lib/hooks/useCategoriasEcommerce';
import { Search, X } from 'lucide-react';

interface Props {
  categorias: Categoria[];
  categoriaSel: string;
  setCategoriaSel: (id: string) => void;
  rangoPrecio: number;
  setRangoPrecio: (precio: number) => void;
  busqueda: string;
  setBusqueda: (valor: string) => void;
}

export function FiltrosLaterales({ 
  categorias, 
  categoriaSel, 
  setCategoriaSel, 
  rangoPrecio, 
  setRangoPrecio,
  busqueda,
  setBusqueda 
}: Props) {
  return (
    <aside className="space-y-10">
      {/* SECCIÓN BÚSQUEDA - Ahora integrada aquí */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest mb-4 text-gray-400">Buscar</h3>
        <div className="relative group">
          <input
            type="text"
            placeholder="¿Qué buscas?"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-gray-50 border-b-2 border-gray-100 focus:border-[#f02d65] py-2 pl-8 pr-8 outline-none transition-all text-sm font-medium"
          />
          <Search className="absolute left-0 top-2.5 text-gray-300 group-focus-within:text-[#f02d65]" size={18} />
          {busqueda && (
            <button 
              onClick={() => setBusqueda('')}
              className="absolute right-0 top-2.5 text-gray-400 hover:text-red-500"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* SECCIÓN CATEGORÍAS */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest mb-4 text-gray-400">Categorías</h3>
        <div className="flex flex-col gap-1">
          <button 
            onClick={() => setCategoriaSel('todos')}
            className={`text-left px-3 py-2.5 rounded-xl text-[13px] transition-all ${categoriaSel === 'todos' ? 'bg-[#f02d65] text-white font-bold shadow-md shadow-rose-200' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Todas las prendas
          </button>
          {categorias.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setCategoriaSel(cat.id.toString())}
              className={`text-left px-3 py-2.5 rounded-xl text-[13px] transition-all ${categoriaSel === cat.id.toString() ? 'bg-[#f02d65] text-white font-bold shadow-md shadow-rose-200' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* SECCIÓN PRECIO */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Precio Máx.</h3>
          <span className="text-sm font-bold text-[#f02d65]">S/ {rangoPrecio}</span>
        </div>
        <input 
          type="range" min="0" max="1000" step="5"
          className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#f02d65]"
          value={rangoPrecio}
          onChange={(e) => setRangoPrecio(parseInt(e.target.value))}
        />
        <div className="flex justify-between text-[10px] text-gray-300 font-bold mt-2 uppercase">
          <span>S/ 0</span>
          <span>S/ 1000</span>
        </div>
      </div>
    </aside>
  );
}