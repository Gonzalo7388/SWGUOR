import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
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

  // 1. Intentar iniciar sesión en Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    return NextResponse.json(
      { error: 'Credenciales inválidas o cuenta no confirmada' }, 
      { status: 401 }
    );
  }

  // 2. Validar que el usuario sea un CLIENTE (Seguridad B2B)
  // Consultamos tu tabla de usuarios para ver su rol
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
    .single();

    if (dbError || !usuario) {
    return NextResponse.json({ error: 'Usuario no vinculado al sistema' }, { status: 403 });
    }

    // 3. Validación de seguridad: Si el rol es cliente pero no tiene empresa asociada
    if (usuario.rol === 'cliente' && !usuario.cliente_id) {
    return NextResponse.json({ error: 'Perfil de cliente incompleto' }, { status: 403 });
    }

    return NextResponse.json({ 
    success: true, 
    role: usuario.rol,
    user_id: usuario.id
    });
}