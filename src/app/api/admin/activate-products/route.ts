import { createClient as createServerClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data, error } = await supabase
      .from('productos')
      .update({ estado: 'activo' })
      .eq('estado', 'inactivo')
      .select('id, nombre, estado');

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `${data?.length || 0} productos actualizados a estado 'activo'`,
      actualizados: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
