import { prisma } from '@/lib/prisma';
import { crearNotificacion } from '@/lib/helpers/crear-notificacion.helper';
import { parseDescripcionDetallada } from '@/lib/helpers/ficha-tecnica-descripcion.helper';

export interface ResultadoRegistroCorte {
  ordenId: bigint;
  confeccionId: bigint;
  tallerNombre: string;
  yaExistia: boolean;
}

function resolverProductoPrincipalId(
  items: Array<{ cantidad: number; producto_id?: bigint | null; productos?: { id: bigint } | null }>,
): bigint {
  const acumulado = new Map<string, number>();

  for (const item of items) {
    const pid = item.productos?.id ?? item.producto_id;
    if (!pid) continue;
    const key = String(pid);
    acumulado.set(key, (acumulado.get(key) ?? 0) + item.cantidad);
  }

  let mejorId = items[0]?.productos?.id ?? items[0]?.producto_id ?? BigInt(0);
  let maxCant = 0;

  for (const [id, cant] of acumulado) {
    if (cant > maxCant) {
      maxCant = cant;
      mejorId = BigInt(id);
    }
  }

  return mejorId;
}

async function seleccionarTallerConfeccion() {
  const preferidos = await prisma.talleres.findMany({
    where: { estado: 'activo', especialidad: 'confeccion' },
    orderBy: { id: 'asc' },
    select: { id: true, nombre: true },
  });

  if (preferidos.length > 0) return preferidos[0];

  const cualquiera = await prisma.talleres.findFirst({
    where: { estado: 'activo' },
    orderBy: { id: 'asc' },
    select: { id: true, nombre: true },
  });

  if (!cualquiera) {
    throw new Error('No hay talleres activos disponibles para asignar la confección.');
  }

  return cualquiera;
}

async function notificarRepresentantesTaller(params: {
  ordenId: bigint;
  tallerNombre: string;
}) {
  const representantes = await prisma.usuarios.findMany({
    where: { rol: 'representante_taller', estado: 'activo' },
    select: { id: true },
  });

  const url = `/representante/ordenes/${params.ordenId}`;

  await Promise.all(
    representantes.map((rep) =>
      crearNotificacion({
        usuario_id: rep.id,
        tipo: 'orden_produccion',
        titulo: 'Nueva orden de confección',
        mensaje: `Nueva orden de confección asignada al taller ${params.tallerNombre}.`,
        referencia_tipo: 'ORDEN_PRODUCCION',
        referencia_id: params.ordenId,
        url_destino: url,
      }),
    ),
  );
}

export async function registrarCortePedidoCompletado(params: {
  pedidoId: bigint;
  usuarioId: bigint;
  notas?: string;
}): Promise<ResultadoRegistroCorte> {
  const pedido = await prisma.pedidos.findUnique({
    where: { id: params.pedidoId },
    include: {
      pedido_items: {
        include: {
          productos: { select: { id: true, nombre: true } },
        },
      },
    },
  });

  if (!pedido) {
    throw new Error('Pedido no encontrado');
  }

  if (!pedido.pedido_items.length) {
    throw new Error('El pedido no tiene ítems para procesar');
  }

  const productoId = resolverProductoPrincipalId(pedido.pedido_items);
  const producto = pedido.pedido_items.find(
    (i) => String(i.productos?.id ?? i.producto_id) === String(productoId),
  )?.productos;

  const ficha = await prisma.fichas_tecnicas.findFirst({
    where: { id_producto: productoId, estado: 'aprobada' },
    orderBy: { created_at: 'desc' },
    select: { id: true },
  });

  if (!ficha) {
    throw new Error(
      'No hay ficha técnica aprobada para el producto principal. Solicite al diseñador que la apruebe.',
    );
  }

  const taller = await seleccionarTallerConfeccion();

  let ordenExistente = await prisma.ordenes_produccion.findFirst({
    where: {
      pedido_id: params.pedidoId,
      producto_id: productoId,
      estado: { not: 'cancelada' },
    },
    include: { confecciones: { take: 1 } },
    orderBy: { created_at: 'desc' },
  });

  let yaExistia = false;

  const resultado = await prisma.$transaction(async (tx) => {
    let orden = ordenExistente;

    if (!orden) {
      orden = await tx.ordenes_produccion.create({
        data: {
          producto_id: productoId,
          taller_id: taller.id,
          ficha_id: ficha.id,
          estado: 'confirmada',
          cantidad_solicitada: pedido.total_unidades ?? 0,
          pedido_id: params.pedidoId,
          creado_por: params.usuarioId,
          notas: params.notas?.trim() || null,
        },
        include: { confecciones: { take: 1 } },
      });
    } else {
      yaExistia = true;
    }

    const corteRegistrado = await tx.seguimiento_produccion.findFirst({
      where: { orden_id: orden.id, etapa: 'corte', completado_en: { not: null } },
    });

    if (!corteRegistrado) {
      await tx.seguimiento_produccion.create({
        data: {
          orden_id: orden.id,
          etapa: 'corte',
          completado_en: new Date(),
          usuario_id: params.usuarioId,
          observaciones: params.notas?.trim() || 'Corte completado.',
          activo: true,
        },
      });
    }

    let confeccion = orden.confecciones?.[0];

    if (!confeccion) {
      confeccion = await tx.confecciones.create({
        data: {
          taller_id: taller.id,
          orden_produccion_id: orden.id,
          estado: 'pendiente',
          prenda: producto?.nombre ?? 'Prenda',
          cantidad: pedido.total_unidades ?? 0,
          notas: params.notas?.trim() || null,
          fecha_inicio: new Date(),
          responsable_id: params.usuarioId,
        },
      });

      await tx.seguimiento_confeccion.create({
        data: {
          confeccion_id: confeccion.id,
          estado_nuevo: 'pendiente',
          notas: 'Confección creada automáticamente tras corte.',
          responsable_id: params.usuarioId,
        },
      });
    }

    return {
      ordenId: orden.id,
      confeccionId: confeccion.id,
      tallerNombre: taller.nombre,
    };
  });

  if (!yaExistia) {
    await notificarRepresentantesTaller({
      ordenId: resultado.ordenId,
      tallerNombre: resultado.tallerNombre,
    });
  }

  return { ...resultado, yaExistia };
}

export async function obtenerDatosFichaParaCorte(productoId: bigint) {
  const ficha = await prisma.fichas_tecnicas.findFirst({
    where: { id_producto: productoId },
    orderBy: { created_at: 'desc' },
    include: {
      fichas_tecnicas_detalle: {
        include: {
          materiales: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              composicion: true,
              color: true,
              unidad_medida: true,
            },
          },
          insumo: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              unidad_medida: true,
            },
          },
        },
        orderBy: { id: 'asc' },
      },
    },
  });

  if (!ficha) return null;

  const descripcion = parseDescripcionDetallada(ficha.descripcion_detallada);

  return {
    id: String(ficha.id),
    version: ficha.version,
    estado: ficha.estado,
    ficha_url: ficha.ficha_url,
    imagen_geometral: ficha.imagen_geometral,
    descripcionTexto: descripcion.texto,
    evidencias: descripcion.evidencias,
    detalle: ficha.fichas_tecnicas_detalle.map((d) => ({
      id: String(d.id),
      cantidad_consumo: Number(d.cantidad_consumo),
      material: d.materiales
        ? {
            nombre: d.materiales.nombre,
            tipo: d.materiales.tipo,
            composicion: d.materiales.composicion,
            color: d.materiales.color,
            unidad: d.materiales.unidad_medida,
          }
        : null,
      insumo: d.insumo
        ? {
            nombre: d.insumo.nombre,
            tipo: d.insumo.tipo,
            unidad: d.insumo.unidad_medida,
          }
        : null,
      observaciones: d.observaciones,
    })),
  };
}
