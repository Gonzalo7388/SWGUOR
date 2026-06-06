import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import type { AccionAuditoria } from '@prisma/client';

interface RegistrarAuditoriaProps {
    usuarioId: number | null;
    accion: AccionAuditoria;
    tabla: string;
    registroId: number;
    datosAntes?: any;
    datosDespues?: any;
}

export async function registrarAuditoria({
    usuarioId,
    accion,
    tabla,
    registroId,
    datosAntes = null,
    datosDespues = null,
}: RegistrarAuditoriaProps) {
    try {
        const supabase = await createClient();
        const headersList = await headers();

        // 1. Extraer User Agent de forma segura
        const userAgent = headersList.get('user-agent') || 'Desconocido';

        // 2. Extraer IP real (Soporta Vercel, Cloudflare, Proxies y Localhost)
        const forwardedFor = headersList.get('x-forwarded-for');
        let ipAddress = '127.0.0.1';

        if (forwardedFor) {
            ipAddress = forwardedFor.split(',')[0].trim();
        }

        // 3. Insertar datos usando el cliente de Supabase
        const { error } = await supabase
            .from('auditoria')
            .insert({
                usuario_id: usuarioId,
                accion: accion,
                tabla: tabla,
                registro_id: registroId,
                datos_antes: datosAntes, // Supabase procesa los objetos JSON automáticamente
                datos_despues: datosDespues,
                ip_address: ipAddress,
                user_agent: userAgent
            });

        if (error) {
            throw error;
        }

        console.log(`[AUDITORIA LOG] Acción: ${accion} en Tabla: ${tabla} por IP: ${ipAddress}`);
    } catch (error) {
        console.error('Error crítico registrando bitácora de auditoría:', error);
    }
}