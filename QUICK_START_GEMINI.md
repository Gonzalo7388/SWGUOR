# 🚀 Quick Start: Gemini IA en 15 Minutos

## Paso 1: Obtener API Key (2 min)

1. Ir a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click en "Create API Key"
3. Copiar la clave
4. Pegar en `.env.local`:
```env
GEMINI_API_KEY=tu_clave_aqui
```

## Paso 2: Instalar Dependencia (1 min)

```bash
npm install @google/generative-ai
```

## Paso 3: Crear Archivo Base de Gemini (2 min)

Copiar esto en `src/lib/gemini.ts`:

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const modelRapido = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: { temperature: 0.2, maxOutputTokens: 2048 }
});

export const modelDetallado = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
});
```

## Paso 4: Crear Función de Extracción (3 min)

Copiar esto en `src/lib/helpers/extract-geometral.ts`:

```typescript
import fs from 'fs';
import { modelDetallado } from '@/lib/gemini';

export async function extraerGeometral(imagePath: string) {
  const base64 = fs.readFileSync(imagePath).toString('base64');
  
  const prompt = `
ERES: Experto en fichas técnicas textiles.
TAREA: Analiza geometral y extrae medidas, materiales, SAM.
RESPONDE SOLO EN JSON:
{
  "medidas": [{"punto_medida": string, "talla": string, "valor_cm": number}],
  "materiales": [{"componente": string, "material": string}],
  "especificaciones_tecnicas": {"sam_total": number},
  "confianza_general": 0.95
}
`;

  const response = await modelDetallado.generateContent([
    { inlineData: { mimeType: 'image/jpeg', data: base64 } },
    { text: prompt }
  ]);

  // Parse JSON de respuesta
  const texto = response.response.text();
  const match = texto.match(/\{[\s\S]*\}/);
  return JSON.parse(match?.[0] || '{}');
}
```

## Paso 5: Crear Endpoint API (2 min)

Copiar esto en `src/app/api/ai/extract-geometral/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { extraerGeometral } from '@/lib/helpers/extract-geometral';

export async function POST(request: NextRequest) {
  let tempFile: string | null = null;
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
    
    // Guardar temp
    const buffer = await file.arrayBuffer();
    tempFile = path.join('/tmp', `geometral-${Date.now()}.jpg`);
    await writeFile(tempFile, Buffer.from(buffer));
    
    // Extraer
    const data = await extraerGeometral(tempFile);
    
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (tempFile) await unlink(tempFile).catch(() => {});
  }
}
```

## Paso 6: Usar en Componente (3 min)

```typescript
// En tu componente
const handleUploadGeometral = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch('/api/ai/extract-geometral', {
    method: 'POST',
    body: formData
  });
  
  const { data } = await res.json();
  
  // Cargar en form
  data.medidas.forEach(m => {
    append({
      punto_medida: m.punto_medida,
      valor_cm: m.valor_cm
    });
  });
};
```

## Paso 7: Testear (2 min)

```bash
# Crear archivo test
curl -X POST http://localhost:3000/api/ai/extract-geometral \
  -F "file=@test-image.jpg"
```

---

## ✅ Verificación

- [ ] API Key en `.env.local`
- [ ] Dependencia instalada: `npm list @google/generative-ai`
- [ ] Archivo `src/lib/gemini.ts` creado
- [ ] Función `extraerGeometral()` creada
- [ ] Endpoint POST creado
- [ ] Test exitoso

---

## 🎯 Próximos Pasos Avanzados

1. Agregar extracción de cotizaciones (PDF)
2. Crear endpoint de chat
3. Auto-completar formularios
4. Validación con Zod
5. Manejo de errores y reintentos

---

## 📚 Documentación Adicional

Consulta estos archivos para más detalles:
- **GUIA_GEMINI_IA.md** - Guía completa
- **PROMPTS_BANCO.md** - Prompts listos para usar
- **IMPLEMENTACION_GEMINI.md** - Código completo
