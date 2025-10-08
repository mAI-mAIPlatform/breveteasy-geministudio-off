// Fix: Provide the implementation for the Gemini service.
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Google Gemini AI client.
// The API key is sourced from the `process.env.API_KEY` environment variable,
// which is assumed to be pre-configured and available in the execution environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export { ai, Type };
