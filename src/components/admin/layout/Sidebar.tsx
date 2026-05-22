'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, ShoppingCart, ShoppingBag, Users, Menu, X,
  LogOut, Boxes, Scissors, Building,
  Bell, BarChart3, LucideIcon, ChevronDown,
  Settings, Truck, Package, Grid3x3, DollarSign, FileText,
  Building2, ShieldCheck, UserSquare, Briefcase, MessageSquare, History, Tag, Lock,
} from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import type { usuarios } from '@prisma/client';
import { usePermissions } from '@/lib/hooks/usePermissions';
import type { RecursoKey } from '@/lib/constants/roles';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type SubItem = {
  title: string;
  href: string;
  icon?: LucideIcon;
  resource: RecursoKey;
};

type NavItem = {
  title: string;
  href?: string;
  icon: LucideIcon;
  roles: string[];
  resource?: RecursoKey;
  subItems?: SubItem[];
};

// ─── Sidebar principal ────────────────────────────────────────────────────────

export default function Sidebar({ }: { usuario: usuarios }) {
  const pathname = usePathname();
  const supabase = getSupabaseBrowserClient();
  const { can } = usePermissions();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/admin/Panel-Administrativo/dashboard',
      icon: LayoutDashboard,
      resource: 'dashboard' as RecursoKey,
      roles: ['gerente', 'administrador', 'recepcionista', 'disenador', 'cortador', 'ayudante', 'representante_taller'],
    },
    {
      title: 'Reportes',
      href: '/admin/Panel-Administrativo/reportes',
      icon: BarChart3,
      resource: 'reportes' as RecursoKey,
      roles: ['gerente', 'administrador'],
    },
    {
      title: 'Catálogo',
      icon: Package,
      roles: ['gerente', 'administrador', 'disenador', 'cortador'],
      subItems: [
        { title: 'Productos', href: '/admin/Panel-Administrativo/productos', icon: Package, resource: 'productos' as RecursoKey },
        { title: 'Categorías', href: '/admin/Panel-Administrativo/categorias', icon: Grid3x3, resource: 'categorias' as RecursoKey },
        { title: 'Fichas Técnicas', href: '/admin/Panel-Administrativo/fichas-tecnicas', icon: FileText, resource: 'fichas_tecnicas' as RecursoKey },
        { title: 'Promociones y Ofertas', href: '/admin/Panel-Administrativo/promociones', icon: Tag, resource: 'promociones' as RecursoKey },
      ],
    },
    {
      title: 'Ventas y Pedidos',
      icon: ShoppingCart,
      roles: ['gerente', 'administrador', 'recepcionista', 'disenador'],
      subItems: [
        { title: 'Pedidos', href: '/admin/Panel-Administrativo/pedidos', icon: ShoppingCart, resource: 'pedidos' as RecursoKey },
        { title: 'Cotizaciones', href: '/admin/Panel-Administrativo/cotizaciones', icon: FileText, resource: 'cotizaciones' as RecursoKey },
        { title: 'Devoluciones', href: '/admin/Panel-Administrativo/devoluciones-cliente', icon: Truck, resource: 'devoluciones_clientes' as RecursoKey },
        { title: 'Pagos', href: '/admin/Panel-Administrativo/pagos', icon: DollarSign, resource: 'pagos' as RecursoKey },
      ],
    },
    {
      title: 'Manufactura',
      icon: Scissors,
      roles: ['gerente', 'administrador', 'cortador', 'representante_taller', 'disenador'],
      subItems: [
        { title: 'Órdenes Producción', href: '/admin/Panel-Administrativo/produccion', icon: Package, resource: 'produccion' as RecursoKey },
        { title: 'Confecciones', href: '/admin/Panel-Administrativo/confecciones', icon: Scissors, resource: 'confecciones' as RecursoKey },
        { title: 'Talleres', href: '/admin/Panel-Administrativo/talleres', icon: Building, resource: 'talleres' as RecursoKey },
        { title: 'Incidencias del Taller', href: '/admin/Panel-Administrativo/incidencias-taller', icon: Bell, resource: 'incidencias' as RecursoKey },
        { title: 'Incidencias del Cliente', href: '/admin/Panel-Administrativo/incidencias-cliente', icon: Bell, resource: 'incidencias' as RecursoKey },
      ],
    },
    {
      title: 'Inventario',
      icon: Boxes,
      roles: ['gerente', 'administrador', 'cortador', 'ayudante'],
      subItems: [
        { title: 'Almacenes', href: '/admin/Panel-Administrativo/almacenes', icon: Boxes, resource: 'almacenes' as RecursoKey },
        { title: 'Inventario', href: '/admin/Panel-Administrativo/inventario', icon: Boxes, resource: 'inventario' as RecursoKey },
        { title: 'Movimientos', href: '/admin/Panel-Administrativo/movimientos', icon: Grid3x3, resource: 'movimiento_inventario' as RecursoKey },
        { title: 'Reservas de stock', href: '/admin/Panel-Administrativo/inventario/reservas', icon: Lock, resource: 'inventario' as RecursoKey },
        { title: 'Devoluciones Prov.', href: '/admin/Panel-Administrativo/devoluciones-proveedor', icon: Truck, resource: 'devoluciones_proveedor' as RecursoKey },
      ],
    },
    {
      title: 'Compras',
      icon: ShoppingBag,
      roles: ['gerente', 'administrador', 'almacenero'],
      subItems: [
        {
          title: 'Proveedores',
          href: '/admin/Panel-Administrativo/proveedores',
          icon: Building2,
          resource: 'proveedores' as RecursoKey,
        },
        {
          title: 'Órdenes de Compra',
          href: '/admin/Panel-Administrativo/ordenes-compra',
          icon: ShoppingBag,
          resource: 'ordenes_compra' as RecursoKey,
        },
        {
          title: 'Proveedores Cotizaciones',
          href: '/admin/Panel-Administrativo/cotizaciones-proveedor',
          icon: FileText,
          resource: 'proveedores' as RecursoKey,
        },
      ],
    },
    {
      title: 'Logística',
      icon: Truck,
      roles: ['gerente', 'administrador', 'ayudante', 'recepcionista'],
      subItems: [
        { title: 'Despachos', href: '/admin/Panel-Administrativo/despachos', icon: Truck, resource: 'despachos' as RecursoKey },
      ],
    },
    {
      title: 'Directorio',
      icon: Users,
      roles: ['gerente', 'administrador', 'recepcionista'],
      subItems: [
        { title: 'Usuarios', href: '/admin/Panel-Administrativo/usuarios', icon: ShieldCheck, resource: 'usuarios' as RecursoKey },
        { title: 'Personal Interno', href: '/admin/Panel-Administrativo/personal', icon: UserSquare, resource: 'personal' as RecursoKey },
        { title: 'Clientes', href: '/admin/Panel-Administrativo/clientes', icon: Briefcase, resource: 'clientes' as RecursoKey },
        { title: 'Auditoría', href: '/admin/Panel-Administrativo/auditoria', icon: History, resource: 'usuarios' as RecursoKey },
        { title: 'Feedback Clientes', href: '/admin/Panel-Administrativo/feedback-cliente', icon: MessageSquare, resource: 'feedback_cliente' as RecursoKey },
      ],
    },
    {
      title: 'Configuración',
      href: '/admin/Panel-Administrativo/configuracion',
      icon: Settings,
      resource: 'configuracion' as RecursoKey,
      roles: ['gerente', 'administrador'],
    },
    {
      title: 'Notificaciones',
      href: '/admin/Panel-Administrativo/notificaciones',
      icon: Bell,
      resource: 'notificaciones' as RecursoKey,
      roles: ['administrador', 'gerente', 'recepcionista', 'disenador', 'cortador', 'representante_taller', 'ayudante'],
    },
  ];

  const filteredNavItems = useMemo(() => {
    return navItems
      .map(item => {
        if (item.subItems) {
          const allowedSubItems = item.subItems.filter(sub => can('view', sub.resource));
          if (allowedSubItems.length === 0 && !item.href) return null;
          return { ...item, subItems: allowedSubItems };
        }
        if (item.resource === 'dashboard' as RecursoKey) return item;
        if (item.resource && can('view', item.resource)) return item;
        return null;
      })
      .filter((item): item is NavItem => item !== null);
  }, [can]);

  const toggleMenu = (title: string) => {
    if (isCollapsed) setIsCollapsed(false);
    setOpenMenus(prev =>
      prev.includes(title) ? prev.filter(i => i !== title) : [...prev, title]
    );
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error al salir de GUOR Corp:', error);
    }
  };

  return (
    <>
      {/* Botón móvil */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className={cn(
          'lg:hidden fixed top-4 left-4 z-50 p-3 bg-slate-900 text-white rounded-2xl shadow-xl transition-all',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-90',
          'hover:bg-slate-800',
        )}
        aria-label={isMobileOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={isMobileOpen}
        aria-controls="admin-sidebar"
      >
        {isMobileOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
      </button>

      {/* Overlay móvil */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-30 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Overlay para cerrar notificaciones */}
      {notifOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setNotifOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        className={cn(
          'flex flex-col h-screen w-72 border-r border-slate-100',
          'fixed lg:sticky top-0 z-40 bg-[#fffdf7] overflow-hidden transition-transform',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
        role="complementary"
        aria-label="Menú de navegación del panel administrativo"
      >
        {/* Header */}
        <header className="h-24 flex items-center border-b border-slate-100/50 px-4">
          <div className="flex items-center gap-3 w-full">
            <div className="relative w-10 h-10 shrink-0 rounded-xl bg-white flex items-center justify-center">
              <img src="/logo.png" alt="Logo de GUOR" className="w-7 h-7 object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-extrabold text-slate-950 text-xl leading-tight truncate tracking-tighter">GUOR</h1>
              <p className="text-[10px] uppercase tracking-widest text-rose-600 font-bold truncate">
                Admin Panel
              </p>
            </div>
          </div>
        </header>

        {/* Navegación */}
        <nav
          className="flex-1 px-3 mt-4 space-y-1.5 overflow-y-auto custom-scrollbar"
          role="navigation"
          aria-label="Menú principal"
        >
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isOpen = openMenus.includes(item.title);
            const isActive = item.href === pathname || item.subItems?.some(s => s.href === pathname);

            return (
              <div key={item.title}>
                {item.subItems ? (
                  <button
                    onClick={() => toggleMenu(item.title)}
                    aria-expanded={isOpen}
                    aria-label={isOpen ? `Ocultar ${item.title}` : `Mostrar ${item.title}`}
                    className={cn(
                      'w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all font-semibold text-sm',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#fffdf7]',
                      isActive
                        ? 'bg-rose-50 text-rose-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200',
                      isCollapsed && 'justify-center',
                    )}
                  >
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} aria-hidden />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.title}</span>
                        <ChevronDown
                          size={16}
                          className={cn('transition-transform text-slate-400', isOpen && 'rotate-180')}
                          aria-hidden
                        />
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href!}
                    onClick={() => setIsMobileOpen(false)}
                    aria-current={pathname === item.href ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all font-semibold text-sm',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#fffdf7]',
                      pathname === item.href
                        ? 'bg-rose-50 text-rose-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200',
                      isCollapsed && 'justify-center',
                    )}
                    title={item.title}
                  >
                    <Icon size={22} strokeWidth={pathname === item.href ? 2.5 : 2} aria-hidden />
                    {!isCollapsed && <span>{item.title}</span>}
                  </Link>
                )}

                {/* Submenu */}
                {!isCollapsed && isOpen && item.subItems && (
                  <div
                    className="ml-10 mt-1 space-y-1 animate-in slide-in-from-top-1 duration-200"
                    role="group"
                    aria-label={`Subopciones de ${item.title}`}
                  >
                    {item.subItems.map(sub => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setIsMobileOpen(false)}
                        aria-current={pathname === sub.href ? 'page' : undefined}
                        className={cn(
                          'flex items-center gap-2.5 py-2.5 px-3 text-xs font-semibold rounded-lg transition-all',
                          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#fffdf7]',
                          pathname === sub.href
                            ? 'text-rose-700 bg-rose-100/50'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200',
                        )}
                        title={sub.title}
                      >
                        {sub.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100/50">
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-3 w-full p-3.5 rounded-2xl text-slate-500 hover:text-white hover:bg-slate-950 transition-all',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#fffdf7] active:scale-95',
            )}
            aria-label="Cerrar sesión"
          >
            <LogOut size={22} aria-hidden />
            <span className="text-sm font-bold">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}