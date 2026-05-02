# Flujo de Fichas Técnicas - Modas GUOR

## Descripción General

El módulo de fichas técnicas permite a los diseñadores crear y subir fichas técnicas de prendas, y a los cortadores subir sus propias fichas de medidas. Cada ficha técnica representa la especificación técnica completa de una prenda, incluyendo medidas, materiales, insumos y costos.

## Estructura de Datos

### Fichas Técnicas (`fichas_tecnicas`)
- **id**: Identificador único
- **id_producto**: Referencia al producto
- **version**: Versión de la ficha (ej: 1.0, 2.0)
- **descripcion_detallada**: Descripción técnica
- **sam_total**: Tiempo total (SAM - Standard Allowed Minutes)
- **costo_estimado**: Costo estimado de producción
- **ficha_url**: URL del PDF de la ficha técnica
- **imagen_geometral**: Imagen con la geometría de la prenda
- **estado**: borrador | activo | revisión | obsoleto

### Ficha de Medidas (`ficha_medidas`)
- **id**: Identificador único
- **id_ficha**: Referencia a fichas_tecnicas
- **punto_medida**: Punto de medición (ej: Largo, Ancho, Largo de manga)
- **talla**: Tamaño (ej: XS, S, M, L, XL)
- **valor_cm**: Valor en centímetros
- **tolerancia**: Margen de tolerancia permitido

### Detalles de Materiales/Insumos (`fichas_tecnicas_detalle`)
- **id**: Identificador único
- **ficha_id**: Referencia a fichas_tecnicas
- **material_id**: Referencia a materiales (opcional)
- **insumo_id**: Referencia a insumos (opcional)
- **cantidad_consumo**: Cantidad consumida
- **porcentaje_desperdicio**: Porcentaje de desperdicio permitido

## Flujo de Negocio

### 1. Creación de Ficha Técnica (Diseñador)

```
Diseñador accede a: /admin/Panel-Administrativo/fichas-tecnicas/nueva
```

**Pasos:**
1. Selecciona el producto
2. Carga un PDF con la ficha técnica (opcional)
3. Sistema extrae automáticamente:
   - Versión
   - Descripción
   - SAM total
   - Costo estimado
   - Puntos de medida
4. Completa datos manualmente si es necesario
5. Define puntos de medida (punto_medida, talla, valor_cm, tolerancia)
6. Guarda la ficha en estado **"borrador"**

**Datos guardados:**
- Ficha técnica principal
- Puntos de medida en tabla `ficha_medidas`

### 2. Visualización de Detalle (Diseñador/Cortador)

```
Acceso: /admin/Panel-Administrativo/fichas-tecnicas/[id]
```

La página detalle tiene 3 pestañas:

#### Pestaña "Info General"
- Muestra datos básicos de la ficha
- **Para Diseñador**: Botón "Cargar PDF" para subir/actualizar la ficha técnica
  - Se abre un modal con `PdfUploadExtractor`
  - Extrae datos automáticamente
  - Actualiza la ficha vía `PUT /api/admin/fichas-tecnicas/[id]`
  
- **Para Cortador**: Botón "Cargar Medidas" para subir su ficha de medidas
  - Se abre un sheet con `MedidasUploadSheet`
  - Permite extraer medidas desde PDF O cargar manualmente
  - Guarda medidas vía `POST /api/admin/fichas-tecnicas/medidas`

#### Pestaña "Medidas"
- Muestra tabla de medidas puntuales
- Componente `MedidasEditor` permite:
  - Ver medidas existentes
  - Editar (si tienes permisos)
  - Agregar nuevas medidas
  - Eliminar medidas

#### Pestaña "Materiales e Insumos"
- Muestra detalles de materiales/insumos necesarios
- Componente `DetallesMateriales` permite:
  - Ver materiales e insumos requeridos
  - Cantidades y desperdicios

### 3. Control de Permisos

Los permisos se controlan mediante el hook `usePermissions()` que usa la tabla `PERMISOS_RECURSO_POR_ROL`:

#### Diseñador
- **Puede:**
  - Ver fichas técnicas (`view: fichas_tecnicas`)
  - Crear fichas técnicas (`create: ficha_tecnica`)
  - Editar fichas técnicas (`edit: ficha_tecnica`)
  - Subir PDF de ficha técnica
  
- **No puede:**
  - Subir ficha de medidas
  - Crear cotizaciones/pedidos

#### Cortador
- **Puede:**
  - Ver fichas técnicas (`view: fichas_tecnicas`)
  - Ver/editar medidas (`edit: ficha_tecnica`)
  - Subir ficha de medidas
  
- **No puede:**
  - Crear/editar ficha técnica principal
  - Cambiar otros datos de la ficha

#### Administrador/Gerente
- **Pueden:**
  - Realizar todas las acciones
  - Cambiar estado de fichas

## APIs Endpoints

### GET /api/admin/fichas-tecnicas
Listar todas las fichas con filtros opcionales
```
?estado=activo&busqueda=pantalon&categoria=123
```

### GET /api/admin/fichas-tecnicas/[id]
Obtener detalle completo de una ficha

### POST /api/admin/fichas-tecnicas
Crear nueva ficha técnica
```json
{
  "producto_id": 123,
  "version": "1.0",
  "descripcion_detallada": "Pantalón deportivo",
  "sam_total": 15.5,
  "costo_estimado": 25.00,
  "ficha_url": "https://..."
}
```

### PUT /api/admin/fichas-tecnicas/[id]
Actualizar ficha técnica
```json
{
  "version": "1.1",
  "descripcion_detallada": "...",
  "sam_total": 16,
  "costo_estimado": 26.00,
  "ficha_url": "https://...",
  "estado": "activo"
}
```

### POST /api/admin/fichas-tecnicas/medidas
Guardar medidas para una ficha
```json
{
  "ficha_id": "456",
  "medidas": [
    {
      "punto_medida": "Largo",
      "talla": "M",
      "valor_cm": 85.0,
      "tolerancia": 0.5
    },
    {
      "punto_medida": "Largo de Manga",
      "talla": "M",
      "valor_cm": 60.0,
      "tolerancia": 0.3
    }
  ]
}
```

### DELETE /api/admin/fichas-tecnicas/medidas?id=xxx
Eliminar una medida específica

### GET /api/admin/fichas-tecnicas/detalle?ficha_id=xxx
Obtener detalles de materiales/insumos de una ficha

### POST /api/admin/fichas-tecnicas/detalle
Guardar detalles de materiales/insumos

## Estados de Ficha

- **borrador**: Creada pero no completada
- **activo**: Ficha en uso para nuevos pedidos
- **revisión**: Bajo revisión/cambios pendientes
- **obsoleto**: Reemplazada por versión más nueva

## Flujo de Estado

```
borrador → [editar datos] → activo
         ↓
       revisión → activo
         ↓
      obsoleto (cuando hay nueva versión)
```

## Componentes Principales

### FichaTecnicaForm
- Ubicación: `src/components/admin/fichas-tecnicas/FichaTecnicaForm.tsx`
- Uso: Crear nueva ficha técnica
- Features:
  - Selector de producto
  - Upload de PDF con extracción automática
  - Entrada manual de datos
  - Tabla de medidas editable

### MedidasEditor
- Ubicación: `src/components/admin/fichas-tecnicas/MedidasEditor.tsx`
- Uso: Ver/editar medidas de una ficha existente
- Features:
  - Tabla de medidas
  - Agregar/editar/eliminar filas
  - Guardar cambios
  - Control de permisos

### MedidasUploadSheet (NUEVO)
- Ubicación: `src/components/admin/fichas-tecnicas/MedidasUploadSheet.tsx`
- Uso: Cortador sube su ficha de medidas
- Features:
  - Extracción de PDF
  - Entrada manual en tabla
  - Validación de datos
  - POST a endpoint medidas

### DetallesMateriales
- Ubicación: `src/components/admin/fichas-tecnicas/DetallesMateriales.tsx`
- Uso: Ver/editar materiales e insumos
- Features:
  - Tabla de materiales
  - Cantidades y desperdicios
  - Selección de materiales/insumos disponibles

## Uso de PdfUploadExtractor

El componente `PdfUploadExtractor` se usa en dos contextos:

1. **Crear ficha técnica (nueva)**
   ```jsx
   <PdfUploadExtractor
     extractType="ficha_tecnica"
     label="Cargar PDF de Ficha Técnica"
     onExtract={handlePdfExtracted}
   />
   ```

2. **Actualizar PDF de ficha existente**
   ```jsx
   <PdfUploadExtractor
     extractType="ficha_tecnica"
     label="Cargar PDF de Ficha Técnica"
     onExtract={handlePdfExtracted}
   />
   ```

3. **Cargar medidas desde PDF**
   ```jsx
   <PdfUploadExtractor
     extractType="ficha_medidas"
     label="Cargar PDF con Medidas"
     onExtract={handleMedidasExtracted}
   />
   ```

Los datos extraídos dependen del `extractType` y se pasan a través de `onExtract`.

## Notas Importantes

1. **Validación**: No se puede crear dos fichas para el mismo producto
2. **Borrado**: Las fichas no se borran, solo se marcan como obsoleto
3. **Auditoría**: Se registra quién crea/actualiza cada ficha (via `created_at`, `updated_at`)
4. **Serialización**: Todos los IDs `BigInt` se serializan a strings en las respuestas JSON

## Desarrollo Futuro

- [ ] Exportar ficha técnica a PDF
- [ ] Comparar versiones de fichas
- [ ] Historial de cambios
- [ ] Aprobación de fichas por supervisores
- [ ] Templates de fichas por tipo de prenda
- [ ] Integración con sistema de producción
