'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard, FileText, ShoppingBag, Truck,
  PanelLeftClose, Package, PanelLeft, LogOut,
  Settings, UserCircle
} from 'lucide-react';

import { getSupabaseBrowserClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const MENU_GROUPS = [
  {
    group: 'General',
    items: [{ href: '/portal/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    group: 'Comercial',
    items: [
      { href: '/portal/productos',    label: 'Catálogo',    icon: ShoppingBag },
      { href: '/portal/cotizaciones', label: 'Cotizaciones', icon: FileText },
      { href: '/portal/ordenes',      label: 'Mis órdenes', icon: Package },
    ],
  },
  {
    group: 'Logística',
    items: [{ href: '/portal/despachos', label: 'Seguimiento', icon: Truck }],
  },
  {
    group: 'Soporte',
    items: [
      { href: '/portal/perfil',         label: 'Mi Perfil',      icon: UserCircle },
      { href: '/portal/configuracion',  label: 'Configuración',  icon: Settings },
    ],
  },
];

interface PortalSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function PortalSidebar({ collapsed, onToggle }: PortalSidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();

  const handleLogout = async () => {
    await getSupabaseBrowserClient().auth.signOut();
    router.replace('/auth/login');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full flex flex-col z-40 shadow-xl transition-all duration-300',
        'border-r border-[#e4c28a]/30',
        // Fondo oscuro cálido de la paleta
        'bg-[#231e1d]',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* ── Logo ── */}
      <div className="flex items-center h-20 px-4 border-b border-[#e4c28a]/20 bg-[#1a1614]">
        {!collapsed ? (
          <div className="flex items-center gap-3 flex-1 animate-in fade-in duration-300">
            <div className="relative w-12 h-12 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="leading-tight">
              <span className="text-[#e4c28a] font-bold text-sm tracking-wide block">GUOR PRO</span>
              <span className="text-[#b5854b] text-[10px] tracking-widest uppercase">Portal Cliente</span>
            </div>
          </div>
        ) : (
          <div className="relative w-9 h-9 mx-auto">
            <Image src="/logo.png" alt="Logo" fill className="object-contain" priority />
          </div>
        )}

        <button
          onClick={onToggle}
          className={cn(
            'text-[#b5854b] hover:text-[#e4c28a] p-1.5 transition-colors flex-shrink-0',
            collapsed && 'absolute bottom-3 right-0 left-0 mx-auto w-fit',
          )}
        >
          {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* ── Navegación ── */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto space-y-7">
        {MENU_GROUPS.map((group) => (
          <div key={group.group}>
            {!collapsed && (
              <h3 className="text-[9px] uppercase font-bold text-[#b5854b]/60 tracking-[0.25em] mb-2.5 px-3 animate-in fade-in">
                {group.group}
              </h3>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group',
                      active
                        ? 'bg-[#b5854b] text-[#fff4e2]'
                        : 'text-[#e4c28a]/60 hover:text-[#e4c28a] hover:bg-[#e4c28a]/10',
                    )}
                  >
                    <item.icon
                      size={17}
                      className={cn(
                        'flex-shrink-0',
                        active ? 'text-[#fff4e2]' : 'text-[#b5854b]/70 group-hover:text-[#e4c28a]',
                      )}
                    />
                    {!collapsed && (
                      <span className="flex-1 whitespace-nowrap">{item.label}</span>
                    )}
                    {active && !collapsed && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#fff4e2]/70 flex-shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Logout ── */}
      <div className="p-3 border-t border-[#e4c28a]/15">
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-xs font-semibold',
            'text-[#b5854b]/50 hover:text-[#fbddd3] hover:bg-[#fbddd3]/10 transition-all',
            collapsed && 'justify-center',
          )}
        >
          <LogOut size={16} />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}