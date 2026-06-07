import { NextRequest, NextResponse } from 'next/server';
import { isPagoIdempotenciaError } from '@/lib/services/pago-idempotencia.service';
import {
  isCulqiPedidoPagoError,
  procesarCargoPedidoCulqi,
} from '@/lib/services/culqi-charge.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, source_id, pedido_id, email, description } = body;

    if (!pedido_id || !email) {
      return NextResponse.json(
        {
          success: false,
          message: 'Faltan datos para procesar el pago del pedido',
          code: 'DATOS_INCOMPLETOS',
        },
        { status: 400 },
      );
    }

    const result = await procesarCargoPedidoCulqi({
      pedidoId: Number(pedido_id),
      token,
      sourceId: source_id,
      email,
      description,
    });

    return NextResponse.json(
      {
        success: result.success,
        message: result.message,
        code: result.code,
        data: result.data,
      },
      { status: result.httpStatus },
    );
  } catch (error) {
    if (isPagoIdempotenciaError(error) || isCulqiPedidoPagoError(error)) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          code: error.code,
        },
        { status: error.status },
      );
    }

    if (
      error instanceof Error &&
      error.message.includes('CULQI_SECRET_KEY')
    ) {
      console.error('[POST /api/culqi/charge]', error.message);
      return NextResponse.json(
        {
          success: false,
          message: 'Error de configuración del servidor',
          code: 'CULQI_CONFIG_ERROR',
        },
        { status: 500 },
      );
    }

    console.error('[POST /api/culqi/charge]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error del servidor',
        code: 'SERVER_ERROR',
      },
      { status: 500 },
    );
  }
}
