'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface CartItem {
  id: string | number;
  nombre: string;
  precio: number;
  imagen?: string;
  cantidad: number;
  categoria_id?: string | number;
}

interface CartContextType {
  items: CartItem[];
  total: number;
  agregarAlCarrito: (producto: any) => void;
  removerDelCarrito: (id: string | number) => void;
  actualizarCantidad: (id: string | number, cantidad: number) => void;
  vaciarCarrito: () => void;
  obtenerCantidadTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Hidratar desde localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('carrito');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (error) {
      console.error('[CART_CONTEXT] Error loading cart:', error);
    }
    setMounted(true);
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('carrito', JSON.stringify(items));
      
      // Calcular total
      const totalPrice = items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
      setTotal(totalPrice);
    }
  }, [items, mounted]);

  const agregarAlCarrito = (producto: any) => {
    setItems((prevItems) => {
      const itemExistente = prevItems.find((item) => item.id === producto.id);

      if (itemExistente) {
        // Incrementar cantidad si ya existe
        return prevItems.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        // Agregar nuevo producto
        return [
          ...prevItems,
          {
            id: producto.id,
            nombre: producto.nombre,
            precio: parseFloat(producto.precio || 0),
            imagen: producto.imagen,
            cantidad: 1,
            categoria_id: producto.categoria_id,
          },
        ];
      }
    });
  };

  const removerDelCarrito = (id: string | number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const actualizarCantidad = (id: string | number, cantidad: number) => {
    if (cantidad <= 0) {
      removerDelCarrito(id);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, cantidad } : item
      )
    );
  };

  const vaciarCarrito = () => {
    setItems([]);
  };

  const obtenerCantidadTotal = () => {
    return items.reduce((acc, item) => acc + item.cantidad, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        total,
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
  if (!context) {
    throw new Error('useCarrito debe usarse dentro de CartProvider');
  }
  return context;
}
