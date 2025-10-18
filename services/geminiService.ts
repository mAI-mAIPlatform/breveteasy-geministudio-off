import { GoogleGenAI, Type } from "@google/genai";
import type { Quiz, Question, ImageModel, CanvasModel, Planning, FlashAiModel, PlanningAiModel, ConseilsAiModel, ChatMessage, ChatPart } from '../types';
import type { GenerateContentResponse } from '@google/genai';

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

// Fix: Add missing generateImage export
/**
 * Generates an image using the Gemini API (Imagen model).
 * @param prompt - The text prompt for image generation.
 * @param model - The specific image model to use.
 * @param style - A style modifier for the image.
 * @param format - The output image format ('jpeg' or 'png').
 * @param aspectRatio - The desired aspect ratio.
 * @param imageGenerationInstruction - Additional system-level instructions for style.
 * @param negativePrompt - Elements to exclude from the image.
 * @returns A promise that resolves to the image data.
 */
export const generateImage = async (
    prompt: string,
    model: ImageModel,
    style: string,
    format: 'jpeg' | 'png',
    aspectRatio: string,
    imageGenerationInstruction: string,
    negativePrompt: string
): Promise<{ data: string; mimeType: string; }> => {
    const qualityPrompt = model === 'faceai-pro' || model === 'faceai-max'
        ? 'haute qualité, 4k, hyper-détaillé, photoréaliste'
        : '';
    const stylePrompt = style !== 'none' ? `style ${style.replace('-', ' ')}` : '';
    const userInstruction = imageGenerationInstruction.trim();

    const mainPrompt = [prompt, stylePrompt, qualityPrompt, userInstruction].filter(Boolean).join(', ');
    
    const finalPrompt = negativePrompt?.trim() ? `${mainPrompt}, negative_prompt: [${negativePrompt.trim()}]` : mainPrompt;
    
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: finalPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: `image/${format}`,
          aspectRatio: aspectRatio,
        },
    });
    
    const imageBytes = response.generatedImages[0].image.imageBytes;
    return { data: imageBytes, mimeType: `image/${format}`};
};

// Fix: Add missing generateInteractivePage export
/**
 * Generates an interactive HTML page using the Gemini API.
 * @param prompt - The prompt describing the page to create.
 * @param model - The canvas model to use.
 * @param systemInstruction - System-level instructions for the AI.
 * @returns A promise resolving to the HTML content string.
 */
export const generateInteractivePage = async (
    prompt: string,
    model: CanvasModel,
    systemInstruction: string,
): Promise<string> => {
    const geminiModel = model === 'canvasai' ? 'gemini-2.5-flash' : 'gemini-2.5-pro';
    
    const fullPrompt = `${prompt}. La sortie doit être un fichier HTML unique, complet et valide, incluant le CSS dans une balise <style> et le JavaScript dans une balise <script>. Ne pas utiliser de bibliothèques externes. Le code doit être autonome.`;

    const response = await ai.models.generateContent({
        model: geminiModel,
        contents: fullPrompt,
        config: {
            systemInstruction: systemInstruction || "Tu es un développeur web expert qui crée des pages web interactives à partir de descriptions. Ton code doit être propre, efficace et contenu dans un seul fichier HTML.",
        }
    });
    return response.text;
};

// Fix: Add missing generateFlashQuestion export
/**
 * Generates a single flash question (MCQ).
 * @param level - The educational level for the question.
 * @param systemInstruction - System-level instructions for the AI.
 * @param model - The flash AI model to use.
 * @returns A promise resolving to a Question object.
 */
export const generateFlashQuestion = async (
    level: string,
    systemInstruction: string,
    model: FlashAiModel
): Promise<Question> => {
    const questionSchema = {
        type: Type.OBJECT,
        properties: {
            questionText: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 4, maxItems: 4 },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING }
        },
        required: ['questionText', 'options', 'correctAnswer', 'explanation']
    };

    const prompt = `Génère une seule question flash de type QCM (avec exactement 4 options) pour le niveau ${level}. Le sujet peut être n'importe quelle matière du Brevet des collèges. Fournis une explication pour la bonne réponse.`;
    
    const geminiModel = model === 'flashai' ? 'gemini-2.5-flash' : 'gemini-2.5-pro';

    const response = await ai.models.generateContent({
        model: geminiModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: questionSchema,
            systemInstruction: systemInstruction,
        }
    });
    
    return JSON.parse(response.text);
};

// Fix: Add missing generatePlanning export
/**
 * Generates a study plan.
 * @param task - The task to be planned.
 * @param dueDate - The deadline for the task.
 * @param todayDate - The current date.
 * @param systemInstruction - System-level instructions for the AI.
 * @param model - The planning AI model to use.
 * @returns A promise resolving to a Planning object.
 */
export const generatePlanning = async (
    task: string,
    dueDate: string,
    todayDate: string,
    systemInstruction: string,
    model: PlanningAiModel,
): Promise<Planning> => {
    const planningSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            schedule: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        date: { type: Type.STRING, description: "Date au format YYYY-MM-DD" },
                        tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['date', 'tasks']
                }
            }
        },
        required: ['title', 'schedule']
    };

    const prompt = `La date d'aujourd'hui est le ${new Date(todayDate + 'T00:00:00Z').toLocaleDateString('fr-FR', { timeZone: 'UTC' })}. Crée un planning de révision pour la tâche suivante : "${task}". La date limite est le ${dueDate}. Le planning doit commencer à partir d'aujourd'hui ou d'un jour futur, jamais dans le passé. Décompose la tâche en étapes logiques et répartis-les sur les jours disponibles jusqu'à la date limite. Le planning doit être réaliste. Assure-toi que les dates dans le JSON sont au format YYYY-MM-DD.`;

    const geminiModel = model === 'planningai' ? 'gemini-2.5-flash' : 'gemini-2.5-pro';
    
    const response = await ai.models.generateContent({
        model: geminiModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: planningSchema,
            systemInstruction: systemInstruction,
        }
    });
    
    return JSON.parse(response.text);
};

// Fix: Add missing generateConseils export
/**
 * Generates study advice.
 * @param subject - The subject for which advice is needed.
 * @param level - The educational level.
 * @param systemInstruction - System-level instructions for the AI.
 * @param model - The advice AI model to use.
 * @returns A promise resolving to an HTML string with advice.
 */
export const generateConseils = async (
    subject: string,
    level: string,
    systemInstruction: string,
    model: ConseilsAiModel,
): Promise<string> => {
    const prompt = `Génère des conseils et des stratégies de révision pour la matière "${subject}" au niveau "${level}". La réponse doit être formatée en HTML simple (<h1>, <h2>, <p>, <ul>, <li>, <strong>) pour être affichée directement. Fournis des conseils pratiques et actionnables.`;

    const geminiModel = model === 'conseilsai' ? 'gemini-2.5-flash' : 'gemini-2.5-pro';
    
    const response = await ai.models.generateContent({
        model: geminiModel,
        contents: prompt,
        config: {
            systemInstruction: systemInstruction || "Tu es un conseiller pédagogique expert qui aide les élèves à optimiser leurs révisions.",
        }
    });
    return response.text;
};

export const generateContentWithSearch = async (history: ChatMessage[], currentParts: ChatPart[]): Promise<GenerateContentResponse> => {
    const contents = history.map(m => ({
        role: m.role,
        parts: m.parts.map(p => p.text ? ({text: p.text}) : ({inlineData: {data: p.image!.data, mimeType: p.image!.mimeType}}))
    }));

    contents.push({
        role: 'user',
        parts: currentParts.map(p => p.text ? ({text: p.text}) : ({inlineData: {data: p.image!.data, mimeType: p.image!.mimeType}}))
    });

    const response = await ai.models.generateContent({
       model: "gemini-2.5-flash",
       // @ts-ignore
       contents: contents,
       config: {
         tools: [{googleSearch: {}}],
       },
    });

    return response;
};