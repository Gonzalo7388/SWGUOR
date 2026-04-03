import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => 
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // 1. Login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas o cuenta no confirmada' }, 
        { status: 401 }
      );
    }

    // 2. Consulta a la tabla de usuarios
    // USAMOS .maybeSingle() para evitar que un error de "no filas" rompa la ejecución
    const { data: usuario, error: dbError } = await supabase
      .from('usuarios')
      .select(`
          id,
          rol,
          estado,
          cliente_id,
          clientes (
            razon_social,
            ruc
          )
      `)
      .eq('auth_id', authData.user.id)
      .maybeSingle();

    // --- DEBUG PARA CONSOLA ---
    if (dbError) console.error('Error de base de datos:', dbError);
    if (!usuario) console.warn('No se encontró el perfil para el ID:', authData.user.id);
    // --------------------------

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no vinculado al sistema' }, { status: 403 });
    }

    // 3. Validación de estado (Básico para seguridad)
    if (usuario.estado !== 'activo') {
        return NextResponse.json({ error: 'Cuenta inactiva. Contacte soporte.' }, { status: 403 });
    }

    // 4. Validación B2B
    if (usuario.rol === 'cliente' && !usuario.cliente_id) {
      return NextResponse.json({ error: 'Perfil de cliente incompleto' }, { status: 403 });
    }

    return NextResponse.json({ 
      success: true, 
      role: usuario.rol,
      user_id: usuario.id
    });

  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}