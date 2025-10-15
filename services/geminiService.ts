import { GoogleGenAI, Type } from "@google/genai";

// This application is designed to run in an environment where the API key is provided
// through a securely managed environment variable named `process.env.API_KEY`.
// This is a standard practice in modern web development platforms like Vercel or Gemini Studio
// to prevent exposing sensitive keys on the client-side. The platform injects the variable
// during the build or runtime process, so it is not visible in the public source code.
const apiKey = process.env.API_KEY;

if (!apiKey) {
    // This provides a clear error message if the environment variable is not set.
    // This can happen if the app is not configured correctly on the deployment platform.
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;padding:16px;background:red;color:white;text-align:center;font-family:sans-serif;z-index:9999';
    errorDiv.innerHTML = "<strong>Erreur de configuration :</strong> La clé API n'est pas configurée. Assurez-vous que la variable d'environnement `API_KEY` est définie dans les paramètres de votre projet.";
    document.body.prepend(errorDiv);
    throw new Error("API_KEY environment variable is not set. Please configure it in your project settings.");
}

const ai = new GoogleGenAI({ apiKey });

export { ai, Type };
