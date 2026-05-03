import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint de estadísticas de movimientos (en construcción)',
  });
}
