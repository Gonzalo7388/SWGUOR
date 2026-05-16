import { useCallback } from "react";
import { toast } from "sonner";

interface RegistroMovimientoParams {
  insumo_id?: string;
  material_id?: string;
  producto_id?: string;
  cantidad: number;
  tipo_movimiento: "entrada" | "salida" | "ajuste";
  referencia_tipo: "ORDEN" | "COMPRA" | "VENTA" | "AJUSTE";
  motivo: string;
  costo_unitario?: number;
}

export function useMovimientosInventario() {
  const registrarMovimiento = useCallback(
    async (params: RegistroMovimientoParams) => {
      try {
        const response = await fetch("/api/admin/movimientos-inventario", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Error al registrar movimiento");
        }

        const data = await response.json();
        toast.success("Movimiento registrado exitosamente");
        return data.data;
      } catch (error: any) {
        console.error("Error registrando movimiento:", error);
        toast.error(error.message || "Error al registrar movimiento");
        throw error;
      }
    },
    []
  );

  const registrarCompra = useCallback(
    async (params: {
      insumo_id?: string;
      material_id?: string;
      cantidad: number;
      costo_unitario: number;
      orden_compra_id?: string;
      motivo?: string;
    }) => {
      return registrarMovimiento({
        insumo_id: params.insumo_id,
        material_id: params.material_id,
        cantidad: params.cantidad,
        tipo_movimiento: "entrada",
        referencia_tipo: "COMPRA",
        motivo: params.motivo || "Compra a proveedor",
        costo_unitario: params.costo_unitario,
      });
    },
    [registrarMovimiento]
  );

  const registrarDevolucionProveedor = useCallback(
    async (params: {
      insumo_id?: string;
      material_id?: string;
      cantidad: number;
      costo_unitario: number;
      devolucion_id?: string;
      motivo: string;
    }) => {
      return registrarMovimiento({
        insumo_id: params.insumo_id,
        material_id: params.material_id,
        cantidad: params.cantidad,
        tipo_movimiento: "salida",
        referencia_tipo: "COMPRA",
        motivo: `Devolución a proveedor: ${params.motivo}`,
        costo_unitario: params.costo_unitario,
      });
    },
    [registrarMovimiento]
  );

  const registrarVenta = useCallback(
    async (params: {
      producto_id: string;
      cantidad: number;
      pedido_id?: string;
      motivo?: string;
    }) => {
      return registrarMovimiento({
        producto_id: params.producto_id,
        cantidad: params.cantidad,
        tipo_movimiento: "salida",
        referencia_tipo: "VENTA",
        motivo: params.motivo || "Venta de producto",
      });
    },
    [registrarMovimiento]
  );

  const registrarDevolucionCliente = useCallback(
    async (params: {
      producto_id: string;
      cantidad: number;
      devolucion_id?: string;
      motivo: string;
    }) => {
      return registrarMovimiento({
        producto_id: params.producto_id,
        cantidad: params.cantidad,
        tipo_movimiento: "entrada",
        referencia_tipo: "VENTA",
        motivo: `Devolución de cliente: ${params.motivo}`,
      });
    },
    [registrarMovimiento]
  );

  const registrarConsumoFabricacion = useCallback(
    async (params: {
      insumo_id?: string;
      material_id?: string;
      cantidad: number;
      confeccion_id?: string;
      motivo?: string;
    }) => {
      return registrarMovimiento({
        insumo_id: params.insumo_id,
        material_id: params.material_id,
        cantidad: params.cantidad,
        tipo_movimiento: "salida",
        referencia_tipo: "AJUSTE",
        motivo: params.motivo || "Consumo en fabricación",
      });
    },
    [registrarMovimiento]
  );

  const registrarIngresoStock = useCallback(
    async (params: {
      insumo_id?: string;
      material_id?: string;
      producto_id?: string;
      cantidad: number;
      motivo?: string;
    }) => {
      return registrarMovimiento({
        insumo_id: params.insumo_id,
        material_id: params.material_id,
        producto_id: params.producto_id,
        cantidad: params.cantidad,
        tipo_movimiento: "entrada",
        referencia_tipo: "AJUSTE",
        motivo: params.motivo || "Ingreso manual de stock",
      });
    },
    [registrarMovimiento]
  );

  const registrarIncidencia = useCallback(
    async (params: {
      insumo_id?: string;
      material_id?: string;
      producto_id?: string;
      cantidad: number;
      incidencia_id?: string;
      motivo: string;
    }) => {
      return registrarMovimiento({
        insumo_id: params.insumo_id,
        material_id: params.material_id,
        producto_id: params.producto_id,
        cantidad: params.cantidad,
        tipo_movimiento: "salida",
        referencia_tipo: "AJUSTE",
        motivo: `Incidencia: ${params.motivo}`,
      });
    },
    [registrarMovimiento]
  );

  return {
    registrarMovimiento,
    registrarCompra,
    registrarDevolucionProveedor,
    registrarVenta,
    registrarDevolucionCliente,
    registrarConsumoFabricacion,
    registrarIngresoStock,
    registrarIncidencia,
  };
}
