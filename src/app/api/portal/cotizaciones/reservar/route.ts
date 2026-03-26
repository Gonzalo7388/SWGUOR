import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/** * POST /api/sistema-erp/cotizaciones/reservar
 * Reserva el stock para una cotización específica
 * Body: { cotizacion_id: number, items: [{ producto_id: number, cantidad: number }] }
 */
export async function POST(req: Request) {
  const { cotizacion_id, items } = await req.json();
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc('reservar_stock_cotizacion', {
      p_cotizacion_id: cotizacion_id,
      p_items: items,
    });

  if (error) {
    // El detalle del error viene de RAISE EXCEPTION
    const detalle = JSON.parse(error.details ?? '[]');
    return NextResponse.json({ error: 'stock_insuficiente', faltantes: detalle }, { status: 409 });
  }

  return NextResponse.json(data);
}