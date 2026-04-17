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
  Maximize2
} from "lucide-react";
import { TallaProductos, ColorPrenda } from '@prisma/client';

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
  animal_print: "#D2B48C"
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

  const coloresRestantes = colors.filter(c => !DESTACADOS.includes(c));

  return (
    <div className="space-y-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      
      {/* FILA 1 */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* BUSCADOR */}
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-3 text-slate-400 group-focus-within:text-pink-500 w-4 h-4 transition-colors" />
          <Input 
            placeholder="Buscar por nombre o SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-3 top-3 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ✅ CATEGORÍA (FIX AQUÍ) */}
        <div className="w-full lg:w-64">
          <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
            <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/50">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>

            <SelectContent className="rounded-xl">
              <SelectItem value="all">Todas las categorías</SelectItem>

              {categorias?.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ORDEN */}
        <Button 
          variant="outline" 
          onClick={() => {
            if (sortOrder === 'none') setSortOrder('asc');
            else if (sortOrder === 'asc') setSortOrder('desc');
            else setSortOrder('none');
          }}
          className={`h-11 px-6 rounded-xl font-bold ${
            sortOrder !== 'none' ? 'bg-pink-50 border-pink-200 text-pink-700' : ''
          }`}
        >
          <ArrowUpDown className={`w-4 h-4 mr-2 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
          {sortOrder === 'none'
            ? 'Ordenar Precio'
            : `Precio: ${sortOrder === 'asc' ? 'Menor a Mayor' : 'Mayor a Menor'}`}
        </Button>
      </div>

      {/* COLORES */}
      <div>
        <Label className="text-xs font-black uppercase text-slate-400 flex items-center gap-2">
          <Filter className="w-3 h-3 text-pink-500" /> Colores
        </Label>

        <div className="flex flex-wrap gap-2 mt-2">

          <button
            onClick={() => setColorFilter("")}
            className={`w-9 h-9 rounded-full ${
              colorFilter === "" ? "bg-pink-600" : "bg-slate-100"
            }`}
          />

          {DESTACADOS.map((color) => {
            const c = color.toLowerCase();
            return (
              <button
                key={color}
                onClick={() => setColorFilter(c)}
                className={`w-9 h-9 rounded-full ${
                  colorFilter === c ? "ring-2 ring-pink-500" : ""
                }`}
                style={{ backgroundColor: COLOR_MAP[c] || "#ccc" }}
              >
                {colorFilter === c && <Check className="w-3 h-3 text-white mx-auto" />}
              </button>
            );
          })}

          {/* MÁS COLORES */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="h-9 w-9 rounded-full">
                <Plus className="w-4 h-4" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-64 p-3 rounded-2xl">
              {coloresRestantes.map((color) => (
                <button
                  key={color}
                  onClick={() => setColorFilter(color)}
                  className="block w-full text-left px-2 py-1 text-sm hover:bg-slate-50"
                >
                  {color}
                </button>
              ))}
            </PopoverContent>
          </Popover>

        </div>
      </div>

      {/* TALLAS */}
      <div>
        <Label className="text-xs font-black uppercase text-slate-400 flex items-center gap-2">
          <Maximize2 className="w-3 h-3 text-pink-500" /> Tallas
        </Label>

        <div className="flex flex-wrap gap-2 mt-2">
          <button
            onClick={() => setSizeFilter("")}
            className={`px-3 h-9 rounded-xl ${
              sizeFilter === "" ? "bg-pink-600 text-white" : "bg-slate-100"
            }`}
          >
            TODAS
          </button>

          {Object.values(TallaProductos).map((talla) => (
            <button
              key={talla}
              onClick={() => setSizeFilter(talla)}
              className={`px-3 h-9 rounded-xl ${
                sizeFilter === talla ? "bg-pink-600 text-white" : "bg-slate-100"
              }`}
            >
              {talla}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}