import prisma from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/serialize';
import { NextResponse } from 'next/server';

// Claves de configuración por defecto
const CONFIG_DEFAULTS: Record<string, { valor: string; categoria: string; descripcion: string; tipo_dato: string }> = {
  // Empresa
  'empresa_nombre': { valor: 'GUOR - Modas y Estilos', categoria: 'empresa', descripcion: 'Nombre de la empresa', tipo_dato: 'string' },
  'empresa_ruc': { valor: '20123456789', categoria: 'empresa', descripcion: 'RUC de la empresa', tipo_dato: 'string' },
  'empresa_telefono': { valor: '+51 987654321', categoria: 'empresa', descripcion: 'Teléfono de contacto', tipo_dato: 'string' },
  'empresa_email': { valor: 'info@guor.com', categoria: 'empresa', descripcion: 'Email corporativo', tipo_dato: 'string' },
  'empresa_direccion': { valor: 'Av. Principal 123, Lima', categoria: 'empresa', descripcion: 'Dirección fiscal', tipo_dato: 'string' },
  'empresa_ciudad': { valor: 'Lima', categoria: 'empresa', descripcion: 'Ciudad', tipo_dato: 'string' },
  'empresa_pais': { valor: 'Perú', categoria: 'empresa', descripcion: 'País', tipo_dato: 'string' },

  // Tienda
  'tienda_nombre': { valor: 'GUOR Shop', categoria: 'tienda', descripcion: 'Nombre de la tienda', tipo_dato: 'string' },
  'tienda_descripcion': { valor: 'Tienda de ropa y textiles', categoria: 'tienda', descripcion: 'Descripción', tipo_dato: 'string' },
  'tienda_moneda': { valor: 'PEN', categoria: 'tienda', descripcion: 'Moneda por defecto', tipo_dato: 'string' },
  'tienda_zona_horaria': { valor: 'America/Lima', categoria: 'tienda', descripcion: 'Zona horaria', tipo_dato: 'string' },

  // Impuestos
  'impuesto_igv': { valor: '18', categoria: 'impuestos', descripcion: 'Porcentaje de IGV', tipo_dato: 'number' },
  'impuesto_descuento_default': { valor: '0', categoria: 'impuestos', descripcion: 'Descuento por defecto %', tipo_dato: 'number' },

  // Producción
  'produccion_moq_default': { valor: '400', categoria: 'produccion', descripcion: 'MOQ por defecto', tipo_dato: 'number' },
  'produccion_stock_alert_pct': { valor: '20', categoria: 'produccion', descripcion: '% stock mínimo para alerta', tipo_dato: 'number' },
};

// GET: Leer toda la configuración agrupada por categoría
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoria = searchParams.get('categoria');

    const where: Record<string, unknown> = {};
    if (categoria) where.categoria = categoria;

    const configs = await prisma.configuracion_sistema.findMany({
      where,
      orderBy: [{ categoria: 'asc' }, { clave: 'asc' }],
    });

    // Si no hay registros, inicializar con valores por defecto
    if (configs.length === 0) {
      await inicializarConfiguracion();
      const configsInit = await prisma.configuracion_sistema.findMany({
        orderBy: [{ categoria: 'asc' }, { clave: 'asc' }],
      });
      return NextResponse.json(serializeBigInt({
        data: agruparPorCategoria(configsInit),
        flat: serializeBigInt(configsInit),
      }));
    }

    return NextResponse.json(serializeBigInt({
      data: agruparPorCategoria(configs),
      flat: serializeBigInt(configs),
    }));
  } catch (error: any) {
    console.error('Error fetching configuracion:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Actualizar uno o varios ajustes
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { settings, updated_by } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Se requiere un objeto "settings" con las claves a actualizar' },
        { status: 400 }
      );
    }

    const entries = Object.entries(settings);

    // Validar que las claves existan
    const existingConfigs = await prisma.configuracion_sistema.findMany({
      where: { clave: { in: entries.map(([k]) => k) } },
    });

    const existingKeys = new Set(existingConfigs.map((c) => c.clave));

    // Actualizar existentes
    const updates = entries
      .filter(([key]) => existingKeys.has(key))
      .map(([clave, valor]) =>
        prisma.configuracion_sistema.update({
          where: { clave },
          data: {
            valor: String(valor),
            updated_by: updated_by ?? null,
          },
        })
      );

    // Crear las que no existan
    const creates = entries
      .filter(([key]) => !existingKeys.has(key))
      .map(([clave, valor]) => {
        const def = CONFIG_DEFAULTS[clave];
        return prisma.configuracion_sistema.create({
          data: {
            clave,
            valor: String(valor),
            categoria: def?.categoria ?? 'general',
            descripcion: def?.descripcion ?? null,
            tipo_dato: def?.tipo_dato ?? 'string',
            updated_by: updated_by ?? null,
          },
        });
      });

    const results = await prisma.$transaction([...updates, ...creates]);

    // Devolver configuración actualizada
    const allConfigs = await prisma.configuracion_sistema.findMany({
      orderBy: [{ categoria: 'asc' }, { clave: 'asc' }],
    });

    return NextResponse.json(serializeBigInt({
      success: true,
      updated: results.length,
      data: agruparPorCategoria(allConfigs),
    }));
  } catch (error: any) {
    console.error('Error updating configuracion:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Configuración no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function agruparPorCategoria(configs: { clave: string; valor: string; categoria: string; tipo_dato: string }[]) {
  const grouped: Record<string, Record<string, string | number | boolean>> = {};

  for (const c of configs) {
    if (!grouped[c.categoria]) grouped[c.categoria] = {};
    grouped[c.categoria][c.clave] = parsearValor(c.valor, c.tipo_dato);
  }

  return grouped;
}

function parsearValor(valor: string, tipo: string): string | number | boolean {
  if (tipo === 'number') return Number(valor);
  if (tipo === 'boolean') return valor === 'true';
  return valor;
}

async function inicializarConfiguracion() {
  const entries = Object.entries(CONFIG_DEFAULTS);
  await prisma.configuracion_sistema.createMany({
    data: entries.map(([clave, def]) => ({
      clave,
      valor: def.valor,
      categoria: def.categoria,
      descripcion: def.descripcion,
      tipo_dato: def.tipo_dato,
    })),
  });
}
