import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_MODEL_FLASH } from '@/lib/constants/gemini';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Falta GEMINI_API_KEY en las variables de entorno');
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/** Modelo general (chat / fichas técnicas) */
export const model = genAI.getGenerativeModel({
  model: GEMINI_MODEL_FLASH,
  generationConfig: {
    temperature: 0.2,
    topP: 0.8,
  },
});

/** Modelo con salida JSON estricta (cotizaciones proveedor — CUS_44) */
export function getGeminiJsonModel(systemInstruction: string) {
  return genAI.getGenerativeModel({
    model: GEMINI_MODEL_FLASH,
    systemInstruction,
    generationConfig: {
      temperature: 0.1,
      topP: 0.8,
      responseMimeType: 'application/json',
    },
  });
}
