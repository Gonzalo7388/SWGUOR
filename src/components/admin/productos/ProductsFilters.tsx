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
  categorias
}: ProductFiltersProps) {

  return (
    <div className="space-y-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">

      {/* FILA 1 */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* BUSCADOR */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
          <Input 
            placeholder="Buscar por nombre o SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 rounded-xl"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-3 top-3">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* CATEGORÍA */}
        <div className="w-full lg:w-64">
          <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas las categorías</SelectItem>
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
          className="h-11 rounded-xl"
        >
          <ArrowUpDown className={`w-4 h-4 mr-2 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
          {sortOrder === 'none'
            ? 'Ordenar Precio'
            : `Precio: ${sortOrder === 'asc' ? 'Menor a Mayor' : 'Mayor a Menor'}`
          }
        </Button>
      </div>

      {/* FILTROS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* COLORES */}
        <div className="space-y-3">
          <Label className="text-xs font-bold flex items-center gap-2">
            <Filter className="w-3 h-3" /> Colores
          </Label>

          <div className="flex flex-wrap gap-2">

            <button
              onClick={() => setColorFilter("")}
              className={`w-9 h-9 rounded-full ${
                colorFilter === "" ? "bg-pink-600" : "bg-gray-200"
              }`}
            />

            {DESTACADOS.map((color) => {
              const normalized = color.toLowerCase();

              return (
                <button
                  key={color}
                  onClick={() => setColorFilter(normalized)}
                  className={`w-9 h-9 rounded-full border ${
                    colorFilter === normalized ? "ring-2 ring-pink-500" : ""
                  }`}
                  style={{ backgroundColor: COLOR_MAP[normalized] || "#ccc" }}
                >
                  {colorFilter === normalized && (
                    <Check className="w-3 h-3 text-white mx-auto" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* TALLAS */}
        <div className="space-y-3">
          <Label className="text-xs font-bold flex items-center gap-2">
            <Maximize2 className="w-3 h-3" /> Tallas
          </Label>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSizeFilter("")}
              className={`px-3 h-9 rounded ${
                sizeFilter === "" ? "bg-pink-600 text-white" : "bg-gray-200"
              }`}
            >
              TODAS
            </button>

            {Object.values(TallaProductos).map((talla) => (
              <button
                key={talla}
                onClick={() => setSizeFilter(talla)}
                className={`px-3 h-9 rounded ${
                  sizeFilter === talla ? "bg-pink-600 text-white" : "bg-gray-200"
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