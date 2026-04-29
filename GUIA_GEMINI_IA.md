# Guía Completa: Usar Gemini IA en Modas GUOR

## 📋 Tabla de Contenidos
1. [Configuración Inicial](#configuración-inicial)
2. [Mejores Prácticas](#mejores-prácticas)
3. [Extracción de Imágenes (Geometral)](#extracción-de-imágenes-geometral)
4. [Extracción de PDFs](#extracción-de-pdfs)
5. [Chatbot Asistente](#chatbot-asistente)
6. [Agregación Automática en Formularios](#agregación-automática-en-formularios)
7. [Manejo de Errores](#manejo-de-errores)
8. [Optimización de Costos](#optimización-de-costos)

---

## Configuración Inicial

### Variables de Entorno
```bash
# .env.local o .env.production
GEMINI_API_KEY=tu_clave_api_aqui
NEXT_PUBLIC_MAX_FILE_SIZE=10485760  # 10MB en bytes
```

### Inicialización en `src/lib/gemini.ts`
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Falta GEMINI_API_KEY en variables de entorno");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Modelos disponibles:
// - "gemini-2.0-flash": Rápido, eficiente (RECOMENDADO)
// - "gemini-1.5-pro": Más potente, lento, caro
// - "gemini-1.5-flash": Balance (alternativa)

export const modelRapido = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 0.2,    // Bajo: respuestas precisas, no creativas
    topP: 0.8,           // Diversidad moderada
    maxOutputTokens: 2048,
  }
});

export const modelDetallado = genAI.getGenerativeModel({ 
  model: "gemini-1.5-pro",
  generationConfig: {
    temperature: 0.1,    // Muy bajo: máxima precisión
    topP: 0.5,
    maxOutputTokens: 4096,
  }
});
```

---

## Mejores Prácticas

### 1. Diseño de Prompts Efectivos

#### ✅ CORRECTO: Prompt Estructurado
```typescript
const prompt = `
CONTEXTO: Eres un experto en fichas técnicas de moda.

TAREA: Analiza la imagen geometral y extrae medidas de la prenda.

FORMATO REQUERIDO: Responde SOLO en JSON sin explicaciones adicionales.

ESTRUCTURA JSON:
{
  "medidas": [
    {
      "punto_medida": "string (nombre exacto del punto)",
      "talla": "string (XS, S, M, L, XL)",
      "valor_cm": "number (valor numérico)",
      "tolerancia": "number o null"
    }
  ],
  "descripcion": "string breve"
}

REGLAS IMPORTANTES:
- Extrae TODOS los puntos de medida visibles
- Si no hay unidad, asume centímetros
- Si no hay talla explícita, usa 'M' como referencia
- Redondea a 1 decimal
`;
```

#### ❌ INCORRECTO: Prompt Vago
```typescript
const prompt = `
Extrae la información de esta imagen.
`;
// Problema: Ambiguo, Gemini no sabe qué extraer exactamente
```

### 2. Validación de Respuesta

```typescript
function parseJSON<T>(raw: string): T {
  // Intenta múltiples patrones
  const patterns = [
    /```json\n?([\s\S]*?)\n?```/, // JSON en código block
    /\{[\s\S]*\}/,                 // JSON puro
  ];

  let jsonStr = raw;
  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (match) {
      jsonStr = match[1] ?? match[0];
      break;
    }
  }

  return JSON.parse(jsonStr.trim()) as T;
}

// Uso con validación
try {
  const data = parseJSON<ExtraccionFichaTecnica>(response);
  // Validar con Zod
  const validated = fichaTecnicaSchema.parse(data);
  return validated;
} catch (error) {
  throw new Error(`JSON inválido: ${error.message}`);
}
```

---

## Extracción de Imágenes (Geometral)

### Flujo Completo

```typescript
// src/lib/helpers/ai-extraction-mejorado.ts

export async function extraerGeometral(
  imagePath: string,
  productoId?: string
): Promise<ExtraccionFichaTecnica> {
  // 1. Validar archivo
  if (!fs.existsSync(imagePath)) {
    throw new Error('Archivo no encontrado');
  }

  // 2. Convertir a Base64
  const base64 = fs.readFileSync(imagePath).toString('base64');
  const mimeType = getMimeType(imagePath);

  // 3. Crear prompt muy específico
  const prompt = `
ROLE: Analista experto en fichas técnicas de confección.

IMAGEN: Imagen geometral (technical drawing) de una prenda de ropa.

OBJETIVO: Extraer TODAS las medidas, materiales y especificaciones visibles.

INSTRUCCIONES:
1. Identifica cada punto de medida (puntas de flechas, etiquetas)
2. Lee el valor numérico (puede estar en cm, inches, etc)
3. Si hay tabla de tallas, extrae todas
4. Si hay especificaciones de materiales, extráelas
5. Busca referencias a SAM o tiempo de confección

RESPUESTA OBLIGATORIA EN JSON (SIN EXPLICACIONES ADICIONALES):
{
  "medidas": [
    {
      "punto_medida": "nombre exacto del punto (ej: HPS to Hem)",
      "talla": "si es tabla multi-talla, o 'M' como base",
      "valor_cm": número,
      "tolerancia": número o null,
      "nota": "cualquier nota especial"
    }
  ],
  "materiales": [
    {
      "componente": "nombre del componente (cuerpo, mangas, etc)",
      "material": "tipo de material",
      "composicion": "% composición si aparece",
      "color": "color si aparece"
    }
  ],
  "especificaciones": {
    "sam_total": número o null,
    "costo_estimado": número o null,
    "render_time": "tiempo si aparece",
    "observaciones": "cualquier otra observación importante"
  },
  "calidad_imagen": "excelente|buena|regular|pobre",
  "confianza_extraccion": 0.0 - 1.0
}

REGLAS CRÍTICAS:
- Extrae EXACTAMENTE lo que ves, sin inventar
- Si un valor es ambiguo, marca confianza < 0.8
- Redondea decimales a máximo 2 lugares
- Si no ves claramente algo, omítelo o usa null
`;

  try {
    // 4. Llamar a Gemini
    const response = await modelDetallado.generateContent([
      { inlineData: { mimeType, data: base64 } },
      { text: prompt },
    ]);

    const content = response.response.text();
    console.log('Respuesta Gemini:', content);

    // 5. Parsear y validar
    const extracted = parseJSON<ExtraccionFichaTecnica>(content);
    
    // 6. Validar confianza
    if (extracted.especificaciones?.confianza_extraccion < 0.7) {
      console.warn('⚠️ Baja confianza en la extracción');
    }

    return extracted;
  } catch (error: any) {
    console.error('❌ Error en extracción geometral:', error);
    throw new Error(
      `No se pudo extraer la ficha técnica: ${error.message}`
    );
  }
}
```

### En el Componente Frontend

```typescript
// src/components/admin/fichas-tecnicas/FichaTecnicaForm.tsx

const handleImageExtracted = (data: any) => {
  // data contiene: medidas[], materiales[], especificaciones
  
  // 1. Cargar medidas
  if (data.medidas && Array.isArray(data.medidas)) {
    // Limpiar medidas anteriores
    while (fields.length > 0) remove(0);
    
    // Agregar nuevas medidas
    data.medidas.forEach((m: any) => {
      append({
        punto_medida: m.punto_medida || '',
        talla: m.talla || 'M',
        valor_cm: m.valor_cm ? Number(m.valor_cm) : undefined,
        tolerancia: m.tolerancia ? Number(m.tolerancia) : undefined,
      });
    });
  }

  // 2. Cargar especificaciones
  if (data.especificaciones) {
    if (data.especificaciones.sam_total) {
      form.setValue('sam_total', Number(data.especificaciones.sam_total));
    }
    if (data.especificaciones.costo_estimado) {
      form.setValue('costo_estimado', Number(data.especificaciones.costo_estimado));
    }
  }

  // 3. Mostrar confianza
  const confianza = data.especificaciones?.confianza_extraccion ?? 0;
  if (confianza < 0.8) {
    toast.warning('⚠️ Revisa los datos extraídos, confianza baja');
  } else {
    toast.success('✅ Datos extraídos correctamente');
  }
};
```

---

## Extracción de PDFs

### Cotización de Proveedor

```typescript
// src/lib/helpers/ai-extraction-mejorado.ts

export async function extraerCotizacionPDF(
  pdfPath: string
): Promise<ExtraccionCotizacionProveedor> {
  const base64 = fs.readFileSync(pdfPath).toString('base64');

  const prompt = `
OBJETIVO: Extraer datos de una cotización comercial de proveedor.

RESPUESTA EN JSON (SIN EXPLICACIONES):
{
  "numero": "número de cotización",
  "fecha": "YYYY-MM-DD",
  "vigencia_hasta": "YYYY-MM-DD o null",
  "proveedor": {
    "nombre": "razón social",
    "ruc": "ruc o tax id",
    "contacto": "correo",
    "telefono": "número"
  },
  "moneda": "USD|PEN|EUR",
  "items": [
    {
      "codigo": "código si aparece",
      "descripcion": "descripción completa",
      "cantidad": número,
      "unidad": "unidades|kg|metros|etc",
      "precio_unitario": número,
      "subtotal": número
    }
  ],
  "subtotal": número,
  "impuestos": número,
  "total": número,
  "forma_pago": "contado|crédito|etc",
  "tiempo_entrega": "días o descripción",
  "observaciones": "términos especiales o notas"
}

REGLAS:
- Si hay tabla de items, extrae TODOS
- Calcula totales si no aparecen explícitos
- Si hay descuentos, incluye en observaciones
- Mantén exactitud en números decimales
`;

  try {
    const response = await modelRapido.generateContent([
      { inlineData: { mimeType: 'application/pdf', data: base64 } },
      { text: prompt },
    ]);

    return parseJSON<ExtraccionCotizacionProveedor>(
      response.response.text()
    );
  } catch (error: any) {
    throw new Error(`Error extrayendo cotización: ${error.message}`);
  }
}
```

---

## Chatbot Asistente

### Configuración del Asistente

```typescript
// src/lib/ai/chatbot.ts

export interface ChatContext {
  usuario_rol: string;
  usuario_id: string;
  contexto?: string; // Ej: producto actual, ficha técnica en edición
}

export async function procesarMensajeChat(
  mensaje: string,
  historial: Array<{ role: 'user' | 'model'; content: string }>,
  context: ChatContext
): Promise<string> {
  const systemPrompt = `
ERES: Asistente IA de Modas GUOR, experto en confección textil y gestión de producción.

CONTEXTO DEL USUARIO:
- Rol: ${context.usuario_rol}
- Contexto actual: ${context.contexto || 'Sin contexto específico'}

CAPACIDADES:
1. Responder preguntas sobre fichas técnicas
2. Ayudar en cálculo de costos y SAM
3. Sugerir mejoras en especificaciones
4. Guiar en uso del sistema
5. Responder sobre procesos de producción

RESTRICCIONES:
- No modificar datos sin confirmación del usuario
- No ejecutar acciones, solo sugerir
- Ser breve y práctico (máximo 2-3 párrafos)
- Si no sabes, di "No tengo información al respecto"

TONO:
- Profesional pero amable
- Técnico pero comprensible
- Útil y directo
`;

  try {
    const chat = modelRapido.startChat({
      history: historial.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        temperature: 0.3, // Más bajo para respuestas consistentes
        maxOutputTokens: 1024,
      },
    });

    const response = await chat.sendMessage(mensaje);
    return response.response.text();
  } catch (error: any) {
    console.error('Error en chatbot:', error);
    throw new Error('Error procesando tu pregunta');
  }
}
```

### Endpoint para Chat

```typescript
// src/app/api/ai/chat/route.ts

export async function POST(req: Request) {
  const { mensaje, historial, contexto, usuario_rol, usuario_id } = 
    await req.json();

  try {
    const respuesta = await procesarMensajeChat(
      mensaje,
      historial,
      {
        usuario_rol,
        usuario_id,
        contexto,
      }
    );

    return NextResponse.json({
      success: true,
      respuesta,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### Componente Frontend

```typescript
// src/components/AsistenteIA.tsx

export function AsistenteIA() {
  const [mensajes, setMensajes] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);

  const enviarMensaje = async () => {
    if (!input.trim()) return;

    // Agregar mensaje del usuario
    const nuevoMensaje = { role: 'user' as const, content: input };
    setMensajes(prev => [...prev, nuevoMensaje]);
    setInput('');
    setCargando(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje: input,
          historial: mensajes,
          contexto: 'Sistema de fichas técnicas',
          usuario_rol: 'diseñador',
          usuario_id: '123',
        }),
      });

      const { respuesta } = await res.json();
      setMensajes(prev => [...prev, { role: 'assistant', content: respuesta }]);
    } catch (error) {
      toast.error('Error en chatbot');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {mensajes.map((msg, idx) => (
        <div key={idx} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
          <div
            className={`inline-block max-w-xs p-3 rounded-lg ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            {msg.content}
          </div>
        </div>
      ))}
      {cargando && <p className="text-gray-500">Procesando...</p>}

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu pregunta..."
          className="flex-1 border rounded px-3 py-2"
          onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
        />
        <button onClick={enviarMensaje} className="bg-blue-600 text-white px-4 py-2 rounded">
          Enviar
        </button>
      </div>
    </div>
  );
}
```

---

## Agregación Automática en Formularios

### Estrategia Multi-paso

```typescript
// src/lib/helpers/form-aggregation.ts

export async function agregarDatosFormularioAutomatico(
  tipoFormulario: 'ficha_tecnica' | 'medidas' | 'cotizacion',
  archivoPath: string,
  datosActuales?: Record<string, any>
): Promise<Record<string, any>> {
  
  let datosExtraidos: any = {};

  // Paso 1: Extracción según tipo
  if (tipoFormulario === 'ficha_tecnica') {
    datosExtraidos = await extraerGeometral(archivoPath);
  } else if (tipoFormulario === 'cotizacion') {
    datosExtraidos = await extraerCotizacionPDF(archivoPath);
  }

  // Paso 2: Validación contra datos existentes
  const datosValidados = validarConDatosActuales(
    datosExtraidos,
    datosActuales
  );

  // Paso 3: Enriquecimiento (búsquedas adicionales)
  const datosEnriquecidos = await enriquecerDatos(
    datosValidados,
    tipoFormulario
  );

  // Paso 4: Formateo para el formulario
  return formatearParaFormulario(datosEnriquecidos, tipoFormulario);
}

function validarConDatosActuales(
  extraidos: any,
  actuales?: Record<string, any>
): any {
  if (!actuales) return extraidos;

  // Detectar conflictos
  const conflictos: string[] = [];
  
  for (const [key, valor] of Object.entries(extraidos)) {
    if (actuales[key] && actuales[key] !== valor) {
      conflictos.push(`${key}: "${actuales[key]}" vs "${valor}"`);
    }
  }

  if (conflictos.length > 0) {
    console.warn('⚠️ Conflictos detectados:', conflictos);
    // Retornar datos extraídos pero marcar como "revisar"
  }

  return { ...actuales, ...extraidos };
}

async function enriquecerDatos(
  datos: any,
  tipo: string
): Promise<any> {
  // Ej: Si se extrajo nombre de material, buscar propiedades en BD
  if (tipo === 'ficha_tecnica' && datos.materiales) {
    // Buscar cada material en la BD
    for (const mat of datos.materiales) {
      const propiedades = await buscarMaterialEnBD(mat.material);
      if (propiedades) {
        Object.assign(mat, propiedades);
      }
    }
  }
  return datos;
}

function formatearParaFormulario(datos: any, tipo: string): Record<string, any> {
  // Convertir formato de extracción a formato de formulario
  if (tipo === 'ficha_tecnica') {
    return {
      version: datos.version || '1.0',
      descripcion_detallada: datos.especificaciones?.observaciones,
      sam_total: datos.especificaciones?.sam_total,
      costo_estimado: datos.especificaciones?.costo_estimado,
      medidas: datos.medidas, // Para useFieldArray
    };
  }
  return datos;
}
```

---

## Manejo de Errores

### Estrategia Completa

```typescript
// src/lib/helpers/error-handling.ts

export class GeminiExtractionError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'GeminiExtractionError';
  }
}

export async function extraerConReintentos<T>(
  fn: () => Promise<T>,
  maxReintentos: number = 3,
  retardoMs: number = 1000
): Promise<T> {
  let ultimoError: Error | null = null;

  for (let intento = 1; intento <= maxReintentos; intento++) {
    try {
      return await fn();
    } catch (error: any) {
      ultimoError = error;

      // Errores no recuperables
      if (error.message.includes('JSON inválido')) {
        throw new GeminiExtractionError('INVALID_JSON', error.message, false);
      }

      // Errores de API
      if (error.status === 429) {
        // Rate limit
        console.warn(`⏳ Rate limit, reintentando en ${retardoMs}ms...`);
        await new Promise(r => setTimeout(r, retardoMs * intento)); // Backoff exponencial
        continue;
      }

      if (error.status === 500) {
        // Error del servidor
        console.warn(`⚠️ Error del servidor, reintentando...`);
        await new Promise(r => setTimeout(r, retardoMs * intento));
        continue;
      }

      // Error no recuperable
      throw new GeminiExtractionError(
        'UNRECOVERABLE_ERROR',
        error.message,
        false
      );
    }
  }

  throw ultimoError ||
    new GeminiExtractionError('MAX_RETRIES', 'Máximo de reintentos alcanzado', true);
}

// Uso
try {
  const datos = await extraerConReintentos(
    () => extraerGeometral(imagePath),
    3,
    1000
  );
} catch (error: any) {
  if (error instanceof GeminiExtractionError) {
    if (error.retryable) {
      toast.error('Error temporal, intenta nuevamente');
    } else {
      toast.error('No se pudo extraer la información: ' + error.message);
    }
  }
}
```

---

## Optimización de Costos

### Estrategia de Modelos

```typescript
// Usar modelo rápido (Flash) para tareas simples
// Usar modelo potente (Pro) solo si es necesario

const decisionArbol = {
  // ✓ Usar Flash
  'extraccion_cotizacion': 'flash',        // Simple, estructura conocida
  'listado_items': 'flash',                 // Tareas repetitivas
  'respuesta_chat_simple': 'flash',         // Chat básico
  
  // ✗ Usar Pro
  'analisis_imagen_complejo': 'pro',       // Geometral con muchos detalles
  'extraccion_multi_documento': 'pro',      // Análisis cruzado
  'respuesta_chat_tecnica': 'pro',          // Consultas técnicas profundas
};

export function selectModeloOptimo(tarea: string): typeof modelRapido | typeof modelDetallado {
  const modelType = decisionArbol[tarea as keyof typeof decisionArbol] || 'flash';
  return modelType === 'flash' ? modelRapido : modelDetallado;
}
```

### Caché de Resultados

```typescript
// src/lib/ai/cache.ts

const cacheExtracciones = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hora

export function getCacheKey(filePath: string, tipo: string): string {
  const hash = require('crypto')
    .createHash('md5')
    .update(filePath + tipo)
    .digest('hex');
  return hash;
}

export async function extraerConCache(
  filePath: string,
  tipo: string,
  fn: () => Promise<any>
): Promise<any> {
  const cacheKey = getCacheKey(filePath, tipo);
  const cached = cacheExtracciones.get(cacheKey);

  // Validar cache
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('📦 Usando resultado en caché');
    return cached.data;
  }

  // Obtener nuevo
  const data = await fn();
  cacheExtracciones.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}
```

---

## Resumen de Modelos

| Tarea | Modelo | Velocidad | Precisión | Costo | Recomendación |
|-------|--------|-----------|-----------|-------|---------------|
| Chat básico | Flash | ⚡⚡⚡ | ⭐⭐⭐ | $ | ✓ |
| Extracción cotización | Flash | ⚡⚡⚡ | ⭐⭐⭐⭐ | $ | ✓ |
| Geometral simple | Flash | ⚡⚡ | ⭐⭐⭐ | $ | ✓ |
| Geometral compleja | Pro | ⚡ | ⭐⭐⭐⭐⭐ | $$$ | ✓ |
| Análisis múltiple | Pro | ⚡ | ⭐⭐⭐⭐⭐ | $$$ | Cuando sea necesario |

---

## Checklist de Implementación

- [ ] Configurar `GEMINI_API_KEY` en `.env.local`
- [ ] Revisar `src/lib/gemini.ts` con los modelos correctos
- [ ] Implementar funciones en `src/lib/helpers/ai-extraction.ts`
- [ ] Crear endpoints en `src/app/api/ai/`
- [ ] Integrar en componentes con manejo de errores
- [ ] Testear con archivos reales
- [ ] Monitorear costos en Google AI Studio
- [ ] Documentar prompts efectivos encontrados

---

## Recursos Útiles

- [Documentación Gemini API](https://ai.google.dev/docs)
- [Prompting Guide](https://ai.google.dev/docs/guides/prompting)
- [Vision con Gemini](https://ai.google.dev/docs/vision)
- [Modelos disponibles](https://ai.google.dev/models)
