'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface CartItem {
  id: string | number;
  nombre: string;
  precio: number;
  imagen?: string;
  cantidad: number;
  categoria_id?: string | number;
  talla?: string;
  color?: string;
  imagenIA?: string | null;
  colorCustom?: string | null;
}

interface CartContextType {
  items: CartItem[];
  total: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  agregarAlCarrito: (producto: any) => void;
  removerDelCarrito: (id: string | number, talla?: string, color?: string) => void;
  actualizarCantidad: (id: string | number, cantidad: number, talla?: string, color?: string) => void;
  vaciarCarrito: () => void;
  obtenerCantidadTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false); // Estado real añadido
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('carrito');
      if (saved) setItems(JSON.parse(saved));
    } catch (error) {
      console.error('[CART_CONTEXT] Error loading cart:', error);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('carrito', JSON.stringify(items));
      const totalPrice = items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
      setTotal(totalPrice);
    }
  }, [items, mounted]);

  const agregarAlCarrito = (producto: any) => {
    setItems((prevItems) => {
      const itemExistente = prevItems.find((item) => 
        item.id === producto.id && 
        item.talla === producto.talla && 
        item.color === producto.color
      );

      if (itemExistente) {
        return prevItems.map((item) =>
          (item.id === producto.id && item.talla === producto.talla && item.color === producto.color)
            ? { ...item, cantidad: item.cantidad + (producto.cantidad || 1) }
            : item
        );
      } else {
        return [
          ...prevItems,
          {
            id: producto.id,
            nombre: producto.nombre,
            precio: parseFloat(producto.precio || 0),
            imagen: producto.imagen,
            cantidad: producto.cantidad || 1,
            categoria_id: producto.categoria_id,
            talla: producto.talla || 'Única',
            color: producto.color || 'Único',
            imagenIA: producto.imagenIA,
            colorCustom: producto.colorCustom
          },
        ];
      }
    });
  };

  const removerDelCarrito = (id: string | number, talla?: string, color?: string) => {
    setItems((prevItems) => prevItems.filter((item) => 
      !(item.id === id && item.talla === talla && item.color === color)
    ));
  };

  const actualizarCantidad = (id: string | number, cantidad: number, talla?: string, color?: string) => {
    if (cantidad <= 0) { 
      removerDelCarrito(id, talla, color); 
      return; 
    }
    setItems((prevItems) => prevItems.map((item) => 
      (item.id === id && item.talla === talla && item.color === color) 
        ? { ...item, cantidad } 
        : item
    ));
  };

  const vaciarCarrito = () => setItems([]);

  const obtenerCantidadTotal = () => items.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        subtotal: total,
        isCartOpen,
        setIsCartOpen,
        agregarAlCarrito,
        removerDelCarrito,
        actualizarCantidad,
        vaciarCarrito,
        obtenerCantidadTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCarrito() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCarrito debe usarse dentro de CartProvider');
  return context;
}