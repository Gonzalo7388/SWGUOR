export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';
import { SchemaType, Tool } from '@google/generative-ai';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { serializeBigInt } from '@/lib/utils/serialize';
import { model } from '@/lib/gemini';

const tools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: 'consultar_inventario',
        description: 'Consulta stock y precios de productos activos por nombre o categoría. Devuelve variantes con tallas, colores y stock disponible.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            busqueda: { type: SchemaType.STRING, description: 'Nombre del producto o categoría a buscar' },
            talla: { type: SchemaType.STRING, description: 'Talla específica (XS, S, M, L, XL, XXL)' },
          },
          required: ['busqueda'],
        } as any,
      },
      {
        name: 'cotizar_pedido',
        description: 'Calcula el total con descuentos escalonados e IGV (18%) para una lista de productos. Valida el MOQ de 400 unidades.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            items: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  producto_id: { type: SchemaType.NUMBER, description: 'ID del producto' },
                  cantidad: { type: SchemaType.NUMBER, description: 'Cantidad de unidades' },
                },
                required: ['producto_id', 'cantidad'],
              } as any,
            },
          },
          required: ['items'],
        } as any,
      },
    ],
  },
];

export async function POST(req: Request) {
  try {
    // 1. Autenticación — extraer cliente de la sesión
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'no_auth' }, { status: 401 });
    }

    const usuarioDb = await prisma.usuarios.findFirst({
      where: { auth_id: user.id },
      select: { id: true, nombre_completo: true },
    });

    const clienteDb = usuarioDb
      ? await prisma.clientes.findFirst({
          where: { usuario_id: usuarioDb.id },
          select: { id: true, razon_social: true },
        })
      : null;

    const nombreCliente = clienteDb?.razon_social ?? usuarioDb?.nombre_completo ?? 'Estimado cliente';

    // 2. Parsear mensajes del chat
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Se requieren mensajes' }, { status: 400 });
    }

    // 3. System prompt personalizado con el nombre del cliente
    const systemPrompt = `Eres el asistente experto de Modas y Estilos GUOR.
      Estás atendiendo a: ${nombreCliente}.
      REGLAS CRÍTICAS:
      - NO utilices emojis en tus respuestas bajo ninguna circunstancia.
      - Pedido mínimo (MOQ): 400 unidades.
      - IGV: 18% incluido en todos los precios.
      - Escalas de descuento: 400-999 (0%), 1000-4999 (5%), 5000-9999 (12%), 10000+ (18%).
      - Si el cliente pregunta por disponibilidad o stock, usa la herramienta 'consultar_inventario'.
      - Si el cliente quiere saber precios, totales o armar un pedido, usa 'cotizar_pedido'.
      - Mantén un tono profesional, directo y formal orientado a negocios B2B.
      - Responde siempre en español.`;

    // 4. Iniciar chat con Gemini
    const chat = model.startChat({
      tools,
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: `Entendido. Soy el asistente comercial de GUOR. Bienvenido/a, ${nombreCliente}. ¿En qué puedo ayudarle hoy?` }] },
        ...messages.slice(0, -1).map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        })),
      ],
    });

    // 5. Enviar último mensaje del usuario
    const lastMsg = messages[messages.length - 1].content;
    let result = await chat.sendMessage(lastMsg);
    let response = result.response;

    // 6. Ejecutar tool calls en bucle (máx 5 iteraciones)
    let iterations = 0;
    while (
      response.candidates?.[0]?.content?.parts?.some((p) => p.functionCall) &&
      iterations < 5
    ) {
      const parts = response.candidates[0].content.parts;
      const toolResponses = await Promise.all(
        parts
          .filter((p) => p.functionCall)
          .map(async (p) => {
            const call = p.functionCall!;
            const output = await ejecutarTool(call.name, call.args);
            return { functionResponse: { name: call.name, response: output } };
          })
      );

      result = await chat.sendMessage(toolResponses);
      response = result.response;
      iterations++;
    }

    return NextResponse.json({
      success: true,
      text: response.text(),
      cliente: nombreCliente,
    });
  } catch (error: any) {
    console.error('[Portal Chat] Error:', error);
    return NextResponse.json(
      { error: 'Error en el servidor de chat' },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Tool Executors
// ─────────────────────────────────────────────────────────────

const ESCALAS_DESCUENTO = [
  { min: 400, dcto: 0.0 },
  { min: 1000, dcto: 0.05 },
  { min: 5000, dcto: 0.12 },
  { min: 10000, dcto: 0.18 },
];

async function ejecutarTool(nombre: string, args: any) {
  switch (nombre) {
    case 'consultar_inventario': {
      const where: Record<string, unknown> = { estado: 'activo' };

      // Búsqueda por nombre de producto o categoría
      if (args.busqueda) {
        // Primero buscar por categoría
        const categorias = await prisma.categorias.findMany({
          where: { nombre: { contains: args.busqueda, mode: 'insensitive' } },
          select: { id: true },
        });

        const categoriaIds = categorias.map((c) => c.id);

        where.OR = [
          { nombre: { contains: args.busqueda, mode: 'insensitive' } },
          ...(categoriaIds.length > 0 ? [{ categoria_id: { in: categoriaIds } }] : []),
        ];
      }

      const productos = await prisma.productos.findMany({
        where,
        include: {
          categorias: { select: { nombre: true } },
          variantes_producto: {
            where: { estado: 'activo', stock_adicional: { gt: 0 } },
            select: {
              id: true,
              color: true,
              talla: true,
              stock_adicional: true,
              precio_adicional: true,
              sku: true,
            },
          },
        },
        take: 8,
      });

      const resultado = productos.map((p) => ({
        id: p.id.toString(),
        nombre: p.nombre,
        categoria: p.categorias?.nombre ?? 'Sin categoría',
        precio: Number(p.precio),
        variantes: p.variantes_producto.map((v) => ({
          color: v.color,
          talla: v.talla,
          stock: v.stock_adicional,
          precio_adicional: Number(v.precio_adicional),
          sku: v.sku,
        })),
      }));

      return { productos: resultado, total_encontrados: resultado.length };
    }

    case 'cotizar_pedido': {
      if (!args.items || !Array.isArray(args.items) || args.items.length === 0) {
        return { error: 'Se requieren items con producto_id y cantidad' };
      }

      // Obtener precios reales de los productos
      const productoIds = args.items
        .map((i: any) => Number(i.producto_id))
        .filter(Boolean);

      const productos = await prisma.productos.findMany({
        where: { id: { in: productoIds }, estado: 'activo' },
        select: { id: true, nombre: true, precio: true, moq: true },
      });

      const precioMap = new Map(productos.map((p) => [p.id.toString(), p]));

      const subtotalBruto = args.items.reduce((acc: number, item: any) => {
        const prod = precioMap.get(String(item.producto_id));
        const precio = prod ? Number(prod.precio) : 0;
        return acc + precio * (item.cantidad || 0);
      }, 0);

      const totalUnidades = args.items.reduce(
        (s: number, i: any) => s + (i.cantidad || 0),
        0
      );

      const escala = [...ESCALAS_DESCUENTO]
        .reverse()
        .find((r) => totalUnidades >= r.min);

      const pctDescuento = (escala?.dcto ?? 0) * 100;
      const montoDescuento = subtotalBruto * (escala?.dcto ?? 0);
      const subtotalConDescuento = subtotalBruto - montoDescuento;
      const igv = subtotalConDescuento * 0.18;
      const total = subtotalConDescuento + igv;

      const escalaSiguiente = ESCALAS_DESCUENTO.find(
        (r) => r.min > totalUnidades
      );

      return {
        items_detalle: args.items.map((item: any) => {
          const prod = precioMap.get(String(item.producto_id));
          return {
            producto: prod?.nombre ?? `Producto #${item.producto_id}`,
            cantidad: item.cantidad,
            precio_unitario: prod ? Number(prod.precio) : 0,
            subtotal: prod ? Number(prod.precio) * (item.cantidad || 0) : 0,
          };
        }),
        subtotal_bruto: Math.round(subtotalBruto * 100) / 100,
        total_unidades: totalUnidades,
        descuento_aplicado: `${pctDescuento}%`,
        monto_descuento: Math.round(montoDescuento * 100) / 100,
        subtotal_con_descuento: Math.round(subtotalConDescuento * 100) / 100,
        igv: Math.round(igv * 100) / 100,
        total: Math.round(total * 100) / 100,
        cumple_moq: totalUnidades >= 400,
        moq_estado:
          totalUnidades < 400
            ? `Alerta: No alcanza el mínimo de 400 unidades (actual: ${totalUnidades})`
            : 'Requisito de pedido mínimo cumplido',
        proximo_nivel: escalaSiguiente
          ? `Si llega a ${escalaSiguiente.min} unidades obtendrá ${(escalaSiguiente.dcto * 100).toFixed(0)}% de descuento`
          : 'Ya cuenta con el descuento máximo disponible',
      };
    }

    default:
      return { error: 'Herramienta no implementada' };
  }
}
