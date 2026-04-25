import { CheckCircle2, Package, UserCog, MessageSquare } from "lucide-react";

export function ActivityLog({ clienteId }: { clienteId: string }) {
  // Datos de ejemplo (esto vendría de una tabla 'logs_actividad')
  const actividades = [
    { id: 1, tipo: 'pedido', msg: 'Realizó un nuevo pedido #0452', fecha: 'Hoy, 10:30 AM', icon: <Package className="w-3 h-3"/>, color: 'text-blue-600 bg-blue-50' },
    { id: 2, tipo: 'sistema', msg: 'Actualizó su dirección de despacho', fecha: 'Ayer, 04:15 PM', icon: <UserCog className="w-3 h-3"/>, color: 'text-purple-600 bg-purple-50' },
    { id: 3, tipo: 'comentario', msg: 'Vendedor añadió nota: "Solicitó descuento por volumen"', fecha: '22 Abr, 2024', icon: <MessageSquare className="w-3 h-3"/>, color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Actividad Reciente</h3>
      <div className="space-y-6 relative before:absolute before:left-[13px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-100">
        {actividades.map((act) => (
          <div key={act.id} className="relative pl-8">
            <div className={`absolute left-0 p-1.5 rounded-full border border-white shadow-sm z-10 ${act.color}`}>
              {act.icon}
            </div>
            <div className="flex flex-col">
              <p className="text-xs font-bold text-slate-700 leading-none">{act.msg}</p>
              <p className="text-[10px] text-slate-400 mt-1.5 font-medium">{act.fecha}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}