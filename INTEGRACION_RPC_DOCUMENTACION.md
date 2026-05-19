# 📚 Documentación de Integración RPC - Sistema GUOR v2

## 📋 Descripción General

Este documento describe la integración completa de los RPC (Remote Procedure Calls) de PostgreSQL en el frontend, servicios y APIs del sistema GUOR v2.

**Fecha de Actualización**: 2026-05-06  
**Estado**: Integración Completa  
**Versión**: 2.0

---

## 🏗️ Arquitectura de Integración

```
┌─────────────────┐
│   APIs          │  (Next.js Route Handlers)
├─────────────────┤
│   Services      │  (Lógica de negocio + RPC)
├─────────────────┤
│   Helpers RPC   │  (Abstracción de RPC)
├─────────────────┤
│   Schemas       │  (Validación Zod)
├─────────────────┤
│   Prisma + RPC  │  (PostgreSQL)
└─────────────────┘
```

---

## 📁 Estructura de Archivos Creados/Actualizados

### Helpers (Abstracción de RPC)
- **`src/lib/helpers/rpc-helpers.ts`** - Funciones wrapper para todos los RPC
  - `calcularCostoFicha()` - Calcula costo de ficha técnica
  - `crearReservaStock()` - Reserva stock con validaciones
  - `actualizarPrecioConHistorico()` - Actualiza precio con histórico
  - `insertarMovimiento()` - Registra movimiento de inventario
  - `obtenerStockDisponible()` - Obtiene stock considerando reservas
  - `registrarCambioEstadoConfeccion()` - Registra cambios de estado
  - `crearNotificacion()` - Crea notificación
  - `obtenerNotificacionesNoLeidas()` - Obtiene notificaciones sin leer
  - `marcarNotificacionesComoLeidas()` - Marca como leídas
  - `obtenerHistoricoPrecio()` - Obtiene histórico de precios
  - `validarStockSuficiente()` - Valida disponibilidad
  - `obtenerAuditoriaReciente()` - Obtiene auditoría

### Schemas (Validación)
- **`src/lib/schemas/rpc-schemas.ts`** - Schemas Zod para validación
  - Enums: `TipoMovimientoEnum`, `ReferenciaMovimientoEnum`, `TipoNotificacionEnum`
  - Schemas de entrada: `CalcularCostoFichaSchema`, `CrearReservaStockSchema`, etc.
  - Schemas de respuesta: `RespuestaOperacionSchema`, `RespuestaStockSchema`
  - Schemas de consulta: `PaginacionSchema`, `BuscarMovimientosSchema`, etc.

### Services (Lógica de Negocio)
- **`src/lib/services/fichas-tecnicas-rpc-service.ts`**
  - `obtenerFichaTecnica()` - Con cálculo de costo RPC
  - `crearFichaTecnica()` - Crea con detalles
  - `actualizarFichaTecnica()` - Actualiza y recalcula
  - `obtenerCostoFicha()` - Usa RPC directamente
  - `aprobarFichaTecnica()` - Aprueba
  - `marcarFichaComObsoleta()` - Marca obsoleta
  - `validarFichaTecnica()` - Validación completa

- **`src/lib/services/inventario-rpc-service.ts`**
  - `obtenerStockProducto()` - Por almacén
  - `obtenerStockInsumo()` - Por almacén
  - `obtenerStockMaterial()` - Por almacén
  - `registrarEntrada()` - Con RPC
  - `registrarSalida()` - Con validación de stock
  - `registrarAjuste()` - Ajustes de inventario
  - `obtenerMovimientosProducto()` - Histórico
  - `filtrarMovimientos()` - Búsqueda avanzada
  - `obtenerResumenMovimientos()` - Resumen por período
  - `obtenerItemsConStockBajo()` - Alertas

- **`src/lib/services/notificaciones-rpc-service.ts`**
  - `crearNotificacionNueva()` - Crea notificación
  - `obtenerNoLeidas()` - No leídas por usuario
  - `obtenerNotificacionesUsuario()` - Con paginación
  - `marcarComoLeida()` - Una notificación
  - `marcarVariasComoLeidas()` - Múltiples
  - `marcarTodasComoLeidas()` - Todas de usuario
  - `eliminarNotificacion()` - Una
  - `eliminarVariasNotificaciones()` - Múltiples
  - `obtenerEstadisticasNotificaciones()` - Estadísticas
  - **Servicios de eventos:**
    - `notificarCotizacionExpirada()`
    - `notificarDevolucionSolicitada()`
    - `notificarStockBajo()`
    - `notificarPagoPendiente()`
    - `notificarConfeccionCompletada()`

### APIs (Route Handlers)
- **`src/app/api/admin/fichas-tecnicas-rpc/route.ts`**
  - `GET ?id={fichaId}` - Obtiene ficha con costo
  - `POST` - Crea ficha técnica
  - `PUT ?id={fichaId}` - Actualiza ficha

- **`src/app/api/admin/inventario-rpc/route.ts`**
  - `GET ?tipo=producto&id={id}` - Obtiene stock
  - `GET ?action=bajo-stock` - Items con stock bajo
  - `POST` - Registra movimiento (entrada/salida/ajuste)
  - `PUT` - Filtra movimientos

- **`src/app/api/admin/notificaciones-rpc/route.ts`**
  - `GET ?usuarioId={id}` - Lista notificaciones
  - `GET ?usuarioId={id}&action=no-leidas` - No leídas
  - `GET ?usuarioId={id}&action=stats` - Estadísticas
  - `POST` - Crea notificación
  - `PUT ?action=marcar-leida` - Marca leída
  - `PUT ?action=marcar-todas-leidas` - Marca todas
  - `DELETE` - Elimina notificación(es)

- **`src/app/api/admin/auditoria-operaciones-rpc/route.ts`**
  - `GET ?action=reciente` - Auditoría reciente
  - `GET ?action=registro&tabla={tabla}&registroId={id}` - Por registro
  - `POST ?operacion=aprobar-ficha` - Aprueba ficha
  - `POST ?operacion=obsoleta-ficha` - Marca obsoleta
  - `POST ?operacion=notificar-*` - Varios tipos de notificaciones

---

## 🔄 Flujos de Integración con RPC

### 1. Cálculo de Costo de Ficha Técnica

**RPC Base**: `calcular_costo_ficha(fichaId)`

```typescript
// Desde el servicio
const costo = await calcularCostoFicha({ fichaId: 1 });

// Automático al obtener ficha
const ficha = await fichasTecnicasService.obtenerFichaTecnica(1);
console.log(ficha.costoCalculado); // Costo calculado por RPC
```

**Flujo**:
1. Usuario solicita ficha → GET `/api/admin/fichas-tecnicas-rpc?id=1`
2. Service llama `obtenerFichaTecnica(1)`
3. Helper ejecuta RPC `calcular_costo_ficha(1)`
4. RPC suma materiales + insumos con desperdicio
5. Retorna costo en respuesta

---

### 2. Registro de Movimientos de Inventario

**RPC Base**: `fn_insertar_movimiento(...)`

```typescript
// Entrada de compra
await registrarEntrada({
  productoId: 5,
  almacenId: 1,
  cantidad: 100,
  motivo: "Compra OC#123",
  tipoReferencia: "COMPRA",
  referenciaId: 123,
  usuarioId: 1,
  costoUnitario: 25.50
});

// Salida por venta
await registrarSalida({
  productoId: 5,
  almacenId: 1,
  cantidad: 10,
  motivo: "Venta pedido #456",
  tipoReferencia: "VENTA",
  referenciaId: 456
});
```

**Flujo**:
1. POST `/api/admin/inventario-rpc` con datos de movimiento
2. Service valida y registra en tabla `movimientos_inventario`
3. Helper ejecuta RPC `fn_insertar_movimiento(...)`
4. RPC actualiza `almacen_stock` automáticamente
5. Respuesta con ID del movimiento

---

### 3. Reserva de Stock

**RPC Base**: `fn_crear_reserva_stock(productoId, almacenId, cantidad, motivo)`

```typescript
const resultado = await crearReservaStock({
  productoId: "uuid-producto",
  almacenId: "uuid-almacen",
  cantidadAReservar: 50,
  motivo: "Reserva para cotización #100",
  pedidoId: "uuid-pedido"
});

// Respuesta: { status: "success", cantidad_reservada: 50, nuevo_disponible: 150 }
```

**Validaciones Automáticas**:
- Stock actual >= cantidad a reservar
- Considera reservas activas existentes
- Expira en 48 horas por defecto

---

### 4. Sistema de Notificaciones

**RPC Base**: Triggers en BD disparan eventos

```typescript
// Crear notificación manual
await crearNotificacionNueva({
  usuarioId: 5,
  tipo: "stock_bajo",
  titulo: "Stock bajo: Tela Azul",
  mensaje: "El stock bajó a 20 unidades",
  referenciaType: "materiales",
  referenciaId: 1,
  urlDestino: "/admin/inventario"
});

// Notificaciones automáticas por eventos
await notificarStockBajo({
  itemId: 1,
  itemNombre: "Tela Azul",
  stockActual: 20,
  stockMinimo: 50,
  tipoItem: "material"
});
```

**Eventos Soportados**:
- Cotización expirada
- Devolución solicitada
- Stock bajo
- Pago pendiente a taller
- Confección completada

---

### 5. Cambios de Estado con Auditoría

**RPC Base**: `fn_auditoria` (trigger)

```typescript
// Aprobar ficha técnica
const fichaAprobada = await fichasTecnicasService.aprobarFichaTecnica(1, usuarioId);

// Automáticamente:
// 1. Actualiza estado a "aprobada"
// 2. RPC trigger registra en tabla `auditoria`
// 3. Guarda datos_antes y datos_despues
```

**Auditoría Disponible Para**:
- Fichas técnicas
- Productos
- Precios
- Usuarios
- Configuración del sistema

---

## 📊 Ejemplo de Uso Completo: Crear Ficha Técnica con Costo

### Cliente (Frontend)

```typescript
// components/fichas-tecnicas/crear-ficha.tsx
const response = await fetch('/api/admin/fichas-tecnicas-rpc', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productoId: 1,
    version: '2.0',
    descripcionDetallada: 'Ficha técnica para prenda A',
    detalles: [
      {
        materialId: 5,
        cantidadConsumo: 2.5,
        porcentajeDesperdicio: 15,
        observaciones: 'Tela principal'
      },
      {
        insumoId: 3,
        cantidadConsumo: 50,
        porcentajeDesperdicio: 5,
        observaciones: 'Hilo de costura'
      }
    ],
    createdBy: usuarioId
  })
});

const { data: fichaCreada } = await response.json();
console.log(`Costo estimado: ${fichaCreada.costoCalculado}`);
```

### Flow en Backend

```
1. POST request llega a /api/admin/fichas-tecnicas-rpc
2. API valida con schema Zod
3. Llama a fichasTecnicasService.crearFichaTecnica()
4. Service:
   - Crea ficha en BD
   - Crea detalles
   - Registra auditoria
   - Llama calcularCostoFicha()
5. Helper ejecuta RPC:
   - fn_calcular_costo_ficha(fichaId)
   - RPC suma costos de materiales con desperdicio
   - RPC suma costos de insumos
   - RPC actualiza campo costo_estimado
6. Retorna ficha con costoCalculado
```

---

## 🔐 Mejores Prácticas Implementadas

### 1. **Separación de Responsabilidades**
```
RPC Helpers    → Abstracción de RPC puro
Services       → Lógica de negocio + integración
APIs           → Validación + respuestas HTTP
```

### 2. **Validación en Capas**
```
Zod Schemas    → Validación de entrada
RPC Triggers   → Validación en BD
Services       → Lógica de negocio
```

### 3. **Manejo de Errores**
```typescript
try {
  const resultado = await rpcFunction();
  return { success: true, data: resultado };
} catch (error) {
  console.error("Error:", error);
  throw new Error("Mensaje usuario-amigable");
}
```

### 4. **Transacciones Implícitas**
- Los RPC con triggers manejan transacciones automáticamente
- Los servicios usan Prisma para ACID en operaciones complejas

---

## 📈 Modelos de Datos Clave

### almacen_stock
```sql
id, almacen_id, zona_id, producto_id, insumo_id, material_id, 
cantidad, stock_minimo, updated_at
```

### movimientos_inventario
```sql
id, producto_id, insumo_id, material_id, almacen_id, cantidad,
tipo_movimiento, referencia_tipo, referencia_id, motivo, usuario_id,
created_at, updated_at
```

### notificaciones
```sql
id, usuario_id, tipo, titulo, mensaje, leido, leido_at,
referencia_tipo, referencia_id, url_destino, created_at
```

### auditoria
```sql
id, usuario_id, accion, tabla, registro_id, datos_antes, datos_despues,
ip_address, user_agent, created_at
```

---

## 🚀 Próximos Pasos de Desarrollo

- [ ] Crear API para precio histórico
- [ ] Crear API para órdenes de compra con RPC
- [ ] Crear API para confecciones con triggers
- [ ] Crear API para despachos con RPC
- [ ] Implementar WebSocket para notificaciones en tiempo real
- [ ] Dashboard de auditoría en tiempo real
- [ ] Exportar reportes de auditoría

---

## 📚 Referencias RPC Implementadas

| RPC | Helper | Service | API | Estado |
|-----|--------|---------|-----|--------|
| calcular_costo_ficha | ✅ | ✅ | ✅ | ✅ |
| fn_crear_reserva_stock | ✅ | 🔄 | 🔄 | ⚙️ |
| fn_actualizar_precio_con_historico | ✅ | ⚙️ | 🔄 | ⚙️ |
| fn_insertar_movimiento | ✅ | ✅ | ✅ | ✅ |
| fn_auditoria | ✅ | ✅ | ✅ | ✅ |
| notificaciones (triggers) | ✅ | ✅ | ✅ | ✅ |

**Leyenda**: ✅ = Completado, 🔄 = Parcial, ⚙️ = En desarrollo, ❌ = No iniciado

---

## 📞 Soporte y Contacto

Para cambios o adiciones a la integración RPC, consultar documentación de BD o contactar al equipo de desarrollo.

**Última Actualización**: 2026-05-06  
**Versión del Schema**: 2.0  
**Compatible con**: Next.js 14+, Prisma 5+, PostgreSQL 14+
