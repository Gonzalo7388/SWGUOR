# Implementación Práctica: Gemini IA en Modas GUOR

## Índice
1. [Extraer Geometral (Imagen)](#extraer-geometral)
2. [Extraer Cotización (PDF)](#extraer-cotización)
3. [Chat Bot Asistente](#chat-bot-asistente)
4. [Auto-Completar Formulario](#auto-completar-formulario)
5. [Manejo de Errores](#manejo-de-errores)

---

## Extraer Geometral

### Paso 1: Crear Función Helper

```typescript
// src/lib/helpers/extract-geometral.ts

import fs from 'fs';
import path from 'path';
import { modelDetallado } from '@/lib/gemini';

export interface MedidaExtraida {
  punto_medida: string;
  talla: string;
  valor_cm: number;
  tolerancia?: number;
  rango_tallas?: Record<string, number>;
  notas?: string;
}

export interface MaterialExtraido {
  componente: string;
  material: string;
  composicion?: string;
  peso_gm2?: number;
  color?: string;
}

export interface ExtraccionGeometral {
  medidas: MedidaExtraida[];
  materiales: MaterialExtraido[];
  especificaciones_tecnicas: {
    sam_total?: number;
    tiempo_confeccion_minutos?: number;
    tipo_puntada?: string;
    acabados_especiales?: string[];
  };
  calidad_imagen: 'excelente' | 'buena' | 'regular' | 'pobre';
  confianza_general: number;
  observaciones: string;
}

// Función principal
export async function extraerGeometral(
  imagePath: string
): Promise<ExtraccionGeometral> {
  // 1. Validar archivo existe
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Archivo no encontrado: ${imagePath}`);
  }

  // 2. Validar tipo de archivo
  const ext = path.extname(imagePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
  };

  if (!mimeTypes[ext]) {
    throw new Error(`Tipo de archivo no soportado: ${ext}`);
  }

  // 3. Validar tamaño (máximo 10MB)
  const stats = fs.statSync(imagePath);
  if (stats.size > 10 * 1024 * 1024) {
    throw new Error('Archivo demasiado grande (máximo 10MB)');
  }

  // 4. Convertir a Base64
  const imageData = fs.readFileSync(imagePath);
  const base64 = imageData.toString('base64');
  const mimeType = mimeTypes[ext];

  // 5. Prompt muy específico para geometral
  const prompt = `
ERES: Experto internacional en análisis de fichas técnicas textiles y confección de moda.

TAREA: Analizar imagen geometral (technical drawing) y extraer medidas precisas.

CONTEXTO IMPORTANTE:
- Esta es una prenda de ropa (vestido, camisa, pantalón, chaqueta, etc)
- Las flechas y líneas indican puntos de medida específicos
- Puede haber tabla de múltiples tallas
- Necesito datos exactos para producción

PASOS A SEGUIR:
1️⃣ IDENTIFICA: Cada punto de medida (cabeza de flecha, línea punteada, número)
2️⃣ LEE: El valor exacto, convirtiendo a centímetros si es necesario (1 inch = 2.54cm)
3️⃣ EXTRAE: Tabla de tallas si está presente (XS, S, M, L, XL)
4️⃣ BUSCA: Información de materiales, composición, peso
5️⃣ CALCULA: SAM (Standard Allowed Minutes) si está visible
6️⃣ VALIDA: Que las proporciones tengan sentido

RESPUESTA OBLIGATORIA - FORMATO JSON EXACTO (SIN EXPLICACIONES ADICIONALES, SIN MARKDOWN):
{
  "medidas": [
    {
      "punto_medida": "HPS (Hombro a Punta de Sisa)",
      "talla": "M",
      "valor_cm": 45.5,
      "tolerancia": 1.0,
      "rango_tallas": {
        "XS": 42.0,
        "S": 43.5,
        "M": 45.5,
        "L": 48.0,
        "XL": 50.5
      },
      "notas": "Medida crítica para ajuste superior"
    },
    {
      "punto_medida": "Largo Total",
      "talla": "M",
      "valor_cm": 92.0,
      "tolerancia": 1.5,
      "notas": "Desde hombro a dobladillo"
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
    "acabados_especiales": ["Doblado especial en cuello", "Ribete reforzado en sisas"]
  },
  "calidad_imagen": "excelente",
  "confianza_general": 0.95,
  "observaciones": "Imagen muy clara. Medidas bien visibles. Tabla de tallas completa."
}

REGLAS CRÍTICAS:
✅ Extrae EXACTAMENTE lo que ves, NO inventes datos
✅ Si algo es ambiguo, marca confianza < 0.8
✅ Redondea decimales a MÁXIMO 2 lugares
✅ Si NO ves claramente, omite o usa null
✅ SÉ EXHAUSTIVO: TODAS las medidas, TODOS los materiales
✅ Responde PURO JSON, sin código, sin explicaciones

CONFIANZA:
- 0.95+: Imagen clara, datos precisos
- 0.80-0.94: Datos legibles, pequeñas ambigüedades
- 0.60-0.79: Imagen poco clara, algunos datos dudosos
- < 0.60: Imagen muy pobre, datos no confiables`;

  try {
    console.log('📤 Enviando a Gemini...');
    
    // 6. Llamar a Gemini
    const response = await modelDetallado.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      },
      {
        text: prompt,
      },
    ]);

    const content = response.response.text();
    console.log('📥 Respuesta recibida');

    // 7. Parsear JSON
    const extraida = parseJSON<ExtraccionGeometral>(content);

    // 8. Validar
    if (!extraida.medidas || extraida.medidas.length === 0) {
      throw new Error('No se extrajeron medidas de la imagen');
    }

    if (extraida.confianza_general < 0.6) {
      console.warn('⚠️ ADVERTENCIA: Baja confianza en la extracción');
    }

    return extraida;
  } catch (error: any) {
    console.error('❌ Error en extracción geometral:', error);
    throw new Error(
      \`Error extrayendo geometral: \${error.message}\`
    );
  }
}

// Helper para parsear JSON de respuesta Gemini
function parseJSON<T>(raw: string): T {
  // Patrón 1: JSON dentro de código block
  let match = raw.match(/\`\`\`(?:json)?\n?([\s\S]*?)\n?\`\`\`/);
  if (match) {
    return JSON.parse(match[1].trim()) as T;
  }

  // Patrón 2: JSON puro
  match = raw.match(/\{[\s\S]*\}/);
  if (match) {
    return JSON.parse(match[0]) as T;
  }

  // Si nada funciona
  throw new Error('No se encontró JSON válido en respuesta');
}
`;
```

### Paso 2: Crear Endpoint API

```typescript
// src/app/api/ai/extract-geometral/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { extraerGeometral } from '@/lib/helpers/extract-geometral';

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;

  try {
    // 1. Obtener archivo de FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 2. Validar tipo
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WEBP allowed' },
        { status: 400 }
      );
    }

    // 3. Validar tamaño
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum 10MB' },
        { status: 400 }
      );
    }

    // 4. Guardar archivo temporal
    const buffer = await file.arrayBuffer();
    const ext = file.type === 'image/jpeg' ? '.jpg' : 
                file.type === 'image/png' ? '.png' : '.webp';
    tempFilePath = path.join('/tmp', \`geometral-\${Date.now()}\${ext}\`);
    
    await writeFile(tempFilePath, Buffer.from(buffer));

    // 5. Extraer datos
    const extraida = await extraerGeometral(tempFilePath);

    // 6. Retornar resultado
    return NextResponse.json({
      success: true,
      data: extraida,
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Error processing image' },
      { status: 500 }
    );
  } finally {
    // Limpiar archivo temporal
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch (e) {
        console.error('Error cleaning temp file:', e);
      }
    }
  }
}
```

### Paso 3: Usar en Componente

```typescript
// src/components/admin/fichas-tecnicas/FichaTecnicaForm.tsx

const handleGeometralExtracted = async (file: File) => {
  setExtrayendo(true);
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/ai/extract-geometral', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error(await res.text());

    const { data: extraida } = await res.json();

    // Cargar medidas en el form
    if (extraida.medidas) {
      fields.forEach((_, idx) => remove(idx));
      extraida.medidas.forEach(m => {
        append({
          punto_medida: m.punto_medida,
          talla: m.talla || 'M',
          valor_cm: m.valor_cm,
          tolerancia: m.tolerancia,
        });
      });
      toast.success(\`✅ Extraídas \${extraida.medidas.length} medidas\`);
    }

    // Cargar especificaciones
    if (extraida.especificaciones_tecnicas?.sam_total) {
      form.setValue('sam_total', extraida.especificaciones_tecnicas.sam_total);
    }

    // Mostrar confianza
    if (extraida.confianza_general < 0.8) {
      toast.warning('⚠️ Baja confianza, revisa los datos');
    }
  } catch (error) {
    toast.error('Error extrayendo geometral');
  } finally {
    setExtrayendo(false);
  }
};
```

---

## Extraer Cotización

### Función Helper

```typescript
// src/lib/helpers/extract-cotizacion.ts

import fs from 'fs';
import path from 'path';
import { modelRapido } from '@/lib/gemini';

export interface ItemCotizacion {
  numero: number;
  codigo?: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  precio_unitario: number;
  subtotal: number;
}

export interface ExtraccionCotizacion {
  documento: {
    tipo: string;
    numero: string;
    fecha: string;
    vigencia_dias?: number;
  };
  proveedor: {
    nombre: string;
    ruc?: string;
    contacto?: string;
    telefono?: string;
  };
  items: ItemCotizacion[];
  resumen: {
    subtotal: number;
    impuesto: number;
    total: number;
    moneda: string;
  };
  terminos: {
    forma_pago: string;
    plazo_dias: number;
    tiempo_entrega: string;
  };
  confianza: number;
}

export async function extraerCotizacion(
  pdfPath: string
): Promise<ExtraccionCotizacion> {
  if (!fs.existsSync(pdfPath)) {
    throw new Error(\`PDF no encontrado: \${pdfPath}\`);
  }

  const buffer = fs.readFileSync(pdfPath);
  const base64 = buffer.toString('base64');

  const prompt = \`
TAREA: Extraer información de cotización/presupuesto de proveedor.

BUSCA:
- Número de cotización, fecha, vigencia
- Datos del proveedor (nombre, RUC, contacto)
- TABLA DE ITEMS: descripción, cantidad, precio, subtotal
- Subtotal, impuestos, total
- Términos de pago y tiempo de entrega

RESPONDE EN JSON (SIN EXPLICACIONES):
{
  "documento": {
    "tipo": "cotizacion",
    "numero": "COT-2024-001",
    "fecha": "2024-01-15",
    "vigencia_dias": 30
  },
  "proveedor": {
    "nombre": "Textiles del Sur",
    "ruc": "20123456789",
    "contacto": "contacto@textiles.com",
    "telefono": "+51 1 2345678"
  },
  "items": [
    {
      "numero": 1,
      "codigo": "TEJ-001",
      "descripcion": "Jersey 100% algodón, 200gm2, azul marino",
      "cantidad": 50,
      "unidad": "kg",
      "precio_unitario": 12.50,
      "subtotal": 625.00
    }
  ],
  "resumen": {
    "subtotal": 625.00,
    "impuesto": 112.50,
    "total": 737.50,
    "moneda": "USD"
  },
  "terminos": {
    "forma_pago": "50% adelanto, 50% contra entrega",
    "plazo_dias": 30,
    "tiempo_entrega": "21 días"
  },
  "confianza": 0.95
}

REGLAS:
✅ Extrae TODOS los items
✅ Mantén precisión en decimales
✅ Si hay descuentos, incluye en subtotal
✅ Si no hay impuesto visible, usa 0
✅ Responde PURO JSON\`;

  try {
    const response = await modelRapido.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64,
        },
      },
      {
        text: prompt,
      },
    ]);

    return parseJSON<ExtraccionCotizacion>(response.response.text());
  } catch (error: any) {
    throw new Error(\`Error en PDF: \${error.message}\`);
  }
}

function parseJSON<T>(raw: string): T {
  const match = raw.match(/\`\`\`(?:json)?\n?([\s\S]*?)\n?\`\`\`/) ||
                raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('JSON not found');
  return JSON.parse(match[1] ?? match[0]) as T;
}
\`;
```

---

## Chat Bot Asistente

### Función Chat

```typescript
// src/lib/ai/chatbot.ts

import { modelRapido } from '@/lib/gemini';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export async function enviarMensajeChat(
  mensaje: string,
  historial: ChatMessage[],
  rol: string
): Promise<string> {
  const systemPrompt = \`
ERES: AsistenteIA Modas GUOR - Experto en fichas técnicas, producción y costos textiles.

USUARIO ROL: \${rol}

CAPACIDADES PRINCIPALES:
1. Explicar conceptos de confección (SAM, puntadas, materiales)
2. Validar especificaciones (¿esto tiene sentido?)
3. Sugerir mejoras (material alternativo, costos)
4. Guiar en uso del sistema
5. Responder sobre procesos de producción

INSTRUCCIONES:
- Responde en español, profesional pero amable
- Máximo 2-3 párrafos por respuesta
- Ofrece datos y números cuando sea posible
- Si no sabes, di "No tengo esa información"
- NO ejecutes acciones, solo sugiere

TONO: Práctico, empoderador, honesto
\`;

  try {
    const chat = modelRapido.startChat({
      history: historial.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    });

    const response = await chat.sendMessage(mensaje);
    return response.response.text();
  } catch (error: any) {
    throw new Error(\`Error chat: \${error.message}\`);
  }
}
\`;
```

### Endpoint Chat

```typescript
// src/app/api/ai/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { enviarMensajeChat } from '@/lib/ai/chatbot';

export async function POST(request: NextRequest) {
  try {
    const { mensaje, historial, rol } = await request.json();

    const respuesta = await enviarMensajeChat(mensaje, historial, rol);

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
\`;
```

### Componente Chat

```typescript
// src/components/AsistenteIAChat.tsx

export function AsistenteIAChat() {
  const [mensajes, setMensajes] = useState<Array<{ rol: 'user' | 'ai'; texto: string }>>([]);
  const [input, setInput] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async () => {
    if (!input.trim()) return;

    const nuevoMsg = { rol: 'user' as const, texto: input };
    setMensajes(prev => [...prev, nuevoMsg]);
    setInput('');
    setEnviando(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje: input,
          historial: mensajes,
          rol: 'diseñador', // O del usuario actual
        }),
      });

      const { respuesta } = await res.json();
      setMensajes(prev => [...prev, { rol: 'ai', texto: respuesta }]);
    } catch (error) {
      console.error(error);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="h-96 overflow-y-auto bg-gray-50 p-4 rounded">
        {mensajes.map((msg, i) => (
          <div key={i} className={msg.rol === 'user' ? 'text-right' : 'text-left'}>
            <div
              className={\`max-w-xs inline-block p-3 rounded-lg \${
                msg.rol === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-900'
              }\`}
            >
              {msg.texto}
            </div>
          </div>
        ))}
        {enviando && <p className="text-gray-500 text-sm">Procesando...</p>}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregunta al asistente..."
          className="flex-1 border rounded px-3 py-2"
          onKeyPress={(e) => e.key === 'Enter' && enviar()}
        />
        <button
          onClick={enviar}
          disabled={enviando}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {enviando ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </div>
  );
}
\`;
```

---

## Auto-Completar Formulario

```typescript
// src/lib/helpers/auto-complete-form.ts

export async function agregarDatosAutomaticamente(
  tipoArchivo: 'geometral' | 'cotizacion',
  archivo: File
): Promise<Record<string, any>> {
  
  // Crear FormData
  const formData = new FormData();
  formData.append('file', archivo);

  // Llamar endpoint correspondiente
  const endpoint = tipoArchivo === 'geometral'
    ? '/api/ai/extract-geometral'
    : '/api/ai/extract-cotizacion';

  const res = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const { data } = await res.json();

  // Transformar a formato de formulario
  return transformarDatos(data, tipoArchivo);
}

function transformarDatos(data: any, tipo: string): Record<string, any> {
  if (tipo === 'geometral') {
    return {
      medidas: data.medidas,
      sam_total: data.especificaciones_tecnicas?.sam_total,
      costo_estimado: data.especificaciones_tecnicas?.costo_estimado,
      confianza: data.confianza_general,
    };
  }

  if (tipo === 'cotizacion') {
    return {
      numero_cotizacion: data.documento.numero,
      fecha_cotizacion: data.documento.fecha,
      proveedor: data.proveedor.nombre,
      items: data.items,
      total: data.resumen.total,
      moneda: data.resumen.moneda,
    };
  }

  return {};
}
\`;
```

---

## Manejo de Errores

```typescript
// src/lib/helpers/error-handling.ts

export class AIExtractionError extends Error {
  constructor(
    public code: string,
    message: string,
    public retryable: boolean = false
  ) {
    super(message);
  }
}

export async function extraerConReintentos<T>(
  fn: () => Promise<T>,
  maxReintentos: number = 3,
  retardoMs: number = 2000
): Promise<T> {
  for (let i = 1; i <= maxReintentos; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (i === maxReintentos) throw error;

      // Rate limit
      if (error.status === 429) {
        console.warn(\`Rate limit, reintentando...\`);
        await new Promise(r => setTimeout(r, retardoMs * i));
        continue;
      }

      // Error del servidor
      if (error.status >= 500) {
        console.warn(\`Error servidor, reintentando...\`);
        await new Promise(r => setTimeout(r, retardoMs * i));
        continue;
      }

      throw error;
    }
  }
  throw new Error('Max retries');
}
\`;
```

---

## ✅ Checklist Implementación

- [ ] Crear archivos en `src/lib/helpers/`
- [ ] Crear endpoints en `src/app/api/ai/`
- [ ] Verificar variables de entorno (`GEMINI_API_KEY`)
- [ ] Instalar dependencia: `npm install @google/generative-ai`
- [ ] Testear cada función con archivos reales
- [ ] Integrar componentes en UI
- [ ] Documentar prompts efectivos
- [ ] Monitorear costos en Google AI Console

---

## 🧪 Testing Rápido

```bash
# Test geometral
curl -X POST http://localhost:3000/api/ai/extract-geometral \
  -F "file=@sample.jpg"

# Test cotización
curl -X POST http://localhost:3000/api/ai/extract-cotizacion \
  -F "file=@sample.pdf"

# Test chat
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"mensaje":"¿Qué es SAM?","historial":[],"rol":"diseñador"}'
```

---

## 🎯 Próximos Pasos

1. **Implementar**: Copia los archivos a tu proyecto
2. **Testear**: Prueba con documentos reales
3. **Refinar**: Ajusta prompts según resultados
4. **Monitorear**: Revisa costos y errores
5. **Documentar**: Mantén registro de casos de uso
