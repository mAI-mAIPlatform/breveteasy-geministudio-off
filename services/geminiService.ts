// Fix: Provide the implementation for the Gemini service.
import { GoogleGenAI, Type } from "@google/genai";


const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export { ai, Type };
