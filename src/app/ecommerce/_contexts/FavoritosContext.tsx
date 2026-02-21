'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

interface Favorito {
  id: number;
  nombre: string;
  precio: number;
  imagen?: string;
}

interface FavoritosContextType {
  favoritos: Favorito[];
  esFavorito: (productoId: number) => boolean;
  agregarFavorito: (producto: Favorito) => void;
  removerFavorito: (productoId: number) => void;
  toggleFavorito: (producto: Favorito) => void;
  cargado: boolean; // Exponemos esto para evitar saltos visuales
}

const FavoritosContext = createContext<FavoritosContextType | undefined>(undefined);

export function FavoritosProvider({ children }: { children: React.ReactNode }) {
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [cargado, setCargado] = useState(false);

  // 1. Carga optimizada: Solo ocurre una vez y de forma pasiva
  useEffect(() => {
    const cargarDatos = () => {
      try {
        const guardados = localStorage.getItem('favoritos_ecommerce');
        if (guardados) {
          const parseados = JSON.parse(guardados);
          // Validamos que sea un array para evitar crashes
          if (Array.isArray(parseados)) {
            setFavoritos(parseados);
          }
        }
      } catch (e) {
        console.error('[FAVORITOS] Error en hidratación:', e);
      } finally {
        setCargado(true);
      }
    };

    // Usamos requestIdleCallback si está disponible para no bloquear la carga inicial de la página
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(cargarDatos);
    } else {
      setTimeout(cargarDatos, 1);
    }
  }, []);

  // 2. Persistencia eficiente: Evitamos escribir en cada renderizado
  useEffect(() => {
    if (cargado) {
      const timeoutId = setTimeout(() => {
        try {
          localStorage.setItem('favoritos_ecommerce', JSON.stringify(favoritos));
        } catch (e) {
          console.error('[FAVORITOS] Error al persistir:', e);
        }
      }, 300); // Debounce de 300ms para no saturar el disco en clics rápidos
      return () => clearTimeout(timeoutId);
    }
  }, [favoritos, cargado]);

  // 3. Memoización de funciones para evitar re-renders en los hijos (FavoriteCard)
  const esFavorito = useCallback((productoId: number): boolean => {
    return favoritos.some((fav) => fav.id === productoId);
  }, [favoritos]);

  const agregarFavorito = useCallback((producto: Favorito) => {
    setFavoritos(prev => {
      if (prev.some(p => p.id === producto.id)) return prev;
      return [...prev, producto];
    });
  }, []);

  const removerFavorito = useCallback((productoId: number) => {
    setFavoritos(prev => prev.filter((fav) => fav.id !== productoId));
  }, []);

  const toggleFavorito = useCallback((producto: Favorito) => {
    setFavoritos(prev => {
      const existe = prev.some(p => p.id === producto.id);
      if (existe) return prev.filter(p => p.id !== producto.id);
      return [...prev, producto];
    });
  }, []);

  // 4. Value memoizado para evitar que todo el árbol se renderice si el objeto contexto cambia
  const value = useMemo(() => ({
    favoritos,
    esFavorito,
    agregarFavorito,
    removerFavorito,
    toggleFavorito,
    cargado
  }), [favoritos, esFavorito, agregarFavorito, removerFavorito, toggleFavorito, cargado]);

  return (
    <FavoritosContext.Provider value={value}>
      {children}
    </FavoritosContext.Provider>
  );
}

export function useFavoritos() {
  const context = useContext(FavoritosContext);
  if (!context) throw new Error('useFavoritos debe estar dentro de FavoritosProvider');
  return context;
}  