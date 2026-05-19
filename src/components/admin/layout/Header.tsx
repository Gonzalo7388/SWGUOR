'use client';

import { ChevronRight, Home, User } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { usuarios, personal_interno, clientes } from "@prisma/client";
import { NotificationDropdown } from "./NotificationDropdown";

// El nombre_completo ya no está en usuarios — viene de personal_interno o clientes
interface AdminHeaderProps {
  usuario: usuarios & {
    personal_interno?: Pick<personal_interno, 'nombre_completo'>[];
    clientes?:         Pick<clientes, 'razon_social'>[];
  };
}

export default function AdminHeader({ usuario }: AdminHeaderProps) {
  const pathname = usePathname();

  // Resolver el nombre a mostrar: personal_interno > clientes.razon_social > email
  const nombreDisplay =
    usuario.personal_interno?.[0]?.nombre_completo ??
    usuario.clientes?.[0]?.razon_social             ??
    usuario.email;

  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(path => path && path !== 'admin' && path !== 'Panel-Administrativo');
    return paths.map((path, index) => {
      const label  = path.replace(/-/g, ' ').replace(/_/g, ' ');
      const isLast = index === paths.length - 1;
      return (
        <div key={path} className="flex items-center">
          <ChevronRight className="w-4 h-4 text-gray-400 mx-1 shrink-0" />
          <span className={`text-sm font-medium capitalize ${isLast ? "text-rose-600 font-semibold" : "text-gray-500"}`}>
            {label}
          </span>
        </div>
      );
    });
  };

  return (
    <header className="admin-topbar sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/80 backdrop-blur-md px-4 lg:px-8 shadow-sm">
      <div className="flex flex-1 items-center justify-between">

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2">
          <div className="w-10 lg:hidden" />
          <nav className="hidden md:flex items-center text-gray-500">
            <Link href="/admin/Panel-Administrativo/dashboard" className="hover:text-rose-500 transition-colors">
              <Home className="w-4 h-4" />
            </Link>
            {generateBreadcrumbs()}
          </nav>
        </div>

        {/* Usuario */}
        <div className="flex items-center gap-2 sm:gap-4">
          <NotificationDropdown />
          <div className="h-8 w-px bg-gray-200 mx-1 hidden sm:block" />

          <Link
            href="/admin/Panel-Administrativo/perfil"
            className="admin-user-link group flex items-center gap-3 p-1 pr-2 rounded-xl transition-all duration-200 hover:bg-amber-50 cursor-pointer"
          >
            <div className="hidden sm:flex flex-col items-end transition-transform group-hover:-translate-x-1">
              <span className="admin-user-name text-sm font-bold text-gray-800 leading-none group-hover:text-black transition-colors">
                {nombreDisplay}
              </span>
              <span className="admin-user-role text-[10px] font-medium text-gray-400 uppercase tracking-tighter group-hover:text-black/70 transition-colors">
                {usuario.rol?.replace('_', ' ')}
              </span>
            </div>

            <div className="admin-user-avatar relative w-9 h-9 rounded-xl bg-rose-500 overflow-hidden shadow-md">
              <span className="flex items-center justify-center h-full text-white font-bold">
                <User className="w-4 h-4" />
              </span>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}