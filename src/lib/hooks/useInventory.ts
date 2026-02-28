/**
 * Hook personalizado para manejar inventario
 * Proporciona funciones para obtener, actualizar y gestionar el inventario
 */

import { useCallback, useState } from 'react';
import {
  obtenerInsumos,
  obtenerInventarioPorProducto,
  crearInsumo,
  actualizarStockInsumo,
  descontarStock,
  incrementarStock,
  obtenerProductosAgotados,
  obtenerProductosStockBajo,
} from '@/lib/helpers/products-helpers';
import type { Inventario, InventarioInsert, TipoInsumo } from '@/types';

interface UseInventarioState {
  insumos: Inventario[];
  inventarioActual: Inventario | null;
  productosAgotados: Inventario[];
  productosStockBajo: Inventario[];
  cargando: boolean;
  error: string | null;
}

interface UseInventarioActions {
  obtenerInsumosList: (tipo?: TipoInsumo) => Promise<void>;
  obtenerInventario: (productoId: number) => Promise<void>;
  crearInsumoNuevo: (insumoData: InventarioInsert) => Promise<boolean>;
  actualizarStock: (inventarioId: number, nuevoStock: number) => Promise<boolean>;
  descontar: (inventarioId: number, cantidad: number) => Promise<boolean>;
  incrementar: (inventarioId: number, cantidad: number) => Promise<boolean>;
  obtenerAgotados: () => Promise<void>;
  obtenerBajoStock: () => Promise<void>;
  limpiar: () => void;
}

/**
 * Hook para gestionar inventario
 */
export function useInventario(): UseInventarioState & UseInventarioActions {
  const [state, setState] = useState<UseInventarioState>({
    insumos: [],
    inventarioActual: null,
    productosAgotados: [],
    productosStockBajo: [],
    cargando: false,
    error: null
  });

  const obtenerInsumosList = useCallback(async (tipo?: TipoInsumo) => {
    setState(prev => ({ ...prev, cargando: true, error: null }));
    try {
      const { data, error } = await obtenerInsumos(tipo);

      if (error) {
        setState(prev => ({ ...prev, error, cargando: false }));
        return;
      }

      setState(prev => ({
        ...prev,
        insumos: data || [],
        cargando: false
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.message || 'Error obteniendo insumos',
        cargando: false
      }));
    }
  }, []);

  const obtenerInventario = useCallback(async (productoId: number) => {
    setState(prev => ({ ...prev, cargando: true, error: null }));
    try {
      const { data, error } = await obtenerInventarioPorProducto(productoId);

      if (error) {
        setState(prev => ({ ...prev, error, cargando: false }));
        return;
      }

      setState(prev => ({
        ...prev,
        inventarioActual: data,
        cargando: false
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.message || 'Error obteniendo inventario',
        cargando: false
      }));
    }
  }, []);

  const crearInsumoNuevo = useCallback(async (insumoData: InventarioInsert) => {
    setState(prev => ({ ...prev, cargando: true, error: null }));
    try {
      const { data, error } = await crearInsumo(insumoData);

      if (error) {
        setState(prev => ({ ...prev, error, cargando: false }));
        return false;
      }

      // Agregar a la lista
      setState(prev => ({
        ...prev,
        insumos: [data as Inventario, ...prev.insumos],
        cargando: false
      }));

      return true;
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.message || 'Error creando insumo',
        cargando: false
      }));
      return false;
    }
  }, []);

  const actualizarStock = useCallback(async (inventarioId: number, nuevoStock: number) => {
    setState(prev => ({ ...prev, cargando: true, error: null }));
    try {
      const { success, error } = await actualizarStockInsumo(inventarioId, nuevoStock);

      if (error || !success) {
        setState(prev => ({
          ...prev,
          error: error || 'Error actualizando stock',
          cargando: false
        }));
        return false;
      }

      // Actualizar localmente
      setState(prev => ({
        ...prev,
        insumos: prev.insumos.map(i =>
          i.id === inventarioId ? { ...i, stock_actual: nuevoStock } : i
        ),
        inventarioActual:
          prev.inventarioActual?.id === inventarioId
            ? { ...prev.inventarioActual, stock_actual: nuevoStock }
            : prev.inventarioActual,
        cargando: false
      }));

      return true;
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.message || 'Error actualizando stock',
        cargando: false
      }));
      return false;
    }
  }, []);

  const descontar = useCallback(async (inventarioId: number, cantidad: number) => {
    setState(prev => ({ ...prev, cargando: true, error: null }));
    try {
      const { success, nuevoStock, error } = await descontarStock(inventarioId, cantidad);

      if (error || !success) {
        setState(prev => ({
          ...prev,
          error: error || 'Error descontando stock',
          cargando: false
        }));
        return false;
      }

      setState(prev => ({
        ...prev,
        insumos: prev.insumos.map(i =>
          i.id === inventarioId ? { ...i, stock_actual: nuevoStock || 0 } : i
        ),
        inventarioActual:
          prev.inventarioActual?.id === inventarioId
            ? { ...prev.inventarioActual, stock_actual: nuevoStock || 0 }
            : prev.inventarioActual,
        cargando: false
      }));

      return true;
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.message || 'Error descontando stock',
        cargando: false
      }));
      return false;
    }
  }, []);

  const incrementar = useCallback(async (inventarioId: number, cantidad: number) => {
    setState(prev => ({ ...prev, cargando: true, error: null }));
    try {
      const { success, nuevoStock, error } = await incrementarStock(inventarioId, cantidad);

      if (error || !success) {
        setState(prev => ({
          ...prev,
          error: error || 'Error incrementando stock',
          cargando: false
        }));
        return false;
      }

      setState(prev => ({
        ...prev,
        insumos: prev.insumos.map(i =>
          i.id === inventarioId ? { ...i, stock_actual: nuevoStock || 0 } : i
        ),
        inventarioActual:
          prev.inventarioActual?.id === inventarioId
            ? { ...prev.inventarioActual, stock_actual: nuevoStock || 0 }
            : prev.inventarioActual,
        cargando: false
      }));

      return true;
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.message || 'Error incrementando stock',
        cargando: false
      }));
      return false;
    }
  }, []);

  const obtenerAgotados = useCallback(async () => {
    setState(prev => ({ ...prev, cargando: true, error: null }));
    try {
      const { data, error } = await obtenerProductosAgotados();

      if (error) {
        setState(prev => ({ ...prev, error, cargando: false }));
        return;
      }

      setState(prev => ({
        ...prev,
        productosAgotados: data || [],
        cargando: false
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.message || 'Error obteniendo productos agotados',
        cargando: false
      }));
    }
  }, []);

  const obtenerBajoStock = useCallback(async () => {
    setState(prev => ({ ...prev, cargando: true, error: null }));
    try {
      const { data, error } = await obtenerProductosStockBajo();

      if (error) {
        setState(prev => ({ ...prev, error, cargando: false }));
        return;
      }

      setState(prev => ({
        ...prev,
        productosStockBajo: data || [],
        cargando: false
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.message || 'Error obteniendo productos con stock bajo',
        cargando: false
      }));
    }
  }, []);

  const limpiar = useCallback(() => {
    setState({
      insumos: [],
      inventarioActual: null,
      productosAgotados: [],
      productosStockBajo: [],
      cargando: false,
      error: null
    });
  }, []);

  return {
    ...state,
    obtenerInsumosList,
    obtenerInventario,
    crearInsumoNuevo,
    actualizarStock,
    descontar,
    incrementar,
    obtenerAgotados,
    obtenerBajoStock,
    limpiar
  };
}
