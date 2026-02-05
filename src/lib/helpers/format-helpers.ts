/**
 * Helpers para formateo de datos
 * Funciones para formatear moneda, fechas, números, etc.
 */

import { format, formatDistance, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatear moneda a soles peruanos
 */
export function formatearMoneda(valor: number, mostrarSimbolo: boolean = true): string {
  const formateado = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor);

  return mostrarSimbolo ? formateado : formateado.replace('S/.', '').trim();
}

/**
 * Formatear número con separadores de miles
 */
export function formatearNumero(
  valor: number,
  decimales: number = 2,
  separador: string = ','
): string {
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales
  }).format(valor);
}

/**
 * Formatear porcentaje
 */
export function formatearPorcentaje(valor: number, decimales: number = 2): string {
  return `${(valor * 100).toFixed(decimales)}%`;
}

/**
 * Formatear fecha al formato DD/MM/YYYY
 */
export function formatearFecha(fecha: string | Date, incluirHora: boolean = false): string {
  try {
    let fechaParse: Date;

    if (typeof fecha === 'string') {
      fechaParse = parseISO(fecha);
    } else {
      fechaParse = fecha;
    }

    if (!isValid(fechaParse)) return '';

    const patron = incluirHora ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy';
    return format(fechaParse, patron, { locale: es });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return '';
  }
}

/**
 * Formatear fecha corta (Ene 15, 2024)
 */
export function formatearFechaCorta(fecha: string | Date): string {
  try {
    let fechaParse: Date;

    if (typeof fecha === 'string') {
      fechaParse = parseISO(fecha);
    } else {
      fechaParse = fecha;
    }

    if (!isValid(fechaParse)) return '';

    return format(fechaParse, 'MMM dd, yyyy', { locale: es });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return '';
  }
}

/**
 * Formatear fecha con hora completa
 */
export function formatearFechaHora(fecha: string | Date): string {
  return formatearFecha(fecha, true);
}

/**
 * Obtener distancia relativa entre fechas (ej: "hace 2 horas")
 */
export function formatearDistanciaFecha(fecha: string | Date): string {
  try {
    let fechaParse: Date;

    if (typeof fecha === 'string') {
      fechaParse = parseISO(fecha);
    } else {
      fechaParse = fecha;
    }

    if (!isValid(fechaParse)) return '';

    return formatDistance(fechaParse, new Date(), {
      locale: es,
      addSuffix: true
    });
  } catch (error) {
    console.error('Error formateando distancia:', error);
    return '';
  }
}

/**
 * Formatear RUC (11 dígitos)
 */
export function formatearRUC(ruc: string | number): string {
  const rucStr = ruc.toString().padStart(11, '0');
  if (rucStr.length !== 11) return rucStr;
  return `${rucStr.slice(0, 2)}-${rucStr.slice(2, 10)}-${rucStr.slice(10)}`;
}

/**
 * Formatear teléfono peruano
 */
export function formatearTelefono(telefono: string | number): string {
  const teleStr = telefono.toString().replace(/\D/g, '');

  if (teleStr.length === 9) {
    return `(${teleStr.slice(0, 3)}) ${teleStr.slice(3, 6)}-${teleStr.slice(6)}`;
  } else if (teleStr.length === 11 && teleStr.startsWith('51')) {
    const sinPais = teleStr.slice(2);
    return `(${sinPais.slice(0, 3)}) ${sinPais.slice(3, 6)}-${sinPais.slice(6)}`;
  }

  return teleStr;
}

/**
 * Formatear nombre propio (primera letra mayúscula)
 */
export function formatearNombrePropio(nombre: string): string {
  return nombre
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Truncar texto con puntos suspensivos
 */
export function truncarTexto(texto: string, longitud: number = 50): string {
  if (texto.length <= longitud) return texto;
  return `${texto.slice(0, longitud)}...`;
}

/**
 * Formatear cantidad de items (singular/plural)
 */
export function formatearItems(cantidad: number, singular: string, plural: string): string {
  return cantidad === 1 ? `${cantidad} ${singular}` : `${cantidad} ${plural}`;
}

/**
 * Formatear peso/talla
 */
export function formatearTalla(talla: string): string {
  const tallaMap: Record<string, string> = {
    'XS': 'Extra Pequeño',
    'S': 'Pequeño',
    'M': 'Mediano',
    'L': 'Grande',
    'XL': 'Extra Grande',
    'XXL': 'Extra Extra Grande'
  };

  return tallaMap[talla.toUpperCase()] || talla;
}

/**
 * Capitalizar primera letra
 */
export function capitalizarPrimera(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

/**
 * Formatear estado para mostrar (solicitado -> Solicitado)
 */
export function formatearEstado(estado: string): string {
  return estado
    .split('_')
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ');
}

/**
 * Formatear URL de imagen con validación
 */
export function formatearUrlImagen(url: string | null | undefined): string {
  if (!url) return '/placeholder-image.png';
  if (url.startsWith('http')) return url;
  return `/uploads/${url}`;
}

/**
 * Obtener iniciales de un nombre
 */
export function obtenerIniciales(nombre: string): string {
  return nombre
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

/**
 * Formatear duración en tiempo (minutos, horas, días)
 */
export function formatearDuracion(minutos: number): string {
  if (minutos < 60) {
    return `${minutos}m`;
  }

  const horas = Math.floor(minutos / 60);
  if (horas < 24) {
    return `${horas}h`;
  }

  const dias = Math.floor(horas / 24);
  return `${dias}d`;
}

/**
 * Formatear bytes a KB, MB, GB
 */
export function formatearTamaño(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
