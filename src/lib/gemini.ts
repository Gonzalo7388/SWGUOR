import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Falta la API Key de Gemini en las variables de entorno");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Usamos 1.5 Flash por su baja latencia en respuestas de chat
export const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.2, // Mantener respuestas precisas y no creativas
    topP: 0.8,
  }
});