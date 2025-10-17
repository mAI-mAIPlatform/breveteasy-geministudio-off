import { GoogleGenAI, Type } from "@google/genai";
import type { Quiz, ImageModel } from '../types';

// ===================================================================================
// IMPORTANT SECURITY WARNING:
// In a real-world application, especially a Next.js app, this API key
// should NEVER be exposed on the client side. All API calls should be proxied
// through server-side API routes to protect the key from being stolen.
// This client-side implementation is for demonstration purposes only.
// ===================================================================================
const apiKey = process.env.API_KEY;

if (!apiKey) {
  // This check ensures the application fails fast with a clear error message
  // if the API key is not configured in the deployment environment.
  throw new Error(
    "La variable d'environnement API_KEY n'est pas définie. " +
    "Veuillez vous assurer qu'elle est correctement configurée dans votre environnement de déploiement."
  );
}

const ai = new GoogleGenAI({ apiKey });

export { ai, Type };


/**
 * Generates a quiz using the Gemini API.
 * @param subjectName - The name of the quiz subject.
 * @param count - The number of questions to generate.
 * @param difficulty - The difficulty level of the quiz.
 * @param level - The educational level for the quiz.
 * @param customPrompt - Any additional custom instructions.
 * @param systemInstruction - The system instruction for the AI model.
 * @returns A promise that resolves to the generated Quiz object.
 */
export const generateQuiz = async (
    subjectName: string,
    count: number,
    difficulty: string,
    level: string,
    customPrompt: string,
    systemInstruction: string,
): Promise<Quiz> => {
    const quizSchema = {
        type: Type.OBJECT,
        properties: {
            subject: { type: Type.STRING },
            questions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        questionText: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctAnswer: { type: Type.STRING },
                        explanation: { type: Type.STRING }
                    },
                    required: ['questionText', 'options', 'correctAnswer', 'explanation']
                }
            }
        },
        required: ['subject', 'questions']
    };

    const prompt = `Génère un quiz de ${count} questions sur le sujet "${subjectName}" pour le niveau ${level}, difficulté ${difficulty}. ${customPrompt}. Les questions doivent être des QCM avec 4 options de réponse. Fournis une explication pour chaque bonne réponse.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: quizSchema,
            systemInstruction: systemInstruction,
        }
    });
    
    return JSON.parse(response.text);
};

/**
 * Generates generic HTML content (exercises, lessons, etc.) using the Gemini API.
 * @param prompt - The full prompt describing the content to generate.
 * @param systemInstruction - The system instruction for the AI model.
 * @returns A promise that resolves to the generated HTML string.
 */
export const generateHtmlContent = async (
    prompt: string,
    systemInstruction: string,
): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
        }
    });
    return response.text;
};

/**
 * Generates an image using the Imagen API.
 * @param prompt - The text description of the image to generate.
 * @param model - The image generation model to use.
 * @param style - The artistic style for the image.
 * @param format - The output image format ('jpeg' or 'png').
 * @param aspectRatio - The aspect ratio of the image.
 * @param imageGenerationInstruction - Global style instructions for the image AI.
 * @returns A promise that resolves to the generated image data (base64) and mimeType.
 */
export const generateImage = async (
    prompt: string,
    model: ImageModel,
    style: string,
    format: 'jpeg' | 'png',
    aspectRatio: string,
    imageGenerationInstruction: string,
): Promise<{ data: string; mimeType: string; }> => {
    const qualityPrompt = model === 'faceai-plus'
        ? 'haute qualité, 4k, hyper-détaillé, photoréaliste'
        : '';

    const stylePrompt = style !== 'none' ? `style ${style.replace('-', ' ')}` : '';
    const userInstruction = imageGenerationInstruction.trim();

    const finalPrompt = [
        prompt,
        stylePrompt,
        qualityPrompt,
        userInstruction
    ].filter(Boolean).join(', ');
    
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: finalPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: `image/${format}`,
          aspectRatio: aspectRatio,
          // BUG FIX: negativePrompt is not a supported parameter and has been removed.
        },
    });
    
    const imageBytes = response.generatedImages[0].image.imageBytes;
    return { data: imageBytes, mimeType: `image/${format}`};
};
