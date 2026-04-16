"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Search, 
  ArrowUpDown, 
  Plus, 
  X, 
  Filter,
  Check,
  Maximize2,
  RefreshCw
} from "lucide-react";
import { useProducts } from "@/lib/hooks/useProducts";
import {TallaProductos, ColorPrenda} from '@prisma/client';


const normalizeId = (id: any) => String(id).replace(/[^0-9]/g, '');
const DESTACADOS = Object.keys(ColorPrenda);

const COLOR_MAP: Record<string, string> = {
  azul: "#3B82F6",
  azulino: "#1E40AF",
  beige: "#F5F5DC",
  blanco: "#FFFFFF",
  camel: "#C19A6B",
  celeste: "#93C5FD",
  cemento: "#A0A0A0",
  chocolate: "#4B2C20",
  coral: "#FF7F50",
  crema: "#FFFDD0",
  fucsia: "#FF00FF",
  grafito: "#383838",
  gris: "#808080",
  guinda: "#800000",
  lila: "#C8A2C8",
  marron: "#5C4033",
  melange: "#BFC1C2",
  melon: "#FEB236",
  negro: "#000000",
  nude: "#E3BC9A",
  palo_rosa: "#D19292",
  perla: "#EAE0C8",
  piton: "#8B8C7A",
  rojo: "#EF4444",
  rosa: "#FFC0CB",
  rose: "#FF007F",
  verde: "#10B981",
  vino: "#722F37",
  animal_print: "#D2B48C" // Puedes usar un color base o un degradado
};

export interface ProductFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  colorFilter: string;
  setColorFilter: (value: string) => void;
  sizeFilter: string;
  setSizeFilter: (value: string) => void;
  sortOrder: 'asc' | 'desc' | 'none';
  setSortOrder: (value: 'asc' | 'desc' | 'none') => void;
  selectedCategoria: string;
  setSelectedCategoria: (value: string) => void;
  categorias: any[];
  colors: string[];
}

export default function ProductFilters({ 
  searchTerm,
  setSearchTerm,
  colorFilter,
  setColorFilter,
  sizeFilter,
  setSizeFilter,
  sortOrder,
  setSortOrder,
  selectedCategoria,
  setSelectedCategoria,
  categorias,
  colors 
}: ProductFiltersProps) {
  
  const { loading, refetch } = useProducts();
  const coloresRestantes = colors.filter(c => !DESTACADOS.includes(c));


return (
    <div className="space-y-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      
      {/* FILA 1: BÚSQUEDA, CATEGORÍA Y ORDENAMIENTO */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Buscador Dinámico */}
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-3 text-slate-400 group-focus-within:text-pink-500 w-4 h-4 transition-colors" />
          <Input 
            placeholder="Buscar por nombre o SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 border-slate-200 bg-slate-50/50 focus:bg-white transition-all rounded-xl"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Selector de Categorías */}
        <div className="w-full lg:w-64">
          <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
            <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/50">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categorias && categorias.map((cat) => (
                <SelectItem key={normalizeId(cat.id)} value={normalizeId(cat.id)}>
                  {cat.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Refetch */}
        <Button variant="outline" className="h-11 border-slate-200 shrink-0 rounded-xl" onClick={refetch}>
          <RefreshCw className={`w-4 h-4 ${loading && "animate-spin"}`} />
        </Button>

        {/* Botón de Ordenar por Precio */}
        <Button 
          variant="outline" 
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className={`h-11 px-6 rounded-xl font-bold transition-all border-slate-200 ${
            sortOrder !== 'none' ? 'bg-pink-50 border-pink-200 text-pink-700' : 'bg-white text-slate-600'
          }`}
        >
          <ArrowUpDown className={`w-4 h-4 mr-2 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
          Precio: {sortOrder === 'asc' ? 'Menor a Mayor' : sortOrder === 'desc' ? 'Mayor a Menor' : 'Ordenar'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
        
        {/* SECCIÓN DE COLORES */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
              <Filter className="w-3 h-3 text-pink-500" /> Filtrar por Color
            </Label>
            {colorFilter && (
              <button 
                onClick={() => setColorFilter("")}
                className="text-[10px] font-bold text-pink-600 hover:underline uppercase"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setColorFilter("")}
              className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all ${
                colorFilter === "" 
                  ? "border-pink-600 bg-pink-600 text-white shadow-lg shadow-pink-100" 
                  : "border-slate-100 bg-slate-100 text-slate-400"
              }`}
            >
              ALL
            </button>

            {DESTACADOS.map((color) => (
              <button
                key={color}
                onClick={() => setColorFilter(color)}
                title={color}
                className={`w-9 h-9 rounded-full border-2 transition-all hover:scale-110 active:scale-90 relative flex items-center justify-center ${
                  colorFilter === color 
                    ? "border-pink-600 ring-4 ring-pink-50" 
                    : "border-slate-200 shadow-sm"
                }`}
                style={{ backgroundColor: COLOR_MAP[color] }}
              >
                {colorFilter === color && (
                  <Check className={`w-4 h-4 ${color === "Blanco" || color === "Beige" || color === "Rosa pastel" ? "text-slate-900" : "text-white"}`} />
                )}
              </button>
            ))}

            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={`h-9 w-9 rounded-full p-0 flex items-center justify-center transition-all ${
                    coloresRestantes.includes(colorFilter) ? "bg-pink-600 text-white shadow-lg" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 bg-white p-3 rounded-2xl shadow-xl border-slate-100" align="start">
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {coloresRestantes.map((color) => (
                    <button
                      key={color}
                      onClick={() => setColorFilter(color)}
                      className={`text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                        colorFilter === color ? "bg-pink-50 text-pink-700" : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* SECCIÓN DE TALLAS */}
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
            <Maximize2 className="w-3 h-3 text-pink-500" /> Filtrar por Talla
          </Label>
          
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Botón para limpiar filtro */}
            <button
              onClick={() => setSizeFilter("")}
              className={`px-4 h-9 rounded-xl border-2 text-[10px] font-black transition-all ${
                sizeFilter === "" 
                  ? "border-pink-600 bg-pink-600 text-white shadow-lg shadow-pink-100" 
                  : "border-slate-100 bg-slate-100 text-slate-400 hover:border-slate-200"
              }`}
            >
              TODAS
            </button>

            {/* MAP DE TALLAS REALES DESDE PRISMA */}
            {Object.values(TallaProductos).map((talla) => (
              <button
                key={talla}
                onClick={() => setSizeFilter(talla)}
                className={`w-9 h-9 rounded-full border-2 text-[11px] font-bold transition-all flex items-center justify-center ${
                  sizeFilter === talla 
                    ? "border-pink-600 bg-pink-600 text-white shadow-md" 
                    : "border-slate-200 bg-white text-slate-600 hover:border-pink-300"
                }`}
              >
                {talla}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}