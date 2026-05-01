# Módulo de Movimientos de Inventario - Guía de Integración

## Arquitectura

El módulo de movimientos de inventario es un **historial centralizado y automático** que registra todos los cambios de inventario del sistema. Se integra con:

- ✅ Compras de materiales/insumos (ordenes_compra)
- ✅ Ventas de productos (ordenes_venta)
- ✅ Producción (uso en confecciones)
- ✅ Devoluciones (cliente/proveedor)
- ✅ Incidencias (pérdidas, daños)
- ✅ Ajustes manuales (recuentos)

## Estructura de Carpetas

```
src/
├── lib/
│   ├── services/
│   │   └── movimientos-inventario-services.ts (Servicio principal)
│   ├── helpers/
│   │   └── movimientos-inventario-helpers.ts (Funciones de registro)
│   └── hooks/
│       └── useMovimientos.ts (Hooks para React)
├── app/
│   └── api/
│       └── admin/
│           └── movimientos-inventario/
│               ├── route.ts (GET/POST movimientos)
│               └── resumen/
│                   └── route.ts (GET estadísticas)
└── components/
    └── admin/
        └── inventario/
            └── MovimientosInventarioTable.tsx (Componente de tabla)
```

## Uso en Servicios

### 1. Registrar Compra de Materiales

**Ubicación:** `src/lib/services/ordenes-compra-services.ts` (al confirmar recepción)

```typescript
import { registrarEntradaCompra } from '@/lib/helpers/movimientos-inventario-helpers';

async function confirmarRecepcion(ordenId: string) {
  // ... código existente ...
  
  // Registrar movimiento automáticamente
  await registrarEntradaCompra({
    material_id: detalleCompra.material_id,
    cantidad: detalleCompra.cantidad,
    costo_unitario: detalleCompra.precio_unitario,
    numero_oc: orden.numero_oc,
    usuario_id: usuarioId,
    almacen_id: almacenId,
  });
}
```

### 2. Registrar Venta de Productos

**Ubicación:** `src/lib/services/ordenes-venta-services.ts` (al confirmar venta)

```typescript
import { registrarSalidaVenta } from '@/lib/helpers/movimientos-inventario-helpers';

async function confirmarVenta(ordenId: string) {
  // ... código existente ...
  
  for (const item of orden.detalles) {
    await registrarSalidaVenta({
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      numero_ov: orden.numero_ov,
      usuario_id: usuarioId,
      almacen_id: almacenId,
    });
  }
}
```

### 3. Registrar Uso en Producción

**Ubicación:** `src/lib/services/confecciones-services.ts` (al usar material)

```typescript
import { registrarSalidaProduccion } from '@/lib/helpers/movimientos-inventario-helpers';

async function crearConfeccion(data: any) {
  // ... crear confección ...
  
  // Registrar salida de materiales
  for (const material of data.materiales) {
    await registrarSalidaProduccion({
      material_id: material.id,
      cantidad: material.cantidad_usada,
      confeccion_id: confeccion.id,
      usuario_id: usuarioId,
      almacen_id: almacenId,
    });
  }
}
```

### 4. Registrar Devolución de Cliente

**Ubicación:** `src/lib/services/devoluciones-cliente-services.ts`

```typescript
import { registrarEntradaDevolucionCliente } from '@/lib/helpers/movimientos-inventario-helpers';

async function registrarDevolucion(data: any) {
  // ... crear devolución ...
  
  await registrarEntradaDevolucionCliente({
    producto_id: data.producto_id,
    cantidad: data.cantidad,
    numero_devolucion: devolucion.numero,
    usuario_id: usuarioId,
    almacen_id: almacenId,
  });
}
```

### 5. Registrar Incidencia

**Ubicación:** `src/lib/services/incidencias-services.ts`

```typescript
import { registrarSalidaIncidencia } from '@/lib/helpers/movimientos-inventario-helpers';

async function crearIncidencia(data: any) {
  // ... crear incidencia ...
  
  await registrarSalidaIncidencia({
    material_id: data.material_id,
    cantidad: data.cantidad,
    tipo_incidencia: data.tipo, // "pérdida", "daño", "robo"
    numero_incidencia: incidencia.numero,
    usuario_id: usuarioId,
    almacen_id: almacenId,
  });
}
```

## Uso en Componentes

### Listar movimientos en una página

```typescript
'use client';

import { useMovimientos } from '@/lib/hooks/useMovimientos';

export default function MiComponente() {
  const { movimientos, isLoading } = useMovimientos({
    tipo_movimiento: 'entrada',
    limite: 50,
    autoRefresh: true, // Actualizar cada 30s
  });

  return (
    <div>
      {isLoading ? <p>Cargando...</p> : (
        movimientos.map(mov => (
          <div key={mov.id}>{mov.motivo}</div>
        ))
      )}
    </div>
  );
}
```

### Obtener estadísticas

```typescript
import { useResumenMovimientos } from '@/lib/hooks/useMovimientos';

export default function Dashboard() {
  const { resumen } = useResumenMovimientos();

  return (
    <div>
      <p>Entradas: {resumen?.entradas}</p>
      <p>Salidas: {resumen?.salidas}</p>
      <p>Ajustes: {resumen?.ajustes}</p>
    </div>
  );
}
```

## API Endpoints

### GET `/api/admin/movimientos-inventario`

Listar movimientos con filtros

```bash
GET /api/admin/movimientos-inventario?tipo_movimiento=entrada&limite=20&desde=2025-01-01
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "123",
      "producto_id": "456",
      "cantidad": 100,
      "tipo_movimiento": "entrada",
      "motivo": "Compra OC-001",
      "costo_unitario": 50.00,
      "usuario_id": "789",
      "created_at": "2025-01-15T10:30:00Z",
      "usuarios": { "nombre": "Juan Pérez" },
      "productos": { "nombre": "Camisa Azul" }
    }
  ]
}
```

### POST `/api/admin/movimientos-inventario`

Registrar movimiento manual

```bash
POST /api/admin/movimientos-inventario
Content-Type: application/json

{
  "material_id": "123",
  "cantidad": 50,
  "tipo_movimiento": "entrada",
  "motivo": "Ajuste por recuento físico",
  "usuario_id": "456"
}
```

### GET `/api/admin/movimientos-inventario/resumen`

Obtener estadísticas

```bash
GET /api/admin/movimientos-inventario/resumen?desde=2025-01-01&hasta=2025-01-31
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "entradas": 45,
    "salidas": 23,
    "ajustes": 5,
    "total": 73
  }
}
```

## Validaciones Automáticas

El servicio valida automáticamente:

1. **Stock no negativo**: Previene salidas que dejen stock negativo
2. **Items requeridos**: Debe especificar al menos un producto/material/insumo
3. **Trazabilidad**: Registra automáticamente usuario y fecha
4. **Transacciones**: Todo se registra atómicamente (éxito o fallo completo)

## Tipo de Movimientos

```
entrada: Aumenta stock (compra, devolución cliente, etc.)
salida: Disminuye stock (venta, uso en producción, etc.)
ajuste: Corrección manual (recuentos, errores)
```

## Referencias

Cada movimiento puede vincularse a:

```
ORDEN: Ordenes de producción (confecciones)
COMPRA: Órdenes de compra (proveedores)
VENTA: Órdenes de venta (clientes)
AJUSTE: Ajustes manuales (sin vinculación)
```

## Próximas Integraciones

Para completar el sistema, integra registro automático en:

- [ ] Servicios de compra (ordenes-compra-services.ts)
- [ ] Servicios de venta (ordenes-venta-services.ts)
- [ ] Servicios de producción (confecciones-services.ts)
- [ ] Servicios de devoluciones (devoluciones-services.ts)
- [ ] Servicios de incidencias (incidencias-services.ts)
- [ ] Componentes de ajuste manual de stock

## Consideraciones

- **Ubicación única**: Todo pasa por MovimientosInventarioService.registrar()
- **Transacciones**: Usa Prisma.$transaction para atomicidad
- **Auditoría**: Cada movimiento registra usuario y timestamp
- **Performance**: Los índices en created_at y referencias optimizan búsquedas
- **Historial**: Nunca se elimina, es inmutable (solo para lectura)
