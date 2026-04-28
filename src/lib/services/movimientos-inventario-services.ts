import { prisma }          from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';

export const InventarioService = {
  /**
   * Registra un movimiento y actualiza el stock/precio del material o insumo
   */
  async registrarMovimiento(data: {
    material_id?:     string | number;
    insumo_id?:       string | number;
    cantidad:         number;
    tipo:             'entrada' | 'salida' | 'ajuste';
    motivo:           string;
    costo_unitario?:  number;
    usuario_id?:      string | number;
    referencia_tipo?: any;
    referencia_id?:   string | number;
  }) {
    return prisma.$transaction(async (tx) => {
      const id = data.material_id || data.insumo_id;
      if (!id) throw new Error('Debe especificar un material o insumo');

      // 1. Obtener stock actual antes del movimiento
      const material = await tx.materiales.findUnique({
        where: { id: BigInt(id) },
        select: { stock_actual: true }
      });

      if (!material) throw new Error('Material no encontrado');

      const stockAnterior = Number(material.stock_actual);
      const cantidadOperacion = data.tipo === 'salida' ? -Math.abs(data.cantidad) : Math.abs(data.cantidad);
      const stockPosterior = stockAnterior + cantidadOperacion;

      // 2. Crear el registro en movimientos_inventario
      const movimiento = await tx.movimientos_inventario.create({
        data: {
          material_id:     data.material_id ? BigInt(data.material_id) : null,
          insumo_id:       data.insumo_id ? BigInt(data.insumo_id) : null,
          cantidad:        data.cantidad,
          tipo_movimiento: data.tipo,
          motivo:          data.motivo,
          costo_unitario:  data.costo_unitario ?? null,
          usuario_id:      data.usuario_id ? BigInt(data.usuario_id) : null,
          referencia_tipo: data.referencia_tipo ?? null,
          referencia_id:   data.referencia_id ? BigInt(data.referencia_id) : null,
        },
      });

      // 3. Actualizar la tabla maestra (Material)
      // Si es ENTRADA, actualizamos el precio_unitario automáticamente
      const updateData: any = {
        stock_actual: stockPosterior,
        updated_at:   new Date(),
      };

      if (data.tipo === 'entrada' && data.costo_unitario) {
        updateData.precio_unitario = data.costo_unitario;
      }

      await tx.materiales.update({
        where: { id: BigInt(id) },
        data:  updateData,
      });

      return serializeBigInt(movimiento);
    });
  }
};