import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, EstadoCotizacion } from '@prisma/client';

const prisma = new PrismaClient();

interface GenerarDemoParams {
  cantidad?: number;
  cliente_id?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerarDemoParams = await req.json();
    const cantidad = body.cantidad || 8;
    const clienteId = body.cliente_id;

    if (!clienteId) {
      return NextResponse.json(
        { error: 'cliente_id requerido' },
        { status: 400 }
      );
    }

    // Verificar que el cliente existe
    const cliente = await prisma.clientes.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Estados y datos de prueba
    const estados: EstadoCotizacion[] = ['borrador', 'enviada', 'aprobada', 'rechazada', 'convertida', 'expirada'] as EstadoCotizacion[];
    const zonas = [
      { zona: 'cercana_sjl', costo: 15 },
      { zona: 'media', costo: 20 },
      { zona: 'lejana', costo: 25 },
    ];

    const cotizacionesGeneradas: any[] = [];

    for (let i = 0; i < cantidad; i++) {
      const estado = estados[Math.floor(Math.random() * estados.length)];
      const zona = zonas[Math.floor(Math.random() * zonas.length)];
      
      // Generar datos realistas
      const subtotal = Math.floor(Math.random() * 90000) + 10000; // 10k - 100k
      const descuentoPct = [0, 5, 10, 15][Math.floor(Math.random() * 4)];
      const descuentoMonto = Math.floor(subtotal * (descuentoPct / 100));
      const baseIgv = subtotal - descuentoMonto;
      const igv = Math.floor(baseIgv * 0.18);
      const costoEnvio = zona.costo;
      const total = baseIgv + igv + costoEnvio;

      // Fecha aleatoria entre los últimos 60 días
      const diasAtras = Math.floor(Math.random() * 60);
      const fechaCreacion = new Date();
      fechaCreacion.setDate(fechaCreacion.getDate() - diasAtras);

      const validaHasta = new Date(fechaCreacion);
      validaHasta.setDate(validaHasta.getDate() + 7); // Válida 7 días

      // Generar número de cotización
      const year = fechaCreacion.getFullYear();
      const month = String(fechaCreacion.getMonth() + 1).padStart(2, '0');
      const day = String(fechaCreacion.getDate()).padStart(2, '0');
      const hours = String(fechaCreacion.getHours()).padStart(2, '0');
      const minutes = String(fechaCreacion.getMinutes()).padStart(2, '0');
      const seconds = String(fechaCreacion.getSeconds()).padStart(2, '0');
      const numeroCotizacion = `COT-${year}${month}${day}-${hours}${minutes}${seconds}-${9000 + i}`;

      // Crear cotización
      const cotizacion = await prisma.cotizaciones.create({
        data: {
          cliente_id: BigInt(clienteId),
          numero: numeroCotizacion,
          estado,
          subtotal: subtotal,
          monto_descuento: descuentoMonto,
          igv,
          costo_envio: costoEnvio,
          costo_total_estimado: total,
          total,
          moneda: 'PEN',
          valida_hasta: validaHasta,
          created_at: fechaCreacion,
          updated_at: new Date(),
        },
      });

      // Generar ítems de prueba (2-5 productos por cotización)
      const numItems = Math.floor(Math.random() * 4) + 2;
      const productosIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // IDs de ejemplo

      for (let j = 0; j < numItems; j++) {
        const productoId = productosIds[Math.floor(Math.random() * productosIds.length)];
        const cantidadItem = Math.floor(Math.random() * 4000) + 400; // 400-4400 unidades
        const precioUnitario = Math.floor(Math.random() * 200) + 20; // S/ 20-220
        const subtotalItem = cantidadItem * precioUnitario;

        try {
          await prisma.cotizacion_items.create({
            data: {
              cotizacion_id: cotizacion.id,
              producto_id: BigInt(productoId),
              variante_id: BigInt(productoId),
              precio_unitario_snapshot: precioUnitario,
              cantidad: cantidadItem,
              subtotal: subtotalItem,
              color_snapshot: ['Rojo', 'Azul', 'Negro', 'Blanco', 'Verde'][Math.floor(Math.random() * 5)],
              talla_snapshot: ['XS', 'S', 'M', 'L', 'XL'][Math.floor(Math.random() * 5)],
            },
          });
        } catch (e) {
          // Ignorar errores en items si el producto no existe
          console.log(`Producto ${productoId} no encontrado para item de demo`);
        }
      }

      cotizacionesGeneradas.push({
        numero: numeroCotizacion,
        estado,
        total,
        items: numItems,
      } as any);
    }

    return NextResponse.json({
      mensaje: `Se generaron ${cantidad} cotizaciones de demostración exitosamente`,
      cotizaciones: cotizacionesGeneradas,
    });
  } catch (error) {
    console.error('Error generando demo:', error);
    return NextResponse.json(
      { error: 'Error al generar cotizaciones de demostración' },
      { status: 500 }
    );
  }
}
