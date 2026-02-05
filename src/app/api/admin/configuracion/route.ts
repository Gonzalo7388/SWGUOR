import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Obtener todos los usuarios
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('id, email, nombre_completo, rol, estado')
      .limit(50);

    if (usuariosError) {
      console.error('Error fetching usuarios:', usuariosError);
      return NextResponse.json(
        { error: 'Error al obtener usuarios' },
        { status: 500 }
      );
    }

    // Configuración por defecto (en un caso real, esto vendría de una tabla de configuración)
    const config = {
      empresa: {
        nombreEmpresa: 'GUOR - Modas y Estilos',
        ruc: '20123456789',
        contacto: '+51 987654321',
        email: 'info@guor.com',
        direccion: 'Av. Principal 123, Lima',
        ciudad: 'Lima',
        pais: 'Perú'
      },
      tienda: {
        nombreTienda: 'GUOR Shop',
        descripcion: 'Tienda de ropa y textiles',
        moneda: 'PEN',
        zonaHoraria: 'America/Lima'
      },
      usuarios: usuarios || [],
      pagos: {
        metodos: [
          { nombre: 'Tarjeta Crédito', activo: true },
          { nombre: 'Transferencia Bancaria', activo: true },
          { nombre: 'Efectivo', activo: false },
          { nombre: 'Billetera Digital', activo: true }
        ]
      },
      impuestos: {
        igv: 18,
        descuentoDefault: 0
      }
    };

    return NextResponse.json({ data: config });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();

    // En un caso real, esto guardaría en una tabla de configuración
    // Por ahora, simulamos que se guarda correctamente
    console.log('Guardando configuración:', body);

    // Aquí iría la lógica para guardar en base de datos
    // const { data, error } = await supabase.from('configuracion').upsert(body);

    return NextResponse.json({
      success: true,
      message: 'Configuración guardada correctamente'
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
