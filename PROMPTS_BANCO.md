# Banco de Prompts Gemini IA para Modas GUOR

## 📌 Prompts para Geometral (Imágenes)

### Prompt 1: Extracción Completa (Recomendado)

```
ROLE: Experto en análisis de fichas técnicas de confección textil.

TAREA: Analizar imagen geometral (technical drawing) y extraer medidas precisas.

CONTEXTO:
- Esta es una prenda de ropa (vestido, camisa, pantalón, etc)
- La imagen contiene flechas o líneas indicando puntos de medida
- Puede haber múltiples tallas en la misma imagen

INSTRUCCIONES PASO A PASO:
1. Identifica CADA punto de medida (cabeza de flecha, línea punteada, número)
2. Lee el valor exacto en centímetros (o convierte si está en inches: 1 inch = 2.54cm)
3. Si hay tabla de tallas (XS, S, M, L, XL), extrae para cada una
4. Busca información de materiales (composición, peso, etc)
5. Busca referencias a tiempo SAM (Standard Allowed Minutes)

RESPUESTA OBLIGATORIA - SOLO JSON (sin explicaciones adicionales):
{
  "medidas": [
    {
      "punto_medida": "ej: HPS (Hombro al Sisa)",
      "talla": "M",
      "valor_cm": 45.5,
      "tolerancia": 1.0,
      "rango_tallas": {
        "XS": 42,
        "S": 43,
        "M": 45.5,
        "L": 48,
        "XL": 50
      },
      "notas": "Cualquier observación especial"
    }
  ],
  "materiales": [
    {
      "componente": "Cuerpo Principal",
      "material": "Jersey 100% Algodón",
      "composicion": "100% Algodón",
      "peso_gm2": 200,
      "color": "Azul Marino"
    }
  ],
  "especificaciones_tecnicas": {
    "sam_total": 12.5,
    "tiempo_confeccion_minutos": 750,
    "tipo_puntada": "Flatlock",
    "acabados_especiales": ["Doblado especial", "Ribete reforzado"]
  },
  "calidad_imagen": "excelente|buena|regular|pobre",
  "confianza_general": 0.95,
  "observaciones": "Imagen clara, medidas bien visibles"
}

REGLAS CRÍTICAS:
✓ Extrae EXACTAMENTE lo que ves, no inventes datos
✓ Si un valor es ambiguo, marca confianza < 0.8
✓ Redondea decimales a máximo 2 lugares
✓ Si no ves claramente, omite o usa null
✓ Sé exhaustivo: TODAS las medidas, TODOS los materiales visibles
```

### Prompt 2: Extracción Rápida (Para urgencias)

```
Analiza esta imagen geometral de prenda.
Extrae SOLO en JSON (sin texto adicional):
- medidas principales: [{"punto": string, "talla": "M", "cm": number}]
- materiales: [{"componente": string, "material": string}]
- sam_total: number
Omite valores inciertos.
```

### Prompt 3: Validación de Medidas

```
TAREA: Validar si estas medidas son coherentes para una prenda.

MEDIDAS ACTUALES:
{medidas_json}

IMAGEN: [geometral image]

VERIFICAR:
1. ¿Las proporciones tienen sentido? (ej: no puede haber mangas más largas que el torso)
2. ¿Los valores están en rangos realistas para la talla?
3. ¿Hay medidas faltantes críticas?
4. ¿Hay conflictos entre medidas?

RESPUESTA JSON:
{
  "valida": true|false,
  "advertencias": ["lista de problemas encontrados"],
  "sugerencias": ["cómo corregir"],
  "confianza": 0.0-1.0
}
```

---

## 📄 Prompts para PDFs (Cotizaciones)

### Prompt 1: Cotización Completa

```
OBJETIVO: Extraer información comercial de cotización de proveedor.

PDF: Documento de cotización/presupuesto/quote

BUSCAR:
- Número de cotización y fecha
- Datos proveedor (nombre, RUC, contacto)
- Tabla de items con descripción, cantidad, precio
- Subtotal, impuestos, total
- Términos de pago y tiempo de entrega

RESPUESTA OBLIGATORIA EN JSON:
{
  "documento": {
    "tipo": "cotizacion|presupuesto|quote",
    "numero": "COT-2024-001",
    "fecha": "2024-01-15",
    "vigencia_dias": 30,
    "referencia": "PO-123" o null
  },
  "proveedor": {
    "nombre": "Textiles del Sur SA",
    "ruc": "20123456789",
    "direccion": "Calle Principal 123",
    "contacto": "contacto@textiles.com",
    "telefono": "+51 1 2345678"
  },
  "comprador": {
    "nombre": "Modas GUOR",
    "departamento": "Compras"
  },
  "items": [
    {
      "numero": 1,
      "codigo": "TEJ-001",
      "descripcion": "Jersey 100% algodón, 200gm2, color azul marino",
      "cantidad": 50,
      "unidad": "kg",
      "precio_unitario": 12.50,
      "subtotal": 625.00,
      "moneda": "USD"
    }
  ],
  "resumen_financiero": {
    "subtotal": 625.00,
    "descuento_porcentaje": 0,
    "descuento_monto": 0,
    "impuesto_tipo": "IGV",
    "impuesto_porcentaje": 18,
    "impuesto_monto": 112.50,
    "total": 737.50,
    "moneda": "USD"
  },
  "terminos_comerciales": {
    "forma_pago": "50% adelanto, 50% contra entrega",
    "plazo_dias": 30,
    "tiempo_entrega": "21 días",
    "incoterm": "FOB",
    "puerto_destino": "Lima",
    "flete_incluido": false
  },
  "notas_especiales": ["Precio válido por 30 días", "Sujeto a disponibilidad"],
  "confianza_extraccion": 0.98
}

REGLAS:
✓ Extrae TODOS los items, sin excepciones
✓ Calcula totales si no aparecen
✓ Sé consistente con formatos de fecha
✓ Si hay descuentos, sépalos claramente
```

### Prompt 2: Comparación de Cotizaciones

```
TAREA: Comparar dos cotizaciones de proveedor.

COTIZACION 1:
{cot1_json}

COTIZACION 2:
{cot2_json}

ANALIZAR:
- Diferencias de precio por item
- Términos comerciales
- Ventajas/desventajas de cada una

RESPUESTA JSON:
{
  "items_comparacion": [
    {
      "item": "descripcion",
      "precio_cot1": 12.50,
      "precio_cot2": 11.80,
      "diferencia_porcentaje": -5.6,
      "mejor_opcion": "Cotizacion 2"
    }
  ],
  "recomendacion": "Seleccionar Cotizacion 2 por 5.6% más económica",
  "observaciones": "Verificar tiempo de entrega, más largo en Cot2"
}
```

---

## 💬 Prompts para Chatbot

### Sistema Prompt: Asistente GUOR

```
NOMBRE: AsistenteIA Modas GUOR

OBJETIVO: Ayudar a empleados en sistema de gestión de fichas técnicas y producción.

ÁREAS DE EXPERTISE:
1. Fichas Técnicas: Estructura, medidas, validación
2. Costos: Cálculo SAM, costos de producción, márgenes
3. Materiales: Propiedades, compatibilidades, proveedores
4. Proceso: Flujos de diseño, confección, despacho
5. Sistema: Cómo usar la plataforma, reportes, búsquedas

ROLES SOPORTADOS:
- Diseñador: Crear fichas, validar medidas, análisis de costos
- Cortador: Verificar medidas, procesos de corte
- Gerente: Reportes, análisis, decisiones estratégicas
- Administrador: Configuración, usuarios, permisos

INSTRUCCIONES:
1. Responder SIEMPRE en español profesional
2. Ser conciso: máximo 2-3 párrafos por respuesta
3. Ofrecer alternativas cuando haya opciones múltiples
4. Si no sabes, ser honesto: "No tengo información al respecto"
5. Sugerir acciones concretas, no genéricas
6. Usar números y datos cuando sea posible
7. Referirse al contexto: "Para el vestido que estás creando..."

RESTRICCIONES:
✗ NO modificar datos sin confirmar con usuario
✗ NO ejecutar acciones, solo sugerir
✗ NO compartir información sensible (contraseñas, pagos)
✗ NO hacer promesas sobre funciones que no existen
✗ NO ser condescendiente ni técnico innecesariamente

CONTEXTO DE USUARIO:
- Disponible en cada pregunta: rol, ID, producto actual (si aplica)
- Usar para personalizar respuestas

TONO: Profesional, amable, práctico, empoderador

EJEMPLOS DE RESPUESTAS:

User (Diseñador): "¿Cómo calculo el SAM para un vestido?"
Asistente: "El SAM (Standard Allowed Minutes) es el tiempo que debe tomar hacer una prenda en condiciones estándar. Para tu vestido, suma:
- Corte de piezas: ~2 min
- Costura principal: ~6 min  
- Acabados: ~2 min
- Control calidad: ~1 min
Total: ~11 SAM

Si la productividad es 45 prendas/hora, el costo sería SAM*(tarifa/60). Cargalo en la ficha técnica para un cálculo automático."

User (Cortador): "Tengo dudas en la medida HPS"
Asistente: "HPS = Hombro a Punta de Sisa (shoulder point to side seam). Mide desde la punta del hombro, bajando verticalmente hasta donde termina la manga. Es crítica para que la prenda quede bien ajustada. En tu geometral debería estar claramente marcada con una flecha. Si no la ves, pregunta al diseñador."
```

### Prompt: Validador de Medidas

```
USER: "¿Son correctas estas medidas para {tipo_prenda} talla M?"

MEDIDAS:
{medidas_json}

RESPONDER:
1. ¿Hacen sentido estas proporciones?
2. ¿Hay medidas faltantes importantes?
3. Si hay problemas, cuáles son y cómo corregirlos

Ser específico: no "parece bien", sino "largo de manga está en rango 57-62cm para talla M, la tuya de 59cm es perfecta"
```

---

## 🔄 Prompts para Agregación de Datos

### Prompt: Enriquecimiento de Ficha Técnica

```
TAREA: Completar ficha técnica con información adicional.

DATOS INICIALES:
{ficha_json}

MATERIALES ENCONTRADOS: {materiales_lista}

BUSCAR EN CONOCIMIENTO:
1. Propiedades de cada material (elasticidad, encogimiento, resistencia)
2. Compatibilidades (¿estos materiales van bien juntos?)
3. Procesos recomendados (lavado, teñido)
4. Proveedores más comunes
5. Costo estimado según material

RESPUESTA JSON CON ENRIQUECIMIENTO:
{
  "materiales_expandido": [
    {
      "material": "Jersey 100% Algodón",
      "propiedades": {
        "elasticidad": "baja",
        "encogimiento_porcentaje": 3,
        "resistencia": "media-alta",
        "transpirabilidad": "excelente"
      },
      "procesos": ["Lavado 30°", "Secadora moderada"],
      "proveedores_sugeridos": ["Textiles del Sur", "Confecciones Andinas"],
      "costo_estimado_kg": 12.50
    }
  ],
  "compatibilidades": "Buena compatibilidad. Jersey con poliéster híbrido mejora elasticidad",
  "observaciones": "Material de buena calidad, fácil de trabajar, excelente terminación"
}
```

---

## 📊 Prompts para Análisis y Reportes

### Prompt: Análisis de Productividad

```
DATOS: Lista de fichas técnicas con SAM y tiempos reales

ANALIZAR:
- Fichas que están sobre SAM estimado
- Variaciones significativas
- Recomendaciones de optimización

RESPUESTA: Tabla con análisis y acciones sugeridas
```

### Prompt: Validador de Costo

```
TAREA: Validar si el costo estimado es realista.

FICHA: {ficha_json}
MERCADO_ACTUAL: {precios_vigentes}

COMPARAR:
- Costo similar vs productos en mercado
- Margen de rentabilidad esperado
- Factores que impactan costo

RESPUESTA: Recomendación de ajuste de precio
```

---

## 🛠️ Tips de Prompt Engineering

### ✅ QUÉ FUNCIONA BIEN

1. **Estructura Clara**
```
✓ Role + Tarea + Contexto + Instrucciones + Formato
✗ "Extrae esto de la imagen" (muy vago)
```

2. **Ejemplos en el Prompt**
```
✓ "punto_medida": "HPS (Hombro a Punta de Sisa)" (muestra formato)
✗ Solo JSON vacío
```

3. **Restricciones Explícitas**
```
✓ "Extrae SOLO lo que ves, sin inventar datos"
✗ Dejar que Gemini "interprete"
```

4. **Formato de Salida Preciso**
```
✓ Especificar JSON con estructura completa
✗ "Dame los datos en formato estructurado"
```

### ❌ QUÉ NO FUNCIONA

1. **Prompts Ambiguos**
```
✗ "Analiza esta imagen"
✓ "Extrae medidas de esta imagen geometral siguiendo estructura..."
```

2. **Pedir Demasiadas Cosas**
```
✗ "Analiza, valida, sugiere mejoras, calcula costos"
✓ Una tarea principal + subtareas claras
```

3. **Sin Contexto**
```
✗ Solo pasar la imagen sin descripción
✓ "Esta es geometral de vestido para talla M, mira por flechas..."
```

4. **Formato Vago**
```
✗ "Dame los datos"
✓ "Responde en JSON con estructura: {campo: tipo}"
```

---

## 🧪 Testing de Prompts

**Paso 1: Crear Archivo de Prueba**
```typescript
// test-prompts.ts
const testImages = [
  { path: 'sample-geometral-1.jpg', tipo: 'vestido', talla: 'M' },
  { path: 'sample-geometral-2.jpg', tipo: 'pantalon', talla: 'L' },
];

const testPDFs = [
  { path: 'sample-cotizacion-1.pdf', proveedor: 'Textiles Sur' },
];
```

**Paso 2: Ejecutar Extracción**
```typescript
for (const test of testImages) {
  const resultado = await extraerGeometral(test.path);
  console.log(`✓ ${test.tipo}: ${Object.keys(resultado.medidas).length} medidas`);
}
```

**Paso 3: Validar Resultado**
- ¿Extrae todas las medidas?
- ¿Formato JSON válido?
- ¿Valores realistas?
- ¿Confianza > 0.8?

**Paso 4: Iterar Prompt**
Si falla, ajusta el prompt y reintenta.

---

## 📋 Prompt Checklist

Para cada nuevo caso de uso:

- [ ] Define claro ROLE (quién es Gemini)
- [ ] Define claro TAREA (qué hace)
- [ ] Proporciona CONTEXTO relevante
- [ ] Escribe INSTRUCCIONES paso a paso
- [ ] Especifica FORMATO de salida (JSON con estructura)
- [ ] Incluye REGLAS de validación
- [ ] Prueba con 3+ ejemplos reales
- [ ] Ajusta basado en resultados
- [ ] Documenta en este archivo
