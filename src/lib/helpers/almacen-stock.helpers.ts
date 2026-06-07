import type { AlmacenStock, AjustarStock } from '@/lib/schemas/almacenes';

type TipoItem = 'producto' | 'insumo' | 'material' | 'desconocido';

export const almacenStockHelpers = {

    // Identifica qué tipo de ítem tiene el registro
    resolverTipoItem: (stock: AlmacenStock): TipoItem => {
        if (stock.producto_id) return 'producto';
        if (stock.insumo_id) return 'insumo';
        if (stock.material_id) return 'material';
        return 'desconocido';
    },

    // Devuelve el ID del ítem sin importar el tipo
    resolverItemId: (stock: AlmacenStock): bigint | null =>
        stock.producto_id ?? stock.insumo_id ?? stock.material_id ?? null,

    // Verifica si hay stock suficiente para una salida
    tieneSuficiente: (stock: AlmacenStock, cantidadRequerida: number): boolean =>
        Number(stock.cantidad) >= cantidadRequerida,

    // Verifica si está por debajo del mínimo
    estaBajoMinimo: (stock: AlmacenStock): boolean => {
        const minimo = Number(stock.stock_minimo ?? 0);
        return minimo > 0 && Number(stock.cantidad) < minimo;
    },

    // Cuánto falta para llegar al mínimo (0 si está bien)
    calcularDeficit: (stock: AlmacenStock): number => {
        const minimo = Number(stock.stock_minimo ?? 0);
        const actual = Number(stock.cantidad);
        return Math.max(minimo - actual, 0);
    },

    // Aplica el delta según el tipo de ajuste
    calcularNuevaCantidad: (stock: AlmacenStock, ajuste: AjustarStock): number => {
        const actual = Number(stock.cantidad);
        const cantidad = ajuste.cantidad;

        switch (ajuste.tipo) {
            case 'entrada': return actual + cantidad;
            case 'salida': return Math.max(actual - cantidad, 0);
            case 'ajuste': return cantidad; // reemplazo directo
        }
    },

    // Filtra los registros que están bajo el mínimo
    filtrarBajoMinimo: (stocks: AlmacenStock[]): AlmacenStock[] =>
        stocks.filter(almacenStockHelpers.estaBajoMinimo),

    // Agrupa por tipo de ítem
    agruparPorTipo: (stocks: AlmacenStock[]): Record<TipoItem, AlmacenStock[]> =>
        stocks.reduce(
            (acc, curr) => {
                const tipo = almacenStockHelpers.resolverTipoItem(curr);
                acc[tipo].push(curr);
                return acc;
            },
            {
                producto: [] as AlmacenStock[],
                insumo: [] as AlmacenStock[],
                material: [] as AlmacenStock[],
                desconocido: [] as AlmacenStock[],
            } as Record<TipoItem, AlmacenStock[]>
        ),

    // Suma el total de unidades en stock de una lista
    calcularTotalUnidades: (stocks: AlmacenStock[]): number =>
        stocks.reduce((sum, s) => sum + Number(s.cantidad), 0),

    // Valida que el ajuste no deje stock negativo
    validarSalida: (stock: AlmacenStock, cantidad: number): { valido: boolean; mensaje?: string } => {
        const disponible = Number(stock.cantidad);
        if (disponible < cantidad) {
            return {
                valido: false,
                mensaje: `Stock insuficiente: disponible ${disponible}, solicitado ${cantidad}`,
            };
        }
        return { valido: true };
    },
};