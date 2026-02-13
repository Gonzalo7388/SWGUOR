'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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
}

const FavoritosContext = createContext<FavoritosContextType | undefined>(undefined);

export function FavoritosProvider({ children }: { children: React.ReactNode }) {
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [cargado, setCargado] = useState(false);

  // Cargar favoritos del localStorage al montar
  useEffect(() => {
    try {
      const favoritosGuardados = localStorage.getItem('favoritos_ecommerce');
      if (favoritosGuardados) {
        setFavoritos(JSON.parse(favoritosGuardados));
      }
    } catch (error) {
      console.error('[FAVORITOS] Error al cargar:', error);
    }
    setCargado(true);
  }, []);

  // Guardar favoritos en localStorage cada que cambian
  useEffect(() => {
    if (cargado) {
      try {
        localStorage.setItem('favoritos_ecommerce', JSON.stringify(favoritos));
      } catch (error) {
        console.error('[FAVORITOS] Error al guardar:', error);
      }
    }
  }, [favoritos, cargado]);

  const esFavorito = (productoId: number): boolean => {
    return favoritos.some((fav) => fav.id === productoId);
  };

  const agregarFavorito = (producto: Favorito) => {
    if (!esFavorito(producto.id)) {
      setFavoritos([...favoritos, producto]);
    }
  };

  const removerFavorito = (productoId: number) => {
    setFavoritos(favoritos.filter((fav) => fav.id !== productoId));
  };

  const toggleFavorito = (producto: Favorito) => {
    if (esFavorito(producto.id)) {
      removerFavorito(producto.id);
    } else {
      agregarFavorito(producto);
    }
  };

  return (
    <FavoritosContext.Provider
      value={{
        favoritos,
        esFavorito,
        agregarFavorito,
        removerFavorito,
        toggleFavorito,
      }}
    >
      {children}
    </FavoritosContext.Provider>
  );
}

export function useFavoritos() {
  const context = useContext(FavoritosContext);
  if (!context) {
    throw new Error('useFavoritos debe ser usado dentro de FavoritosProvider');
  }
  return context;
}
