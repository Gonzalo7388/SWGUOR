'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Send, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type MensajeChat = {
  id: string;
  pedido_id: string;
  usuario_id: number | null;
  emisor: string;
  contenido: string;
  solicita_humano: boolean;
  created_at: string;
};

interface Props {
  pedidoId: number | string;
}

function mensajeBienvenida(pedidoId: number | string): string {
  return `Hola, soy el asistente virtual de GUOR. Veo que tu pedido #${pedidoId} está en proceso. ¿En qué te puedo ayudar?`;
}

function esCliente(emisor: string): boolean {
  return emisor.toLowerCase() === 'cliente';
}

function etiquetaEmisor(emisor: string): string {
  const e = emisor.toLowerCase();
  if (e === 'admin') return 'Soporte GUOR';
  if (e === 'bot') return 'Asistente GUOR';
  return 'Tú';
}

export function ChatAsistenciaCliente({ pedidoId }: Props) {
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [texto, setTexto] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollAlFinal = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      setCargandoHistorial(true);
      try {
        const res = await fetch(`/api/pedidos/${pedidoId}/chat`, { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error ?? 'No se pudo cargar el chat');
        }
        if (activo) {
          setMensajes(Array.isArray(json.data) ? json.data : []);
        }
      } catch (e: unknown) {
        if (activo) {
          toast.error(e instanceof Error ? e.message : 'Error al cargar asistencia');
        }
      } finally {
        if (activo) setCargandoHistorial(false);
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, [pedidoId]);

  useEffect(() => {
    scrollAlFinal();
  }, [mensajes, enviando, cargandoHistorial, scrollAlFinal]);

  const enviarPost = async (contenido: string, solicita_humano: boolean) => {
    const res = await fetch(`/api/pedidos/${pedidoId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contenido,
        emisor: 'cliente',
        solicita_humano,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message ?? json.error ?? 'No se pudo enviar el mensaje');
    }
    if (Array.isArray(json.data)) {
      setMensajes(json.data);
    }
  };

  const handleEnviar = async () => {
    const contenido = texto.trim();
    if (!contenido || enviando) return;

    setTexto('');
    setEnviando(true);
    try {
      await enviarPost(contenido, false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al enviar');
      setTexto(contenido);
    } finally {
      setEnviando(false);
    }
  };

  const handleContactarHumano = async () => {
    if (enviando) return;
    setEnviando(true);
    try {
      await enviarPost('Solicito contacto con un asesor humano.', true);
      toast.success('Un asesor será notificado por este mismo canal.');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'No se pudo solicitar asesor');
    } finally {
      setEnviando(false);
    }
  };

  const mostrarBienvenida = !cargandoHistorial && mensajes.length === 0;

  return (
    <div className="flex flex-col rounded-xl border border-[#e4c28a]/25 bg-[#fffdf8] overflow-hidden min-h-[420px]">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[280px] max-h-[min(52vh,480px)]"
      >
        {cargandoHistorial && (
          <div className="flex items-center justify-center py-12 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-[#b5854b] mr-2" />
            <span className="text-sm">Cargando conversación...</span>
          </div>
        )}

        {mostrarBienvenida && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white border border-stone-200 px-4 py-3 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1">
                Asistente GUOR
              </p>
              <p className="text-sm text-stone-700 leading-relaxed">
                {mensajeBienvenida(pedidoId)}
              </p>
            </div>
          </div>
        )}

        {mensajes.map((m) => {
          const cliente = esCliente(m.emisor);
          return (
            <div
              key={m.id}
              className={cn('flex', cliente ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-3 shadow-sm',
                  cliente
                    ? 'rounded-tr-sm bg-violet-600 text-white'
                    : 'rounded-tl-sm bg-white border border-stone-200 text-stone-800',
                )}
              >
                <p
                  className={cn(
                    'text-[10px] font-black uppercase tracking-wider mb-1',
                    cliente ? 'text-violet-200' : 'text-stone-400',
                  )}
                >
                  {etiquetaEmisor(m.emisor)}
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.contenido}</p>
              </div>
            </div>
          );
        })}

        {enviando && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-sm bg-stone-100 border border-stone-200 px-4 py-3 flex items-center gap-2 text-stone-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              El asistente está respondiendo...
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-[#e4c28a]/20 bg-white p-4 space-y-3">
        <div className="flex gap-2">
          <Input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleEnviar();
              }
            }}
            placeholder="Escribe tu consulta sobre este pedido..."
            disabled={enviando}
            className="rounded-xl border-stone-200 text-sm"
          />
          <Button
            type="button"
            onClick={handleEnviar}
            disabled={enviando || !texto.trim()}
            className="rounded-xl bg-[#231e1d] hover:bg-violet-700 text-[#e4c28a] shrink-0 px-4"
          >
            {enviando ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 mr-1.5" />
                Enviar
              </>
            )}
          </Button>
        </div>
        <button
          type="button"
          onClick={handleContactarHumano}
          disabled={enviando}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-violet-700 transition-colors disabled:opacity-50"
        >
          <UserRound className="w-3.5 h-3.5" />
          Contactar a un humano
        </button>
      </div>
    </div>
  );
}
