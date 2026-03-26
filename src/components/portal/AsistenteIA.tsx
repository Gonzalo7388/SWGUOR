'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Loader2, MessageSquare, X, Send, Phone, ArrowRight } from 'lucide-react';
import { usePortal } from '@/app/portal/_contexts/PortalContext';
import { cn } from '@/lib/utils';

export function AsistenteIA() {
  const { cliente } = usePortal();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [chat, setChat] = useState([
    { role: 'bot', content: 'Hola. Soy el asistente de GUOR. Puedo ayudarle con el estado de sus pedidos, consultas de stock o informacion sobre escalas de precios.' }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const PREGUNTAS_FRECUENTES = [
    { label: 'Consultar mis cotizaciones', prompt: 'Deseo saber el estado de mis ultimas cotizaciones.' },
    { label: 'Descuentos por mayor', prompt: '¿Cuales son las escalas de descuentos por volumen de compra?' },
    { label: 'Plazos de entrega', prompt: '¿Cual es el tiempo estimado de entrega para Lima y provincias?' },
    { label: 'Stock disponible', prompt: '¿Tienen disponibilidad de los modelos de temporada actual?' },
  ];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chat, loading]);

  const enviarMensaje = async (texto: string) => {
    if (!texto.trim()) return;

    setChat(prev => [...prev, { role: 'user', content: texto }]);
    setMensaje('');
    setLoading(true);

    try {
      const res = await fetch('/api/portal/chat', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            messages: [
            ...chat.map(m => ({ 
              role: m.role === 'user' ? 'user' : 'model', 
              content: m.content 
            })),
            { role: 'user', content: texto }
          ],
          cliente_id: cliente?.id 
        }),
      });

      if (!res.ok) throw new Error('Error en el servidor');

      const data = await res.json();
      
      // Tu API devuelve { text: "respuesta" }, así que leemos data.text
      setChat(prev => [...prev, { role: 'bot', content: data.text }]);
    } catch (error) {
      console.error("Error al enviar:", error);
      setChat(prev => [...prev, { role: 'bot', content: 'Error de conexion. Por favor, intente mas tarde.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[9999] flex flex-col items-end gap-4">
      {/* Boton WhatsApp */}
      <a 
        href="https://wa.me/51999999999" 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform border-4 border-white"
      >
        <Phone size={24} />
      </a>

      {/* Ventana de Chat */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[360px] h-[550px] bg-white rounded-[32px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
          
          {/* Header */}
          <div className="p-5 bg-slate-900 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-blue-400" />
              <span className="font-black text-xs uppercase tracking-widest">Analista GUOR IA</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:opacity-70 transition-opacity">
              <X size={20} />
            </button>
          </div>
          
          {/* Cuerpo del Chat */}
          <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto bg-slate-50 space-y-4">
            {chat.map((m, i) => (
              <div key={i} className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm",
                  m.role === 'user' 
                    ? "bg-blue-600 text-white rounded-br-none" 
                    : "bg-white border border-slate-100 text-slate-700 rounded-bl-none"
                )}>
                  {m.content}
                </div>
              </div>
            ))}

            {/* Sugerencias iniciales */}
            {chat.length < 3 && (
              <div className="pt-4 space-y-2 animate-in fade-in duration-700">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Consultas sugeridas</p>
                {PREGUNTAS_FRECUENTES.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => enviarMensaje(q.prompt)}
                    className="w-full text-left p-3 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm flex items-center justify-between group"
                  >
                    {q.label}
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
            
            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <Loader2 size={14} className="animate-spin" />
                <span>Consultando informacion...</span>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <form 
            onSubmit={(e) => { e.preventDefault(); enviarMensaje(mensaje); }} 
            className="p-4 bg-white border-t flex gap-2 items-center"
          >
            <input 
              className="flex-1 bg-slate-100 rounded-2xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              placeholder="Escriba su consulta aqui..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
            />
            <button 
              type="submit"
              className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-900/10"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Boton Principal Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl border-4 border-white transition-all active:scale-90",
          isOpen ? "bg-white text-slate-900" : "bg-slate-900 text-white hover:bg-blue-600"
        )}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>
    </div>
  );
}