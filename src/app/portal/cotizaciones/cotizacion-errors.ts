
import type { ConvertirError, RecotizarError } from './actions';

export function mensajeErrorConversion(error: ConvertirError): string {
    const mensajes: Record<ConvertirError, string> = {
        no_autenticado: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
        cotizacion_no_encontrada: 'La cotización no existe o fue eliminada.',
        cotizacion_no_pertenece_al_cliente: 'No tienes permiso para convertir esta cotización.',
        estado_no_convertible: 'Solo las cotizaciones aprobadas pueden convertirse en pedido.',
        ya_convertida: 'Esta cotización ya fue convertida en un pedido anteriormente.',
        sin_items: 'La cotización no tiene productos.',
        error_interno: 'Ocurrió un error inesperado. Intenta nuevamente.',
    };
    return mensajes[error] ?? 'Error desconocido.';
}

export function mensajeErrorRecotizacion(error: RecotizarError): string {
    const mensajes: Record<RecotizarError, string> = {
        no_autenticado: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
        cliente_no_encontrado: 'No se encontró tu perfil de cliente.',
        cliente_inactivo: 'Tu cuenta está inactiva. Contacta a soporte.',
        cotizacion_no_encontrada: 'La cotización no existe o fue eliminada.',
        cotizacion_sin_items: 'La cotización no tiene productos para recotizar.',
        estado_no_recotizable: 'Esta cotización no puede recotizarse en su estado actual.',
        sin_variantes_activas: 'Todos los productos de esta cotización fueron dados de baja del catálogo.',
        error_interno: 'Ocurrió un error inesperado. Intenta nuevamente.',
    };
    return mensajes[error] ?? 'Error desconocido.';
}