import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// 1. CONFIGURACIÓN DE PERMISOS EXTENDIDA
const routePermissions: Record<string, string[]> = {
  // --- Rutas Administrativas (Staff) ---
  '/admin/Panel-Administrativo/dashboard': ['administrador', 'recepcionista', 'disenador', 'cortador', 'ayudante', 'representante_taller', 'gerente'],
  '/admin/Panel-Administrativo/usuarios': ['administrador', 'gerente'],
  '/admin/Panel-Administrativo/clientes': ['administrador', 'recepcionista', 'gerente'],
  '/admin/Panel-Administrativo/pedidos': ['administrador', 'recepcionista', 'disenador', 'cortador', 'gerente', 'representante_taller'],
  '/admin/Panel-Administrativo/productos': ['administrador', 'disenador', 'gerente', 'recepcionista', 'representante_taller'],
  '/admin/Panel-Administrativo/inventario': ['administrador', 'disenador', 'gerente', 'cortador', 'ayudante', 'representante_taller'],
  '/admin/Panel-Administrativo/confecciones': ['administrador', 'representante_taller', 'gerente', 'disenador', 'cortador'],
  '/admin/Panel-Administrativo/cotizaciones': ['administrador', 'recepcionista', 'gerente'],
  '/admin/Panel-Administrativo/categorias': ['administrador', 'disenador', 'gerente'],
  '/admin/Panel-Administrativo/talleres': ['administrador', 'gerente', 'representante_taller'],
  '/admin/Panel-Administrativo/proveedores': ['administrador', 'gerente'],
  '/admin/Panel-Administrativo/ventas': ['administrador', 'recepcionista', 'gerente'],
  '/admin/Panel-Administrativo/despachos': ['administrador', 'recepcionista', 'gerente', 'ayudante', 'representante_taller'],
  '/admin/Panel-Administrativo/pagos': ['administrador', 'gerente'],
  '/admin/Panel-Administrativo/notificaciones': ['administrador', 'recepcionista', 'disenador', 'cortador', 'ayudante', 'representante_taller', 'gerente'],

  // --- Rutas del Portal B2B (Clientes) ---
  '/portal/dashboard': ['cliente'],
  '/portal/productos': ['cliente'],
  '/portal/cotizaciones': ['cliente'],
  '/portal/ordenes': ['cliente'],
  '/portal/perfil': ['cliente'],
};

const ESTADO_ACTIVO = 'ACTIVO';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  // 2. RUTAS PÚBLICAS ÚNICAS
  const publicPaths = ['/auth/login', '/auth/signup', '/admin/acceso-denegado'];
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // 3. PROTECCIÓN DE RUTAS PRIVADAS (/admin y /portal)
  if (pathname.startsWith('/admin') || pathname.startsWith('/portal')) {
    
    // Si no hay sesión, todos van al MISMO login
    if (!user) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Obtenemos los datos del usuario (Rol y Estado)
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('rol, estado')
      .eq('auth_id', user.id)
      .single();

    // Validar cuenta activa
    if (!usuario || usuario.estado?.toLowerCase() !== 'activo') {
      return NextResponse.redirect(new URL('/auth/login?error=cuenta_inactiva', request.url));
    }

    const userRole = usuario.rol?.toLowerCase();

    // 4. VALIDACIÓN CRUZADA
    if (pathname.startsWith('/admin') && userRole === 'cliente') {
      return NextResponse.redirect(new URL('/admin/acceso-denegado', request.url));
    }
    
    if (pathname.startsWith('/portal') && userRole !== 'cliente') {
      // Si un admin entra a /portal, lo mandamos a su dashboard administrativo
      return NextResponse.redirect(new URL('/admin/Panel-Administrativo/dashboard', request.url));
    }

    // 5. VALIDACIÓN DE PERMISOS ESPECÍFICOS (RBAC)
    // Buscamos si la ruta actual requiere un rol específico
    const matchedRoute = Object.keys(routePermissions)
      .find(route => pathname.startsWith(route));

    if (matchedRoute) {
      const rolesPermitidos = routePermissions[matchedRoute];
      const esSuperUsuario = userRole === 'gerente' || userRole === 'administrador';
      
      if (!esSuperUsuario && !rolesPermitidos.includes(userRole)) {
        return NextResponse.redirect(new URL('/admin/acceso-denegado', request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/portal/:path*',
  ],
};
