'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Loader2, MessageSquare, X, Send, Phone, ArrowRight } from 'lucide-react';
import { usePortal } from '@/app/portal/_contexts/PortalContext';
import { cn } from '@/lib/utils';

type ChatMessage = { role: 'user' | 'bot'; content: string };

const MENSAJE_INICIAL: ChatMessage = {
  role: 'bot',
  content: 'Hola. Soy el asistente de GUOR. Puedo ayudarle con el estado de sus pedidos, consultas de stock o información sobre escalas de precios.',
};

const PREGUNTAS_FRECUENTES = [
  { label: 'Consultar mis cotizaciones',  prompt: 'Deseo saber el estado de mis últimas cotizaciones.' },
  { label: 'Descuentos por mayor',        prompt: '¿Cuáles son las escalas de descuentos por volumen de compra?' },
  { label: 'Plazos de entrega',           prompt: '¿Cuál es el tiempo estimado de entrega para Lima y provincias?' },
  { label: 'Stock disponible',            prompt: '¿Tienen disponibilidad de los modelos de temporada actual?' },
];

export function AsistenteIA() {
  const { cliente } = usePortal();
  const [isOpen,  setIsOpen]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [chat,    setChat]    = useState<ChatMessage[]>([MENSAJE_INICIAL]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat, loading]);

  const enviarMensaje = async (texto: string) => {
    const textoTrimmed = texto.trim();
    if (!textoTrimmed || loading) return;

    // Agregar mensaje del usuario al chat local
    const nuevoChat: ChatMessage[] = [...chat, { role: 'user', content: textoTrimmed }];
    setChat(nuevoChat);
    setMensaje('');
    setLoading(true);

    try {
      // Construir historial para la API:
      // - Excluir el mensaje inicial del bot (lo maneja el system prompt de la API)
      // - Mapear roles: 'bot' → 'model', 'user' → 'user'
      const historialParaAPI = nuevoChat
        .slice(1) // omitir el mensaje de bienvenida (lo maneja la API internamente)
        .map(m => ({
          role:    m.role === 'user' ? 'user' : 'model',
          content: m.content,
        }));

      const res = await fetch('/api/portal/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          messages:   historialParaAPI,
          cliente_id: cliente?.id,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        // Error de autenticación
        if (res.status === 401) {
          setChat(prev => [...prev, {
            role: 'bot',
            content: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente para continuar.',
          }]);
          return;
        }
        throw new Error(errData.error || `Error ${res.status}`);
      }

      const data = await res.json();

      if (!data.text) throw new Error('Respuesta vacía del servidor');

      setChat(prev => [...prev, { role: 'bot', content: data.text }]);
    } catch (error: any) {
      console.error('[AsistenteIA] Error:', error);
      setChat(prev => [...prev, {
        role: 'bot',
        content: 'Error de conexión. Por favor, intente más tarde.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje(mensaje);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[9999] flex flex-col items-end gap-4">

      {/* Botón WhatsApp */}
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
                  "max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm whitespace-pre-wrap",
                  m.role === 'user'
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white border border-slate-100 text-slate-700 rounded-bl-none"
                )}>
                  {m.content}
                </div>
              </div>
            ))}

            {/* Sugerencias iniciales — solo cuando solo está el mensaje de bienvenida */}
            {chat.length === 1 && (
              <div className="pt-4 space-y-2 animate-in fade-in duration-700">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Consultas sugeridas</p>
                {PREGUNTAS_FRECUENTES.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => enviarMensaje(q.prompt)}
                    disabled={loading}
                    className="w-full text-left p-3 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm flex items-center justify-between group disabled:opacity-50"
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
                <span>Consultando información...</span>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <div className="p-4 bg-white border-t flex gap-2 items-center">
            <input
              className="flex-1 bg-slate-100 rounded-2xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              placeholder="Escriba su consulta aquí..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              onClick={() => enviarMensaje(mensaje)}
              disabled={loading || !mensaje.trim()}
              className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      )}

      {/* Botón Principal Toggle */}
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