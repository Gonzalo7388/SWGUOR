import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("ERROR: GEMINI_API_KEY no encontrada");
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // @ts-ignore
    const client = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
    // We can't easily list models with the high-level SDK without extra effort, 
    // but we can try common names.
    
    const models = ["gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-1.5-pro", "gemini-2.0-flash-exp"];
    
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        const result = await model.generateContent("test");
        console.log(`Modelo ${m}: FUNCIONA`);
      } catch (e: any) {
        console.log(`Modelo ${m}: ERROR - ${e.message}`);
      }
    }
  } catch (error: any) {
    console.error("Error:", error.message);
  }
}

listModels();
