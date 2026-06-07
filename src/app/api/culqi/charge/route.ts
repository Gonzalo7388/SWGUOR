import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type MetodoPagoPedido =
  | "efectivo"
  | "transferencia_bcp"
  | "yape"
  | "plin"
  | "visa"
  | "mastercard";

function inferMetodoPago(data: Record<string, any>): MetodoPagoPedido {
  const sourceType = String(data?.source?.type ?? "").toLowerCase();
  if (sourceType.includes("yape")) return "yape";
  if (sourceType.includes("plin")) return "plin";

  const brand = String(
    data?.source?.iin?.card_brand ?? data?.source?.brand ?? ""
  ).toLowerCase();

  if (brand.includes("master")) return "mastercard";
  return "visa";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, source_id, pedido_id, amount, currency_code, email, description } = body;

    const paymentSource = source_id ?? token;

    if (!paymentSource || !pedido_id || !amount || !currency_code || !email) {
      return NextResponse.json(
        {
          success: false,
          message: "Faltan datos para procesar el pago del pedido",
        },
        { status: 400 }
      );
    }

    const pedidoId = Number(pedido_id);
    const amountInCents = Number(amount);
    const amountInSoles = amountInCents / 100;

    if (
      !Number.isFinite(pedidoId) ||
      pedidoId <= 0 ||
      !Number.isFinite(amountInSoles) ||
      amountInSoles <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Datos de pago inválidos",
        },
        { status: 400 }
      );
    }

    const secretKey = process.env.CULQI_SECRET_KEY;

    if (!secretKey) {
      console.error(
        "CULQI_SECRET_KEY no está configurada en las variables de entorno"
      );
      return NextResponse.json(
        {
          success: false,
          message: "Error de configuración del servidor",
        },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.culqi.com/v2/charges", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency_code,
        email,
        source_id: paymentSource,
        ...(description ? { description } : {}),
      }),
    });

    const data = await response.json();

    if (response.ok) {
      const metodoPago =
        paymentSource === "bank_transfer"
          ? "transferencia_bcp"
          : inferMetodoPago(data as Record<string, any>);

      await prisma.$transaction(async (tx) => {
        const pedido = await tx.pedidos.findUnique({
          where: { id: BigInt(pedidoId) },
          select: { id: true, total: true, monto_pagado: true },
        });

        if (!pedido) {
          throw new Error("pedido_no_encontrado");
        }

        const totalPedido = Number(pedido.total ?? 0);
        const pagadoActual = Number(pedido.monto_pagado ?? 0);
        const nuevoMontoPagado = pagadoActual + amountInSoles;
        const nuevoSaldoPendiente = Math.max(totalPedido - nuevoMontoPagado, 0);

        await tx.pedidos.update({
          where: { id: BigInt(pedidoId) },
          data: {
            metodo_pago: metodoPago,
            monto_pagado: nuevoMontoPagado,
            saldo_pendiente: nuevoSaldoPendiente,
          },
        });

        await tx.pagos.create({
          data: {
            id_uuid: crypto.randomUUID(),
            pedido_id: BigInt(pedidoId),
            monto: amountInSoles,
            metodo_pago: metodoPago,
            tipo: "pago_completo",
            estado: "pagado",
            fecha_pago: new Date(),
            notas: `Pago automático Culqi${
              data?.id ? ` (${String(data.id)})` : ""
            }`,
          },
        });
      });

      return NextResponse.json(
        {
          success: true,
          data,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: data.user_message || "Error al procesar el pago",
          code: data.code,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error en el procesamiento del pago:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error del servidor",
      },
      { status: 500 }
    );
  }
}