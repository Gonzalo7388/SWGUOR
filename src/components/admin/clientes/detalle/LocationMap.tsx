import { MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LocationMap({ direccion, ciudad }: { direccion: string; ciudad?: string }) {
  // Formateamos la URL para Google Maps
  const mapQuery = encodeURIComponent(`${direccion}, ${ciudad}`);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <div className="mt-4 space-y-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ubicación Logística</p>
      <div className="relative h-32 w-full rounded-xl overflow-hidden border border-slate-200 group">
        {/* Placeholder de Mapa Estético (puedes reemplazar src con tu API Key de Google Static Maps) */}
        <img 
          src={`https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=60&w=500`} 
          alt="Mapa de ubicación"
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-blue-600/10 group-hover:bg-transparent transition-colors" />
        
        <Button 
          variant="secondary" 
          size="sm" 
          className="absolute bottom-2 right-2 h-7 text-[10px] gap-1 shadow-lg"
          onClick={() => window.open(googleMapsUrl, '_blank')}
        >
          <ExternalLink size={12} /> Ver en Maps
        </Button>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
        <MapPin size={12} className="text-blue-500" />
        <span className="truncate">{direccion}</span>
      </div>
    </div>
  );
}