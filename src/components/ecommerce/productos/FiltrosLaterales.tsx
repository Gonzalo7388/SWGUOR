import { Categoria } from '@/lib/hooks/useCategoriasEcommerce';
import { Search, X, Check } from 'lucide-react';

// Mapeo profesional de colores para la interfaz
const MAPA_COLORES: Record<string, string> = {
  'Blanco': '#FFFFFF',
  'Negro': '#000000',
  'Gris': '#9CA3AF',
  'Beige': '#F5F5DC',
  'Marrón Pastel': '#78350f',
  'Azul Jean': '#5d8aa8',
  'Azul Marino': '#1e3a8a',
  'Rosa Pastel': '#fbcfe8',
  'Morado Claro': '#e9d5ff',
  'Multicolor': 'linear-gradient(45deg, #f02d65, #fbbf24, #3b82f6)',
  'Único': '#e5e7eb'
};

interface Props {
  categorias: Categoria[];
  categoriaSel: string;
  setCategoriaSel: (id: string) => void;
  rangoPrecio: number;
  setRangoPrecio: (precio: number) => void;
  busqueda: string;
  setBusqueda: (valor: string) => void;
  maximoPermitido: number;
  // Nuevas props de filtrado avanzado
  tallasSel: string[];
  setTallasSel: (tallas: string[]) => void;
  coloresSel: string[];
  setColoresSel: (colores: string[]) => void;
}

export function FiltrosLaterales({ 
  categorias, categoriaSel, setCategoriaSel, 
  rangoPrecio, setRangoPrecio, 
  busqueda, setBusqueda, 
  maximoPermitido,
  tallasSel, setTallasSel,
  coloresSel, setColoresSel
}: Props) {

  const toggleFiltro = (valor: string, lista: string[], setLista: (l: string[]) => void) => {
    const nuevaLista = lista.includes(valor) 
      ? lista.filter(item => item !== valor) 
      : [...lista, valor];
    setLista(nuevaLista);
  };

  return (
    <aside className="space-y-10">
      {/* BÚSQUEDA */}
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
            <button onClick={() => setBusqueda('')} className="absolute right-0 top-2.5 text-gray-400 hover:text-red-500">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* CATEGORÍAS */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest mb-4 text-gray-400">Categorías</h3>
        <div className="flex flex-col gap-1">
          <button 
            onClick={() => setCategoriaSel('todos')}
            className={`text-left px-3 py-2.5 rounded-xl text-[13px] transition-all ${categoriaSel === 'todos' ? 'bg-[#f02d65] text-white font-bold shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Todas las prendas
          </button>
          {categorias.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setCategoriaSel(cat.id.toString())}
              className={`text-left px-3 py-2.5 rounded-xl text-[13px] transition-all ${categoriaSel === cat.id.toString() ? 'bg-[#f02d65] text-white font-bold shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* TALLAS */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest mb-4 text-gray-400">Tallas</h3>
        <div className="flex flex-wrap gap-2">
          {['S', 'M', 'L', 'XL'].map(talla => (
            <button
              key={talla}
              onClick={() => toggleFiltro(talla, tallasSel, setTallasSel)}
              className={`w-10 h-10 rounded-lg text-xs font-bold transition-all border-2 ${
                tallasSel.includes(talla) 
                ? 'border-[#f02d65] bg-[#f02d65] text-white shadow-md' 
                : 'border-gray-100 text-gray-600 hover:border-gray-300'
              }`}
            >
              {talla}
            </button>
          ))}
        </div>
      </div>

      {/* COLORES */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest mb-4 text-gray-400">Colores</h3>
        <div className="grid grid-cols-5 gap-3">
          {Object.keys(MAPA_COLORES).map(color => (
            <button
              key={color}
              title={color}
              onClick={() => toggleFiltro(color, coloresSel, setColoresSel)}
              className="relative flex items-center justify-center group"
            >
              <div 
                className={`w-7 h-7 rounded-full border border-gray-200 transition-all ${
                  coloresSel.includes(color) ? 'scale-110 ring-2 ring-[#f02d65] ring-offset-2' : 'hover:scale-110'
                }`}
                style={{ background: MAPA_COLORES[color] }}
              />
              {coloresSel.includes(color) && (
                <Check size={12} className={color === 'Blanco' || color === 'Beige' ? 'text-black absolute' : 'text-white absolute'} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* RANGO DE PRECIO */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Precio Máx.</h3>
          <span className="text-sm font-bold text-[#f02d65]">S/ {rangoPrecio.toFixed(2)}</span>
        </div>
        <input 
          type="range" min="0" max={maximoPermitido} step="0.5"
          className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#f02d65]"
          value={rangoPrecio}
          onChange={(e) => setRangoPrecio(parseFloat(e.target.value))}
        />
        <div className="flex justify-between text-[10px] text-gray-300 font-bold mt-2">
          <span>S/ 0.00</span>
          <span>S/ {maximoPermitido.toFixed(2)}</span>
        </div>
      </div>
    </aside>
  );
}