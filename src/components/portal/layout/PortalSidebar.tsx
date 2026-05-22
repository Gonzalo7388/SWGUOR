'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard, FileText, ShoppingBag, ShoppingCart, Truck,
  PanelLeftClose, Package, PanelLeft, LogOut,
  Settings, UserCircle, PackageOpen,
} from 'lucide-react';

import { getSupabaseBrowserClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const MENU_GROUPS = [
  {
    group: 'Menú Principal',
    items: [{ href: '/portal/dashboard', label: 'Inicio', icon: LayoutDashboard }],
  },
  {
    group: 'Comercial',
    items: [
      { href: '/portal/productos', label: 'Catálogo', icon: ShoppingBag },
      { href: '/portal/compras', label: 'Confirmar compra', icon: ShoppingCart },
      { href: '/portal/cotizaciones/solicitar', label: 'Solicitar cotización', icon: FileText },
      { href: '/portal/cotizaciones', label: 'Mis cotizaciones', icon: FileText },
      { href: '/portal/pedidos', label: 'Mis pedidos', icon: Package },
    ],
  },
  {
    group: 'Logística & Despachos',
    items: [
      { href: '/portal/seguimiento-pedido', label: 'Trazabilidad', icon: Truck },
      { href: '/portal/despachos', label: 'Envíos', icon: PackageOpen },

    ],
  },
  {
    group: 'Cuenta',
    items: [
      { href: '/portal/perfil', label: 'Mi Perfil', icon: UserCircle },
      { href: '/portal/configuracion', label: 'Ajustes', icon: Settings },
    ],
  },
];

interface PortalSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function PortalSidebar({ collapsed, onToggle }: PortalSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await getSupabaseBrowserClient().auth.signOut();
    router.replace('/auth/login');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full flex flex-col z-40 transition-all duration-500 ease-in-out',
        'bg-[#0f172a] text-slate-200 border-r border-white/5',
        collapsed ? 'w-20' : 'w-72',
      )}
    >
      {/* ── Logo Section ── */}
      <div className="flex items-center h-24 px-6 mb-4">
        {!collapsed ? (
          <div className="flex items-center gap-4 flex-1 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="relative w-12 h-12 bg-white/5 rounded-2xl p-2 border border-white/10">
              <Image src="/logo.png" alt="Logo" fill className="object-contain p-1" priority />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg tracking-tight leading-none">GUOR <span className="text-[#d4af37]">PRO</span></span>
              <span className="text-slate-500 text-[10px] font-medium tracking-[0.2em] uppercase mt-1">Portal Corporativo</span>
            </div>
          </div>
        ) : (
          <div className="relative w-10 h-10 mx-auto bg-white/5 rounded-xl p-1.5 border border-white/10">
            <Image src="/logo.png" alt="Logo" fill className="object-contain" priority />
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto custom-scrollbar space-y-8">
        {MENU_GROUPS.map((group) => (
          <div key={group.group} className="space-y-2">
            {!collapsed && (
              <h3 className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.15em] mb-3 px-3 opacity-80">
                {group.group}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-[13.5px] font-medium transition-all duration-300 relative group',
                      active
                        ? 'bg-gradient-to-r from-[#d4af37]/20 to-transparent text-white border-l-2 border-[#d4af37]'
                        : 'text-slate-400 hover:text-white hover:bg-white/5',
                    )}
                  >
                    <item.icon
                      size={18}
                      className={cn(
                        'transition-transform duration-300 group-hover:scale-110',
                        active ? 'text-[#d4af37]' : 'text-slate-500 group-hover:text-slate-300',
                      )}
                    />
                    {!collapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {active && !collapsed && (
                      <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[#d4af37] shadow-[0_0_10px_#d4af37]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer / Logout ── */}
      <div className="p-4 mt-auto">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 mb-2 rounded-lg bg-white/5 text-slate-500 hover:text-white transition-colors"
        >
          {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>

        <div className="pt-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-semibold transition-all duration-300',
              'text-slate-500 hover:text-rose-400 hover:bg-rose-400/5',
              collapsed && 'justify-center',
            )}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
