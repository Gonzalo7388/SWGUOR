import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';

export const ProductosService = {
  async listar(params?: {
    categoriaId?: string;
    busqueda?: string;
    estado?: string;
    color?: string;
    talla?: string;
  }) {
    const where: any = {};
    if (params?.categoriaId) where.categoria_id = BigInt(params.categoriaId);
    if (params?.estado) where.estado = params.estado;
    if (params?.busqueda) {
      where.OR = [
        { nombre: { contains: params.busqueda, mode: 'insensitive' } },
        { sku: { contains: params.busqueda, mode: 'insensitive' } },
      ];
    }
    if (params?.color) {
      where.variantes_producto = { some: { color: params.color } };
    }
    if (params?.talla) {
      where.variantes_producto = { some: { talla: params.talla } };
    }

    const [productos, categorias] = await Promise.all([
      prisma.productos.findMany({
        where,
        include: {
          categorias: true,
          // Cargamos las variantes incluyendo la columna 'stock'
          variantes_producto: { 
            orderBy: { created_at: 'asc' } 
          },
          fichasTecnicas: { select: { id: true, version: true, estado: true } },
        },
        orderBy: { nombre: 'asc' },
      }),
      prisma.categorias.findMany({
        where: { activo: true },
        orderBy: { nombre: 'asc' },
      }),
    ]);

    return serializeBigInt({ productos, categorias });
  },

  async obtenerPorId(id: string) {
    try {
    const producto = await prisma.productos.findUnique({
      where: { id: BigInt(id) },
      include: {
        categorias: true,
        variantes_producto: {
          orderBy: { created_at: 'asc' }
        },
        fichasTecnicas: {
          include: { ficha_medidas: { orderBy: [{ talla: 'asc' }, { punto_medida: 'asc' }] } },
        },
      },
    });

    if (!producto) return null;

    return serializeBigInt(producto);
  } catch (error) {
      console.error("Error en ProductosService.obtenerPorId:", error);
      throw error; // Esto permitirá ver el error real en la terminal de VS Code
    }
  },

  async crear(body: any) {
    const { producto, variantes, nueva_ficha_relacional } = body;

    return prisma.$transaction(async (tx) => {
      let fichas_tecnicas_id: bigint | null = null;
      if (nueva_ficha_relacional) {
        const ficha = await tx.fichas_tecnicas.create({
          data: {
            version: nueva_ficha_relacional.version ?? '1.0',
            descripcion_detallada: nueva_ficha_relacional.descripcion_detallada ?? null,
            sam_total: nueva_ficha_relacional.sam_total ?? null,
            costo_estimado: nueva_ficha_relacional.costo_estimado ?? null,
            imagen_geometral: nueva_ficha_relacional.imagen_geometral ?? null,
            estado: 'borrador',
          },
        });
        fichas_tecnicas_id = ficha.id;
      }

      const nuevo = await tx.productos.create({
        data: {
          nombre: producto.nombre,
          sku: producto.sku,
          descripcion: producto.descripcion ?? null,
          precio: producto.precio,
          stock: producto.stock ?? 0,
          estado: producto.estado ?? 'activo',
          destacado: producto.destacado ?? false,
          categoria_id: producto.categoria_id ? BigInt(producto.categoria_id) : null,
          moq: producto.moq ?? 400,
          imagen: producto.imagen ?? null,
          reglas_descuento: producto.reglas_descuento ?? null,
          colores_disponibles: producto.colores_disponibles ?? [],
          tallas_disponibles: producto.tallas_disponibles ?? [],
          fichas_tecnicas_id,
          updated_at: new Date(),
        },
      });

      if (variantes?.length) {
        await tx.variantes_producto.createMany({
          data: variantes.map((v: any) => ({
            producto_id: nuevo.id,
            nombre: `${producto.nombre} - ${v.color} - ${v.talla}`,
            color: v.color,
            talla: v.talla,
            sku: v.sku.toUpperCase(),
            precio_adicional: v.precio_adicional ?? 0,
            stock: Number(v.stock) ?? 0,
            imagen_url: v.imagen_url ?? null,
            estado: v.estado ?? 'activo',
          })),
        });
      }

      if (fichas_tecnicas_id) {
        await tx.fichas_tecnicas.update({
          where: { id: fichas_tecnicas_id },
          data: { id_producto: nuevo.id },
        });
      }

      return serializeBigInt(nuevo);
    });
  },

  async actualizar(id: string, body: any) {
    const { producto, variantes } = body;

    return prisma.$transaction(async (tx) => {
      const actualizado = await tx.productos.update({
        where: { id: BigInt(id) },
        data: {
          ...(producto.nombre !== undefined && { nombre: producto.nombre }),
          ...(producto.precio !== undefined && { precio: producto.precio }),
          ...(producto.estado !== undefined && { estado: producto.estado }),
          ...(producto.descripcion !== undefined && { descripcion: producto.descripcion }),
          ...(producto.categoria_id !== undefined && { categoria_id: producto.categoria_id ? BigInt(producto.categoria_id) : null }),
          ...(producto.imagen !== undefined && { imagen: producto.imagen }),
          ...(producto.ficha_url !== undefined && { ficha_url: producto.ficha_url }),
          ...(producto.reglas_descuento !== undefined && { reglas_descuento: producto.reglas_descuento }),
          ...(producto.colores_disponibles !== undefined && { colores_disponibles: producto.colores_disponibles }),
          ...(producto.tallas_disponibles !== undefined && { tallas_disponibles: producto.tallas_disponibles }),
          updated_at: new Date(),
        },
      });

      if (variantes?.length) {
        for (const v of variantes) {
          if (v.id) {
            // Actualizar variante existente
            await tx.variantes_producto.update({
              where: { id: BigInt(v.id) },
              data: {
                color: v.color,
                talla: v.talla,
                sku: v.sku.toUpperCase(),
                stock: Number(v.stock) ?? 0,
                precio_adicional: v.precio_adicional ?? 0,
              },
            });
          } else {
            // Crear nueva variante si se agregó en el edit
            await tx.variantes_producto.create({
              data: {
                producto_id: BigInt(id),
                nombre: `${actualizado.nombre} - ${v.color} - ${v.talla}`,
                color: v.color,
                talla: v.talla,
                sku: v.sku.toUpperCase(),
                stock: Number(v.stock) ?? 0,
                estado: 'activo',
              },
            });
          }
        }
      }

      return serializeBigInt(actualizado);
    });
  },

  async toggleEstado(id: string, estado: 'activo' | 'inactivo') {
    const producto = await prisma.productos.update({
      where: { id: BigInt(id) },
      data: { estado, updated_at: new Date() },
    });
    return serializeBigInt(producto);
  },

  async eliminar(id: string) {
    await prisma.productos.delete({ where: { id: BigInt(id) } });
    return { success: true };
  },
};