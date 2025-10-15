// Fix: Provide the implementation for the Gemini service.
import { GoogleGenAI, Type } from "@google/genai";

// Initialise le client Google Gemini AI.
// La clé API est gérée de manière sécurisée via la variable d'environnement `process.env.API_KEY`.
// Elle n'est pas visible dans le code et n'est pas exposée aux utilisateurs de l'application.
// Vous pouvez partager l'application en toute sécurité.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export { ai, Type };
