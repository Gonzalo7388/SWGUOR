'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, ShoppingCart, Users, Menu, X,
  LogOut, Boxes, Scissors, Building,
  Bell, ChevronDown, Crown, Shirt, Sparkles, Inbox,
  BarChart3, ShieldCheck, LucideIcon
} from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { usePermissions } from '@/lib/hooks/usePermissions';

type Usuario = Database['public']['Tables']['usuarios']['Row'];

type NavItem = {
  title: string;
  href?: string;
  icon: LucideIcon;
  roles: string[];
  subItems?: { title: string; href: string; icon?: LucideIcon }[];
};

export default function Sidebar({ usuario }: { usuario: Usuario }) {
  const [isOpen, setIsOpen] = useState(true);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { can } = usePermissions();

  const navItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = [
      {
        title: 'Dashboard',
        icon: LayoutDashboard,
        roles: ['administrador', 'recepcionista', 'disenador', 'cortador', 'ayudante', 'representante_taller', 'gerente'],
        href: usuario.rol === 'gerente' ? undefined : '/admin/Panel-Administrativo/dashboard',
        subItems: usuario.rol === 'gerente' ? [
          { title: 'Vista Gerente', href: '/admin/Panel-Administrativo/dashboard', icon: BarChart3 },
          { title: 'Diseñador', href: '/admin/Panel-Administrativo/dashboard/disenador', icon: Sparkles },
          { title: 'Cortador', href: '/admin/Panel-Administrativo/dashboard/cortador', icon: Scissors },
          { title: 'Recepcionista', href: '/admin/Panel-Administrativo/dashboard/recepcionista', icon: Bell },
          { title: 'Ayudante', href: '/admin/Panel-Administrativo/dashboard/ayudante', icon: Inbox },
          { title: 'Taller Externo', href: '/admin/Panel-Administrativo/dashboard/representante_taller', icon: Building },
          { title: 'Administrador', href: '/admin/Panel-Administrativo/dashboard/administrador', icon: ShieldCheck },
        ] : undefined
      },
      {
        title: 'Pedidos',
        href: '/admin/Panel-Administrativo/pedidos',
        icon: ShoppingCart,
        roles: ['administrador', 'recepcionista', 'gerente'],
      },
      {
        title: 'Productos',
        href: '/admin/Panel-Administrativo/productos',
        icon: Shirt,
        roles: ['administrador', 'disenador', 'gerente'],
      },
      {
        title: 'Inventario',
        href: '/admin/Panel-Administrativo/inventario',
        icon: Boxes,
        roles: ['administrador', 'ayudante', 'gerente'],
      },
      {
        title: 'Producción',
        href: '/admin/Panel-Administrativo/produccion',
        icon: Scissors,
        roles: ['administrador', 'cortador', 'representante_taller', 'gerente'],
      },
      {
        title: 'Clientes',
        href: '/admin/Panel-Administrativo/clientes',
        icon: Users,
        roles: ['administrador', 'recepcionista', 'gerente'],
      }
    ];
    return items;
  }, [usuario.rol]);

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const toggleSubmenu = (title: string) => {
    setOpenSubmenu(prev => prev === title ? null : title);
  };

  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-100 transition-all duration-300 shadow-xl",
        isOpen ? "w-72" : "w-20"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header Logo */}
        <div className="p-6 flex items-center justify-between">
          {isOpen && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center">
                <Crown className="text-white w-5 h-5" />
              </div>
              <span className="font-black text-slate-900 tracking-tighter text-xl">GUOR .</span>
            </div>
          )}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Perfil */}
        {isOpen && (
          <div className="px-6 py-4 mb-4">
            <div className="bg-slate-50 rounded-[2rem] p-4 flex items-center gap-3 border border-slate-100">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-900 font-bold shrink-0">
                {usuario.nombre_completo?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-black text-slate-900 truncate uppercase tracking-tight">
                  {usuario.nombre_completo || 'Usuario'}
                </p>
                <p className="text-[10px] font-bold text-pink-600 uppercase tracking-widest italic">
                  {usuario.rol}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navegación */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const hasAccess = item.roles.includes(usuario.rol || '');
            const isSelected = item.href ? pathname?.startsWith(item.href) : false;
            const hasSubItems = !!(item.subItems && item.subItems.length > 0);
            const isSubmenuOpen = openSubmenu === item.title;

            if (!hasAccess) return null;

            return (
              <div key={item.title} className="space-y-1">
                {hasSubItems ? (
                  <button
                    onClick={() => toggleSubmenu(item.title)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all group",
                      isSubmenuOpen ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <item.icon size={22} className={cn(isSubmenuOpen ? "text-pink-500" : "group-hover:text-slate-900")} />
                    {isOpen && (
                      <>
                        <span className="flex-1 text-sm font-bold text-left">{item.title}</span>
                        <ChevronDown size={16} className={cn("transition-transform duration-200", isSubmenuOpen && "rotate-180")} />
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href || '#'}
                    className={cn(
                      "flex items-center gap-3 p-3.5 rounded-2xl transition-all group",
                      isSelected ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <item.icon size={22} className={cn(isSelected ? "text-pink-500" : "group-hover:text-slate-900")} />
                    {isOpen && <span className="text-sm font-bold">{item.title}</span>}
                  </Link>
                )}

                {/* Subitems */}
                {isOpen && hasSubItems && isSubmenuOpen && (
                  <div className="ml-6 space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                    {item.subItems?.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={cn(
                          "flex items-center gap-3 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border-l-2",
                          pathname === sub.href 
                            ? "text-pink-600 bg-pink-50 border-pink-500" 
                            : "text-slate-400 border-transparent hover:text-slate-900 hover:bg-slate-50"
                        )}
                      >
                        {sub.icon && <sub.icon size={14} />}
                        {sub.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3.5 rounded-2xl text-slate-500 hover:text-white hover:bg-slate-950 transition-all"
          >
            <LogOut size={22} />
            {isOpen && <span className="text-sm font-bold uppercase tracking-widest">Cerrar Sesión</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}