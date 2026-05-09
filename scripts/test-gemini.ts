import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("ERROR: GEMINI_API_KEY no encontrada en .env.local");
    return;
  }

  console.log("Iniciando prueba de Gemini con API Key:", apiKey.substring(0, 5) + "...");

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent("Hola, responde con 'OK' si recibes este mensaje.");
    const response = await result.response;
    console.log("Respuesta de Gemini:", response.text());
  } catch (error: any) {
    console.error("Error al llamar a Gemini:", error.message);
    if (error.response) {
      console.error("Detalles del error:", error.response);
    }
  }
}

testGemini();
