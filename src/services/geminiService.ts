import type { Quiz, ImageModel, CanvasModel, FlashAiModel, PlanningAiModel, ConseilsAiModel, Question, Planning, ChatMessage, ChatPart } from '@/lib/types';
import type { GenerateContentResponse } from '@google/genai';

async function callGeminiApi<T>(action: string, payload: any): Promise<T> {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, payload }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API call failed with status ${response.status}: ${errorBody}`);
    }

    return response.json();
}

export const generateQuiz = async (
    subjectName: string,
    count: number,
    difficulty: string,
    level: string,
    customPrompt: string,
    systemInstruction: string,
): Promise<Quiz> => {
    return callGeminiApi<Quiz>('generateQuiz', { subjectName, count, difficulty, level, customPrompt, systemInstruction });
};

export const generateHtmlContent = async (
    prompt: string,
    systemInstruction: string,
    model?: any, // Pass model for backend to decide which gemini model to use
): Promise<string> => {
    const result = await callGeminiApi<{ html: string }>('generateHtmlContent', { prompt, systemInstruction, model });
    return result.html;
};

export const generateImage = async (
    prompt: string,
    model: ImageModel,
    style: string,
    format: 'jpeg' | 'png',
    aspectRatio: string,
    imageGenerationInstruction: string,
    // FIX: Add `negativePrompt` to the function signature.
    negativePrompt: string,
): Promise<{ data: string; mimeType: string; }> => {
    // FIX: Pass `negativePrompt` in the payload to the API.
    return callGeminiApi<{ data: string; mimeType: string; }>('generateImage', { prompt, model, style, format, aspectRatio, imageGenerationInstruction, negativePrompt });
};

export const generateInteractivePage = async (
    prompt: string,
    model: CanvasModel,
    systemInstruction: string
): Promise<string> => {
    const fullPrompt = `${prompt}. La sortie doit être un fichier HTML unique, complet et valide, incluant le CSS dans une balise <style> et le JavaScript dans une balise <script>. Ne pas utiliser de bibliothèques externes. Le code doit être autonome.`;
    return generateHtmlContent(
        fullPrompt, 
        systemInstruction || "Tu es un développeur web expert qui crée des pages web interactives à partir de descriptions. Ton code doit être propre, efficace et contenu dans un seul fichier HTML.",
        model
    );
};

export const generateFlashQuestion = async (
    level: string,
    systemInstruction: string,
    model: FlashAiModel
): Promise<Question> => {
    return callGeminiApi<Question>('generateFlashQuestion', { level, systemInstruction, model });
};

// Fix: Add missing generatePlanning export
export const generatePlanning = async (
    task: string,
    dueDate: string,
    // FIX: Add `todayDate` to the function signature to be passed to the API.
    todayDate: string,
    systemInstruction: string,
    model: PlanningAiModel,
): Promise<Planning> => {
    // FIX: Pass `todayDate` in the payload.
    return callGeminiApi<Planning>('generatePlanning', { task, dueDate, todayDate, systemInstruction, model });
};

export const generateConseils = async (
    subject: string,
    level: string,
    systemInstruction: string,
    model: ConseilsAiModel,
): Promise<string> => {
    return callGeminiApi<{html: string}>('generateConseils', { subject, level, systemInstruction, model }).then(res => res.html);
};

export const generateContentWithSearch = async (history: ChatMessage[], currentParts: ChatPart[]): Promise<GenerateContentResponse> => {
    const result = await callGeminiApi<GenerateContentResponse>('generateWithSearch', { history, currentParts });
    return result;
};
