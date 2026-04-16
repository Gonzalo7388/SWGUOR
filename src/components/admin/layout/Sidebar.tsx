'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, ShoppingCart, Users, Menu, X,
  LogOut, Boxes, Scissors, Building,
  Bell, BarChart3, LucideIcon, ChevronDown,
  Settings, Truck, Package, Grid3x3, DollarSign, FileText,
  Building2
} from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import type { usuarios } from '@prisma/client';
import { usePermissions } from '@/lib/hooks/usePermissions';
import type { RecursoKey } from '@/lib/constants/roles';

type NavItem = {
  title: string;
  href?: string;
  icon: LucideIcon;
  roles: string[];
  subItems?: { title: string; href: string; icon?: LucideIcon }[];
};

export default function Sidebar({ usuario }: { usuario: usuarios }) {
  const router = useRouter();
  const pathname = usePathname();
  const { can } = usePermissions();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/admin/Panel-Administrativo/dashboard',
      icon: LayoutDashboard,
      roles: ['gerente', 'administrador', 'recepcionista', 'disenador', 'cortador', 'ayudante', 'representante_taller'],
    },
    {
      title: 'Reportes',
      href: '/admin/Panel-Administrativo/reportes',
      icon: BarChart3,
      roles: ['gerente', 'administrador'],
    },
    {
      title: 'Catálogo',
      icon: Package,
      roles: ['gerente', 'administrador', 'disenador'],
      subItems: [
        { title: 'Productos', href: '/admin/Panel-Administrativo/productos', icon: Package },
        { title: 'Categorías', href: '/admin/Panel-Administrativo/categorias', icon: Grid3x3 },
      ],
    },
    {
      title: 'Ventas y Pedidos',
      icon: ShoppingCart,
      roles: ['gerente', 'administrador', 'recepcionista', 'disenador'],
      subItems: [
        { title: 'Ventas', href: '/admin/Panel-Administrativo/ventas', icon: DollarSign },
        { title: 'Pedidos', href: '/admin/Panel-Administrativo/pedidos', icon: ShoppingCart },
        { title: 'Cotizaciones', href: '/admin/Panel-Administrativo/cotizaciones', icon: FileText },
        { title: 'Pagos', href: '/admin/Panel-Administrativo/pagos', icon: DollarSign },
      ],
    },
    {
      title: 'Producción',
      icon: Scissors,
      roles: ['gerente', 'administrador', 'cortador', 'representante_taller'],
      subItems: [
        { title: 'Inventario', href: '/admin/Panel-Administrativo/inventario', icon: Boxes },
        { title: 'Confecciones', href: '/admin/Panel-Administrativo/confecciones', icon: Scissors },
        { title: 'Talleres', href: '/admin/Panel-Administrativo/talleres', icon: Building },
      ],
    },
    {
      title: 'Logística',
      icon: Truck,
      roles: ['gerente', 'administrador', 'ayudante'],
      subItems: [
        { title: 'Despachos', href: '/admin/Panel-Administrativo/despachos', icon: Truck },
      ],
    },
    {
      title: 'Proveedores',
      href: '/admin/Panel-Administrativo/proveedores',
      icon: Building2,
      roles: ['gerente', 'administrador'],
    },
    {
      title: 'Personas',
      icon: Users,
      roles: ['gerente', 'administrador'],
      subItems: [
        { title: 'Clientes', href: '/admin/Panel-Administrativo/clientes', icon: Users },
        { title: 'Usuarios', href: '/admin/Panel-Administrativo/usuarios', icon: Users },
      ],
    },
    {
      title: 'Notificaciones',
      href: '/admin/Panel-Administrativo/notificaciones',
      icon: Bell,
      roles: ['gerente', 'administrador', 'recepcionista', 'disenador', 'cortador', 'ayudante', 'representante_taller'],
    },
    {
      title: 'Configuración',
      href: '/admin/Panel-Administrativo/configuracion',
      icon: Settings,
      roles: ['gerente', 'administrador'],
    },
  ];

  const filteredNavItems = useMemo(() => {
    return navItems
      .map(item => {
        if (item.subItems) {
          const allowedSubItems = item.subItems.filter(sub => {
            const resourceKey = sub.title.toLowerCase().trim()
              .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return can('view', resourceKey as RecursoKey);
          });
          if (allowedSubItems.length === 0 && !item.href) return null;
          return { ...item, subItems: allowedSubItems };
        }
        const resourceName = item.title.toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (resourceName === 'dashboard' || can('view', resourceName as RecursoKey)) return item;
        return null;
      })
      .filter((item): item is NavItem => item !== null);
  }, [can]);

  const toggleMenu = (title: string) => {
    if (isCollapsed) setIsCollapsed(false);
    setOpenMenus(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace('/auth/login');
  };

  return (
    <>
      {/* Botón móvil */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-3 left-4 z-50 p-3 bg-slate-900 text-white rounded-2xl shadow-xl active:scale-90 transition-all"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay móvil */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-30 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col h-screen w-72 border-r border-slate-100",
          "fixed lg:sticky top-0 z-40 bg-[#fffdf7] overflow-hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >

        {/* Header - Logo */}
        <div className="h-24 flex items-center border-b border-slate-100/50 px-6">
          <div className="flex items-center gap-3 w-full">
            <div className="relative w-10 h-10 shrink-0 rounded-xl bg-white flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-extrabold text-slate-950 text-xl leading-tight truncate tracking-tighter">GUOR</h1>
              <p className="text-[10px] uppercase tracking-widest text-rose-600 font-bold truncate">
                Admin Panel
              </p>
            </div>
          </div>
        </div>

              {/* Navegación - Contenedor Principal */}
        <nav className="flex-1 px-3 mt-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isOpen = openMenus.includes(item.title);
            const isActive = item.href === pathname ||
              item.subItems?.some(s => s.href === pathname);

            return (
              <div key={item.title}>
                {item.subItems ? (
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all font-semibold text-sm",
                      isActive
                        ? "bg-rose-50 text-rose-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                      isCollapsed && "justify-center"
                    )}
                  >
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.title}</span>
                        <ChevronDown size={16} className={cn("transition-transform text-slate-400", isOpen && "rotate-180")} />
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href!}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all font-semibold text-sm",
                      pathname === item.href
                        ? "bg-rose-50 text-rose-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                      isCollapsed && "justify-center"
                    )}
                  >
                    <Icon size={22} strokeWidth={pathname === item.href ? 2.5 : 2} />
                    {!isCollapsed && <span>{item.title}</span>}
                  </Link>
                )}

                {/* Submenu animado */}
                {!isCollapsed && isOpen && item.subItems && (
                  <div className="ml-10 mt-1 space-y-1 animate-in slide-in-from-top-1 duration-200">
                    {item.subItems.map(sub => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={cn(
                          "flex items-center gap-2.5 py-2.5 px-3 text-xs font-semibold rounded-lg transition-all",
                          pathname === sub.href
                            ? "text-rose-700 bg-rose-100/50"
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        )}
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

        {/* Footer - Logout */}
        <div className="p-4 border-t border-slate-100/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3.5 rounded-2xl text-slate-500 hover:text-white hover:bg-slate-950 transition-all"
          >
            <LogOut size={22} />
            <span className="text-sm font-bold">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}