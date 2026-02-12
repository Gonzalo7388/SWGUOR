'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import { CategoriasService } from '@/lib/services/categoriasService';

interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

export default function CategoriasDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      setLoading(true);
      setError(false);
      const data = await CategoriasService.getCategorias();
      setCategorias(data);
    } catch (err) {
      console.error('[DROPDOWN] Error loading categorias:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="relative h-full flex items-center group"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Link 
        href="/ecommerce/productos"
        className="flex items-center gap-1 text-[13px] font-bold uppercase tracking-widest text-gray-800 group-hover:text-[#f02d65] transition-colors"
      >
        Productos
        <ChevronDown 
          size={14} 
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </Link>

      {/* Dropdown */}
      <div 
        className={`absolute top-full left-0 pt-1 transition-all duration-300 ${
          isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
        }`}
      >
        <div className="bg-white border border-gray-100 shadow-2xl min-w-55 py-2 rounded-lg">
          {loading ? (
            <div className="px-6 py-4 flex justify-center">
              <Loader2 className="animate-spin text-gray-300" size={18} />
            </div>
          ) : error ? (
            <div className="px-6 py-4 flex items-center gap-2 text-xs text-red-500">
              <AlertCircle size={14} />
              <span>Error al cargar</span>
            </div>
          ) : categorias.length > 0 ? (
            <ul className="flex flex-col">
              {categorias.map((cat) => (
                <li key={cat.id}>
                  <Link 
                    href={`/ecommerce/categorias/${cat.id}`}
                    className="block px-6 py-2.5 text-[13px] text-gray-600 hover:text-[#f02d65] hover:bg-gray-50 transition-all font-medium uppercase tracking-tight"
                  >
                    {cat.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-4 text-[11px] text-gray-400 italic text-center">
              No hay categorías
            </div>
          )}
        </div>
      </div>
    </div>
  );
}