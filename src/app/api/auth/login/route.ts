// src/app/api/auth/login/route.ts
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

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    // 2. Consulta simplificada primero para asegurar que el usuario existe
    const { data: usuario, error: dbError } = await supabase
      .from('usuarios')
      .select('id, rol, estado')
      .eq('auth_id', authData.user.id)
      .single();

    if (dbError || !usuario) {
      return NextResponse.json({ error: 'Usuario no registrado en el sistema' }, { status: 403 });
    }

    // 3. Validación de estado (ignora mayúsculas)
    if (usuario.estado?.toLowerCase() !== 'activo') {
      return NextResponse.json({ error: 'La cuenta no se encuentra activa' }, { status: 403 });
    }

    // 4. Si es cliente, buscamos su perfil vinculado por separado para evitar fallos de join
    let cliente_id = null;
    if (usuario.rol === 'cliente') {
      const { data: cliente } = await supabase
        .from('clientes')
        .select('id')
        .eq('usuario_id', usuario.id)
        .single();
      
      if (!cliente) {
        return NextResponse.json({ error: 'Perfil de cliente no vinculado' }, { status: 403 });
      }
      cliente_id = cliente.id;
    }

    return NextResponse.json({
      success: true,
      role: usuario.rol.toLowerCase().trim(),
      user_id: usuario.id,
      cliente_id: cliente_id
    });

  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}