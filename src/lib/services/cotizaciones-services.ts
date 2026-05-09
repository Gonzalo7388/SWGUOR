import { prisma }          from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { Prisma, EstadoCotizacion, EstadoProducto, EstadoCliente } from '@prisma/client';
import { calcularTotalesCotizacion } from '@/lib/logic/cotizaciones-logic';

// ── Tipos ──────────────────────────────────────────────────────────────────────

export interface CotizacionRow {
  id:                number;
  cotizacion_id:     string;
  cliente:           string | null;
  descripcion:       string | null;
  monto:             number;
  estado:            string;
  costo_envio:       number;
  fecha_vencimiento: string;
  fecha_creacion:    string;
  expirada?:         boolean;
}

export interface ItemInput {
  producto_id:          string;
  variante_id:          string;
  cantidad:             number;
  precio_unitario:      number;
  color_snapshot:       string;
  talla_snapshot:       string;
  modelo_snapshot:      string | null;
  prenda_tipo_snapshot: string | null;
}

export interface CrearCotizacionInput {
  cliente_id?:            string;
  nombre_cliente_manual?: string;
  valida_hasta:           string;
  moneda:                 string;
  tasa_impuesto:          string;
  tipo_operacion?:        string;
  notas_internas?:        string;
  costo_envio?:           number;
  zona_envio?:            string;
  // Metadatos ERP opcionales
  empresa?:           string;
  contacto?:          string;
  tipo_destino?:      string;
  vendedor?:          string;
  tipo_venta?:        string;
  unidad_negocio?:    string;
  forma_pago?:        string;
  metodo?:            string;
  direccion_entrega?: string;
  direccion_factura?: string;
  condicion_entrega?: string;
  tiempo_entrega?:    string;
  idioma?:            string;
  referencia?:        string;
  probabilidad?:      string;
  fecha_cierre?:      string;
  items:              ItemInput[];
}

// ── Helpers internos ───────────────────────────────────────────────────────────

function buildCotizacionRow(row: any, today: Date): CotizacionRow {
  const validaHasta = new Date(row.valida_hasta);
  validaHasta.setHours(0, 0, 0, 0);
  const estaExpirada = row.estado === EstadoCotizacion.enviada && today > validaHasta;

  return {
    id:                Number(row.id),
    cotizacion_id:     row.numero,
    cliente:           row.clientes?.razon_social ?? null,
    descripcion:       row.notas_internas ?? null,
    monto:             Number(row.total ?? 0),
    estado:            estaExpirada ? 'expirada' : (row.estado ?? 'borrador'),
    costo_envio:       Number(row.costo_envio ?? 0),
    fecha_vencimiento: row.valida_hasta.toISOString().split('T')[0],
    fecha_creacion:    row.created_at?.toISOString().split('T')[0] ?? '',
    expirada:          estaExpirada,
  };
}

// ── Service ────────────────────────────────────────────────────────────────────

export const CotizacionesService = {

  async listar(estado?: string): Promise<CotizacionRow[]> {
    const where: Record<string, unknown> = {};
    if (estado && estado !== 'todos') where.estado = estado;

    const rows = await prisma.cotizaciones.findMany({
      where,
      include:  { clientes: true },
      orderBy:  { created_at: 'desc' },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return serializeBigInt(rows.map((row) => buildCotizacionRow(row, today)));
  },

  async obtenerPorId(id: string) {
    const cotizacion = await prisma.cotizaciones.findUnique({
      where:   { id: BigInt(id) },
      include: { clientes: true, cotizacion_items: true },
    });
    return cotizacion ? serializeBigInt(cotizacion) : null;
  },

  async crear(input: CrearCotizacionInput): Promise<CotizacionRow> {
    const {
      cliente_id, nombre_cliente_manual, valida_hasta, moneda,
      tasa_impuesto, tipo_operacion, notas_internas, items, costo_envio,
      ...metadatos
    } = input;

    // Calcular totales con la lógica de negocio existente
    const totales = calcularTotalesCotizacion(
      items.map((i) => ({ precioBase: i.precio_unitario, cantidad: i.cantidad }))
    );

    const esExportacion  = tipo_operacion === 'Exportación';
    const tasa           = esExportacion ? 0 : (tasa_impuesto === 'IGV' ? 0.18 : 0);
    const igv            = totales.subtotalConDescuento * tasa;
    const costoEnvio     = Number(costo_envio ?? 0);
    const total          = totales.subtotalConDescuento + igv + costoEnvio;

    const count  = await prisma.cotizaciones.count();
    const numero = `COT-${String(count + 1).padStart(6, '0')}`;

    const clienteIdProcesado = (() => {
      if (!cliente_id || cliente_id === 'none' || cliente_id.trim() === '') return null;
      return BigInt(cliente_id);
    })();

    // Construir notas con metadatos ERP
    let notasFinales = notas_internas ?? '';
    if (nombre_cliente_manual && !clienteIdProcesado) {
      notasFinales = `CLIENTE MANUAL: ${nombre_cliente_manual}\n\n${notasFinales}`.trim();
    }
    if (!notasFinales.includes('[ERP_META]')) {
      const erpMeta = JSON.stringify({ tipo_operacion, ...metadatos });
      notasFinales = notasFinales
        ? `${notasFinales}\n\n[ERP_META]: ${erpMeta}`
        : `[ERP_META]: ${erpMeta}`;
    }

    const cotizacion = await prisma.$transaction(async (tx) => {
      return tx.cotizaciones.create({
        data: {
          numero,
          cliente_id:     clienteIdProcesado,
          estado:         'borrador',
          subtotal:       new Prisma.Decimal(totales.subtotalConDescuento),
          igv:            new Prisma.Decimal(igv),
          total:          new Prisma.Decimal(total),
          valida_hasta:   new Date(valida_hasta),
          expira_at:      new Date(valida_hasta),
          notas_internas: notasFinales,
          costo_envio:    new Prisma.Decimal(costoEnvio),
          costo_total_estimado: new Prisma.Decimal(total),
          moneda:         moneda ?? 'PEN',
          cotizacion_items: {
            create: items.map((item) => ({
              producto_id:              BigInt(item.producto_id),
              variante_id:              BigInt(item.variante_id),
              cantidad:                 item.cantidad,
              precio_unitario_snapshot: new Prisma.Decimal(item.precio_unitario),
              subtotal:                 new Prisma.Decimal(item.cantidad * item.precio_unitario),
              color_snapshot:           item.color_snapshot,
              talla_snapshot:           item.talla_snapshot,
              modelo_snapshot:          item.modelo_snapshot,
              prenda_tipo_snapshot:     item.prenda_tipo_snapshot,
            })) as Prisma.cotizacion_itemsUncheckedCreateWithoutCotizacionesInput[],
          },
        },
        include: { clientes: true },
      });
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return serializeBigInt(buildCotizacionRow(cotizacion, today));
  },

  async actualizarEstado(
    id: string,
    nuevoEstado: 'enviada' | 'aprobada' | 'rechazada' | 'expirada' | 'borrador' | 'convertida',
    motivo?: string
  ): Promise<{ success: boolean; error?: string }> {
    const cotizacion = await prisma.cotizaciones.findUnique({ where: { id: BigInt(id) } });
    if (!cotizacion) return { success: false, error: 'Cotización no encontrada' };

    const transiciones: Record<string, string[]> = {
      borrador:   ['enviada'],
      enviada:    ['aprobada', 'rechazada', 'expirada'],
      aprobada:   ['convertida'],
      rechazada:  ['enviada'],
      expirada:   ['enviada'],
      convertida: [],
    };

    const estadoActual       = cotizacion.estado ?? 'borrador';
    const permitidos         = transiciones[estadoActual] ?? [];

    if (!permitidos.includes(nuevoEstado)) {
      return {
        success: false,
        error: `No se puede cambiar de '${estadoActual}' a '${nuevoEstado}'. Permitidos: ${permitidos.join(', ')}`,
      };
    }

    const updateData: Prisma.cotizacionesUpdateInput = { estado: nuevoEstado };
    if (nuevoEstado === 'aprobada') updateData.aprobado_at = new Date();
    if (motivo) {
      const prefijo = nuevoEstado === 'rechazada' ? '[RECHAZO]' : '[NOTA]';
      updateData.notas_internas =
        `${cotizacion.notas_internas ?? ''}\n${prefijo}: ${motivo}`.trim();
    }

    await prisma.cotizaciones.update({ where: { id: BigInt(id) }, data: updateData });
    return { success: true };
  },

  async aprobar(id: string): Promise<{ success: boolean; pedidoId?: number; error?: string }> {
    const cotizacion = await prisma.cotizaciones.findUnique({
      where:   { id: BigInt(id) },
      include: { cotizacion_items: true },
    });

    if (!cotizacion) return { success: false, error: 'Cotización no encontrada' };

    if (!['enviada', 'borrador'].includes(cotizacion.estado ?? '')) {
      return { success: false, error: `No se puede aprobar una cotización con estado '${cotizacion.estado}'` };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const validaHasta = new Date(cotizacion.valida_hasta);
    validaHasta.setHours(0, 0, 0, 0);
    if (today > validaHasta) return { success: false, error: 'La cotización está expirada.' };

    const result = await prisma.$transaction(async (tx) => {
      await tx.cotizaciones.update({
        where: { id: BigInt(id) },
        data:  { estado: 'aprobada', aprobado_at: new Date() },
      });

      const totalUnidades = cotizacion.cotizacion_items.reduce(
        (sum, item) => sum + item.cantidad, 0
      );

      // Creamos el pedido directamente desde la cotización
      const pedido = await tx.pedidos.create({
        data: {
          cliente_id:      cotizacion.cliente_id,
          cotizacion_id:   cotizacion.id, // Vínculo directo
          estado:          'pendiente',
          prioridad:       'normal',
          notas_pedido:    cotizacion.notas_internas ?? null,
          total_unidades:  totalUnidades,
          // Heredar montos financieros
          subtotal:        cotizacion.subtotal ?? new Prisma.Decimal(0),
          igv:             cotizacion.igv      ?? new Prisma.Decimal(0),
          total:           cotizacion.total    ?? new Prisma.Decimal(0),
          total_estimado:  cotizacion.total    ?? new Prisma.Decimal(0),
          costo_envio:     cotizacion.costo_envio ?? new Prisma.Decimal(0),
          moneda:          cotizacion.moneda   ?? 'PEN',
          pedido_items: {
            create: cotizacion.cotizacion_items.map((item) => ({
              producto_id: item.producto_id,
              variante_id: item.variante_id,
              cantidad:    item.cantidad,
              especificaciones: {
                precio_unitario: Number(item.precio_unitario_snapshot),
                subtotal:        Number(item.subtotal),
                color:           item.color_snapshot,
                modelo:          item.modelo_snapshot,
                prenda_tipo:     item.prenda_tipo_snapshot,
                talla:           item.talla_snapshot,
              },
            })) as Prisma.pedido_itemsUncheckedCreateWithoutPedidosInput[],
          },
        },
      });

      return { pedidoId: Number(pedido.id) };
    });

    return { success: true, pedidoId: result.pedidoId };
  },

  async rechazar(id: string, motivo?: string): Promise<{ success: boolean; error?: string }> {
    const cotizacion = await prisma.cotizaciones.findUnique({ where: { id: BigInt(id) } });
    if (!cotizacion) return { success: false, error: 'Cotización no encontrada' };

    if (!['enviada', 'borrador'].includes(cotizacion.estado ?? '')) {
      return { success: false, error: `No se puede rechazar con estado '${cotizacion.estado}'` };
    }

    await prisma.cotizaciones.update({
      where: { id: BigInt(id) },
      data: {
        estado: 'rechazada',
        notas_internas: motivo
          ? `${cotizacion.notas_internas ?? ''}\n[RECHAZO]: ${motivo}`.trim()
          : cotizacion.notas_internas,
      },
    });

    return { success: true };
  },

  async listarProductos() {
    const productos = await prisma.productos.findMany({
      where:   { estado: EstadoProducto.activo },
      select:  { id: true, nombre: true, sku: true, precio: true },
      orderBy: { nombre: 'asc' },
    });
    return serializeBigInt(
      productos.map((p) => ({
        id:     Number(p.id),
        nombre: p.nombre,
        sku:    p.sku,
        precio: Number(p.precio),
      }))
    );
  },

  async listarClientes() {
    const clientes = await prisma.clientes.findMany({
      where:   { activo: EstadoCliente.activo },
      select:  { id: true, razon_social: true, ruc: true },
      orderBy: { razon_social: 'asc' },
    });
    return serializeBigInt(
      clientes.map((c) => ({
        id:           Number(c.id),
        razon_social: c.razon_social,
        ruc:          c.ruc,
      }))
    );
  },
};