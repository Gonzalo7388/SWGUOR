import { 
  PlusCircle, FileDown, Ban, MoreVertical, Mail 
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function CustomerQuickActions() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 h-9 rounded-xl gap-2 text-xs font-bold shadow-sm shadow-blue-200">
        <PlusCircle size={16} /> Nuevo Pedido
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200 text-slate-500">
            <MoreVertical size={18} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
          <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400 px-2 py-1.5">Gestión de Cliente</DropdownMenuLabel>
          <DropdownMenuItem className="rounded-lg gap-2 text-xs cursor-pointer py-2">
            <FileDown size={14} className="text-slate-400" /> Descargar Historial (PDF)
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-lg gap-2 text-xs cursor-pointer py-2">
            <Mail size={14} className="text-slate-400" /> Enviar Mensaje al Portal
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="rounded-lg gap-2 text-xs cursor-pointer py-2 text-red-600 focus:text-red-600 focus:bg-red-50">
            <Ban size={14} /> Suspender Acceso
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}