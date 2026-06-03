import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, amount, currency_code, email } = body;

    // Obtener la clave secreta desde variables de entorno
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

    console.log("secretKey:", secretKey);
    console.log("Request body:", body);

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
        source_id: token,
      }),
    });

    const data = await response.json();

    if (response.ok) {
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